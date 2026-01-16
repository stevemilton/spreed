/**
 * NeuroStream Reader - Reader Context
 *
 * Provides global reader session state and playback controls.
 */

'use client';

import {
    createContext,
    useContext,
    useState,
    useRef,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import {
    RSVPToken,
    ReadingSession,
    ReaderStatus,
    ReaderContextValue,
    ContextMap,
} from '@/types/reader.types';
import { RenderLoopControls, TokenizationResult } from '@/types/engine.types';
import { tokenizeText, createRenderLoop } from '@/engine';
import { useSettings } from './SettingsContext';

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

const ReaderContext = createContext<ReaderContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════

function generateSessionId(): string {
    return crypto.randomUUID();
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════

export interface ReaderProviderProps {
    children: ReactNode;
}

export function ReaderProvider({ children }: ReaderProviderProps): React.ReactNode {
    const { settings } = useSettings();

    const [session, setSession] = useState<ReadingSession | null>(null);
    const [contextMap, setContextMap] = useState<ContextMap | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [status, setStatus] = useState<ReaderStatus>('IDLE');

    const loopRef = useRef<RenderLoopControls | null>(null);

    // Use a ref to always get the current WPM (avoids stale closure)
    const settingsRef = useRef(settings);
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    // Get current token
    const currentToken = session?.tokens[currentIndex] ?? null;

    // Calculate progress
    const progress = session && session.tokens.length > 0
        ? (currentIndex / session.tokens.length) * 100
        : 0;

    // Is currently playing
    const isPlaying = status === 'PLAYING';

    // ─────────────────────────────────────────────────────────────────
    // RENDER LOOP CALLBACKS
    // ─────────────────────────────────────────────────────────────────

    const handleTokenChange = useCallback((index: number): void => {
        setCurrentIndex(index);
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentIndex: index,
                wordsRead: index + 1,
            };
        });
    }, []);

    const handleComplete = useCallback((): void => {
        setStatus('COMPLETE');
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                status: 'COMPLETE',
            };
        });
    }, []);

    // ─────────────────────────────────────────────────────────────────
    // CONTROLS
    // ─────────────────────────────────────────────────────────────────

    const loadText = useCallback((text: string): void => {
        try {
            const result: TokenizationResult = tokenizeText(text, settingsRef.current);

            const newSession: ReadingSession = {
                sessionId: generateSessionId(),
                sourceText: text,
                tokens: result.tokens,
                currentIndex: 0,
                status: 'IDLE',
                startedAt: null,
                totalDurationMs: result.totalDurationMs,
                elapsedDurationMs: 0,
                wordsRead: 0,
                effectiveWPM: 0,
                tokenizationWPM: result.tokenizationWPM,
            };

            setSession(newSession);
            setContextMap(result.contextMap);
            setCurrentIndex(0);
            setStatus('IDLE');

            // Create or update render loop
            // Use a function reference that reads from ref (always current)
            if (loopRef.current) {
                loopRef.current.updateTokens(result.tokens, result.tokenizationWPM);
            } else {
                loopRef.current = createRenderLoop({
                    isPlaying: false,
                    tokens: result.tokens,
                    currentIndex: 0,
                    onTokenChange: handleTokenChange,
                    onComplete: handleComplete,
                    getCurrentWPM: () => settingsRef.current.baseWPM,
                    tokenizationWPM: result.tokenizationWPM,
                });
            }
        } catch (error) {
            console.error('[Reader] Failed to load text:', error);
            // Could dispatch to error state here
        }
    }, [handleTokenChange, handleComplete]);

    const play = useCallback((): void => {
        if (!session || session.tokens.length === 0) return;

        if (status === 'COMPLETE') {
            // Reset if completed
            loopRef.current?.reset();
            setCurrentIndex(0);
        }

        setStatus('PLAYING');
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                status: 'PLAYING',
                startedAt: prev.startedAt ?? Date.now(),
            };
        });

        loopRef.current?.start();
    }, [session, status]);

    const pause = useCallback((): void => {
        setStatus('PAUSED');
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                status: 'PAUSED',
            };
        });

        loopRef.current?.pause();
    }, []);

    const reset = useCallback((): void => {
        setStatus('IDLE');
        setCurrentIndex(0);
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentIndex: 0,
                status: 'IDLE',
                startedAt: null,
                wordsRead: 0,
                effectiveWPM: 0,
            };
        });

        loopRef.current?.reset();
    }, []);

    const seekTo = useCallback((index: number): void => {
        setCurrentIndex(index);
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentIndex: index,
            };
        });

        loopRef.current?.seekTo(index);
    }, []);

    const seekToSentenceStart = useCallback((): void => {
        loopRef.current?.seekToSentenceStart();
    }, []);

    // ─────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            loopRef.current?.pause();
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────
    // CONTEXT VALUE
    // ─────────────────────────────────────────────────────────────────

    const value: ReaderContextValue = {
        session,
        currentToken,
        contextMap,
        isPlaying,
        progress,
        loadText,
        play,
        pause,
        reset,
        seekTo,
        seekToSentenceStart,
    };

    return (
        <ReaderContext.Provider value={value}>
            {children}
        </ReaderContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to access reader context.
 *
 * @returns Reader context value
 * @throws Error if used outside ReaderProvider
 */
export function useReader(): ReaderContextValue {
    const context = useContext(ReaderContext);

    if (!context) {
        throw new Error('useReader must be used within a ReaderProvider');
    }

    return context;
}
