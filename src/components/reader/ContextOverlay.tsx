/**
 * NeuroStream Reader - ContextOverlay Component
 *
 * Displays the current paragraph context when scrubbing.
 * Shows full paragraph with current word highlighted.
 */

'use client';

import { useEffect, useRef } from 'react';
import styles from './ContextOverlay.module.css';

export interface ContextOverlayProps {
    /** Whether the overlay is visible */
    isActive: boolean;
    /** Current paragraph text */
    paragraphText: string | null;
    /** Current word to highlight */
    currentWord: string | null;
    /** Callback when overlay is clicked (to dismiss) */
    onDismiss?: () => void;
}

/**
 * Overlay component showing paragraph context.
 */
export function ContextOverlay({
    isActive,
    paragraphText,
    currentWord,
    onDismiss,
}: ContextOverlayProps): React.ReactNode | null {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Focus trap when active
    useEffect(() => {
        if (isActive && overlayRef.current) {
            overlayRef.current.focus();
        }
    }, [isActive]);

    if (!isActive || !paragraphText) {
        return null;
    }

    // Highlight the current word in the paragraph
    const highlightedText = currentWord
        ? paragraphText.replace(
            new RegExp(`(\\b${escapeRegex(currentWord)}\\b)`, 'i'),
            '<mark>$1</mark>'
        )
        : paragraphText;

    return (
        <div
            ref={overlayRef}
            className={styles.overlay}
            onClick={onDismiss}
            onKeyDown={(e) => e.key === 'Escape' && onDismiss?.()}
            tabIndex={-1}
            role="dialog"
            aria-label="Paragraph context"
        >
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <span className={styles.title}>Context</span>
                    <span className={styles.hint}>Release to resume</span>
                </div>
                <p
                    className={styles.paragraph}
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
            </div>
        </div>
    );
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
