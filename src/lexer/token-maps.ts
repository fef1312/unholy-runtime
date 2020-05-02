/**
 * Convert strings to tokens and vice versa.
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

import { KeywordSyntaxKind, SyntaxKind } from "../types/syntax";
import { createMapFromTemplate, createReverseMap, MapLike } from "../utils/map";

/** An array of all future-reserved keywords. */
const futureReservedWords: ReadonlyArray<string> = [
    "abstract",
    "async",
    "atomic",
    "attribute",
    "await",
    "break",
    "class",
    "do",
    "byte",
    "char",
    "complex",
    "continue",
    "declare",
    "double",
    "enum",
    "export",
    "exposed",
    "extends",
    "extern",
    "final",
    "float",
    "for",
    "from",
    "goto",
    "implements",
    "import",
    "inline",
    "interface",
    "local",
    "long",
    "namespace",
    "new",
    "null",
    "of",
    "operator",
    "private",
    "protected",
    "public",
    "short",
    "static",
    "struct",
    "super",
    "synchronized",
    "string",
    "this",
    "type",
    "ubyte",
    "uint",
    "ulong",
    "ushort",
    "vec2",
    "vec3",
    "vec4",
    "while",
    "with",
];

/**
 * Return whether `identifier` is a keyword that is reserved for future use.
 *
 * @param identifier The keyword.
 */
export function isFutureReserveWord(identifier: string): boolean {
    return futureReservedWords.indexOf(identifier) !== -1;
}

const textToKeywordObj: MapLike<KeywordSyntaxKind> = {
    bool:       SyntaxKind.BoolKeyword,
    else:       SyntaxKind.ElseKeyword,
    false:      SyntaxKind.FalseKeyword,
    func:       SyntaxKind.FuncKeyword,
    if:         SyntaxKind.IfKeyword,
    int:        SyntaxKind.IntKeyword,
    let:        SyntaxKind.LetKeyword,
    return:     SyntaxKind.ReturnKeyword,
    true:       SyntaxKind.TrueKeyword,
    void:       SyntaxKind.VoidKeyword,
};
/** All keywords mapped to their corresponding {@linkcode KeywordSyntaxKind}. */
const textToKeywordMap = createMapFromTemplate(textToKeywordObj);

/**
 * Return the keyword that matches the specified string.
 *
 * @param str The string.
 * @returns The keyword ID, or `undefined` if it doesn't exist.
 */
export function stringToKeyword(str: string): KeywordSyntaxKind | undefined {
    return textToKeywordMap.get(str);
}

/** All tokens mapped to their corresponding {@linkcode SyntaxKind}. */
const textToTokenMap = createMapFromTemplate<SyntaxKind>({
    ...textToKeywordObj,

    "{":    SyntaxKind.OpenBraceToken,
    "}":    SyntaxKind.CloseBraceToken,
    "(":    SyntaxKind.OpenParenToken,
    ")":    SyntaxKind.CloseParenToken,
    ";":    SyntaxKind.SemicolonToken,
    ",":    SyntaxKind.CommaToken,
    "<":    SyntaxKind.LessThanToken,
    ">":    SyntaxKind.GreaterThanToken,
    "==":   SyntaxKind.EqualsEqualsToken,
    "+":    SyntaxKind.PlusToken,
    "-":    SyntaxKind.MinusToken,
    ":":    SyntaxKind.ColonToken,
    "=":    SyntaxKind.EqualsToken,
});

/**
 * Return the token that matches the specified string.
 *
 * @param str The string.
 * @returns The token ID, or `undefined` if it doesn't exist.
 */
export function stringToToken(str: string): SyntaxKind | undefined {
    return textToTokenMap.get(str);
}

const tokenStrings = createReverseMap(textToTokenMap);

/**
 * Return the string that matches the specified token.
 *
 * @param token The token id.
 * @returns The string associated with that token.
 */
export function tokenToString(token: SyntaxKind): string | undefined {
    return tokenStrings.get(token);
}
