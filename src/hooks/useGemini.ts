/**
 * Spreed - Gemini AI Hook
 *
 * Generates comprehension questions using Google's Gemini API.
 */

'use client';

import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';

export interface ComprehensionQuestion {
    question: string;
    answer: string;
}

export interface UseGeminiState {
    questions: ComprehensionQuestion[];
    isLoading: boolean;
    error: string | null;
    generateQuestions: (text: string) => Promise<void>;
    apiKey: string | null;
    setApiKey: (key: string) => void;
    clearApiKey: () => void;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const PROMPT = `You are a reading comprehension assistant. Based on the following text, generate exactly 3 simple comprehension questions to test if someone understood the main points.

Format your response as a JSON array with exactly this structure:
[
  {"question": "Question 1?", "answer": "Brief answer 1"},
  {"question": "Question 2?", "answer": "Brief answer 2"},
  {"question": "Question 3?", "answer": "Brief answer 3"}
]

Only respond with the JSON array, no other text.

Text to analyze:
`;

function loadApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || null;
    } catch {
        return null;
    }
}

function saveApiKey(key: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
    } catch (e) {
        console.error('[Gemini] Failed to save API key:', e);
    }
}

function removeApiKey(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    } catch (e) {
        console.error('[Gemini] Failed to remove API key:', e);
    }
}

/**
 * Hook for Gemini AI comprehension question generation.
 */
export function useGemini(): UseGeminiState {
    const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKeyState] = useState<string | null>(() => loadApiKey());

    const setApiKey = useCallback((key: string): void => {
        setApiKeyState(key);
        saveApiKey(key);
        setError(null);
    }, []);

    const clearApiKey = useCallback((): void => {
        setApiKeyState(null);
        removeApiKey();
        setQuestions([]);
    }, []);

    const generateQuestions = useCallback(async (text: string): Promise<void> => {
        if (!apiKey) {
            setError('Please enter your Gemini API key in settings');
            return;
        }

        if (!text.trim()) {
            setError('No text to analyze');
            return;
        }

        setIsLoading(true);
        setError(null);
        setQuestions([]);

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: PROMPT + text.slice(0, 3000) // Limit text length
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 500,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('No response from Gemini');
            }

            // Parse the JSON response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const parsed = JSON.parse(jsonMatch[0]) as ComprehensionQuestion[];
            setQuestions(parsed);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate questions';
            setError(message);
            console.error('[Gemini]', err);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);

    return {
        questions,
        isLoading,
        error,
        generateQuestions,
        apiKey,
        setApiKey,
        clearApiKey,
    };
}
