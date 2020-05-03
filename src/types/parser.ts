/**
 * Interface definition for the parser.
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

import type { SourceFile } from "./ast/node";

export default interface IParser {

    /**
     * Parse the specified file.
     *
     * @param fileName The file name.
     * @returns The AST.
     */
    parseFile(fileName: string): Promise<SourceFile>;

}

/** All parsing contexts. */
export const enum ParsingContextFlags {
    None                        = 0 | 0,
    /** Top-level statements (become direct children of the {@linkcode SourceFile} node). */
    SourceElements              = 1 << 0,
    /** Anything inside brackets. */
    BlockStatements             = 1 << 1,
    /** A variable declaration. */
    VarDeclarations             = 1 << 2,
    /** A function declaration. */
    FuncDeclarations            = 1 << 3,
    /** A parameter list declaration (for functions) */
    ParameterDeclarations       = 1 << 4,
    /** Currently unused */
    SignatureDeclarations       = 1 << 5,
    /** Expressions in a parameter list when calling functions. */
    ArgExpressions              = 1 << 6,
}
