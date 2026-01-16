/**
 * NeuroStream Reader - RAF Render Loop with Drift Correction
 *
 * Uses requestAnimationFrame with delta-time accumulator pattern
 * to ensure frame-accurate word presentation with minimal timing drift.
 *
 * CRITICAL: No calculations during render - all math is pre-computed in tokens.
 */

import { RSVPToken } from '@/types/reader.types';
import { LoopState, RenderLoopControls } from '@/types/engine.types';
import { FRAME_DROP_THRESHOLD_MS } from '@/utils/constants';

/**
 * Creates a render loop controller for RSVP playback.
 *
 * @param initialState - Initial loop configuration (without timing state)
 * @returns Control object with start/pause/reset/seek methods
 *
 * @example
 * const loop = createRenderLoop({
 *   isPlaying: false,
 *   tokens: tokenizedResult.tokens,
 *   currentIndex: 0,
 *   onTokenChange: (index) => setCurrentIndex(index),
 *   onComplete: () => setStatus('COMPLETE'),
 *   getCurrentWPM: () => settings.baseWPM,
 *   tokenizationWPM: tokenizedResult.tokenizationWPM
 * });
 *
 * loop.start();
 */
export function createRenderLoop(
    initialState: Omit<LoopState, 'accumulator' | 'lastFrameTime'>
): RenderLoopControls {
    // Internal mutable state
    const state: LoopState = {
        ...initialState,
        accumulator: 0,
        lastFrameTime: 0,
    };

    let rafId: number | null = null;

    // ─────────────────────────────────────────────────────────────────
    // CORE LOOP FUNCTION
    // ─────────────────────────────────────────────────────────────────

    function loop(currentTime: DOMHighResTimeStamp): void {
        // Exit if paused
        if (!state.isPlaying) {
            rafId = null;
            return;
        }

        // Initialize lastFrameTime on first frame
        if (state.lastFrameTime === 0) {
            state.lastFrameTime = currentTime;
        }

        // Calculate delta time since last frame
        const deltaTime = currentTime - state.lastFrameTime;
        state.lastFrameTime = currentTime;

        // Detect significant frame drops (>100ms = 10fps or worse)
        if (deltaTime > FRAME_DROP_THRESHOLD_MS && state.lastFrameTime !== 0) {
            console.warn(
                `[RSVP] Frame drop detected: ${deltaTime.toFixed(1)}ms delta`
            );
            // Don't throw - just log and continue
        }

        // Add delta to accumulator
        state.accumulator += deltaTime;

        // Get current token
        const currentToken = state.tokens[state.currentIndex];

        if (!currentToken) {
            // No more tokens - reading complete
            state.onComplete();
            state.isPlaying = false;
            rafId = null;
            return;
        }

        // Calculate adjusted duration based on current WPM vs tokenization WPM
        // This allows live WPM adjustment without re-tokenization
        const currentWPM = state.getCurrentWPM();
        const wpmScale = state.tokenizationWPM / currentWPM;
        const adjustedDuration = currentToken.baseDurationMs * wpmScale;

        // Check if accumulator exceeds current token's duration
        if (state.accumulator >= adjustedDuration) {
            // Advance to next token
            state.currentIndex++;

            // CRITICAL: Preserve remainder to prevent drift
            // Don't reset to 0, subtract the used duration
            state.accumulator -= adjustedDuration;

            // Notify of token change
            if (state.currentIndex < state.tokens.length) {
                state.onTokenChange(state.currentIndex);
            }
        }

        // Schedule next frame
        rafId = requestAnimationFrame(loop);
    }

    // ─────────────────────────────────────────────────────────────────
    // CONTROL METHODS
    // ─────────────────────────────────────────────────────────────────

    function start(): void {
        if (state.isPlaying) return;
        if (state.tokens.length === 0) return;

        state.isPlaying = true;
        state.lastFrameTime = 0; // Will be set on first frame

        // Notify of initial token if starting from beginning
        if (state.currentIndex === 0) {
            state.onTokenChange(0);
        }

        rafId = requestAnimationFrame(loop);
    }

    function pause(): void {
        state.isPlaying = false;
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function reset(): void {
        pause();
        state.currentIndex = 0;
        state.accumulator = 0;
        state.lastFrameTime = 0;
    }

    function seekTo(index: number): void {
        const wasPlaying = state.isPlaying;
        pause();

        state.currentIndex = Math.max(0, Math.min(index, state.tokens.length - 1));
        state.accumulator = 0;
        state.lastFrameTime = 0;

        // Notify of position change
        state.onTokenChange(state.currentIndex);

        if (wasPlaying) {
            start();
        }
    }

    function seekToSentenceStart(): void {
        const currentToken = state.tokens[state.currentIndex];
        if (!currentToken) return;

        // Find first token of current sentence
        const sentenceStart = state.tokens.findIndex(
            (t) => t.sentenceIndex === currentToken.sentenceIndex
        );

        if (sentenceStart >= 0) {
            seekTo(sentenceStart);
        }
    }

    function updateTokens(tokens: RSVPToken[], tokenizationWPM: number): void {
        const wasPlaying = state.isPlaying;
        pause();

        state.tokens = tokens;
        state.tokenizationWPM = tokenizationWPM;
        state.currentIndex = 0;
        state.accumulator = 0;
        state.lastFrameTime = 0;

        if (wasPlaying && tokens.length > 0) {
            start();
        }
    }

    function getState(): Readonly<Pick<LoopState, 'isPlaying' | 'currentIndex'>> {
        return {
            isPlaying: state.isPlaying,
            currentIndex: state.currentIndex,
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────

    return {
        start,
        pause,
        reset,
        seekTo,
        seekToSentenceStart,
        updateTokens,
        getState,
    };
}
