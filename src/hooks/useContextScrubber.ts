/**
 * NeuroStream Reader - Context Scrubber Hook
 *
 * Manages the hold-to-reveal paragraph context overlay.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useReader } from '@/context/ReaderContext';

export interface ContextScrubberState {
    /** Whether the scrubber overlay is visible */
    isActive: boolean;
    /** The current paragraph text to display */
    paragraphText: string | null;
    /** The current word to highlight in the paragraph */
    currentWord: string | null;
    /** Start scrubbing (show overlay) */
    startScrubbing: () => void;
    /** End scrubbing (hide overlay and seek to sentence start) */
    endScrubbing: () => void;
    /** Toggle scrubbing state */
    toggleScrubbing: () => void;
}

/**
 * Hook to manage context scrubber state.
 *
 * @returns Context scrubber state and controls
 */
export function useContextScrubber(): ContextScrubberState {
    const { session, contextMap, currentToken, isPlaying, pause, seekToSentenceStart } = useReader();

    const [isActive, setIsActive] = useState(false);
    const wasPlayingRef = useRef(false);

    // Get current paragraph text
    const paragraphText = (() => {
        if (!contextMap || !currentToken) return null;

        const paragraph = contextMap.paragraphs[currentToken.paragraphIndex];
        if (!paragraph) return null;

        // Reconstruct paragraph from sentences
        return paragraph.sentences.map((s) => s.text).join(' ');
    })();

    // Get current word
    const currentWord = currentToken?.raw ?? null;

    const startScrubbing = useCallback((): void => {
        if (!session) return;

        // Remember if we were playing
        wasPlayingRef.current = isPlaying;

        // Pause playback
        if (isPlaying) {
            pause();
        }

        setIsActive(true);
    }, [session, isPlaying, pause]);

    const endScrubbing = useCallback((): void => {
        setIsActive(false);

        // Seek to start of current sentence
        seekToSentenceStart();

        // Note: We don't auto-resume. User must manually start again.
        // This matches the PRD which says "Resume from start of current sentence"
    }, [seekToSentenceStart]);

    const toggleScrubbing = useCallback((): void => {
        if (isActive) {
            endScrubbing();
        } else {
            startScrubbing();
        }
    }, [isActive, startScrubbing, endScrubbing]);

    // Clean up when session changes
    useEffect(() => {
        setIsActive(false);
    }, [session?.sessionId]);

    return {
        isActive,
        paragraphText,
        currentWord,
        startScrubbing,
        endScrubbing,
        toggleScrubbing,
    };
}
