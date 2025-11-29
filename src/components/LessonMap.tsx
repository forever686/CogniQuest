import React from 'react';
import { Check, Lock, Play } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { LessonChapter } from '../types';

interface LessonMapProps {
    chapters: LessonChapter[];
    currentChapterIndex: number;
    completedChapters: Set<string>;
    onChapterClick: (index: number) => void;
}

const LessonMap: React.FC<LessonMapProps> = ({ chapters, currentChapterIndex, completedChapters, onChapterClick }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden p-8">
            <div className="w-full max-w-5xl relative">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-12 text-center">Adventure Map</h1>

                {/* Horizontal Line */}
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0 -translate-y-1/2" />

                <div className="flex items-center justify-between relative z-10 px-12 overflow-x-auto pb-8">
                    {chapters.map((chapter, index) => {
                        const isCompleted = completedChapters.has(chapter.id);
                        const isCurrent = index === currentChapterIndex;
                        // Locked if previous chapter not completed AND not current AND not first chapter
                        const isLocked = !isCompleted && !isCurrent && index > 0 && !completedChapters.has(chapters[index - 1].id);

                        const canClick = !isLocked;

                        return (
                            <div
                                key={chapter.id}
                                className="flex flex-col items-center gap-4 group"
                            >
                                <div
                                    className={twMerge(
                                        "w-24 h-24 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border-4 relative",
                                        canClick ? "cursor-pointer hover:scale-110" : "cursor-not-allowed grayscale opacity-60",
                                        isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            isCurrent ? "bg-white border-indigo-500 text-indigo-500 shadow-xl shadow-indigo-500/20" :
                                                "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400"
                                    )}
                                    onClick={() => canClick && onChapterClick(index)}
                                >
                                    {isCompleted ? <Check size={40} strokeWidth={3} /> :
                                        isLocked ? <Lock size={32} /> :
                                            <span className="text-3xl font-bold">{index + 1}</span>}

                                    {/* Play Button Overlay for Current */}
                                    {isCurrent && !isCompleted && (
                                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                                            <Play size={16} fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                {/* Text Info */}
                                <div className="text-center max-w-[150px]">
                                    <h3 className={twMerge(
                                        "text-lg font-bold mb-1 transition-colors",
                                        isCurrent ? "text-indigo-600 dark:text-indigo-400" :
                                            isCompleted ? "text-slate-700 dark:text-slate-300" : "text-slate-500"
                                    )}>
                                        {chapter.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {chapter.steps.length} Steps
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LessonMap;
