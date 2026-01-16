/**
 * NeuroStream Reader - PlaybackControls Component
 *
 * Play, pause, and reset buttons for reader control.
 */

'use client';

import { useReader } from '@/context/ReaderContext';
import styles from './PlaybackControls.module.css';

export interface PlaybackControlsProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Component with playback control buttons.
 */
export function PlaybackControls({ className }: PlaybackControlsProps): React.ReactNode {
    const { session, isPlaying, play, pause, reset } = useReader();

    const hasContent = session && session.tokens.length > 0;
    const isComplete = session?.status === 'COMPLETE';

    const handlePlayPause = (): void => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <button
                className={styles.button}
                onClick={reset}
                disabled={!hasContent}
                title="Reset (R)"
                aria-label="Reset"
            >
                <ResetIcon />
            </button>

            <button
                className={`${styles.button} ${styles.primary}`}
                onClick={handlePlayPause}
                disabled={!hasContent}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                <span className={styles.label}>
                    {isComplete ? 'Restart' : isPlaying ? 'Pause' : 'Play'}
                </span>
            </button>

            <button
                className={styles.button}
                onClick={() => { }}
                disabled={true}
                title="Skip (coming soon)"
                aria-label="Skip"
            >
                <SkipIcon />
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════

function PlayIcon(): React.ReactNode {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function PauseIcon(): React.ReactNode {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
        </svg>
    );
}

function ResetIcon(): React.ReactNode {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
    );
}

function SkipIcon(): React.ReactNode {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 4l10 8-10 8V4zm11 0h3v16h-3V4z" />
        </svg>
    );
}
