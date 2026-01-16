/**
 * NeuroStream Reader - Reader Types
 */

// ═══════════════════════════════════════════════════════════════════
// RSVP TOKEN - The Atomic Display Unit
// ═══════════════════════════════════════════════════════════════════

export interface RSVPToken {
    /** Unique identifier (UUID v4) */
    id: string;
    /** Display string (e.g., "process.") */
    raw: string;
    /** Index of ORP character (0-based) */
    orpIndex: number;
    /** Pre-calculated display duration in ms */
    baseDurationMs: number;
    /** Applied pacing multiplier */
    multiplier: number;
    /** Ends with sentence punctuation */
    isPunctuation: boolean;
    /** Part of hyphenated word */
    isHyphenated: boolean;
    /** Links hyphenated parts */
    hyphenGroupId: string | null;
    /** Index in original word array */
    sourceIndex: number;
    /** Index of containing sentence */
    sentenceIndex: number;
    /** Index of containing paragraph */
    paragraphIndex: number;
}

// ═══════════════════════════════════════════════════════════════════
// READING SESSION STATE
// ═══════════════════════════════════════════════════════════════════

export type ReaderStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'SCRUBBING' | 'COMPLETE';

export interface ReadingSession {
    /** Session identifier */
    sessionId: string;
    /** Original input text */
    sourceText: string;
    /** Pre-computed token stream */
    tokens: RSVPToken[];
    /** Current token index */
    currentIndex: number;
    /** Playback status */
    status: ReaderStatus;
    /** Timestamp of session start */
    startedAt: number | null;
    /** Sum of all token durations */
    totalDurationMs: number;
    /** Duration of completed tokens */
    elapsedDurationMs: number;
    /** Tokens displayed */
    wordsRead: number;
    /** Actual reading speed achieved */
    effectiveWPM: number;
    /** WPM used during tokenization (for scaling) */
    tokenizationWPM: number;
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT STRUCTURES
// ═══════════════════════════════════════════════════════════════════

export interface SentenceBoundary {
    /** First token index of sentence */
    startIndex: number;
    /** Last token index of sentence */
    endIndex: number;
    /** Full sentence text */
    text: string;
}

export interface ParagraphBoundary {
    /** First token index of paragraph */
    startIndex: number;
    /** Last token index of paragraph */
    endIndex: number;
    /** Sentences within paragraph */
    sentences: SentenceBoundary[];
}

export interface ContextMap {
    sentences: SentenceBoundary[];
    paragraphs: ParagraphBoundary[];
}

// ═══════════════════════════════════════════════════════════════════
// READER CONTEXT VALUE
// ═══════════════════════════════════════════════════════════════════

export interface ReaderContextValue {
    session: ReadingSession | null;
    currentToken: RSVPToken | null;
    contextMap: ContextMap | null;
    isPlaying: boolean;
    progress: number;
    loadText: (text: string) => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
    seekTo: (index: number) => void;
    seekToSentenceStart: () => void;
}
