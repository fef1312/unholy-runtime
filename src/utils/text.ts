/**
 * Various text utilities.
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

import CharCodes from "../types/char-codes";

/**
 * Get the JS-internal size of the specified character.
 * All Unicode characters above `0x10000` have a length of two, rather than one.
 *
 * @param char The character code.
 */
export function charSize(char: number): number {
    if (char >= 0x10000) {
        return 2;
    }
    return 1;
}

/**
 * Return whether the specified character code is a whitespace character.
 *
 * @param charCode The character code.
 */
export function isWhitespace(charCode: number): boolean {
    switch (charCode) {
        case CharCodes.Space:
        case CharCodes.LineFeed:
        case CharCodes.CarriageReturn:
        case CharCodes.Tab:
        case CharCodes.VerticalTab:
            return true;
    }
    return false;
}

/**
 * Return whether the specified character code can be the start of an identifier.
 *
 * @param charCode The character code.
 */
export function isIdentifierStart(charCode: number): boolean {
    return charCode >= CharCodes.a && charCode <= CharCodes.z
        || charCode >= CharCodes.A && charCode <= CharCodes.Z
        || charCode === CharCodes._
        || charCode === CharCodes.$
        || charCode > CharCodes.MaxAscii;
}

/**
 * Return whether the specified character code can be part of an identifier.
 *
 * @param charCode The character code.
 */
export function isIdentifierPart(charCode: number): boolean {
    return isIdentifierStart(charCode)
        || charCode >= CharCodes._0 && charCode <= CharCodes._9;
}
