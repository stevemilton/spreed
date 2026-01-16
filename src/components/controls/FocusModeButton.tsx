/**
 * Spreed - FocusModeButton Component
 *
 * Button to enter/exit fullscreen focus mode.
 */

'use client';

import { useFocusMode } from '@/hooks/useFocusMode';
import styles from './PlaybackControls.module.css';

export function FocusModeButton(): React.ReactNode {
    const { isActive, toggle } = useFocusMode();

    return (
        <button
            className={styles.button}
            onClick={toggle}
            title={isActive ? 'Exit Focus Mode' : 'Focus Mode'}
            aria-label={isActive ? 'Exit Focus Mode' : 'Focus Mode'}
        >
            {isActive ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
    );
}

function FullscreenIcon(): React.ReactNode {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
    );
}

function ExitFullscreenIcon(): React.ReactNode {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
    );
}
