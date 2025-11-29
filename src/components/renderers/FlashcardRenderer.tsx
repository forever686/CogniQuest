import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, HelpCircle, CheckCircle2, Volume2 } from 'lucide-react';
import { ttsService } from '../../services/tts';

interface FlashcardRendererProps {
    front: string;
    back: string;
}

const FlashcardRenderer: React.FC<FlashcardRendererProps> = ({ front, back }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 perspective-1000">
            <div className="relative w-full max-w-2xl aspect-video cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-white/10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                ttsService.speak(front);
                            }}
                            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <Volume2 size={20} />
                        </button>
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {front}
                        </h3>
                        <p className="text-white/60 text-sm mt-auto">
                            Click to reveal answer
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-700"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                ttsService.speak(back);
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <Volume2 size={20} />
                        </button>
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-xl text-text-primary">
                                {back}
                            </p>
                        </div>
                        <button
                            className="mt-auto flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                        >
                            <RotateCw className="w-4 h-4" />
                            Flip back
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FlashcardRenderer;
