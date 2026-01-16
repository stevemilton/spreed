/**
 * NeuroStream Reader - Sample Texts for Testing
 */

export const SAMPLE_TEXTS = {
    short: `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.`,

    punctuation: `Wait, what? The results were unexpected: first, the control group showed improvement; second, the test group exceeded all expectations! Amazing.`,

    longWords: `The implementation of pseudopseudohypoparathyroidism diagnostic methodologies requires interdisciplinary collaboration.`,

    paragraph: `Speed reading is a collection of methods aimed at increasing rates of reading without greatly reducing comprehension or retention. Methods include chunking and minimizing subvocalization. The many available speed reading training programs include books, videos, software, and seminars.

Some speed reading proponents claim that subvocalization can be broken with practice. However, research shows that subvocalization aids comprehension and recall of text, and that speed readers still subvocalize but do so more efficiently.`,

    technical: `The algorithm processes O(n log n) operations using a binary heap data structure. Initialize the priority queue with the source vertex, then extract-min and relax edges until the queue is empty. Dijkstra's algorithm guarantees shortest paths for non-negative edge weights.`,
} as const;
