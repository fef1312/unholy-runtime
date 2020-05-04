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

import {
    Node as _NodeInterface,
    NodeFlags,
    SourceFile,
    Identifier as _IdentifierInterface
} from "../types/ast/node";
import type { SyntaxKind } from "../types/syntax";
import type TokenNode from "../types/ast/token";
import type AutoNode from "../types/ast/auto-node";

class Node implements _NodeInterface {

    public line: number;
    public column: number;
    public pos: number;
    public length: number;
    public flags: NodeFlags;
    public kind: SyntaxKind;
    public parent?: _NodeInterface;

    public constructor(kind: SyntaxKind, line: number = NaN, column: number = NaN) {
        this.line = line;
        this.column = column;
        this.kind = kind;
        this.flags = NodeFlags.None;
    }

}

class Token<T extends SyntaxKind> implements TokenNode<T> {

    public line: number;
    public column: number;
    public pos: number;
    public length: number;
    public flags: NodeFlags;
    public kind: T;
    public parent: _NodeInterface;

    public constructor(kind: T, line: number = NaN, column: number = NaN) {
        this.line = line;
        this.column = column;
        this.kind = kind;
        this.flags = NodeFlags.None;
    }

}

class Identifier implements _IdentifierInterface {

    public _expressionBrand: any;
    public _primaryExpressionBrand: any;
    public _leftHandSideExpressionBrand: any;
    public _memberExpressionBrand: any;

    public line: number;
    public column: number;
    public pos: number;
    public length: number;
    public flags: NodeFlags;
    public kind: SyntaxKind;

    public parent: _NodeInterface;
    public name: string;

    public constructor(kind: SyntaxKind, line: number = NaN, column: number = NaN) {
        this.line = line;
        this.column = column;
        this.kind = kind;
        this.flags = NodeFlags.None;
    }

}

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
    Node: Node as any,
    TokenNode: Token as any,
    Identifier: Identifier as any,
    SourceFile: Node as any,
};
export default alloc;
