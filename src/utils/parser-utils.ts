/**
 * Some token utilities usesd by the parser.
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

export function isStartOfLeftHandSideExpression(token: SyntaxKind): boolean {
    switch (token) {
        case SyntaxKind.FalseKeyword:
        case SyntaxKind.IntegerLiteral:
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.OpenParenToken:
        case SyntaxKind.Identifier:
            return true;
    }

    return false;
}

export function isStartOfExpression(token: SyntaxKind): boolean {
    if (isStartOfLeftHandSideExpression(token)) {
        return true;
    }

    switch (token) {
        /* Unary plus / minus */
        case SyntaxKind.PlusToken:
        case SyntaxKind.MinusToken:
            return true;
    }

    return false;
}

export function isAssignmentOperator(token: SyntaxKind): boolean {
    switch (token) {
        case SyntaxKind.EqualsToken:
            return true;
    }

    return false;
}

/**
 * Get the precedence (as documented in `/doc/operator-precedence.md`) of the specified operator.
 * Higher values mean higher precedence.
 *
 * @param operator The binary operator token.
 */
export function getBinaryOperatorPrecedence(operator: SyntaxKind): number {
    switch (operator) {
        case SyntaxKind.AsteriskToken:
        case SyntaxKind.SlashToken:
        case SyntaxKind.PercentToken:
            return 14;
        case SyntaxKind.PlusToken:
        case SyntaxKind.MinusToken:
            return 13;
        case SyntaxKind.GreaterThanToken:
        case SyntaxKind.LessThanToken:
            return 10;
        case SyntaxKind.EqualsEqualsToken:
            return 9;
        case SyntaxKind.EqualsToken:
            return 2;
    }

    return -1;
}
