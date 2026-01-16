/**
 * Spreed - FontSelector Component
 *
 * Allows users to choose between font families.
 */

'use client';

import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import styles from './FontSelector.module.css';

const FONT_OPTIONS = [
    { value: "'SF Mono', 'Fira Code', 'Consolas', monospace", label: 'Mono' },
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: 'Sans' },
    { value: "Georgia, 'Times New Roman', serif", label: 'Serif' },
] as const;

export function FontSelector(): React.ReactNode {
    const { settings, updateSettings } = useSettings();

    const handleChange = useCallback(
        (fontFamily: string): void => {
            updateSettings({ fontFamily });
        },
        [updateSettings]
    );

    return (
        <div className={styles.container}>
            <span className={styles.label}>Font</span>
            <div className={styles.options}>
                {FONT_OPTIONS.map((option) => (
                    <button
                        key={option.label}
                        className={`${styles.option} ${settings.fontFamily === option.value ? styles.active : ''}`}
                        onClick={() => handleChange(option.value)}
                        style={{ fontFamily: option.value }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
