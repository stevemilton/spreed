/**
 * NeuroStream Reader - WPMPresets Component
 *
 * Quick preset buttons for common WPM values.
 */

'use client';

import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { WPM_PRESETS } from '@/utils/constants';
import styles from './WPMPresets.module.css';

export interface WPMPresetsProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Component with preset WPM buttons.
 */
export function WPMPresets({ className }: WPMPresetsProps): React.ReactNode {
    const { settings, updateSettings } = useSettings();

    const handleClick = useCallback(
        (wpm: number): void => {
            updateSettings({ baseWPM: wpm });
        },
        [updateSettings]
    );

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            {WPM_PRESETS.map((wpm) => (
                <button
                    key={wpm}
                    className={`${styles.button} ${settings.baseWPM === wpm ? styles.active : ''}`}
                    onClick={() => handleClick(wpm)}
                    aria-label={`Set WPM to ${wpm}`}
                >
                    {wpm}
                </button>
            ))}
        </div>
    );
}
