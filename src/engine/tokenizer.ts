/**
 * NeuroStream Reader - Text Tokenizer
 *
 * Converts raw text into RSVPToken[] with all durations and ORP positions pre-calculated.
 * Zero calculations should happen during render - all math happens here.
 */

import { RSVPToken, ContextMap, SentenceBoundary, ParagraphBoundary } from '@/types/reader.types';
import { TokenizationResult, RSVPEngineError, RSVPErrorCode } from '@/types/engine.types';
import { ReaderSettings } from '@/types/settings.types';
import { calculateORPIndex } from './orp';
import { calculateDuration } from './pacing';
import { hyphenateWord, needsHyphenation } from './hyphenator';
import { WPM_MIN, WPM_MAX } from '@/utils/constants';

/**
 * Generates a unique ID for tokens.
 */
function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Normalizes whitespace in source text.
 *
 * @param text - Raw input text
 * @returns Normalized text with consistent whitespace
 */
export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, '\n')      // Normalize line endings
        .replace(/\r/g, '\n')        // Handle old Mac line endings
        .replace(/\t/g, ' ')         // Convert tabs to spaces
        .replace(/ +/g, ' ')         // Collapse multiple spaces
        .trim();
}

/**
 * Splits text into words.
 *
 * @param text - Normalized text
 * @returns Array of words
 */
export function splitIntoWords(text: string): string[] {
    return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Builds a context map tracking sentence and paragraph boundaries.
 *
 * @param text - Normalized source text
 * @param words - Array of words
 * @returns Context map with sentence and paragraph boundaries
 */
export function buildContextMap(text: string, words: string[]): ContextMap {
    const sentences: SentenceBoundary[] = [];
    const paragraphs: ParagraphBoundary[] = [];

    // Split into paragraphs first
    const paragraphTexts = text.split(/\n\s*\n/);

    let wordIndex = 0;
    let sentenceIndex = 0;

    for (const paragraphText of paragraphTexts) {
        if (!paragraphText.trim()) continue;

        const paragraphStart = wordIndex;
        const paragraphSentences: SentenceBoundary[] = [];

        // Split paragraph into sentences (simplified regex)
        const sentenceTexts = paragraphText.split(/(?<=[.!?])\s+/);

        for (const sentenceText of sentenceTexts) {
            if (!sentenceText.trim()) continue;

            const sentenceWords = splitIntoWords(sentenceText);
            if (sentenceWords.length === 0) continue;

            const sentenceStart = wordIndex;
            const sentenceEnd = wordIndex + sentenceWords.length - 1;

            const sentence: SentenceBoundary = {
                startIndex: sentenceStart,
                endIndex: sentenceEnd,
                text: sentenceText.trim(),
            };

            sentences.push(sentence);
            paragraphSentences.push(sentence);

            wordIndex += sentenceWords.length;
            sentenceIndex++;
        }

        if (paragraphSentences.length > 0) {
            paragraphs.push({
                startIndex: paragraphStart,
                endIndex: wordIndex - 1,
                sentences: paragraphSentences,
            });
        }
    }

    return { sentences, paragraphs };
}

/**
 * Finds the sentence index for a given word index.
 *
 * @param wordIndex - Index of the word
 * @param contextMap - Context map with boundaries
 * @returns Sentence index (0 if not found)
 */
export function findSentenceIndex(wordIndex: number, contextMap: ContextMap): number {
    for (let i = 0; i < contextMap.sentences.length; i++) {
        const sentence = contextMap.sentences[i];
        if (sentence && wordIndex >= sentence.startIndex && wordIndex <= sentence.endIndex) {
            return i;
        }
    }
    return 0;
}

/**
 * Finds the paragraph index for a given word index.
 *
 * @param wordIndex - Index of the word
 * @param contextMap - Context map with boundaries
 * @returns Paragraph index (0 if not found)
 */
export function findParagraphIndex(wordIndex: number, contextMap: ContextMap): number {
    for (let i = 0; i < contextMap.paragraphs.length; i++) {
        const paragraph = contextMap.paragraphs[i];
        if (paragraph && wordIndex >= paragraph.startIndex && wordIndex <= paragraph.endIndex) {
            return i;
        }
    }
    return 0;
}

/**
 * Creates a single RSVPToken.
 *
 * @param raw - The display string
 * @param settings - Reader settings
 * @param sourceIndex - Index in original word array
 * @param sentenceIndex - Sentence index
 * @param paragraphIndex - Paragraph index
 * @param isHyphenated - Whether this is part of a hyphenated word
 * @param hyphenGroupId - Group ID for hyphenated parts
 * @param checkPunctuation - Whether to check for punctuation pauses
 * @returns RSVPToken
 */
function createToken(
    raw: string,
    settings: ReaderSettings,
    sourceIndex: number,
    sentenceIndex: number,
    paragraphIndex: number,
    isHyphenated: boolean,
    hyphenGroupId: string | null,
    checkPunctuation: boolean
): RSVPToken {
    const orpIndex = calculateORPIndex(raw, settings.orpOffset);
    const { durationMs, multiplier, isPunctuation } = calculateDuration(
        raw,
        settings.baseWPM,
        settings.dynamicPacing,
        checkPunctuation
    );

    return {
        id: generateId(),
        raw,
        orpIndex,
        baseDurationMs: durationMs,
        multiplier,
        isPunctuation,
        isHyphenated,
        hyphenGroupId,
        sourceIndex,
        sentenceIndex,
        paragraphIndex,
    };
}

/**
 * Main tokenization entry point.
 * Converts raw text into pre-calculated RSVPToken array.
 *
 * @param sourceText - The text to tokenize
 * @param settings - Reader settings
 * @returns TokenizationResult with tokens, context map, and metadata
 * @throws RSVPEngineError if input is invalid
 *
 * @example
 * const result = tokenizeText("Hello world.", settings);
 * // result.tokens = [{ raw: "Hello", ... }, { raw: "world.", ... }]
 */
export function tokenizeText(
    sourceText: string,
    settings: ReaderSettings
): TokenizationResult {
    // Validation
    if (!sourceText || sourceText.trim().length === 0) {
        throw new RSVPEngineError(
            'Cannot tokenize empty text',
            RSVPErrorCode.EMPTY_INPUT,
            true
        );
    }

    if (settings.baseWPM < WPM_MIN || settings.baseWPM > WPM_MAX) {
        throw new RSVPEngineError(
            `WPM must be between ${WPM_MIN}-${WPM_MAX}, got ${settings.baseWPM}`,
            RSVPErrorCode.INVALID_WPM,
            true
        );
    }

    // Step 1: Normalize and split into words
    const normalizedText = normalizeWhitespace(sourceText);
    const rawWords = splitIntoWords(normalizedText);

    if (rawWords.length === 0) {
        throw new RSVPEngineError(
            'Text contains no readable words',
            RSVPErrorCode.EMPTY_INPUT,
            true
        );
    }

    // Step 2: Track paragraph and sentence boundaries
    const contextMap = buildContextMap(normalizedText, rawWords);

    // Step 3: Process each word into tokens
    const tokens: RSVPToken[] = [];

    for (let i = 0; i < rawWords.length; i++) {
        const word = rawWords[i];
        if (!word) continue;

        const sentenceIndex = findSentenceIndex(i, contextMap);
        const paragraphIndex = findParagraphIndex(i, contextMap);

        // Check if word needs hyphenation
        if (needsHyphenation(word, settings.maxChunkLength)) {
            const parts = hyphenateWord(word, settings.maxChunkLength);
            const groupId = generateId();

            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                if (!part) continue;

                // Only check punctuation on last part
                const isLastPart = j === parts.length - 1;

                tokens.push(
                    createToken(
                        part,
                        settings,
                        i,
                        sentenceIndex,
                        paragraphIndex,
                        true,
                        groupId,
                        isLastPart
                    )
                );
            }
        } else {
            tokens.push(
                createToken(
                    word,
                    settings,
                    i,
                    sentenceIndex,
                    paragraphIndex,
                    false,
                    null,
                    true
                )
            );
        }
    }

    // Step 4: Calculate totals
    const totalDurationMs = tokens.reduce((sum, t) => sum + t.baseDurationMs, 0);

    return {
        tokens,
        contextMap,
        totalDurationMs,
        wordCount: rawWords.length,
        tokenizationWPM: settings.baseWPM,
    };
}
