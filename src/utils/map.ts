/**
 * Map transformation and generation.
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

export type MapLike<T> = {
    [key: string]: T;
};

/**
 * Create a map from a {@linkcode MapLike} object.
 *
 * @param template The MapLike object.
 * @returns The map.
 */
export function createMapFromTemplate<T>(template: MapLike<T>): Map<string, T> {
    const map: Map<string, T> = new Map();

    for (const key in template) {
        if (!template.hasOwnProperty(key)) {
            continue;
        }

        map.set(key, template[key]);
    }

    return map;
}

/**
 * Create a reversed map from `map` where the keys of `map` are the new values
 * and the values are the new keys.  If a map contains two keys with the same
 * value, the last source entry's key will be the target entry's value.
 *
 * @param map The map.
 * @returns A map where keys and values are reversed.
 */
export function createReverseMap<K, V>(map: Map<K, V>): Map<V, K> {
    const reverseMap: Map<V, K> = new Map();

    for (const elem of map) {
        reverseMap.set(elem[1], elem[0]);
    }

    return reverseMap;
}
