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

import Parser from "./parser/parser";
import astWalk from "./utils/ast-walk";

interface ASTLine {
    line: string;
    depth: number;
}

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

    const parser = new Parser();
    const sourceFile = await parser.parseFile(argv[1]);
    let lines: ASTLine[] = [];

    astWalk(sourceFile, (node, depth, name, leaf) => {
        if (name === undefined) {
            lines.push({
                line: "<child>: " + name,
                depth: depth,
            });
        } else {
            lines.push({
                line: leaf + ": " + name,
                depth: depth,
            });
        }
    });

    printAST(lines);
    return 0;
}

function printAST(lines: ASTLine[]) {
    console.log("┌ Program")
    const countPerDepth: number[] = [];
    for (const line of lines) {
        if (countPerDepth[line.depth] === undefined) {
            countPerDepth[line.depth] = 1;
        } else {
            countPerDepth[line.depth]++;
        }
    }

    const lastIndicesPerDepth: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        const curr = lines[i];
        const next = lines[i + 1];

        // if (curr.depth === 0) {
        //     console.log(curr.line);
        //     continue;
        // }

        let unicodeArt: string = "";
        for (let j = 0; j < curr.depth; j++) {
            if (countPerDepth[j] > 0 && !asdf(lastIndicesPerDepth[j], lines)) {
                unicodeArt += "│ ";
            } else {
                unicodeArt += "  ";
            }
        }

        if (--countPerDepth[curr.depth] === 0 || next?.depth < curr.depth || asdf(i, lines)) {
            unicodeArt += "└";
        } else {
            unicodeArt += "├";
        }

        unicodeArt += "─";

        if (next?.depth > curr.depth) {
            unicodeArt += "┬";
        } else {
            unicodeArt += "─";
        }

        console.log(unicodeArt + " " + curr.line);
        lastIndicesPerDepth[curr.depth] = i;
    }

}

function asdf(index: number, lines: ASTLine[]): boolean {
    for (let i = index + 1; i < lines.length; i++) {
        if (lines[i].depth < lines[index].depth) {
            return true;
        }
        if (lines[i].depth === lines[index].depth) {
            return false;
        }
    }

    return true; /* This should never be reachable */
}
