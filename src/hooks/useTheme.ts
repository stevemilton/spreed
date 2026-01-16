/**
 * NeuroStream Reader - Theme Hook
 *
 * Manages dark/light theme with system preference detection.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Theme } from '@/types/settings.types';

export interface ThemeState {
    /** Current resolved theme ('light' or 'dark') */
    resolvedTheme: 'light' | 'dark';
    /** User's theme preference */
    theme: Theme;
    /** Set theme preference */
    setTheme: (theme: Theme) => void;
    /** Toggle between light and dark */
    toggleTheme: () => void;
}

/**
 * Hook to manage theme state.
 *
 * @returns Theme state and controls
 */
export function useTheme(): ThemeState {
    const { settings, updateSettings } = useSettings();

    // Resolve 'system' theme to actual value
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const resolvedTheme: 'light' | 'dark' =
        settings.theme === 'system' ? getSystemTheme() : settings.theme;

    const setTheme = useCallback(
        (theme: Theme): void => {
            updateSettings({ theme });
        },
        [updateSettings]
    );

    const toggleTheme = useCallback((): void => {
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    // Apply theme to document
    useEffect(() => {
        if (typeof document === 'undefined') return;

        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (settings.theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (): void => {
            // Force re-render by updating (no-op update triggers effect)
            document.documentElement.setAttribute(
                'data-theme',
                mediaQuery.matches ? 'dark' : 'light'
            );
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme]);

    return {
        resolvedTheme,
        theme: settings.theme,
        setTheme,
        toggleTheme,
    };
}
