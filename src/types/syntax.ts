/**
 * Syntactic elements.
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

/**
 * An enum of all possible syntactic elements.
 */
export const enum SyntaxKind {
    Unknown,

    EndOfFileToken,
    OpenBraceToken,
    CloseBraceToken,
    OpenParenToken,
    CloseParenToken,
    SemicolonToken,
    ColonToken,
    CommaToken,
    PlusToken,
    MinusToken,
    LessThanToken,
    GreaterThanToken,
    EqualsToken,
    EqualsEqualsToken,

    IntegerLiteral,

    Identifier,

    KEYWORD_START,

    BoolKeyword,
    ElseKeyword,
    FalseKeyword,
    FuncKeyword,
    LetKeyword,
    IfKeyword,
    IntKeyword,
    ReturnKeyword,
    TrueKeyword,
    VoidKeyword,

    KEYWORD_END,
    NODE_START = KEYWORD_END,

    VarDeclaration,
    FuncDeclaration,

    CallExpression,
    BinaryExpression,

    BlockStatement,
    DeclarationStatement,
    EmptyStatement,
    ExpressionStatement,
    IfStatement,
    ReturnStatement,

    SourceFile,

    NODE_END,
}

/** Any kind of reserved keyword that refers to a (primitive) type. */
export type TypeKeywordSyntaxKind
    = SyntaxKind.BoolKeyword
    | SyntaxKind.IntKeyword
    | SyntaxKind.VoidKeyword
    ;

/** Any kind of syntax element that is a reserved keyword. */
export type KeywordSyntaxKind
    = TypeKeywordSyntaxKind
    | SyntaxKind.ElseKeyword
    | SyntaxKind.FalseKeyword
    | SyntaxKind.FuncKeyword
    | SyntaxKind.LetKeyword
    | SyntaxKind.IfKeyword
    | SyntaxKind.ReturnKeyword
    | SyntaxKind.TrueKeyword
    ;
