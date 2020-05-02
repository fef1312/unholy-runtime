/**
 * Base interface for syntactic elements.
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

import type { SyntaxKind } from "./syntax";

/**
 * A semantic element in a program, i.e. a single token (output of the lexer).
 */
export default interface ISemanticElement<S extends SyntaxKind = SyntaxKind> {

    /** The kind of this syntactic element. */
    kind: S;
    /** The line number of this element's first character, starting from 1. */
    readonly line: number;
    /** The column number of this element's first character, starting from 1. */
    readonly column: number;
    /** The length of this element. */
    readonly length: number;

    /** The raw text of this element. */
    readonly rawText: string;
    /**
     * The value of this element.
     * This is usually the same as {@linkcode .rawText}, except if it is something like a string
     * literal.  In that case, the quotes have been removed and escape sequences resolved.
     */
    value?: string;

    /**
     * Return whether this semantic element is a reserved keyword.
     */
    isReservedWord(): boolean;

}
