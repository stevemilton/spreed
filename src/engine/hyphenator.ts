/**
 * NeuroStream Reader - Word Hyphenation
 *
 * Splits long words (>13 chars) into smaller chunks that fit the foveal window.
 * Uses syllable-based splitting for natural reading flow.
 */

import { MAX_CHUNK_LENGTH } from '@/utils/constants';

const VOWELS = 'aeiouyAEIOUY';
const TARGET_CHUNK_SIZE = 8;

/**
 * Hyphenates a word if it exceeds the maximum chunk length.
 *
 * @param word - The word to potentially hyphenate
 * @param maxLength - Maximum allowed length before hyphenation (default: 13)
 * @returns Array of word parts (single element if no hyphenation needed)
 *
 * @example
 * hyphenateWord("implementation") // ["imple-", "menta-", "tion"]
 * hyphenateWord("hello") // ["hello"]
 */
export function hyphenateWord(word: string, maxLength: number = MAX_CHUNK_LENGTH): string[] {
    if (word.length <= maxLength) {
        return [word];
    }

    // Preserve trailing punctuation
    const punctuationMatch = word.match(/([.,!?;:'")}\]>]+)$/);
    const punctuation = punctuationMatch?.[1] ?? '';
    const cleanWord = punctuation ? word.slice(0, -punctuation.length) : word;

    // If clean word is now short enough, return with punctuation
    if (cleanWord.length <= maxLength) {
        return [word];
    }

    // Split into syllables
    const syllables = splitIntoSyllables(cleanWord);

    // Group syllables into chunks of ~7-8 characters
    const parts = groupSyllablesIntoChunks(syllables, TARGET_CHUNK_SIZE);

    // Add hyphen to all parts except the last, and punctuation to the last
    return parts.map((part, index) => {
        if (index === parts.length - 1) {
            return part + punctuation;
        }
        return part + '-';
    });
}

/**
 * Splits a word into syllables using vowel-consonant patterns.
 * This is a simplified heuristic - production could use Hyphenopoly.
 *
 * @param word - The word to split
 * @returns Array of syllable strings
 */
export function splitIntoSyllables(word: string): string[] {
    if (word.length <= 3) {
        return [word];
    }

    const syllables: string[] = [];
    let current = '';
    let prevWasVowel = false;

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (!char) continue;

        const isVowel = VOWELS.includes(char);

        // Split after vowel followed by consonant (simplified rule)
        if (prevWasVowel && !isVowel && current.length >= 2) {
            syllables.push(current);
            current = char;
        } else {
            current += char;
        }

        prevWasVowel = isVowel;
    }

    // Don't forget the last chunk
    if (current) {
        syllables.push(current);
    }

    return syllables.length > 0 ? syllables : [word];
}

/**
 * Groups syllables into chunks of approximately targetSize characters.
 *
 * @param syllables - Array of syllables to group
 * @param targetSize - Target size for each chunk
 * @returns Array of grouped chunks
 */
export function groupSyllablesIntoChunks(syllables: string[], targetSize: number): string[] {
    if (syllables.length === 0) {
        return [];
    }

    const parts: string[] = [];
    let currentPart = '';

    for (const syllable of syllables) {
        // If adding this syllable would exceed target and we have content, start new part
        if (currentPart.length + syllable.length > targetSize && currentPart.length > 0) {
            parts.push(currentPart);
            currentPart = syllable;
        } else {
            currentPart += syllable;
        }
    }

    // Add final part
    if (currentPart) {
        parts.push(currentPart);
    }

    return parts;
}

/**
 * Checks if a word needs hyphenation.
 *
 * @param word - The word to check
 * @param maxLength - Maximum allowed length
 * @returns True if the word needs hyphenation
 */
export function needsHyphenation(word: string, maxLength: number = MAX_CHUNK_LENGTH): boolean {
    // Strip punctuation for length check
    const cleanWord = word.replace(/[.,!?;:'")}\]>]+$/, '');
    return cleanWord.length > maxLength;
}
