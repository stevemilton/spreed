/**
 * Spreed - ProgressBar Component
 *
 * Visual progress indicator with click-to-seek functionality.
 */

'use client';

import { useCallback, useRef } from 'react';
import { useReader } from '@/context/ReaderContext';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Component that displays reading progress as a clickable bar.
 */
export function ProgressBar({ className }: ProgressBarProps): React.ReactNode {
    const { session, progress, seekTo } = useReader();
    const trackRef = useRef<HTMLDivElement>(null);

    const wordsRead = session?.currentIndex ?? 0;
    const totalWords = session?.tokens.length ?? 0;

    // Handle click on progress bar to seek
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>): void => {
            if (!trackRef.current || !session || totalWords === 0) return;

            const rect = trackRef.current.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const targetIndex = Math.floor(percentage * totalWords);

            seekTo(targetIndex);
        },
        [session, totalWords, seekTo]
    );

    // Handle drag on progress bar
    const handleDrag = useCallback(
        (event: React.MouseEvent<HTMLDivElement>): void => {
            if (event.buttons !== 1) return; // Only left mouse button
            handleClick(event);
        },
        [handleClick]
    );

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <div
                ref={trackRef}
                className={styles.track}
                onClick={handleClick}
                onMouseMove={handleDrag}
                role="slider"
                aria-label="Reading progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
            >
                <div
                    className={styles.fill}
                    style={{ width: `${progress}%` }}
                />
                <div
                    className={styles.handle}
                    style={{ left: `${progress}%` }}
                />
            </div>
            <div className={styles.label}>
                <span className={styles.progress}>{Math.round(progress)}%</span>
                <span className={styles.count}>
                    {wordsRead} / {totalWords} words
                </span>
            </div>
        </div>
    );
}
