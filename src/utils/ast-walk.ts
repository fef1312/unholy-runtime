/**
 * Recursively walk over an AST.
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

import { SyntaxKind } from "../types/syntax";
import { tokenToString } from "../lexer/token-maps";

import type { Node, SourceFile, Identifier } from "../types/ast/node";
import type {
    VarDeclarationStatement,
    BlockStatement,
    FuncDeclarationStatement,
    Statement,
    ExpressionStatement,
    ReturnStatement,
    IfStatement,
} from "../types/ast/statement";
import type {
    VarDeclaration,
    FuncDeclaration,
    ParameterDeclaration,
    Expression,
    BinaryExpression,
    IntegerLiteral,
} from "../types/ast/expression";
import type { TypeNode, KeywordTypeNode } from "../types/ast/type";
import TokenNode from "../types/ast/token";

/**
 * A callback that is invoked on every node in an AST.
 *
 * @param current The current node.
 * @param depth The current depth in the AST.
 * @param name The node name.
 * @param leaf The parent node's leaf name this node is attached to.
 */
export type WalkCallback = (current: Node, depth: number, name: string, leaf?: string) => void;

/**
 * Walk over every node in an abstract syntax tree.
 *
 * @param sourceFile The source file to walk over.
 * @param cb A callback that will be invoked for every tree node.
 */
export default function astWalk(sourceFile: SourceFile, cb: WalkCallback): void {
    cb(sourceFile, 0, `SourceFile <${sourceFile.fileName}>`, "file");
    sourceFile.statements.forEach(stmt => visitStatement(cb, stmt, 1, "statement"));
}

function visitStatement(cb: WalkCallback, node: Statement, depth: number, leaf?: string) {
    switch (node.kind) {
        case SyntaxKind.BlockStatement:
            visitBlockStatement(cb, node as BlockStatement, depth, leaf);
            return;
        case SyntaxKind.VarDeclarationStatement:
            visitVarDeclarationStatement(cb, node as VarDeclarationStatement, depth, leaf);
            return;
        case SyntaxKind.FuncDeclarationStatement:
            visitFuncDeclarationStatement(cb, node as FuncDeclarationStatement, depth, leaf);
            return;
        case SyntaxKind.IfStatement:
            visitIfStatement(cb, node as IfStatement, depth, leaf);
            return;
        case SyntaxKind.ReturnStatement:
            visitReturnStatement(cb, node as ReturnStatement, depth, leaf);
            return;
        case SyntaxKind.ExpressionStatement:
            visitExpressionStatement(cb, node as ExpressionStatement, depth, leaf);
            return;
    }
    cb(node, depth, "Statement < ~unimplemented~ >", leaf);
}

function visitBlockStatement(cb: WalkCallback, node: BlockStatement, depth: number, leaf?: string) {
    cb(node, depth, "BlockStatement", leaf);
    node.statements.forEach(stmt => visitStatement(cb, stmt, depth + 1, "statement"));
}

function visitVarDeclarationStatement(cb: WalkCallback, node: VarDeclarationStatement,
                                      depth: number, leaf?: string) {
    cb(node, depth, "VarDeclarationStatement", leaf);
    visitVarDeclaration(cb, node.declaration, depth + 1, "declaration");
}

function visitFuncDeclarationStatement(cb: WalkCallback, node: FuncDeclarationStatement,
                                       depth: number, leaf?: string) {
    cb(node, depth, "FuncDeclarationStatement", leaf);
    visitFuncDeclaration(cb, node.declaration, depth + 1, "declaration");
}

function visitIfStatement(cb: WalkCallback, node: IfStatement, depth: number, leaf?: string) {
    cb(node, depth, "IfStatement", leaf);
    visitExpression(cb, node.condition, depth + 1, "condition");
    visitStatement(cb, node.thenStatement, depth + 1, "thenStatement");
    if (node.elseStatement !== undefined) {
        visitStatement(cb, node.elseStatement, depth + 1, "elseStatement");
    }
}

function visitReturnStatement(cb: WalkCallback, node: ReturnStatement, depth: number, leaf?: string) {
    cb(node, depth, "ReturnStatement", leaf);
    if (node.expression !== undefined) {
        visitExpression(cb, node.expression, depth + 1, "expression");
    }
}

function visitExpressionStatement(cb: WalkCallback, node: ExpressionStatement, depth: number,
                                  leaf?: string) {
    cb(node, depth, "ExpressionStatement", leaf);
    visitExpression(cb, node.expression, depth + 1, "expression");
}

function visitVarDeclaration(cb: WalkCallback, node: VarDeclaration, depth: number, leaf?: string) {
    cb(node, depth, "VarDeclaration", leaf);
    visitIdentifier(cb, node.name, depth + 1, "name");
    if (node.type !== undefined) {
        visitType(cb, node.type, depth + 1, "type");
    }
    if (node.initializer !== undefined) {
        visitExpression(cb, node.initializer, depth + 1, "initializer");
    }
}

function visitFuncDeclaration(cb: WalkCallback, node: FuncDeclaration, depth: number,
    leaf?: string) {
    cb(node, depth, "FuncDeclaration", leaf);
    visitIdentifier(cb, node.name, depth + 1, "name");
    node.params.forEach(paramNode => visitParameterDeclaration(cb, paramNode, depth + 1, "param"));
    visitType(cb, node.type, depth + 1, "type");
    visitBlockStatement(cb, node.body, depth + 1, "body");
}

function visitParameterDeclaration(cb: WalkCallback, node: ParameterDeclaration, depth: number,
                                  leaf?: string) {
    cb(node, depth, "ParameterDeclaration", leaf);
    visitIdentifier(cb, node.name, depth + 1, "name");
    visitType(cb, node.type, depth + 1, "type");
}

function visitIdentifier(cb: WalkCallback, node: Identifier, depth: number, leaf?: string) {
    cb(node, depth, `Identifier < ${node.name} >`, leaf);
}

function visitType(cb: WalkCallback, node: TypeNode, depth: number, leaf?: string) {
    switch (node.kind) {
        case SyntaxKind.BoolKeyword:
        case SyntaxKind.IntKeyword:
        case SyntaxKind.VoidKeyword:
            cb(node, depth, `TypeNode < ${tokenToString((node as KeywordTypeNode).kind)} >`, leaf);
            return;
    }
    cb(node, depth, "TypeNode < ~unimplemented~ >");
}

function visitToken(cb: WalkCallback, node: TokenNode<SyntaxKind>, depth: number, leaf?: string) {
    cb(node, depth, `Token < ${tokenToString(node.kind)} >`, leaf);
}

function visitExpression(cb: WalkCallback, node: Expression, depth: number, leaf?: string) {
    switch (node.kind) {
        case SyntaxKind.BinaryExpression:
            visitBinaryExpression(cb, node as BinaryExpression, depth, leaf);
            return;
        case SyntaxKind.Identifier:
            visitIdentifier(cb, node as Identifier, depth, leaf);
            return;
        case SyntaxKind.IntegerLiteral:
            visitIntegerLiteral(cb, node as IntegerLiteral, depth, leaf);
            return;
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
            cb(node, depth, `BoolLiteral < ${tokenToString(node.kind)} >`, leaf);
            return;
    }

    cb(node, depth, "Expression < ~unimplemented~ >", leaf);
}

function visitBinaryExpression(cb: WalkCallback, node: BinaryExpression, depth: number,
                               leaf?: string) {
    cb(node, depth, "BinaryExpression", leaf);
    visitExpression(cb, node.left, depth + 1, "left");
    visitToken(cb, node.operatorToken, depth + 1, "operatorToken");
    visitExpression(cb, node.right, depth + 1, "right");
}

function visitIntegerLiteral(cb: WalkCallback, node: IntegerLiteral, depth: number, leaf?: string) {
    cb(node, depth, `IntegerLiteral < ${node.text} >`, leaf);
}
