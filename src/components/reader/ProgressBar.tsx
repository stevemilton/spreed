/**
 * NeuroStream Reader - ProgressBar Component
 *
 * Visual progress indicator showing reading position.
 */

'use client';

import { useReader } from '@/context/ReaderContext';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Component that displays reading progress as a bar.
 */
export function ProgressBar({ className }: ProgressBarProps): React.ReactNode {
    const { session, progress } = useReader();

    const wordsRead = session?.currentIndex ?? 0;
    const totalWords = session?.tokens.length ?? 0;

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <div className={styles.track}>
                <div
                    className={styles.fill}
                    style={{ width: `${progress}%` }}
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
