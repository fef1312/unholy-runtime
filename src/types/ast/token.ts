/**
 * Typedefs for tokens.
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
import type { Node } from "./node";
import type { BinaryOperator, AssignmentOperator } from "./operator";

/** A single token. */
export default interface TokenNode<TKind extends SyntaxKind> extends Node {
    kind: TKind;
    parent: Node;
}

export type EqualsTokenNode = TokenNode<SyntaxKind.EqualsToken>;
export type PlusTokenNode = TokenNode<SyntaxKind.PlusToken>;
export type MinusTokenNode = TokenNode<SyntaxKind.MinusToken>;
export type AsteriskTokenNode = TokenNode<SyntaxKind.AsteriskToken>;
export type SlashTokenNode = TokenNode<SyntaxKind.SlashToken>;
export type PercentTokenNode = TokenNode<SyntaxKind.PercentToken>;
export type BinaryOperatorTokenNode = TokenNode<BinaryOperator>;
export type AssignmentOperatorTokenNode = TokenNode<AssignmentOperator>;
