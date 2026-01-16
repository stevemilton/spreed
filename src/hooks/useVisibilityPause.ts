/**
 * Spreed - useVisibilityPause Hook
 *
 * Auto-pauses reading when tab loses focus.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useReader } from '@/context/ReaderContext';

/**
 * Hook that pauses reading when the browser tab is hidden.
 */
export function useVisibilityPause(): void {
    const { isPlaying, pause } = useReader();
    const wasPlayingRef = useRef(false);

    useEffect(() => {
        const handleVisibilityChange = (): void => {
            if (document.hidden && isPlaying) {
                wasPlayingRef.current = true;
                pause();
            }
            // Note: We don't auto-resume when tab becomes visible again
            // User must manually resume for better UX
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isPlaying, pause]);
}
