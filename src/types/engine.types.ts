/**
 * NeuroStream Reader - Engine Types
 */

import { RSVPToken, ContextMap } from './reader.types';

// ═══════════════════════════════════════════════════════════════════
// RESULT TYPE (for expected failures)
// ═══════════════════════════════════════════════════════════════════

export type Result<T, E> =
    | { success: true; data: T }
    | { success: false; error: E };

// ═══════════════════════════════════════════════════════════════════
// TOKENIZATION RESULT
// ═══════════════════════════════════════════════════════════════════

export interface TokenizationResult {
    tokens: RSVPToken[];
    contextMap: ContextMap;
    totalDurationMs: number;
    wordCount: number;
    tokenizationWPM: number;
}

// ═══════════════════════════════════════════════════════════════════
// DURATION CALCULATION RESULT
// ═══════════════════════════════════════════════════════════════════

export interface DurationResult {
    durationMs: number;
    multiplier: number;
    isPunctuation: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// LOOP STATE
// ═══════════════════════════════════════════════════════════════════

export interface LoopState {
    isPlaying: boolean;
    tokens: RSVPToken[];
    currentIndex: number;
    accumulator: number;
    lastFrameTime: number;
    onTokenChange: (index: number) => void;
    onComplete: () => void;
    getCurrentWPM: () => number;
    tokenizationWPM: number;
}

export interface RenderLoopControls {
    start: () => void;
    pause: () => void;
    reset: () => void;
    seekTo: (index: number) => void;
    seekToSentenceStart: () => void;
    updateTokens: (tokens: RSVPToken[], tokenizationWPM: number) => void;
    getState: () => Readonly<Pick<LoopState, 'isPlaying' | 'currentIndex'>>;
}

// ═══════════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════════

export enum RSVPErrorCode {
    EMPTY_INPUT = 'EMPTY_INPUT',
    INVALID_WPM = 'INVALID_WPM',
    TOKENIZATION_FAILED = 'TOKENIZATION_FAILED',
    LOOP_FRAME_DROP = 'LOOP_FRAME_DROP',
    INDEX_OUT_OF_BOUNDS = 'INDEX_OUT_OF_BOUNDS',
}

export class RSVPEngineError extends Error {
    constructor(
        message: string,
        public readonly code: RSVPErrorCode,
        public readonly recoverable: boolean = true
    ) {
        super(message);
        this.name = 'RSVPEngineError';
    }
}
