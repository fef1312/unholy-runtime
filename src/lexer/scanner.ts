/**
 * Lexer implementation.
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

import type IScanner from "../types/scanner";
import type ISemanticElement from "../types/semantic-element";
import CharCodes from "../types/char-codes";
import SemanticElement from "./semantic-element";
import { SyntaxKind, KeywordSyntaxKind } from "../types/syntax";
import { stringToKeyword, isFutureReserveWord } from "./token-maps";
import { UnholySyntaxError } from "../utils/errors";
import { isIdentifierStart, charSize, isIdentifierPart } from "../utils/text";

interface ScannerState {
    pos: number;
    line: number;
    lineStart: number;
    tokenStart: number;
}

export default class Scanner implements IScanner {

    /** The program's full raw text. */
    private text: string;

    /**
     * The current position as a 0-based absolute character offset to {@linkcode .text}.
     * When {@linkcode .nextToken} has finished, this is always one character after the most recent
     * token's end.
     */
    private pos: number = 0;
    private tokenStart: number = 0;
    /** The length of the program text. */
    private end: number;
    /** The current line, counting from 1. */
    private line: number = 1;
    /** The current column, counting from one. */
    private lineStart: number = 0;

    /**
     * A stack of saved states (required for lookaheads).
     */
    private stateStack: ScannerState[] = [];

    /**
     * Create a new scanner.
     *
     * @param text The raw program text.
     */
    public constructor(text: string) {
        this.text = text;
        this.end = text.length;
    }

    public lookAhead<T>(fn: () => T): T {
        this.storeState();
        const ret = fn();
        this.restoreState();

        return ret;
    }

    public tryScan<T>(fn: () => T): T {
        this.storeState();

        const ret = fn();
        if (!ret) {
            this.restoreState();
        } else {
            this.popState();
        }

        return ret;
    }

    public nextToken(): ISemanticElement {
        while (this.pos < this.end) {
            this.tokenStart = this.pos;
            let ret: ISemanticElement | null;

            try {
                ret = this.nextTokenSingle();
            } finally {
                this.pos++;
            }

            if (ret !== null) {
                return ret;
            }
        }

        return this.makeElem(SyntaxKind.EndOfFileToken, "");
    }

    private nextTokenSingle(): ISemanticElement | null {
        let char = this.text.charCodeAt(this.pos);

        switch (char) {
            case CharCodes.CarriageReturn:
                throw new UnholySyntaxError(
                    "FATAL: Windows encountered",
                    this.makeElem(SyntaxKind.Unknown, " "),
                );

            case CharCodes.LineFeed:
                this.line++;
                this.lineStart = this.pos + 1;
                /* fall through */

            case CharCodes.Space:
                while (this.text.charCodeAt(this.pos + 1) === CharCodes.Space) {
                    this.pos++;
                }
                return null;

            case CharCodes.OpenBrace:
                return this.makeElem(SyntaxKind.OpenBraceToken);

            case CharCodes.CloseBrace:
                return this.makeElem(SyntaxKind.CloseBraceToken);

            case CharCodes.OpenParen:
                return this.makeElem(SyntaxKind.OpenParenToken);

            case CharCodes.CloseParen:
                return this.makeElem(SyntaxKind.CloseParenToken);

            case CharCodes.Semicolon:
                return this.makeElem(SyntaxKind.SemicolonToken);

            case CharCodes.Comma:
                return this.makeElem(SyntaxKind.CommaToken);

            case CharCodes.Colon:
                return this.makeElem(SyntaxKind.ColonToken);

            case CharCodes.Equals:
                if (this.text.charCodeAt(this.pos + 1) === CharCodes.Equals) {
                    this.pos++;
                    return this.makeElem(SyntaxKind.EqualsEqualsToken);
                }
                return this.makeElem(SyntaxKind.EqualsToken);

            case CharCodes.Plus:
                return this.makeElem(SyntaxKind.PlusToken);

            case CharCodes.Minus:
                return this.makeElem(SyntaxKind.MinusToken);

            case CharCodes.LessThan:
                return this.makeElem(SyntaxKind.LessThanToken);

            case CharCodes.GreaterThan:
                return this.makeElem(SyntaxKind.GreaterThanToken);

            case CharCodes._0:
            case CharCodes._1:
            case CharCodes._2:
            case CharCodes._3:
            case CharCodes._4:
            case CharCodes._5:
            case CharCodes._6:
            case CharCodes._7:
            case CharCodes._8:
            case CharCodes._9:
                const num = this.scanDigits(10);
                return this.makeElem(SyntaxKind.IntegerLiteral, num);
        }

        /* isIentifierStart() also returns true for keywords */
        if (isIdentifierStart(char)) {
            let identifierStart: number = this.pos;
            let stillIsIdentifier: boolean;

            do {
                char = this.text.codePointAt(this.pos + 1) ! ;
                if ( (stillIsIdentifier = isIdentifierPart(char)) ) {
                    this.pos += charSize(char);
                }
            } while (this.pos < this.end && stillIsIdentifier);

            const value = this.text.substring(identifierStart, this.pos + 1);
            const elem = this.makeElem<SyntaxKind>(this.getIentifierToken(value), value);

            if (elem.kind === SyntaxKind.Identifier && isFutureReserveWord(value)) {
                elem.kind = SyntaxKind.Unknown;
                throw new UnholySyntaxError(
                    `"${value}" is a reserved keyword`,
                    elem as ISemanticElement<SyntaxKind.Unknown>
                );
            }
            return elem;
        }

        return null;
    }

    /**
     * Scan a sequence of digits in the specified numeric system until a character that does not
     * exist in this numeric system is encountered.  {@linkcode .pos} is set to the last allowes
     * character that was scanned.  The character at the current position MUST be an allowed digit.
     *
     * @param radix The numerical base.
     * @returns The scanned digits.
     */
    private scanDigits(radix: 2 | 8 | 10 | 16): string {
        const start = this.pos;
        let canContinue: boolean = true;

        while (canContinue) {
            /* `break` will end this loop (see below), `continue` makes it go on */
            switch (this.text.charCodeAt(this.pos + 1)) {
                case CharCodes.f:
                case CharCodes.e:
                case CharCodes.d:
                case CharCodes.c:
                case CharCodes.b:
                case CharCodes.a:
                case CharCodes.F:
                case CharCodes.E:
                case CharCodes.D:
                case CharCodes.C:
                case CharCodes.B:
                case CharCodes.A:
                    if (radix < 16) {
                        break;
                    }
                    /* fall through */

                case CharCodes._9:
                case CharCodes._8:
                    if (radix < 10) {
                        break;
                    }
                    /* fall through */

                case CharCodes._7:
                case CharCodes._6:
                case CharCodes._5:
                case CharCodes._4:
                case CharCodes._3:
                case CharCodes._2:
                    if (radix < 8) {
                        break;
                    }
                    /* fall through */

                case CharCodes._1:
                case CharCodes._0:
                    this.pos++;
                    continue;
            }

            /* if we reach this, the next token is not an allowed digit */
            canContinue = false;
        }

        return this.text.substring(start, this.pos + 1);
    }

    /**
     * If `str` is a keyword, return the {@linkcode KeywordSyntaxKind}, and if not return
     * {@linkcode SyntaxKind.Identifier}.
     */
    private getIentifierToken(str: string): SyntaxKind.Identifier | KeywordSyntaxKind {
        /* keywords always start with a lowercase character from a-z */
        if (str.charCodeAt(0) >= CharCodes.a && str.charCodeAt(0) <= CharCodes.z) {
            const keyword = stringToKeyword(str);
            if (keyword !== undefined) {
                return keyword;
            }
        }

        return SyntaxKind.Identifier;
    }

    /**
     *
     * @param kind The syntactic kind of the element.
     * @param text The raw text of this element.  May only be omitted if `kind` is specified in the
     *     character maps.
     */
    private makeElem<T extends SyntaxKind>(kind: T, text?: string): ISemanticElement<T> {
        return new SemanticElement(kind, this.line, this.pos - this.lineStart + 1, text);
    }

    /**
     * Store this scanner's current state.
     * Used for lookaheads.
     */
    private storeState() {
        this.stateStack.push({
            pos: this.pos,
            line: this.line,
            lineStart: this.lineStart,
            tokenStart: this.tokenStart,
        });
    }

    /**
     * Restore this scanner's state to the last time {@linkcode .storeState} was called.
     * Used for lookaheads.
     */
    private restoreState() {
        const state = this.stateStack.pop();
        if (state !== undefined) {
            this.pos = state.pos;
            this.line = state.line;
            this.lineStart = state.lineStart;
            this.tokenStart = state.tokenStart;
        }
    }

    /**
     * Discard the last saved state.
     */
    private popState() {
        return this.stateStack.pop();
    }

}
