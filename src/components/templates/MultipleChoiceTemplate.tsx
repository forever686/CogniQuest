import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface Question {
    question: string;
    options: string[];
    correct_answers: number[]; // Indices of correct options
    explanation?: string;
}

interface MultipleChoiceTemplateProps {
    data: {
        questions: Question[];
    };
    onComplete?: (success: boolean) => void;
}

const MultipleChoiceTemplate: React.FC<MultipleChoiceTemplateProps> = ({ data, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const currentQuestion = data.questions[currentQuestionIndex];
    const isMultiSelect = currentQuestion.correct_answers.length > 1;

    const handleOptionClick = (index: number) => {
        if (hasSubmitted) return;

        if (isMultiSelect) {
            setSelectedOptions(prev => {
                if (prev.includes(index)) {
                    return prev.filter(i => i !== index);
                } else {
                    return [...prev, index];
                }
            });
        } else {
            setSelectedOptions([index]);
        }
    };

    const checkAnswer = () => {
        const correct = currentQuestion.correct_answers.sort().toString() === selectedOptions.sort().toString();
        setIsCorrect(correct);
        setHasSubmitted(true);

        if (correct && onComplete && currentQuestionIndex === data.questions.length - 1) {
            onComplete(true);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < data.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOptions([]);
            setHasSubmitted(false);
            setIsCorrect(null);
        }
    };

    const reset = () => {
        setCurrentQuestionIndex(0);
        setSelectedOptions([]);
        setHasSubmitted(false);
        setIsCorrect(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-text-primary">
                        Question {currentQuestionIndex + 1} of {data.questions.length}
                    </span>
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset
                </button>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-medium text-text-primary mb-2">{currentQuestion.question}</h3>
                {isMultiSelect && <p className="text-sm text-text-secondary">(Select all that apply)</p>}
            </div>

            <div className="flex flex-col gap-3 mb-8">
                {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOptions.includes(idx);
                    const isCorrectAnswer = currentQuestion.correct_answers.includes(idx);

                    let stateStyles = "border-white/10 hover:border-accent hover:bg-accent/5";
                    if (hasSubmitted) {
                        if (isCorrectAnswer) {
                            stateStyles = "border-green-500 bg-green-500/10 text-green-500";
                        } else if (isSelected && !isCorrectAnswer) {
                            stateStyles = "border-red-500 bg-red-500/10 text-red-500";
                        } else {
                            stateStyles = "border-white/5 opacity-50";
                        }
                    } else if (isSelected) {
                        stateStyles = "border-accent bg-accent/10 text-accent";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(idx)}
                            disabled={hasSubmitted}
                            className={clsx(
                                "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                                stateStyles
                            )}
                        >
                            <span className="font-medium">{option}</span>
                            {hasSubmitted && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {hasSubmitted && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                        </button>
                    );
                })}
            </div>

            {hasSubmitted && currentQuestion.explanation && (
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                    <span className="font-bold mr-2">Explanation:</span>
                    {currentQuestion.explanation}
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/10">
                {!hasSubmitted ? (
                    <button
                        onClick={checkAnswer}
                        disabled={selectedOptions.length === 0}
                        className="px-6 py-2.5 rounded-xl font-bold text-sm bg-accent text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-accent/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Check Answer
                    </button>
                ) : (
                    currentQuestionIndex < data.questions.length - 1 ? (
                        <button
                            onClick={nextQuestion}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-200 hover:scale-105 active:scale-95 shadow-lg transition-all"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white cursor-default flex items-center gap-2"
                        >
                            Quiz Completed <CheckCircle2 className="w-4 h-4" />
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default MultipleChoiceTemplate;
