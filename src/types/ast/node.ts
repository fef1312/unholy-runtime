/**
 * AST node types.
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

import type { SyntaxKind } from "../syntax";
import type { Statement } from "./statement";
import type { PrimaryExpression } from "./expression";

export const enum NodeFlags {
    None                = 0 | 0,
    HasError            = 1 << 0,
    ChildHasError       = 1 << 1,
}

/** Any node in the AST. */
export interface Node {
    /** The line number of the node's first character. */
    line: number;
    /** The column number of the node's first character. */
    column: number;
    /** The absolute character offset of the node's first character. */
    pos: number;
    /** The length (as in the source text) of this node. */
    length: number;
    /** The kind of this node. */
    kind: SyntaxKind;
    flags: NodeFlags;
    /**
     * The parent node.
     * Every node that is not a {@linkcode SourceFile} has a parent.
     */
    parent?: Node;
}

export interface NodeArray<T extends Node> extends Array<T> {
    line: number;
    column: number;
    pos: number;
    length: number;
    hasTrailingComma?: boolean;
}

/** A node that holds a literal-like value, e.g. `123` or `"asdf"`. */
export interface LiteralLikeNode extends Node {
    /** The literal text w/out quotes and resolved escape sequences. */
    text: string;
    parent: Node;
}

/** The top-level node in the AST. */
export interface SourceFile extends Node {
    kind: SyntaxKind.SourceFile;
    fileName: string;
    statements: Statement[];
    parent: undefined;
}

export interface Identifier extends PrimaryExpression {
    name: string;
    parent: Node;
}
