/**
 * Spreed - ColorPicker Component
 *
 * Allows users to customize the ORP highlight color.
 */

'use client';

import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import styles from './ColorPicker.module.css';

const COLOR_PRESETS = [
    '#E53935', // Red (default)
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
] as const;

export function ColorPicker(): React.ReactNode {
    const { settings, updateSettings } = useSettings();

    const handleChange = useCallback(
        (color: string): void => {
            updateSettings({ orpHighlightColor: color });
        },
        [updateSettings]
    );

    return (
        <div className={styles.container}>
            <span className={styles.label}>ORP Color</span>
            <div className={styles.presets}>
                {COLOR_PRESETS.map((color) => (
                    <button
                        key={color}
                        className={`${styles.swatch} ${settings.orpHighlightColor === color ? styles.active : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleChange(color)}
                        aria-label={`Set ORP color to ${color}`}
                    />
                ))}
                <input
                    type="color"
                    className={styles.customInput}
                    value={settings.orpHighlightColor}
                    onChange={(e) => handleChange(e.target.value)}
                    aria-label="Custom ORP color"
                />
            </div>
        </div>
    );
}
