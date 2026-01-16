/**
 * NeuroStream Reader - TextInput Component
 *
 * Textarea for entering text to read.
 */

'use client';

import { useState, useCallback } from 'react';
import { useReader } from '@/context/ReaderContext';
import { SAMPLE_TEXTS } from '@/utils/sampleTexts';
import styles from './TextInput.module.css';

export interface TextInputProps {
    /** Optional className for styling */
    className?: string;
}

/**
 * Text input component with sample text buttons.
 */
export function TextInput({ className }: TextInputProps): React.ReactNode {
    const { loadText, session } = useReader();
    const [text, setText] = useState('');

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
            setText(event.target.value);
        },
        []
    );

    const handleStart = useCallback((): void => {
        if (text.trim()) {
            loadText(text);
        }
    }, [text, loadText]);

    const handleLoadSample = useCallback(
        (sampleKey: keyof typeof SAMPLE_TEXTS): void => {
            const sampleText = SAMPLE_TEXTS[sampleKey];
            setText(sampleText);
            loadText(sampleText);
        },
        [loadText]
    );

    const hasContent = text.trim().length > 0;
    const isLoaded = session !== null;

    return (
        <div className={`${styles.container} ${className ?? ''}`}>
            <div className={styles.header}>
                <span className={styles.title}>Paste or type text</span>
                <div className={styles.samples}>
                    <span className={styles.samplesLabel}>Try:</span>
                    <button
                        className={styles.sampleButton}
                        onClick={() => handleLoadSample('short')}
                    >
                        Short
                    </button>
                    <button
                        className={styles.sampleButton}
                        onClick={() => handleLoadSample('paragraph')}
                    >
                        Paragraph
                    </button>
                    <button
                        className={styles.sampleButton}
                        onClick={() => handleLoadSample('technical')}
                    >
                        Technical
                    </button>
                </div>
            </div>

            <textarea
                className={styles.textarea}
                value={text}
                onChange={handleChange}
                placeholder="Paste your text here..."
                rows={5}
                aria-label="Text to read"
            />

            <button
                className={styles.startButton}
                onClick={handleStart}
                disabled={!hasContent}
            >
                {isLoaded ? 'Load New Text' : 'Start Reading'}
            </button>
        </div>
    );
}
