/**
 * Typedefs for the scanner.
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

import type ISemanticElement from "./semantic-element";

export default interface IScanner {

    /**
     * Proceed to the next token.
     *
     * @returns The next token.
     */
    nextToken(): ISemanticElement;

    /**
     * Execute `fn`, restore this scanner's state to how it was before that call, and return the
     * result of the call.
     *
     * @param fn The callback.
     * @returns Whatever `fn` returns.
     */
    lookAhead<T>(fn: () => T): T;

    /**
     * Execute `fn` and return its value.  If that value is falsy, the scanner's state is restored
     * to how it was before the call.
     *
     * @param fn The callback.
     * @returns Whatever `fn` returns.
     */
    tryScan<T>(fn: () => T): T;

}
