/**
 * Parser implementation.
 * @packageDocumentation
 *
 * @license
 * Copyright (c) 2020 Felix Kopp <sandtler@sandtler.club>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import IParser, { ParsingContextFlags } from "../types/parser";
import { SourceFile, Node, NodeFlags, NodeArray, Identifier } from "../types/ast/node";
import type ISemanticElement from "../types/semantic-element";
import { asyncReadFileStr } from "../utils/fs";
import alloc from "../utils/alloc";
import { SyntaxKind } from "../types/syntax";
import type IScanner from "../types/scanner";
import Scanner from "../lexer/scanner";
import type { Statement, BlockStatement, VarDeclarationStatement, FuncDeclarationStatement, ReturnStatement } from "../types/ast/statement";
import { UnholyParserError, UnholySyntaxError } from "../utils/errors";
import { VarDeclaration, FuncDeclaration, ParameterDeclaration } from "../types/ast/expression";
import { tokenToString } from "../lexer/token-maps";
import { TypeNode, KeywordTypeNode } from "../types/ast/type";
import AutoNode from "../types/ast/auto-node";
import TokenNode from "../types/ast/token";

/**
 * This is a minimal parser implementation; only a handful of operatios are supported.
 *
 * All methods starting with `parse` return a child of {@linkcode Node}, and the amount of tokens
 * they consume is usually the amount of children (including the children's children and so on)
 * the returned node is made up of.  This essentially means that all parsing methods expect the
 * parser's current token to be the first one of the node they should parse, and return when the
 * current token is the last one they consist of (except if they don't, naturally).
 *
 * The parent node is set in the {@linkcode .finalizeNode} utility method (located all the way down
 * at the bottom of this file), which uses the parser's {@linkcode .parent} property.  For that
 * reason, all parsing methods must call {@linkcode .pushParent} before invoking other parsing
 * methods to get their required child nodes, and call {@linkcode .popParent} before returning.
 * This ensures that every node has its parent set correctly.
 *
 * The same concept applies to {@linkcode .context} -- a collection of flags that determine what
 * kind of tokens are allowed in the current parsing context (for example, the `return` keyword is
 * only allowed in function bodies).  Parsing methods whose statements are only allowed in certain
 * contexts should always call {@linkcode .assertContext} in order to make sure they don't
 * accidentally accept something that would be syntactically invalid in the current context.
 * Likewise, parsing methods that enter a new context ned to set the corresponding context flags ba
 * a call to {@linkcode .pushContext}, and (before returning) restore the context to how it was
 * before with {@linkcode .popContext}.
 *
 * For example, {@linkcode .parseBlockStatement} works in the following way:
 *
 * 1. Set the {@linkcode ParsingContextFlags.BlockStatements} flag with {@linkcode .pushContext}.
 * 2. Create a new {@linkcode BlockStatement} node with {@linkcode .makeNode}.  This method sets
 *    the node's position (line/column as well as absolute offset to the beginning of the file)
 *    based on the scanner's current position.
 * 3. Set the block node to be the parent of all subsequent nodes with {@linkcode .pushParent}.
 * 4. While the next consumed token is not a closing brace (a), invoke {@linkcode .parseStatement}
 *    (b) and add the returned node to the block node's statement list (c).  The statement node gets
 *    its `parent` preperty set correctly because of step (2), and can't have any nodes that aren't
 *    allowed in block statements because of step (1).
 * 5. Restore the old parent (i.e. the new block statement's parent) with {@linkcode .popParent}.
 * 6. Restore the old context with {@linkcode .popContext}.
 * 7. Call {@linkcode .finalizeNode} to automatically set the block's parent and its absolute length
 *    in characters (based on the starting position that was set in step (2) and the scanner's
 *    current absolute position).
 * 8. Return the block.
 *
 * This same core philosophy applies pretty much to all other parsing functions; this particular
 * example was chosen because it is probably one of the simplest ones that involve all of these
 * basic steps.
 */
export default class Parser implements IParser {

    private scanner: IScanner = undefined ! ;
    private sourceFile: SourceFile = undefined ! ;

    private context: ParsingContextFlags = ParsingContextFlags.SourceElements;
    private contextStack: ParsingContextFlags[] = [];

    private parent: Node = undefined ! ;
    private parentStack: Node[] = [];

    private token: ISemanticElement = undefined ! ;

    public async parseFile(fileName: string): Promise<SourceFile> {
        const text = await asyncReadFileStr(fileName);
        this.scanner = new Scanner(text);

        this.sourceFile = new alloc.SourceFile(SyntaxKind.SourceFile, 0, 0);
        this.sourceFile.statements = [];
        this.sourceFile.fileName = fileName;
        this.parent = this.sourceFile;

        while (this.consume().kind !== SyntaxKind.EndOfFileToken) {
            try {
                this.sourceFile.statements.push(this.parseStatement());
            } catch (err) {
                if (err instanceof UnholySyntaxError || err instanceof UnholyParserError) {
                    err.printDiagnostic(this.sourceFile);
                    throw err;
                }
            }
        };

        if (this.contextStack.length !== 0) {
            console.warn("Context stack had remaining entries");
            this.contextStack = [];
        }
        if (this.parentStack.length !== 0) {
            console.warn("Parent stack had remaining entries");
            this.parentStack = [];
        }

        return this.sourceFile;
    }

    /*
     * Statements
     */

    private parseStatement(): Statement {
        switch (this.token.kind) {
            case SyntaxKind.OpenBraceToken:
                return this.parseBlockStatement();
            case SyntaxKind.LetKeyword:
                return this.parseVarDeclarationStatement();
            case SyntaxKind.FuncKeyword:
                return this.parseFuncDeclarationStatement();
        }

        if (this.token.kind === SyntaxKind.EndOfFileToken) {
            throw new UnholyParserError("Unexpected end of file", this.token);
        } else {
            throw new UnholyParserError(`Unexpected token "${this.token.rawText}"`, this.token);
        }
    }

    private parseBlockStatement(): BlockStatement {
        /* See the doc comment at the top of the file for the explanation of these numbers */

        /* Step 1 */
        const block = new alloc.Node(SyntaxKind.BlockStatement, this.token.line, this.token.column);
        block.statements = [];

        this.pushContext(ParsingContextFlags.BlockStatements); /* Step 2 */
        this.pushParent(block); /* Step 3 */

        while (this.consume().kind !== SyntaxKind.CloseBraceToken) { /* Step 4a */
            const statement = this.parseStatement(); /* Step 4b */
            if (statement.flags & (NodeFlags.HasError | NodeFlags.ChildHasError)) {
                block.flags |= NodeFlags.ChildHasError;
            }
            block.statements.push(statement); /* Step 4c */
        }

        this.popParent(); /* Step 5 */
        this.popContext(); /* Step 6 */

        return this.finalizeNode(block); /* Step 7 && 8 */
    }

    private parseVarDeclarationStatement(): VarDeclarationStatement {
        this.assertContext(
            ParsingContextFlags.SourceElements | ParsingContextFlags.BlockStatements
        );
        const stmt = new alloc.Node(
            SyntaxKind.VarDeclarationStatement,
            this.token.line,
            this.token.column
        );
        this.pushContext(ParsingContextFlags.VarDeclarations);
        this.pushParent(stmt);

        stmt.declaration = this.parseVarDeclaration();

        this.popParent();
        this.popContext();
        return this.finalizeNode(stmt);
    }

    public parseFuncDeclarationStatement(): FuncDeclarationStatement {
        this.assertContext(ParsingContextFlags.SourceElements);
        const stmt = new alloc.Node(
            SyntaxKind.FuncDeclarationStatement,
            this.token.line,
            this.token.column
        );
        this.pushContext(ParsingContextFlags.FuncDeclarations);
        this.pushParent(stmt);

        stmt.declaration = this.parseFuncDeclaration();

        this.popParent();
        this.popContext();
        return this.finalizeNode(stmt);
    }

    /*
     * Declarations
     */

    private parseVarDeclaration(): VarDeclaration {
        this.assertContext(ParsingContextFlags.VarDeclarations);
        const node = new alloc.Node(SyntaxKind.VarDeclaration, this.token.line, this.token.column);
        this.pushParent(node);

        node.name = this.parseIdentifier();
        if (this.consumeOptional(SyntaxKind.ColonToken)) {
            node.type = this.parseType();
        }
        this.consume(SyntaxKind.SemicolonToken);

        this.popParent();
        return this.finalizeNode(node);
    }

    private parseFuncDeclaration(): FuncDeclaration {
        this.assertContext(ParsingContextFlags.FuncDeclarations);

        const node = new alloc.Node(SyntaxKind.FuncDeclaration, this.token.line, this.token.column);
        this.pushParent(node);

        node.name = this.parseIdentifier();

        /* Parameter list */
        this.consume(SyntaxKind.OpenParenToken);
        if (this.consumeOptional(SyntaxKind.CloseParenToken)) {
            node.params = [];
        } else {
            this.pushContext(ParsingContextFlags.ParameterDeclarations);
            node.params = this.parseDelimitedList(
                () => this.parseParameterDeclaration(),
                SyntaxKind.CloseParenToken
            );
            this.popContext();
        }

        /* Return type */
        this.consume(SyntaxKind.ColonToken);
        node.type = this.parseType();

        /* Body */
        this.consume(SyntaxKind.OpenBraceToken);
        node.body = this.parseBlockStatement();

        this.popParent();
        return this.finalizeNode(node);
    }

    /**
     * Parse a single signature parameter declaration.
     */
    private parseParameterDeclaration(): ParameterDeclaration {
        this.assertContext(ParsingContextFlags.ParameterDeclarations);
        const node = new alloc.Node(
            SyntaxKind.ParameterDeclaration,
            this.token.line,
            this.token.column
        );
        this.pushParent(node);

        /* Name: Type */
        node.name = this.parseIdentifier();
        this.consume(SyntaxKind.ColonToken);
        node.type = this.parseType();

        this.popParent();
        return this.finalizeNode(node);
    }

    private parseIdentifier(): Identifier {
        const node = this.makeIdentifier(this.consume(SyntaxKind.Identifier));
        node.name = this.token.rawText;
        return this.finalizeNode(node);
    }

    private parseType(): TypeNode {
        /* only keyword types are supported right now */
        const keyword = this.consume(
            SyntaxKind.BoolKeyword,
            SyntaxKind.IntKeyword,
            SyntaxKind.VoidKeyword,
        );
        const node: KeywordTypeNode = this.makeNode(keyword) as KeywordTypeNode;
        return this.finalizeNode(node);
    }

    /**
     * Parse a comma-separated list of elements.
     *
     * @param parse Callback for parsing individual elements.
     * @param terminator The list terminator token.
     * @returns The list of elements.
     */
    private parseDelimitedList<T extends Node>(parse: () => T, terminator: SyntaxKind):
    NodeArray<T> {
        const list = this.createNodeArray<T>();
        while (true) {
            list.push(parse());

            if (this.consumeOptional(SyntaxKind.CommaToken)) {
                continue;
            }

            this.consume(terminator);
            break;
        }

        return list;
    }

    /*
     * Utilities
     */

    /**
     * Consume the next token.
     *
     * @param expected If specified, throw an error if the scanned token is not this expected one
     *     (or in this array of expected tokens).
     * @returns The next token.
     */
    private consume<T extends SyntaxKind>(...expected: T[]): ISemanticElement<T> {
        const elem = this.scanner.nextToken();

        if (expected.length !== 0) {
            let invalid = expected.indexOf(elem.kind as T) === -1;

            if (invalid) {
                /* TODO: List all expected tokens */
                let tokenString = tokenToString(expected[0]);
                if (tokenString !== undefined) {
                    throw new UnholyParserError(`"${tokenString}" expected`, elem);
                } else {
                    throw new UnholyParserError(`Unexpected token "${elem.rawText}"`, elem);
                }
            }
        }

        return this.token = elem as ISemanticElement<T>;
    }

    private consumeOptional(...tokenKinds: SyntaxKind[]): boolean {
        return this.scanner.tryScan(() => tokenKinds.indexOf(this.scanner.nextToken().kind) !== -1);
    }

    private makeNode<S extends SyntaxKind>(tokenOrElem: S | ISemanticElement<S>): AutoNode<S> {
        let node: AutoNode<S>;
        if (typeof tokenOrElem === "number") { /* tokenOrElem is a SyntaxKind */
            node = new alloc.Node(tokenOrElem, this.token.line, this.token.column);
        } else { /* tokenOrElem is an ISemanticElement */
            node = new alloc.Node(tokenOrElem.kind, tokenOrElem.line, tokenOrElem.column);
        }

        node.pos = this.scanner.getPos();
        return node;
    }

    private makeToken<TKind extends SyntaxKind>(token: ISemanticElement<TKind>): TokenNode<TKind> {
        const tokenNode = new alloc.TokenNode(token.kind, token.line, token.column);
        tokenNode.pos = this.scanner.getPos();
        return tokenNode;
    }

    private makeIdentifier(token: ISemanticElement<SyntaxKind.Identifier>): Identifier {
        const identifier = new alloc.Identifier(SyntaxKind.Identifier, token.line, token.column);
        identifier.pos = this.scanner.getPos();
        return identifier;
    }

    private finalizeNode<T extends Node>(node: T): T {
        node.length = this.scanner.getPos() - node.pos;

        if (node.parent === undefined) {
            node.parent = this.parent;
        }

        return node;
    }

    private createNodeArray<T extends Node = Node>(): NodeArray<T> {
        const ret: any = [];
        ret.line = this.token.line;
        ret.column = this.token.column;
        ret.pos = this.token.pos;
        ret.length = 0;
        return ret;
    }

    /**
     * Check if at least one of the `required` flags is currently set, and throw an error if not.
     *
     * @param required The required parsing context flags.
     * @param loose If `false`, ALL `required` flags need to be set.
     */
    private assertContext(required: ParsingContextFlags, loose: boolean = true) {
        const masked = this.context & required;
        if (loose && masked === 0 || !loose && masked !== this.context) {
            throw new UnholyParserError(
                `"${this.token.rawText}" not allowed in this context`,
                this.token
            );
        }
    }

    private pushContext(context: ParsingContextFlags): void {
        this.contextStack.push(this.context);
        this.context = context;
    }

    private popContext(): ParsingContextFlags {
        const oldContext = this.context;

        const popped = this.contextStack.pop();
        if (popped !== undefined) {
            this.context = popped;
        }

        return oldContext;
    }

    private pushParent(parent: Node): void {
        this.parentStack.push(this.parent);
        this.parent = parent;
    }

    private popParent(): Node {
        const oldParent = this.parent;

        const popped = this.parentStack.pop();
        if (popped !== undefined) {
            this.parent = popped;
        }

        return oldParent;
    }

}
