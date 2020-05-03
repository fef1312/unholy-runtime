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

export interface LeftHandSideExpression extends Expression {
    _leftHandSideExpressionBrand: any;
}

export interface BinaryExpression extends Expression {
    kind: SyntaxKind.BinaryExpression;
    /** The left-hand side of the expression. */
    left: Expression;
    /** The operator used for the expression. */
    operatorToken: BinaryOperatorTokenNode;
    /** The right-hand sidde of the expression. */
    right: Expression;
}

export interface AssignmentExpression<O extends AssignmentOperatorTokenNode>
extends BinaryExpression {
    left: LeftHandSideExpression;
    operatorToken: O;
}

export interface CallExpression extends Expression {
    kind: SyntaxKind.CallExpression;
    expression: LeftHandSideExpression;
    args: Expression[];
}

export interface LiteralExpression extends LiteralLikeNode {
    _literalExpressionBrand: any;
}

export interface Declaration extends Node {
    _declarationBrand: any;
}

export interface NamedDeclaration extends Declaration {
    name: Identifier;
}

export interface VarDeclaration extends NamedDeclaration {
    kind: SyntaxKind.VarDeclaration;
    type?: TypeNode;
}

export interface ParameterDeclaration extends NamedDeclaration {
    kind: SyntaxKind.ParameterDeclaration;
    parent: FuncDeclaration;
    type: TypeNode;
}

export interface FuncDeclaration extends NamedDeclaration {
    kind: SyntaxKind.FuncDeclaration;
    params: ParameterDeclaration[];
    type: TypeNode;
    body: BlockStatement;
}

export interface IntegerLiteral extends LiteralExpression, Declaration {
    kind: SyntaxKind.IntegerLiteral;
}
