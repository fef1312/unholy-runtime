/**
 * Typedefs for operators.
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

/**
 * An operator that performs some sort of addition
 * (subtraction is considered adding negative values).
 */
export type AdditiveOperator
    = SyntaxKind.PlusToken
    | SyntaxKind.MinusToken
    ;

/** A relational (comparing two values) operator. */
export type RelationalOperator
    = SyntaxKind.LessThanToken
    | SyntaxKind.GreaterThanToken
    ;

/** A relational operator, or one with higher precedence. */
export type RelationalOperatorOrHigher
    = AdditiveOperator
    | RelationalOperator
    ;

/** An operator that evaluates equality. */
export type EqualityOperator
    = SyntaxKind.EqualsEqualsToken
    ;

/** An equality operator, or one with higher precedence. */
export type EqualityOperatorOrHigher
    = RelationalOperatorOrHigher
    | EqualityOperator
    ;

/** An assignment operator. */
export type AssignmentOperator
    = SyntaxKind.EqualsToken
    ;

/** An assignment operator or one with higher precedence. */
export type AssignmentOperatorOrHigher
    = EqualityOperatorOrHigher
    | AssignmentOperator
    ;

/** Any binary operator. */
export type BinaryOperator
    = AssignmentOperatorOrHigher
    | SyntaxKind.CommaToken
    ;

/** A unary operator that prefixes an identifier or literal. */
export type PrefixUnaryOperator
    = SyntaxKind.PlusToken
    | SyntaxKind.MinusToken
    ;
