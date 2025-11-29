import React from 'react';
import VisualContainer from '../VisualContainer';
import FlashcardRenderer from '../renderers/FlashcardRenderer';
import DragSortTemplate from '../templates/DragSortTemplate';
import FillBlankTemplate from '../templates/FillBlankTemplate';
import MultipleChoiceTemplate from '../templates/MultipleChoiceTemplate';
import TrueFalseTemplate from '../templates/TrueFalseTemplate';
import type { LessonStep } from '../../types';

interface StagePanelProps {
    step: LessonStep;
    onComplete: (success: boolean, masteryLevel?: number) => void;
}

const StagePanel: React.FC<StagePanelProps> = ({ step, onComplete }) => {
    const renderContent = () => {
        if (step.type === 'FLASHCARD' && step.flashcard) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-2xl aspect-video relative">
                        <FlashcardRenderer
                            front={step.flashcard.front}
                            back={step.flashcard.back}
                        />
                    </div>
                    {/* Self Rating Controls for Flashcard */}
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => onComplete(false, 1)}
                            className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                            Need Practice
                        </button>
                        <button
                            onClick={() => onComplete(true, 5)}
                            className="px-6 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
                        >
                            Mastered
                        </button>
                    </div>
                </div>
            );
        }

        if (step.type === 'QUIZ' && step.quizConfig) {
            return (
                <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-8 items-center justify-center">
                    <div className="w-full max-w-3xl">
                        {(step.quizConfig.template_id === 'T1_DragSort' || step.quizConfig.type === 'DragSort') && (
                            <DragSortTemplate
                                data={{
                                    options: step.quizConfig.data?.items || step.quizConfig.data?.options || step.quizConfig.options || [],
                                    correctOrder: step.quizConfig.data?.correct_order || step.quizConfig.data?.correctOrder || step.quizConfig.correctOrder || []
                                }}
                                onComplete={(success) => onComplete(success, success ? 5 : 1)}
                            />
                        )}
                        {(step.quizConfig.template_id === 'T3_FillBlank' || step.quizConfig.type === 'FillBlank') && (
                            <FillBlankTemplate
                                key={step.id}
                                data={{
                                    text_parts: step.quizConfig.data?.text_parts || step.quizConfig.data?.textParts || (step.quizConfig.question || step.quizConfig.data?.question || '').split('______'),
                                    correct_answers: step.quizConfig.data?.correct_answers || step.quizConfig.data?.correctAnswers || step.quizConfig.answers || [],
                                    options: step.quizConfig.data?.options || step.quizConfig.options || []
                                }}
                                onComplete={(success) => onComplete(success, success ? 5 : 1)}
                            />
                        )}
                        {(step.quizConfig.template_id === 'T4_MultipleChoice' || step.quizConfig.type === 'multiple_choice') && (
                            <MultipleChoiceTemplate
                                data={{
                                    questions: step.quizConfig.questions || step.quizConfig.data?.questions || []
                                }}
                                onComplete={(success) => onComplete(success, success ? 5 : 1)}
                            />
                        )}
                        {(step.quizConfig.template_id === 'T5_TrueFalse' || step.quizConfig.type === 'true_false') && (
                            <TrueFalseTemplate
                                data={{
                                    questions: step.quizConfig.questions || step.quizConfig.data?.questions || []
                                }}
                                onComplete={(success: boolean) => onComplete(success, success ? 5 : 1)}
                            />
                        )}
                        {!['T1_DragSort', 'T3_FillBlank', 'T4_MultipleChoice', 'T5_TrueFalse'].includes(step.quizConfig.template_id || '') &&
                            !['FillBlank', 'DragSort', 'multiple_choice', 'true_false'].includes(step.quizConfig.type || '') && (
                                <div className="text-center p-8 text-slate-500">
                                    Unsupported Quiz Template: {step.quizConfig.template_id || step.quizConfig.type || 'Unknown'}
                                </div>
                            )}
                    </div>
                </div>
            );
        }

        // Default: Visual Asset (Slide, Animation, Diagram)
        return (
            <div className="absolute inset-0 p-4">
                <VisualContainer asset={step.content} />
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden flex flex-col">
            {/* Header / Toolbar */}
            <div className="h-10 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 justify-between bg-white dark:bg-slate-900 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">The Stage</span>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400/50"></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default StagePanel;
