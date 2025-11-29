import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface FillBlankTemplateProps {
    data: {
        text_parts: string[];
        correct_answers: string[];
        options?: string[];
    };
    hint?: string;
    onComplete?: (success: boolean) => void;
}

const FillBlankTemplate: React.FC<FillBlankTemplateProps> = ({ data, hint, onComplete }) => {
    // Initialize answers array with empty strings matching the number of blanks
    const [answers, setAnswers] = useState<string[]>(() => {
        if (data.text_parts && data.text_parts.length > 1) {
            return new Array(data.text_parts.length - 1).fill('');
        }
        return [];
    });

    // Track status for EACH blank individually: 'idle' | 'correct' | 'incorrect'
    const [fieldStatuses, setFieldStatuses] = useState<('idle' | 'correct' | 'incorrect')[]>(() => {
        if (data.text_parts && data.text_parts.length > 1) {
            return new Array(data.text_parts.length - 1).fill('idle');
        }
        return [];
    });

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Removed useEffect that was causing state reset on parent re-render

    const handleInputChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);

        // Reset status for this field when typing
        const newStatuses = [...fieldStatuses];
        newStatuses[index] = 'idle';
        setFieldStatuses(newStatuses);

        setHasSubmitted(false);
    };

    const handleOptionClick = (option: string) => {
        // If an input is focused, fill it. Otherwise fill the first empty blank.
        let targetIndex = focusedIndex;

        if (targetIndex === null) {
            targetIndex = answers.findIndex(a => a === '');
        }

        if (targetIndex !== -1 && targetIndex !== null && targetIndex < answers.length) {
            handleInputChange(targetIndex, option);
            // Move focus to next blank if available
            if (targetIndex < answers.length - 1) {
                setFocusedIndex(targetIndex + 1);
            } else {
                setFocusedIndex(null);
            }
        }
    };

    const checkAnswer = () => {
        const newStatuses = answers.map((ans, index) => {
            const correct = data.correct_answers[index];
            return ans.toLowerCase().trim() === correct.toLowerCase().trim() ? 'correct' : 'incorrect';
        });

        setFieldStatuses(newStatuses as ('idle' | 'correct' | 'incorrect')[]);
        setHasSubmitted(true);

        const allCorrect = newStatuses.every(s => s === 'correct');
        if (allCorrect && onComplete) {
            onComplete(true);
        }
    };

    const reset = () => {
        setAnswers(new Array(answers.length).fill(''));
        setFieldStatuses(new Array(answers.length).fill('idle'));
        setHasSubmitted(false);
        setFocusedIndex(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-text-primary">Fill in the blanks</span>
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset
                </button>
            </div>

            {/* Question Area */}
            <div className="flex flex-wrap items-baseline gap-2 text-lg leading-loose text-text-primary mb-8 font-medium">
                {data.text_parts.map((part, index) => (
                    <React.Fragment key={index}>
                        <span>{part}</span>
                        {index < data.text_parts.length - 1 && (
                            <div className="relative inline-block group">
                                <input
                                    type="text"
                                    value={answers[index] || ''}
                                    onFocus={() => setFocusedIndex(index)}
                                    // Don't blur immediately to allow clicking options
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    className={clsx(
                                        "border-b-2 bg-transparent outline-none px-2 py-1 text-center min-w-[120px] transition-all duration-300",
                                        focusedIndex === index && "scale-105",
                                        fieldStatuses[index] === 'idle' && (focusedIndex === index ? "border-accent bg-accent/5" : "border-text-secondary/50 hover:border-text-secondary"),
                                        fieldStatuses[index] === 'correct' && "border-green-500 text-green-500 font-bold bg-green-500/10",
                                        fieldStatuses[index] === 'incorrect' && "border-red-500 text-red-500 bg-red-500/10"
                                    )}
                                    placeholder="???"
                                />
                                {/* Status Icon Overlay */}
                                {fieldStatuses[index] !== 'idle' && (
                                    <div className="absolute -top-3 -right-3 animate-in zoom-in duration-300">
                                        {fieldStatuses[index] === 'correct' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-white dark:fill-slate-900" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 fill-white dark:fill-slate-900" />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Options / Word Bank */}
            {data.options && data.options.length > 0 && (
                <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Word Bank</p>
                    <div className="flex flex-wrap gap-3">
                        {data.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(option)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-accent hover:border-accent hover:text-white transition-all active:scale-95 text-sm font-medium text-text-primary shadow-sm hover:shadow-lg hover:shadow-accent/20"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer / Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="text-sm text-text-secondary">
                    {hint && <span className="italic flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-accent"></span>Hint: {hint}</span>}
                </div>
                <button
                    onClick={checkAnswer}
                    disabled={hasSubmitted && fieldStatuses.every(s => s === 'correct')}
                    className={clsx(
                        "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg",
                        hasSubmitted && fieldStatuses.every(s => s === 'correct')
                            ? "bg-green-500 text-white cursor-default"
                            : "bg-accent text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-accent/25"
                    )}
                >
                    {hasSubmitted && fieldStatuses.every(s => s === 'correct') ? (
                        <>Correct! <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                        "Check Answers"
                    )}
                </button>
            </div>
        </div>
    );
};

export default FillBlankTemplate;
