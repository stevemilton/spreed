/**
 * Spreed - Share Results Component
 *
 * Allows users to share their reading stats.
 */

'use client';

import { useCallback } from 'react';
import { useReader } from '@/context/ReaderContext';
import { useSettings } from '@/context/SettingsContext';
import styles from './ShareButton.module.css';

export function ShareButton(): React.ReactNode {
    const { session } = useReader();
    const { settings } = useSettings();

    const handleShare = useCallback(async (): Promise<void> => {
        if (!session) return;

        const wordsRead = session.currentIndex;
        const text = `I just read ${wordsRead} words at ${settings.baseWPM} WPM using Spreed! 📚⚡`;
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ text, url });
            } catch (e) {
                // User cancelled
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${text}\n${url}`);
            alert('Copied to clipboard!');
        }
    }, [session, settings.baseWPM]);

    if (!session || session.currentIndex === 0) return null;

    return (
        <button
            className={styles.button}
            onClick={handleShare}
            title="Share your reading stats"
        >
            <ShareIcon />
            <span>Share</span>
        </button>
    );
}

function ShareIcon(): React.ReactNode {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}
