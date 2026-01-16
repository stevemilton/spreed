/**
 * NeuroStream Reader - Settings Types
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ReaderSettings {
    /** Target Words Per Minute (200-1000) */
    baseWPM: number;
    /** ORP position ratio (default: 0.35) */
    orpOffset: number;
    /** Enable semantic pacing multipliers */
    dynamicPacing: boolean;
    /** Max chars before hyphenation (default: 13) */
    maxChunkLength: number;
    /** Theme preference */
    theme: Theme;
    /** Accent color for ORP character */
    orpHighlightColor: string;
    /** Display font */
    fontFamily: string;
    /** Base font size in pixels */
    fontSize: number;
}

export interface SettingsContextValue {
    settings: ReaderSettings;
    updateSettings: (updates: Partial<ReaderSettings>) => void;
    resetSettings: () => void;
}
