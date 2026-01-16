/**
 * Spreed - Reading Stats Component
 *
 * Displays current WPM and estimated time remaining.
 */

'use client';

import { useMemo } from 'react';
import { useReader } from '@/context/ReaderContext';
import { useSettings } from '@/context/SettingsContext';
import styles from './ReadingStats.module.css';

export interface ReadingStatsProps {
    className?: string;
}

/**
 * Component showing reading statistics.
 */
export function ReadingStats({ className }: ReadingStatsProps): React.ReactNode {
    const { session } = useReader();
    const { settings } = useSettings();

    const stats = useMemo(() => {
        if (!session || session.tokens.length === 0) {
            return { timeRemaining: '—', wordsLeft: 0 };
        }

        const wordsLeft = session.tokens.length - session.currentIndex;
        const minutesLeft = wordsLeft / settings.baseWPM;

        if (minutesLeft < 1) {
            const secondsLeft = Math.ceil(minutesLeft * 60);
            return { timeRemaining: `${secondsLeft}s`, wordsLeft };
        } else {
            const mins = Math.floor(minutesLeft);
            const secs = Math.round((minutesLeft - mins) * 60);
            return {
                timeRemaining: secs > 0 ? `${mins}m ${secs}s` : `${mins}m`,
                wordsLeft
            };
        }
    }, [session, settings.baseWPM]);

    if (!session) return null;

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <div className={styles.stat}>
                <span className={styles.value}>{settings.baseWPM}</span>
                <span className={styles.label}>WPM</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.stat}>
                <span className={styles.value}>{stats.timeRemaining}</span>
                <span className={styles.label}>remaining</span>
            </div>
        </div>
    );
}
