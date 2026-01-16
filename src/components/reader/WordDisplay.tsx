/**
 * NeuroStream Reader - WordDisplay Component
 *
 * Renders a word with ORP (Optimal Recognition Point) alignment and highlighting.
 * The ORP character is highlighted and positioned at the center of the display.
 */

'use client';

import { useMemo } from 'react';
import { RSVPToken } from '@/types/reader.types';
import { splitByORP } from '@/engine/orp';
import { useSettings } from '@/context/SettingsContext';
import styles from './WordDisplay.module.css';

export interface WordDisplayProps {
    /** The token to display */
    token: RSVPToken | null;
    /** Whether the reader is in idle/empty state */
    isEmpty?: boolean;
}

/**
 * Component that displays a word with ORP highlighting.
 * The ORP character is centered and highlighted with the accent color.
 */
export function WordDisplay({ token, isEmpty = false }: WordDisplayProps): React.ReactNode {
    const { settings } = useSettings();

    // Split word into before/orp/after parts
    const parts = useMemo(() => {
        if (!token) {
            return { before: '', orp: '', after: '' };
        }
        return splitByORP(token.raw, token.orpIndex);
    }, [token]);

    // Custom style for ORP highlight color
    const orpStyle = {
        color: settings.orpHighlightColor,
    };

    // Custom style for font
    const containerStyle = {
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}px`,
    };

    if (isEmpty || !token) {
        return (
            <div className={styles.container} style={containerStyle}>
                <div className={styles.placeholder}>
                    Paste text below and click Start
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={containerStyle}>
            <div className={styles.word}>
                <span className={styles.before}>{parts.before}</span>
                <span className={styles.orp} style={orpStyle}>{parts.orp}</span>
                <span className={styles.after}>{parts.after}</span>
            </div>
            {/* ORP position indicator line */}
            <div className={styles.orpLine} style={{ backgroundColor: settings.orpHighlightColor }} />
        </div>
    );
}
