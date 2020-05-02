/**
 * Program entry point.
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

import { asyncReadFileStr } from "./utils/fs";
import ISemanticElement from "./types/semantic-element";
import Scanner from "./lexer/scanner";
import { SyntaxKind } from "./types/syntax";

/**
 * Program entry point
 *
 * @param argv The CLI arguments (w/out the call to node)
 * @returns The program exit code
 */
export default async function main(argv: string[]): Promise<number> {
    if (argv.length < 2 || argv[1] === "--help" || argv[1] === "-h" || argv[1] === "-?") {
        console.log(
`Unholy runtime version ${require("../package.json").version}
Copyright (c) 2020 Felix Kopp <sandtler@sandtler.club>
Source code available at <https://github.com/sandtler/unholy-runtime>

This program contains code from the TypeScript compiler.
See <https://www.github.com/microsoft/TypeScript> for details and its license.
`);
        return 0;
    }

    const text = await asyncReadFileStr(argv[1]);
    const scanner = new Scanner(text);
    let element: ISemanticElement;
    do {
        element = scanner.nextToken();
        if (element.isReservedWord()) {
            console.log(`\x1b[0;35m${element.rawText}\x1b[0m`);
        } else if (element.kind === SyntaxKind.Identifier) {
            console.log(`\x1b[0;36m${element.rawText}\x1b[0m`);
        } else if (element.kind === SyntaxKind.IntegerLiteral) {
            console.log(`\x1b[0;32m${element.rawText}\x1b[0m`);
        } else {
            console.log(element.rawText);
        }
    } while (element.kind !== SyntaxKind.EndOfFileToken);
    return 0;
}
