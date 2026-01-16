/**
 * Spreed - useFocusMode Hook
 *
 * Manages fullscreen focus mode for distraction-free reading.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

export interface FocusModeState {
    isActive: boolean;
    toggle: () => void;
    enter: () => void;
    exit: () => void;
}

/**
 * Hook to manage focus mode (fullscreen).
 */
export function useFocusMode(): FocusModeState {
    const [isActive, setIsActive] = useState(false);

    const enter = useCallback((): void => {
        if (typeof document === 'undefined') return;

        document.documentElement.requestFullscreen?.().then(() => {
            setIsActive(true);
        }).catch((err) => {
            console.warn('[FocusMode] Failed to enter fullscreen:', err);
        });
    }, []);

    const exit = useCallback((): void => {
        if (typeof document === 'undefined') return;

        document.exitFullscreen?.().then(() => {
            setIsActive(false);
        }).catch((err) => {
            console.warn('[FocusMode] Failed to exit fullscreen:', err);
        });
    }, []);

    const toggle = useCallback((): void => {
        if (isActive) {
            exit();
        } else {
            enter();
        }
    }, [isActive, enter, exit]);

    // Listen for fullscreen changes (e.g., user presses Escape)
    useEffect(() => {
        const handleFullscreenChange = (): void => {
            setIsActive(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return { isActive, toggle, enter, exit };
}
