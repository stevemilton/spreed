/**
 * Spreed - Main Reader Container
 *
 * Composes all reader-related components with keyboard shortcuts,
 * focus mode, and visibility pause.
 */

'use client';

import { useReader } from '@/context/ReaderContext';
import {
    useKeyboardShortcuts,
    useContextScrubber,
    useVisibilityPause,
    useFocusMode
} from '@/hooks';
import { WordDisplay } from './WordDisplay';
import { ProgressBar } from './ProgressBar';
import { ContextOverlay } from './ContextOverlay';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { FocusModeButton } from '@/components/controls/FocusModeButton';
import { ShareButton } from '@/components/controls/ShareButton';
import { WPMSlider } from '@/components/controls/WPMSlider';
import { WPMPresets } from '@/components/controls/WPMPresets';
import { TextInput } from '@/components/input/TextInput';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { FontSelector } from '@/components/settings/FontSelector';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { ReadingStats } from '@/components/stats/ReadingStats';
import styles from './Reader.module.css';

/**
 * Main reader container component.
 */
export function Reader(): React.ReactNode {
    const { session, currentToken } = useReader();
    const scrubber = useContextScrubber();
    const focusMode = useFocusMode();

    // Enable keyboard shortcuts with scrubber and focus mode integration
    useKeyboardShortcuts({
        enabled: true,
        onScrubStart: scrubber.startScrubbing,
        onScrubEnd: scrubber.endScrubbing,
        onFocusToggle: focusMode.toggle,
    });

    // Auto-pause when tab loses focus
    useVisibilityPause();

    const hasSession = session !== null;

    return (
        <div className={`${styles.container} ${focusMode.isActive ? styles.focusMode : ''}`}>
            {/* Header - hidden in focus mode */}
            {!focusMode.isActive && (
                <header className={styles.header}>
                    <h1 className={styles.title}>Spreed</h1>
                    {hasSession && <ReadingStats />}
                </header>
            )}

            {/* Text Input - Only show when no session and not in focus mode */}
            {!hasSession && !focusMode.isActive && (
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
                <div className={styles.mainControls}>
                    <PlaybackControls />
                    <FocusModeButton />
                </div>

                {!focusMode.isActive && (
                    <div className={styles.wpmControls}>
                        <WPMPresets />
                        <WPMSlider />
                    </div>
                )}
            </section>

            {/* Settings - Only show when not in focus mode */}
            {hasSession && !focusMode.isActive && (
                <section className={styles.settingsSection}>
                    <FontSelector />
                    <ColorPicker />
                    <ShareButton />
                </section>
            )}

            {/* Text Input - Compact when session active */}
            {hasSession && !focusMode.isActive && (
                <section className={styles.compactInputSection}>
                    <TextInput />
                </section>
            )}

            {/* Keyboard Hints + Theme Toggle - hidden in focus mode */}
            {!focusMode.isActive && (
                <footer className={styles.footer}>
                    <div className={styles.hints}>
                        <span><kbd>Space</kbd> Play/Pause</span>
                        <span><kbd>←</kbd><kbd>→</kbd> ±50 WPM</span>
                        <span><kbd>R</kbd> Reset</span>
                        <span><kbd>F</kbd> Focus</span>
                    </div>
                    <ThemeToggle />
                </footer>
            )}

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
