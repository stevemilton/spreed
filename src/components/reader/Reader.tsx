/**
 * NeuroStream Reader - Main Reader Container
 *
 * Composes all reader-related components with keyboard shortcuts
 * and context scrubber functionality.
 */

'use client';

import { useReader } from '@/context/ReaderContext';
import { useKeyboardShortcuts, useContextScrubber } from '@/hooks';
import { WordDisplay } from './WordDisplay';
import { ProgressBar } from './ProgressBar';
import { ContextOverlay } from './ContextOverlay';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { WPMSlider } from '@/components/controls/WPMSlider';
import { WPMPresets } from '@/components/controls/WPMPresets';
import { TextInput } from '@/components/input/TextInput';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import styles from './Reader.module.css';

/**
 * Main reader container component.
 */
export function Reader(): React.ReactNode {
    const { session, currentToken } = useReader();
    const scrubber = useContextScrubber();

    // Enable keyboard shortcuts with scrubber integration
    useKeyboardShortcuts({
        enabled: true,
        onScrubStart: scrubber.startScrubbing,
        onScrubEnd: scrubber.endScrubbing,
    });

    const hasSession = session !== null;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>Spreed</h1>
            </header>

            {/* Text Input - Collapsible when session active */}
            {!hasSession && (
                <section className={styles.inputSection}>
                    <TextInput />
                </section>
            )}

            {/* Word Display */}
            <section className={styles.displaySection}>
                <WordDisplay token={currentToken} isEmpty={!hasSession} />
                {hasSession && <ProgressBar className={styles.progressBar} />}
            </section>

            {/* Controls */}
            <section className={styles.controlsSection}>
                <PlaybackControls />
                <div className={styles.wpmControls}>
                    <WPMPresets />
                    <WPMSlider />
                </div>
            </section>

            {/* Text Input - Compact when session active */}
            {hasSession && (
                <section className={styles.compactInputSection}>
                    <TextInput />
                </section>
            )}

            {/* Keyboard Hints + Theme Toggle */}
            <footer className={styles.footer}>
                <div className={styles.hints}>
                    <span><kbd>Space</kbd> Play/Pause</span>
                    <span><kbd>←</kbd><kbd>→</kbd> ±50 WPM</span>
                    <span><kbd>R</kbd> Reset</span>
                    <span><kbd>Hold Space</kbd> Context</span>
                </div>
                <ThemeToggle />
            </footer>

            {/* Context Overlay */}
            <ContextOverlay
                isActive={scrubber.isActive}
                paragraphText={scrubber.paragraphText}
                currentWord={scrubber.currentWord}
                onDismiss={scrubber.endScrubbing}
            />
        </div>
    );
}
