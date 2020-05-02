/**
 * Async wrappers for the `fs` module.
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

import {
    chmod,
    PathLike,
    readdir,
    readFile,
    stat,
    Stats,
    writeFile,
} from 'fs';
import { TextDecoder } from 'util';

export { PathLike, Stats } from 'fs';

/**
 * Change the octal file permissions of a file using `fs.chmod()`.
 *
 * @param path The path to the file.
 * @param mode The octal file permission mode.  Will be parsed as an octal
 *     number is it is a string.
 */
export function asyncChmod(path: PathLike, mode: string | number): Promise<void> {
    return new Promise(resolve => chmod(path, mode, () => resolve()));
}

/**
 * Get the stats for a file using `fs.stat()`.
 *
 * @param path The path to the file.
 * @returns The stats.
 */
export function asyncStat(path: PathLike): Promise<Stats> {
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
}

/**
 * Return whether a specific file or directory can be accessed with stat.
 *
 * @param path The path to the file.
 */
export async function canStat(path: PathLike): Promise<boolean> {
    try {
        await asyncStat(path);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Read a file to a `Buffer` using `fs.readFile()`.
 *
 * @param path The path to the file.
 * @returns A `Buffer` containing the file's data.
 */
export function asyncReadFile(path: PathLike): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        readFile(path, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Read a file using `fs.readFile()` and decode it to a string directly.
 * The file is assumed to be in UTF-8 encoding.
 *
 * @param path The path to the file.
 * @returns The file contents as a string.
 */
export async function asyncReadFileStr(path: PathLike): Promise<string> {
    return new TextDecoder('utf-8').decode(await asyncReadFile(path));
}

/**
 * Read a directory using `fs.readdir` and return a list of all contained files.
 *
 * @param path The path to the directory.
 * @returns The files inside the dir.
 */
export function asyncReadDir(path: PathLike): Promise<string[]> {
    return new Promise((resolve, reject) => {
        readdir(path, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

/**
 * Write `data` to a file using `fs.writeFile()`.
 *
 * @param path The path to the file.
 * @param data The data to write to.
 */
export function asyncWriteFile(path: PathLike, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
        writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Encode a string to UTF-8 raw data and write them to a file
 * using `fs.writeFile()`.
 *
 * @param path The path to the file.
 * @param data The data to write to.
 */
export function asyncWriteFileStr(path: PathLike, data: string): Promise<void> {
    return asyncWriteFile(path, Buffer.from(data, 'utf-8'));
}
