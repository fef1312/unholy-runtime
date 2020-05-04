/**
 * All expression nodes.
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

import type { Node, Identifier, LiteralLikeNode } from "./node";
import type { SyntaxKind } from "../syntax";
import type { BinaryOperatorTokenNode, AssignmentOperatorTokenNode } from "./token";
import type { TypeNode } from "./type";
import type { BlockStatement } from "./statement";

/*
 * Note about brands:
 * This is only used for making child interfaces of Node that don't have an own property
 * incompatible with each other (yes, this is taken straight from tsc's 5-year-old code).
 * For example, you could assign an Expression to a LeftHandSideExpression if it weren't for that
 * brand member.  That field will get compiled out, so it comes with zero performance impact.
 */

export interface Expression extends Node {
    _expressionBrand: any;
    parent: Node;
}

/**
 * _LeftHandSideExpression_ :
 * - _{@linkcode MemberExpression}_
 */
export interface LeftHandSideExpression extends Expression {
    _leftHandSideExpressionBrand: any;
}

/**
 * _AssignmentExpression_:
 *
 * - _LeftHandSideExpression_ _OperatorToken_ _Expression_
 *
 * where _OperatorToken_ is one of
 *
 * - `=` (simple assignment)
 * - `+=` (addition)
 * - `-=` (subtraction)
 * - `*=` (multiplication)
 * - `/=` (division)
 * - `%=` (modulus)
 * - `**=` (exponentiation)
 * - `&=` (bitwise AND)
 * - `|=` (bitwise OR)
 * - `^=` (bitwise XOR)
 * - `<<=` (bitwise left shift)
 * - `>>=` (bitwise right shift)
 * - `<<<=` (bitwise left rotation)
 * - `>>>=` (bitwise right rotation)
 *
 * Everything except the first operator is unimplemented right now.
 */
export interface AssignmentExpression<O extends AssignmentOperatorTokenNode>
extends BinaryExpression {
    left: LeftHandSideExpression;
    operatorToken: O;
}

/**
 * _BinaryExpression_:
 *
 * - _Expression_ _OperatorToken_ _Expression_
 *
 * where _OperatorToken_ is one of
 *
 * - `,` (list separator)
 * - `.` (member access) (unimplemented)
 * - `+` (addition)
 * - `-` (subtraction)
 * - `*` (multiplication) (unimplemented)
 * - `/` (division) (unimplemented)
 * - `%` (modulus) (unimplemented)
 * - `**` (exponentiation) (unimplemented)
 * - `==` (equality)
 * - `!=` (inequality) (unimplemented)
 * - `>` (numerically greater than)
 * - `<` (numerically less than)
 * - `>=` (equal to or numerically greater than) (unimplemented)
 * - `<=` (equal to or numerically less than) (unimplemented)
 * - `&&` (logical AND) (unimplemented)
 * - `||` (logical OR) (unimplemented)
 * - `!` (logical NOT) (unimplemented)
 * - `&` (bitwise AND) (unimplemented)
 * - `|` (bitwise OR) (unimplemented)
 * - `~` (bitwise NOT) (unimplemented)
 * - `^` (bitwise XOR) (unimplemented)
 * - `<<` (bitwise left shift) (unimplemented)
 * - `>>` (bitwise right shift) (unimplemented)
 * - `<<<` (bitwise left rotate) (unimplemented)
 * - `>>>` (bitwise right rotate) (unimplemented)
 */
export interface BinaryExpression extends Expression {
    kind: SyntaxKind.BinaryExpression;
    /** The left-hand side of the expression. */
    left: Expression;
    /** The operator used for the expression. */
    operatorToken: BinaryOperatorTokenNode;
    /** The right-hand side of the expression. */
    right: Expression;
}

/**
 * _CallExpression_ :
 * - _MemberExpression_ _Arguments_
 *
 * _Arguments_ :
 * - `(` `)`
 * - `(` _ArgumentList_ `)`
 *
 * _ArgumentList_ :
 * - _{@linkcode Identifier}_ `:` _Type_
 * - _ArgumentList_ `,` _{@linkcode Identifier}_ `:` _Type_
 */
export interface CallExpression extends PrimaryExpression {
    kind: SyntaxKind.CallExpression;
    callee: LeftHandSideExpression;
    args: Expression[];
}

/**
 * _MemberExpression_ :
 * - _{@linkcode PrimaryExpression}_ but not _Literal_
 * - _MemberExpression_ `[` _{@linkcode Expression}_ `]`
 * - _MemberExpression_ `.` _{@linkcode Identifier}_
 * - `new` _MemberExpression_ _Arguments_ (see {@linkcode CallExpression} for _Arguments_)
 */
export interface MemberExpression extends LeftHandSideExpression {
    _memberExpressionBrand: any;
}

/**
 * _PrimaryExpression_ :
 * - `this` (unimplemented)
 * - `super` (unimplemented)
 * - _{@linkcode Identifier}_
 * - _{@linkcode Literal}_
 */
export interface PrimaryExpression extends MemberExpression {
    _primaryExpressionBrand: any;
}

/**
 * _LiteralExpression_ :
 * - _{@linkcode BoolLiteral}_
 * - _{@linkcode IntegerLiteral}_
 * - _FloatLiteral_ (unimplemented)
 * - _StringLiteral_ (unimplemented)
 * - _CharLiteral_ (unimplemented)
 * - _ComplexLiteral_ (unimplemented)
 * - _QuaternLiteral_ (unimplemented)
 * - _ArrayLiteral_ (unimplemented)
 * - _RegexLiteral_ (unimplemented)
 * - _StructLiteral_ (unimplemented)
 */
export interface LiteralExpression extends LiteralLikeNode, PrimaryExpression {
    _literalExpressionBrand: any;
}

export interface Declaration extends Node {
    _declarationBrand: any;
    parent: Node;
}

export interface NamedDeclaration extends Declaration {
    name: Identifier;
}

/**
 * _VarDeclaration_ :
 *
 * - `let` _Identifier_ `:` _Type_ `;`
 * - _LetOrConst_ _Identifier_ `=` _Expression_ `;`
 * - _LetOrConst_ _Identifier_ `:` _Type_ `=` _Expression_ `;`
 *
 * _LetOrConst_ :
 * - `let`
 * - `const`
 */
export interface VarDeclaration extends NamedDeclaration {
    kind: SyntaxKind.VarDeclaration;
    type?: TypeNode;
    initializer?: Expression;
}
/**
 * _ParameterDeclaration_ :
 *
 * - _{@linkcode Identifier}_ `:` _Type_
 */
export interface ParameterDeclaration extends NamedDeclaration {
    kind: SyntaxKind.ParameterDeclaration;
    parent: FuncDeclaration;
    type: TypeNode;
}

/**
 * _FuncDeclaration_ :
 *
 * - `func` _Signature_ _{@linkcode BlockStatement}_
 *
 * _Signature_ :
 *
 * - `(` `)` `:` _Type_
 * - `(` _ParameterList_ `)` `:` _Type_
 *
 * _ParameterList_ :
 *
 * - _Identifier_ `:` _Type_
 * - _ParameterList_ `,` _{@linkcode ParameterDeclaration}_
 */
export interface FuncDeclaration extends NamedDeclaration {
    kind: SyntaxKind.FuncDeclaration;
    params: ParameterDeclaration[];
    type: TypeNode;
    body: BlockStatement;
}

/**
 * _BoolLiteral_ :
 *
 * - `true`
 * - `false`
 */
export interface BoolLiteral extends PrimaryExpression {
    kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
}

/**
 * _IntegerLiteral_ :
 *
 * - `0b` _BinaryDigits_
 * - `0o` _OctalDigits_
 * - `0x` _HexDigits_
 * - _FirstDecimalDigit_
 * - _FirstDecimalDigit_ _DecimalDigits_
 *
 * NOTE: Only the last two productions are currently implemented.
 *
 * _BinaryDigits_ :
 *
 * - _BinaryDigit_
 * - _BinaryDigits_ _BinaryDigit_
 *
 * _BinaryDigit_ :
 *
 * - `0`
 * - `1`
 *
 * _OctalDigits_ :
 *
 * - _OctalDigit_
 * - _OctalDigits_ _OctalDigit_
 *
 * _OctalDigit_ :
 *
 * Either of `0`, `1`, `2`, `3`, `4`, `5`, `6`, or `7`
 *
 * _DecimalDigits_ :
 *
 * - _DecimalDigit_
 * - _DecimalDigits_ _DecimalDigit_
 *
 * _DecimalDigit_ :
 *
 * Either of _OctalDigit_, `8`, or `9`
 *
 * _FirstDecimalDigit_ :
 *
 * Either of _DecimalDigit_, but not `0`
 *
 * _HexDigits_ :
 *
 * - _HexDigit_
 * - _HexDigits_ _HexDigit_
 *
 * _HexDigit_ :
 *
 * Either of _DecimalDigit_, `A`, `B`, `C`, `D`, `E`, `F`, `a`, `b`, `c`, `d`, `e`, or `f`
 */
export interface IntegerLiteral extends LiteralExpression, Declaration {
    kind: SyntaxKind.IntegerLiteral;
}
