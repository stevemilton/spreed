/**
 * NeuroStream Reader - ORP (Optimal Recognition Point) Calculation
 *
 * The ORP is the character within a word where the eye naturally focuses.
 * Research shows this is approximately 35% into the word, biased slightly left.
 */

import { ORP_OFFSET_DEFAULT } from '@/utils/constants';

/**
 * Calculates the Optimal Recognition Point index for a word.
 * ORP is approximately 35% into the word, biased toward the beginning.
 *
 * @param word - The word to calculate ORP for
 * @param offset - ORP offset ratio (default 0.35)
 * @returns Zero-based index of the ORP character
 *
 * @example
 * calculateORPIndex("hello") // returns 1 (the 'e')
 * calculateORPIndex("recognition") // returns 3 (the 'o')
 */
export function calculateORPIndex(word: string, offset: number = ORP_OFFSET_DEFAULT): number {
    // Strip trailing punctuation for length calculation
    const cleanWord = stripTrailingPunctuation(word);

    // Edge cases
    if (cleanWord.length <= 1) {
        return 0;
    }

    if (cleanWord.length <= 3) {
        // First char for very short words
        return 0;
    }

    // ORP at ~35% of word length, minimum index 1
    const orpPosition = Math.floor(cleanWord.length * offset);
    return Math.max(1, Math.min(orpPosition, cleanWord.length - 1));
}

/**
 * Strips trailing punctuation from a word for clean length calculation.
 *
 * @param word - The word to clean
 * @returns Word without trailing punctuation
 */
export function stripTrailingPunctuation(word: string): string {
    return word.replace(/[.,!?;:'")}\]>]+$/, '');
}

/**
 * Gets the three parts of a word split by ORP position.
 * Useful for rendering with ORP highlighting.
 *
 * @param word - The word to split
 * @param orpIndex - The ORP character index
 * @returns Object with before, orp, and after parts
 */
export function splitByORP(
    word: string,
    orpIndex: number
): { before: string; orp: string; after: string } {
    if (word.length === 0) {
        return { before: '', orp: '', after: '' };
    }

    // Clamp ORP index to valid range
    const safeIndex = Math.max(0, Math.min(orpIndex, word.length - 1));

    return {
        before: word.slice(0, safeIndex),
        orp: word[safeIndex] ?? '',
        after: word.slice(safeIndex + 1),
    };
}
