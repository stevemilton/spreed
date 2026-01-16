/**
 * NeuroStream Reader - Pacing/Duration Calculation
 *
 * Calculates display duration for each token based on:
 * - Base WPM setting
 * - Word length multipliers (short/normal/long)
 * - Punctuation multipliers (comma/sentence end)
 */

import {
    PACING_MULTIPLIERS,
    SHORT_WORD_THRESHOLD,
    LONG_WORD_THRESHOLD,
    MS_PER_MINUTE,
} from '@/utils/constants';
import { DurationResult } from '@/types';

/**
 * Calculates the display duration for a word token.
 *
 * @param word - The word to calculate duration for
 * @param baseWPM - Base words per minute setting
 * @param dynamicPacing - Whether to apply semantic multipliers
 * @param checkPunctuation - Whether to check for punctuation pauses
 * @returns Duration in ms, multiplier applied, and punctuation flag
 *
 * @example
 * calculateDuration("hello", 600, true, true)
 * // { durationMs: 100, multiplier: 1.0, isPunctuation: false }
 *
 * calculateDuration("Hello.", 600, true, true)
 * // { durationMs: 300, multiplier: 3.0, isPunctuation: true }
 */
export function calculateDuration(
    word: string,
    baseWPM: number,
    dynamicPacing: boolean,
    checkPunctuation: boolean
): DurationResult {
    // Base duration: milliseconds per word at target WPM
    const baseDelayMs = MS_PER_MINUTE / baseWPM;

    // Start with neutral multiplier
    let multiplier: number = PACING_MULTIPLIERS.NORMAL_WORD;
    let isPunctuation = false;

    if (dynamicPacing) {
        // Get letter-only length for proper categorization
        const cleanLength = getLetterOnlyLength(word);

        // Length-based multipliers
        if (cleanLength < SHORT_WORD_THRESHOLD) {
            multiplier = PACING_MULTIPLIERS.SHORT_WORD;
        } else if (cleanLength > LONG_WORD_THRESHOLD) {
            multiplier = PACING_MULTIPLIERS.LONG_WORD;
        }

        // Punctuation multipliers (compound with length)
        if (checkPunctuation) {
            const punctuationMultiplier = getPunctuationMultiplier(word);
            if (punctuationMultiplier > 1) {
                multiplier *= punctuationMultiplier;
                isPunctuation = true;
            }
        }
    }

    return {
        durationMs: Math.round(baseDelayMs * multiplier),
        multiplier,
        isPunctuation,
    };
}

/**
 * Gets the letter-only length of a word (excludes numbers and punctuation).
 *
 * @param word - The word to measure
 * @returns Number of letter characters
 */
export function getLetterOnlyLength(word: string): number {
    return word.replace(/[^a-zA-Z]/g, '').length;
}

/**
 * Gets the punctuation multiplier based on trailing punctuation.
 *
 * @param word - The word to check
 * @returns Multiplier value (1.0 if no punctuation)
 */
export function getPunctuationMultiplier(word: string): number {
    const lastChar = word.slice(-1);

    // Sentence-ending punctuation: 3x pause for cognitive wrap-up
    if ('.!?'.includes(lastChar)) {
        return PACING_MULTIPLIERS.SENTENCE_END;
    }

    // Clause-breaking punctuation: 2x pause for micro-pause
    if (',;:'.includes(lastChar)) {
        return PACING_MULTIPLIERS.COMMA_PAUSE;
    }

    return 1.0;
}

/**
 * Calculates the base delay in milliseconds for a given WPM.
 *
 * @param wpm - Words per minute
 * @returns Milliseconds per word
 */
export function wpmToMs(wpm: number): number {
    return MS_PER_MINUTE / wpm;
}

/**
 * Converts milliseconds per word to WPM.
 *
 * @param ms - Milliseconds per word
 * @returns Words per minute
 */
export function msToWpm(ms: number): number {
    return MS_PER_MINUTE / ms;
}
