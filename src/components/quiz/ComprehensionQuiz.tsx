/**
 * Spreed - Comprehension Quiz Component
 *
 * Displays AI-generated comprehension questions after reading.
 */

'use client';

import { useState } from 'react';
import { useGemini, ComprehensionQuestion } from '@/hooks/useGemini';
import styles from './ComprehensionQuiz.module.css';

export interface ComprehensionQuizProps {
    text: string;
    onClose: () => void;
}

export function ComprehensionQuiz({ text, onClose }: ComprehensionQuizProps): React.ReactNode {
    const { questions, isLoading, error, generateQuestions, apiKey, setApiKey, clearApiKey } = useGemini();
    const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
    const [apiKeyInput, setApiKeyInput] = useState('');

    const handleGenerate = async (): Promise<void> => {
        await generateQuestions(text);
    };

    const handleSaveKey = (): void => {
        if (apiKeyInput.trim()) {
            setApiKey(apiKeyInput.trim());
            setApiKeyInput('');
        }
    };

    const toggleAnswer = (index: number): void => {
        setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // API key setup view
    if (!apiKey) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Comprehension Check</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.apiKeySetup}>
                    <p className={styles.description}>
                        Enter your Gemini API key to enable AI-powered comprehension questions.
                    </p>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        Get a free API key →
                    </a>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Paste your API key..."
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                        />
                        <button
                            className={styles.saveButton}
                            onClick={handleSaveKey}
                            disabled={!apiKeyInput.trim()}
                        >
                            Save
                        </button>
                    </div>
                    <p className={styles.note}>
                        Your key is stored locally and never sent anywhere except Google&apos;s API.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Comprehension Check</h2>
                <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>

            {questions.length === 0 && !isLoading && !error && (
                <div className={styles.intro}>
                    <p>Test your understanding of what you just read!</p>
                    <button className={styles.generateButton} onClick={handleGenerate}>
                        Generate Questions
                    </button>
                </div>
            )}

            {isLoading && (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Generating questions...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                    <button className={styles.retryButton} onClick={handleGenerate}>
                        Try Again
                    </button>
                </div>
            )}

            {questions.length > 0 && (
                <div className={styles.questions}>
                    {questions.map((q, index) => (
                        <QuestionCard
                            key={index}
                            index={index}
                            question={q}
                            showAnswer={!!showAnswers[index]}
                            onToggle={() => toggleAnswer(index)}
                        />
                    ))}
                    <button className={styles.regenerateButton} onClick={handleGenerate}>
                        Generate New Questions
                    </button>
                </div>
            )}

            {/* Footer with change key option */}
            <div className={styles.quizFooter}>
                <button className={styles.changeKeyButton} onClick={clearApiKey}>
                    🔑 Change API Key
                </button>
            </div>
        </div>
    );
}

interface QuestionCardProps {
    index: number;
    question: ComprehensionQuestion;
    showAnswer: boolean;
    onToggle: () => void;
}

function QuestionCard({ index, question, showAnswer, onToggle }: QuestionCardProps): React.ReactNode {
    return (
        <div className={styles.questionCard}>
            <div className={styles.questionNumber}>Q{index + 1}</div>
            <div className={styles.questionContent}>
                <p className={styles.questionText}>{question.question}</p>
                <button className={styles.revealButton} onClick={onToggle}>
                    {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                </button>
                {showAnswer && (
                    <p className={styles.answer}>{question.answer}</p>
                )}
            </div>
        </div>
    );
}
