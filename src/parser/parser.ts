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

import IParser, { ParsingContext } from "../types/parser";
import { SourceFile, Node, NodeFlags, NodeArray, Identifier } from "../types/ast/node";
import type ISemanticElement from "../types/semantic-element";
import { asyncReadFileStr } from "../utils/fs";
import alloc from "../utils/alloc";
import { SyntaxKind } from "../types/syntax";
import type IScanner from "../types/scanner";
import Scanner from "../lexer/scanner";
import type { Statement, BlockStatement, VarDeclarationStatement, FuncDeclarationStatement } from "../types/ast/statement";
import { UnholyParserError, UnholySyntaxError } from "../utils/errors";
import { VarDeclaration, FuncDeclaration, ParameterDeclaration } from "../types/ast/expression";
import { tokenToString } from "../lexer/token-maps";
import { TypeNode, KeywordTypeNode } from "../types/ast/type";
import AutoNode from "../types/ast/auto-node";
import TokenNode from "../types/ast/token";

export default class Parser implements IParser {

    private scanner: IScanner = undefined ! ;
    private sourceFile: SourceFile = undefined ! ;

    private context: ParsingContext = ParsingContext.SourceElements;
    private contextStack: ParsingContext[] = [];

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
        const block = new alloc.Node(SyntaxKind.BlockStatement, this.token.line, this.token.column);
        block.statements = [];

        this.pushContext(ParsingContext.BlockStatements);
        this.pushParent(block);

        while (this.consume().kind !== SyntaxKind.CloseBraceToken) {
            const statement = this.parseStatement();
            if (statement.flags & (NodeFlags.HasError | NodeFlags.ChildHasError)) {
                block.flags |= NodeFlags.ChildHasError;
            }
            block.statements.push(statement);
        }

        this.popParent();
        this.popContext();

        return this.finalizeNode(block);
    }

    private parseVarDeclarationStatement(): VarDeclarationStatement {
        this.assertContext(ParsingContext.SourceElements, ParsingContext.BlockStatements);
        const stmt = new alloc.Node(
            SyntaxKind.VarDeclarationStatement,
            this.token.line,
            this.token.column
        );
        this.pushContext(ParsingContext.VarDeclarations);
        this.pushParent(stmt);

        stmt.declaration = this.parseVarDeclaration();

        this.popParent();
        this.popContext();
        return this.finalizeNode(stmt);
    }

    private parseVarDeclaration(): VarDeclaration {
        this.assertContext(ParsingContext.VarDeclarations);
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

    public parseFuncDeclarationStatement(): FuncDeclarationStatement {
        this.assertContext(ParsingContext.SourceElements);
        const stmt = new alloc.Node(
            SyntaxKind.FuncDeclarationStatement,
            this.token.line,
            this.token.column
        );
        this.pushContext(ParsingContext.FuncDeclarations);
        this.pushParent(stmt);

        stmt.declaration = this.parseFuncDeclaration();

        this.popParent();
        this.popContext();
        return this.finalizeNode(stmt);
    }

    private parseFuncDeclaration(): FuncDeclaration {
        this.assertContext(ParsingContext.FuncDeclarations);

        const node = new alloc.Node(SyntaxKind.FuncDeclaration, this.token.line, this.token.column);
        this.pushParent(node);

        node.name = this.parseIdentifier();

        /* Parameter list */
        this.consume(SyntaxKind.OpenParenToken);
        if (this.consumeOptional(SyntaxKind.CloseParenToken)) {
            node.params = [];
        } else {
            this.pushContext(ParsingContext.ParameterDeclarations);
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
        this.assertContext(ParsingContext.ParameterDeclarations);
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
     * Begin utilities
     */

    private assertContext(...allowed: ParsingContext[]) {
        if (allowed.indexOf(this.context) === -1) {
            throw new UnholyParserError(
                `"${this.token.rawText}" not allowed in this context`,
                this.token
            );
        }
    }

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

    private makeNode<S extends SyntaxKind>(token: ISemanticElement<S>): AutoNode<S> {
        const node = new alloc.Node(token.kind, token.line, token.column);
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

    private pushContext(context: ParsingContext): void {
        this.contextStack.push(this.context);
        this.context = context;
    }

    private popContext(): ParsingContext {
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
