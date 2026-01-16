/**
 * NeuroStream Reader - WPMSlider Component
 *
 * Speed control slider for adjusting reading speed.
 */

'use client';

import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { WPM_MIN, WPM_MAX, WPM_STEP } from '@/utils/constants';
import styles from './WPMSlider.module.css';

export interface WPMSliderProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Slider component for WPM adjustment.
 */
export function WPMSlider({ className }: WPMSliderProps): React.ReactNode {
    const { settings, updateSettings } = useSettings();

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>): void => {
            const value = parseInt(event.target.value, 10);
            updateSettings({ baseWPM: value });
        },
        [updateSettings]
    );

    // Calculate fill percentage for styling
    const fillPercent = ((settings.baseWPM - WPM_MIN) / (WPM_MAX - WPM_MIN)) * 100;

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <label className={styles.label}>
                <span className={styles.text}>WPM</span>
                <span className={styles.value}>{settings.baseWPM}</span>
            </label>
            <div className={styles.sliderWrapper}>
                <input
                    type="range"
                    className={styles.slider}
                    min={WPM_MIN}
                    max={WPM_MAX}
                    step={WPM_STEP}
                    value={settings.baseWPM}
                    onChange={handleChange}
                    aria-label="Words per minute"
                    style={{
                        background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${fillPercent}%, var(--color-border) ${fillPercent}%, var(--color-border) 100%)`,
                    }}
                />
                <div className={styles.range}>
                    <span>{WPM_MIN}</span>
                    <span>{WPM_MAX}</span>
                </div>
            </div>
        </div>
    );
}
