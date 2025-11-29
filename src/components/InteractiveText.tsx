import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveTextProps {
    content: string;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ content }) => {
    const [selectedWord, setSelectedWord] = useState<{ word: string; x: number; y: number } | null>(null);

    const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
        // Simple cleanup: remove punctuation
        const cleanWord = word.replace(/[.,!?;:()]/g, '');
        if (cleanWord.length < 2) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setSelectedWord({
            word: cleanWord,
            x: rect.left + rect.width / 2,
            y: rect.top
        });

        // Auto-hide after 3 seconds
        setTimeout(() => setSelectedWord(null), 3000);
    };

    // Split by spaces but keep punctuation attached for rendering, handle newlines
    const words = content.split(' ');

    return (
        <>
            <p className="text-text-secondary leading-relaxed mb-4">
                {words.map((word, i) => (
                    <span
                        key={i}
                        className="inline-block cursor-pointer hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded px-0.5 transition-colors"
                        onClick={(e) => handleWordClick(e, word)}
                    >
                        {word}{' '}
                    </span>
                ))}
            </p>

            <AnimatePresence>
                {selectedWord && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="fixed z-50 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                        style={{
                            left: selectedWord.x,
                            top: selectedWord.y - 40,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="font-bold mb-0.5">{selectedWord.word}</div>
                        <div className="text-slate-300 text-[10px]">Click to translate (Mock)</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default InteractiveText;
