/**
 * Spreed - Keyboard Shortcuts Hook
 *
 * Handles global keyboard events for reader controls.
 * - Space: Play/Pause toggle
 * - Left Arrow: Decrease WPM by 50
 * - Right Arrow: Increase WPM by 50
 * - R: Reset to beginning
 * - F: Toggle focus mode
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useReader } from '@/context/ReaderContext';
import { useSettings } from '@/context/SettingsContext';
import { WPM_MIN, WPM_MAX, WPM_KEYBOARD_STEP } from '@/utils/constants';

export interface UseKeyboardShortcutsOptions {
    /** Whether shortcuts are enabled */
    enabled?: boolean;
    /** Callback when scrubbing starts (Space held) */
    onScrubStart?: () => void;
    /** Callback when scrubbing ends (Space released) */
    onScrubEnd?: () => void;
    /** Callback when focus mode is toggled */
    onFocusToggle?: () => void;
}

/**
 * Hook to enable keyboard shortcuts for reader control.
 *
 * @param options - Configuration options
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}): void {
    const { enabled = true, onScrubStart, onScrubEnd, onFocusToggle } = options;

    const { session, isPlaying, play, pause, reset, seekToSentenceStart } = useReader();
    const { settings, updateSettings } = useSettings();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent): void => {
            if (!enabled) return;

            // Ignore if user is typing in an input/textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (event.repeat) {
                        // Space held - start scrubbing
                        onScrubStart?.();
                    } else {
                        // Space pressed - toggle playback
                        if (isPlaying) {
                            pause();
                        } else if (session) {
                            play();
                        }
                    }
                    break;

                case 'ArrowLeft':
                    event.preventDefault();
                    updateSettings({
                        baseWPM: Math.max(WPM_MIN, settings.baseWPM - WPM_KEYBOARD_STEP),
                    });
                    break;

                case 'ArrowRight':
                    event.preventDefault();
                    updateSettings({
                        baseWPM: Math.min(WPM_MAX, settings.baseWPM + WPM_KEYBOARD_STEP),
                    });
                    break;

                case 'KeyR':
                    event.preventDefault();
                    reset();
                    break;

                case 'KeyF':
                    event.preventDefault();
                    onFocusToggle?.();
                    break;

                default:
                    break;
            }
        },
        [
            enabled,
            session,
            isPlaying,
            play,
            pause,
            reset,
            settings.baseWPM,
            updateSettings,
            onScrubStart,
            onFocusToggle,
        ]
    );

    const handleKeyUp = useCallback(
        (event: KeyboardEvent): void => {
            if (!enabled) return;

            if (event.code === 'Space') {
                // Space released - end scrubbing and seek to sentence start
                onScrubEnd?.();
                seekToSentenceStart();
            }
        },
        [enabled, onScrubEnd, seekToSentenceStart]
    );

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [enabled, handleKeyDown, handleKeyUp]);
}
