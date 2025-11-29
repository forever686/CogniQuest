import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { clsx } from 'clsx';

interface Question {
    question: string;
    correct_answer: boolean;
    explanation?: string;
}

interface TrueFalseTemplateProps {
    data: {
        questions: Question[];
    };
    onComplete?: (success: boolean) => void;
}

const TrueFalseTemplate: React.FC<TrueFalseTemplateProps> = ({ data, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const currentQuestion = data.questions[currentQuestionIndex];

    const handleAnswerClick = (answer: boolean) => {
        if (hasSubmitted) return;
        setSelectedAnswer(answer);
    };

    const checkAnswer = () => {
        if (selectedAnswer === null) return;

        const correct = selectedAnswer === currentQuestion.correct_answer;
        setIsCorrect(correct);
        setHasSubmitted(true);

        if (correct && onComplete && currentQuestionIndex === data.questions.length - 1) {
            onComplete(true);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < data.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setHasSubmitted(false);
            setIsCorrect(null);
        }
    };

    const reset = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
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

            <div className="mb-8 text-center">
                <h3 className="text-2xl font-medium text-text-primary mb-8">{currentQuestion.question}</h3>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={() => handleAnswerClick(true)}
                        disabled={hasSubmitted}
                        className={clsx(
                            "flex-1 max-w-[200px] p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 group",
                            hasSubmitted && currentQuestion.correct_answer === true
                                ? "border-green-500 bg-green-500/10 text-green-500"
                                : hasSubmitted && selectedAnswer === true && currentQuestion.correct_answer !== true
                                    ? "border-red-500 bg-red-500/10 text-red-500"
                                    : selectedAnswer === true
                                        ? "border-accent bg-accent/10 text-accent scale-105 shadow-lg shadow-accent/20"
                                        : "border-white/10 hover:border-accent hover:bg-accent/5 text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <ThumbsUp className={clsx("w-12 h-12", selectedAnswer === true ? "fill-current" : "")} />
                        <span className="text-xl font-bold">TRUE</span>
                    </button>

                    <button
                        onClick={() => handleAnswerClick(false)}
                        disabled={hasSubmitted}
                        className={clsx(
                            "flex-1 max-w-[200px] p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 group",
                            hasSubmitted && currentQuestion.correct_answer === false
                                ? "border-green-500 bg-green-500/10 text-green-500"
                                : hasSubmitted && selectedAnswer === false && currentQuestion.correct_answer !== false
                                    ? "border-red-500 bg-red-500/10 text-red-500"
                                    : selectedAnswer === false
                                        ? "border-accent bg-accent/10 text-accent scale-105 shadow-lg shadow-accent/20"
                                        : "border-white/10 hover:border-accent hover:bg-accent/5 text-text-secondary hover:text-text-primary"
                        )}
                    >
                        <ThumbsDown className={clsx("w-12 h-12", selectedAnswer === false ? "fill-current" : "")} />
                        <span className="text-xl font-bold">FALSE</span>
                    </button>
                </div>
            </div>

            {hasSubmitted && (
                <div className={clsx(
                    "mb-6 p-4 rounded-xl border flex items-start gap-3",
                    isCorrect ? "bg-green-500/10 border-green-500/20 text-green-200" : "bg-red-500/10 border-red-500/20 text-red-200"
                )}>
                    {isCorrect ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                    <div>
                        <p className="font-bold text-lg mb-1">{isCorrect ? "Correct!" : "Incorrect"}</p>
                        {currentQuestion.explanation && (
                            <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/10">
                {!hasSubmitted ? (
                    <button
                        onClick={checkAnswer}
                        disabled={selectedAnswer === null}
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

export default TrueFalseTemplate;
