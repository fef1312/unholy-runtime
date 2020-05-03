/**
 * Node allocation utilities.
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

import { Node, NodeFlags, SourceFile, Identifier } from "../types/ast/node";
import type { SyntaxKind, TypeKeywordSyntaxKind } from "../types/syntax";
import type TokenNode from "../types/ast/token";
import type {
    BlockStatement,
    EmptyStatement,
    ExpressionStatement,
    IfStatement,
    ReturnStatement,
    FuncDeclarationStatement,
    VarDeclarationStatement,
} from "../types/ast/statement";
import { TypeNode } from "../types/ast/type";
import { BinaryExpression, CallExpression, VarDeclaration, FuncDeclaration } from "../types/ast/expression";

function NodeConstructor(this: Node, kind: SyntaxKind, line: number = NaN, column: number = NaN) {
    this.line = line;
    this.column = column;
    this.length = 1;
    this.kind = kind;
    this.flags = NodeFlags.None;
    this.parent = undefined!;
}

function TokenNodeConstructor(this: Node, kind: SyntaxKind, line: number = NaN,
                              column: number = NaN) {
    this.line = line;
    this.column = column;
    this.length = 1;
    this.kind = kind;
    this.flags = NodeFlags.None;
    this.parent = undefined!;
}

function IdentifierConstructor(this: Node, kind: SyntaxKind, line: number = NaN,
                               column: number = NaN) {
    this.line = line;
    this.column = column;
    this.length = 1;
    this.kind = kind;
    this.flags = NodeFlags.None;
    this.parent = undefined!;
}

type AutoNode<T extends SyntaxKind> =
    T extends TypeKeywordSyntaxKind ? TypeNode :
    T extends SyntaxKind.BlockStatement ? BlockStatement :
    T extends SyntaxKind.EmptyStatement ? EmptyStatement :
    T extends SyntaxKind.ExpressionStatement ? ExpressionStatement :
    T extends SyntaxKind.FuncDeclarationStatement ? FuncDeclarationStatement :
    T extends SyntaxKind.VarDeclarationStatement ? VarDeclarationStatement :
    T extends SyntaxKind.IfStatement ? IfStatement :
    T extends SyntaxKind.ReturnStatement ? ReturnStatement :
    T extends SyntaxKind.BinaryExpression ? BinaryExpression :
    T extends SyntaxKind.CallExpression ? CallExpression :
    T extends SyntaxKind.VarDeclaration ? VarDeclaration :
    T extends SyntaxKind.FuncDeclaration ? FuncDeclaration :
    T extends SyntaxKind.Identifier ? Identifier :
    Node;

/**
 * Quick and dirty (with the focus being clearly on the former) allocator functions that won't
 * produce Nodes conforming exactly to their spec, but hey it's quick.
 */
interface ObjectAllocator {
    readonly Node: new <TKind extends SyntaxKind>(kind: TKind, line?: number, column?: number)
        => AutoNode<TKind>;

    readonly TokenNode: new <TKind extends SyntaxKind>(kind: TKind, line?: number, column?: number)
        => TokenNode<TKind>;

    readonly Identifier: new (kind: SyntaxKind.Identifier, line?: number, column?: number)
        => Identifier;

    readonly SourceFile: new (kind: SyntaxKind.SourceFile, line?: number, column?: number)
        => SourceFile;
}

const alloc: ObjectAllocator = {
    Node: NodeConstructor as any,
    TokenNode: TokenNodeConstructor as any,
    Identifier: IdentifierConstructor as any,
    SourceFile: NodeConstructor as any,
};
export default alloc;
