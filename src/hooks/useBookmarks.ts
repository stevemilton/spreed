/**
 * Spreed - Bookmarks Management Hook
 *
 * Save and manage reading bookmarks in localStorage.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';

export interface Bookmark {
    id: string;
    title: string;
    text: string;
    createdAt: number;
}

export interface BookmarksState {
    bookmarks: Bookmark[];
    addBookmark: (text: string, title?: string) => void;
    removeBookmark: (id: string) => void;
    clearBookmarks: () => void;
}

function generateId(): string {
    return `bm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadBookmarks(): Bookmark[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveBookmarks(bookmarks: Bookmark[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
        console.error('[Bookmarks] Failed to save:', e);
    }
}

/**
 * Hook to manage text bookmarks.
 */
export function useBookmarks(): BookmarksState {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    // Load on mount
    useEffect(() => {
        setBookmarks(loadBookmarks());
    }, []);

    const addBookmark = useCallback((text: string, title?: string): void => {
        const preview = text.slice(0, 50).trim();
        const bookmark: Bookmark = {
            id: generateId(),
            title: title || `${preview}...`,
            text,
            createdAt: Date.now(),
        };

        setBookmarks((prev) => {
            const updated = [bookmark, ...prev].slice(0, 20); // Keep max 20
            saveBookmarks(updated);
            return updated;
        });
    }, []);

    const removeBookmark = useCallback((id: string): void => {
        setBookmarks((prev) => {
            const updated = prev.filter((b) => b.id !== id);
            saveBookmarks(updated);
            return updated;
        });
    }, []);

    const clearBookmarks = useCallback((): void => {
        setBookmarks([]);
        saveBookmarks([]);
    }, []);

    return { bookmarks, addBookmark, removeBookmark, clearBookmarks };
}
