/**
 * NeuroStream Reader - Settings Context
 *
 * Provides global settings state with localStorage persistence.
 */

'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { ReaderSettings, SettingsContextValue } from '@/types/settings.types';
import {
    WPM_DEFAULT,
    ORP_OFFSET_DEFAULT,
    MAX_CHUNK_LENGTH,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_FAMILY,
    DEFAULT_ORP_HIGHLIGHT_COLOR,
    STORAGE_KEYS,
} from '@/utils/constants';

// ═══════════════════════════════════════════════════════════════════
// DEFAULT SETTINGS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: ReaderSettings = {
    baseWPM: WPM_DEFAULT,
    orpOffset: ORP_OFFSET_DEFAULT,
    dynamicPacing: true,
    maxChunkLength: MAX_CHUNK_LENGTH,
    theme: 'system',
    orpHighlightColor: DEFAULT_ORP_HIGHLIGHT_COLOR,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
};

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════

function loadSettings(): ReaderSettings {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<ReaderSettings>;
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch (error) {
        console.error('[Settings] Failed to load from localStorage:', error);
    }

    return DEFAULT_SETTINGS;
}

function saveSettings(settings: ReaderSettings): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('[Settings] Failed to save to localStorage:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════

export interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps): React.ReactNode {
    const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        setSettings(loadSettings());
        setIsHydrated(true);
    }, []);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (isHydrated) {
            saveSettings(settings);
        }
    }, [settings, isHydrated]);

    const updateSettings = useCallback((updates: Partial<ReaderSettings>): void => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetSettings = useCallback((): void => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    const value: SettingsContextValue = {
        settings,
        updateSettings,
        resetSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to access settings context.
 *
 * @returns Settings context value
 * @throws Error if used outside SettingsProvider
 */
export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }

    return context;
}
