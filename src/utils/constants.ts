/**
 * NeuroStream Reader - Application Constants
 */

// ═══════════════════════════════════════════════════════════════════
// WPM CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const WPM_MIN = 200;
export const WPM_MAX = 1000;
export const WPM_DEFAULT = 400;
export const WPM_STEP = 10;
export const WPM_KEYBOARD_STEP = 50;
export const WPM_PRESETS = [300, 450, 600, 800] as const;

// ═══════════════════════════════════════════════════════════════════
// ORP CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const ORP_OFFSET_DEFAULT = 0.35;
export const MAX_CHUNK_LENGTH = 13;

// ═══════════════════════════════════════════════════════════════════
// PACING MULTIPLIERS
// ═══════════════════════════════════════════════════════════════════

export const PACING_MULTIPLIERS = {
    SHORT_WORD: 0.8,      // < 4 chars
    NORMAL_WORD: 1.0,     // 4-12 chars
    LONG_WORD: 1.4,       // > 12 chars
    COMMA_PAUSE: 2.0,     // , ; :
    SENTENCE_END: 3.0,    // . ! ?
} as const;

export const SHORT_WORD_THRESHOLD = 4;
export const LONG_WORD_THRESHOLD = 12;

// ═══════════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════════

export const FRAME_DROP_THRESHOLD_MS = 100;
export const MS_PER_MINUTE = 60000;

// ═══════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════

export const STORAGE_KEYS = {
    SETTINGS: 'neurostream-settings',
    THEME: 'neurostream-theme',
} as const;

// ═══════════════════════════════════════════════════════════════════
// UI DEFAULTS
// ═══════════════════════════════════════════════════════════════════

export const DEFAULT_FONT_SIZE = 48;
export const DEFAULT_FONT_FAMILY = "'SF Mono', 'Fira Code', 'Consolas', monospace";
export const DEFAULT_ORP_HIGHLIGHT_COLOR = '#E53935';
