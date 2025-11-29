import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { LessonPlan, StepType, ReviewItem } from '../types';
import WorkspaceLayout from './workspace/WorkspaceLayout';
import LessonMap from './LessonMap';

interface LessonContainerProps {
    lesson: LessonPlan;
    onComplete?: (results: { score: number; reviewItems: ReviewItem[] }) => void;
    onExit?: () => void;
}

const LessonContainer: React.FC<LessonContainerProps> = ({ lesson, onComplete, onExit }) => {
    const [viewMode, setViewMode] = useState<'MAP' | 'LESSON'>('MAP');
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);

    if (!lesson || !lesson.chapters || lesson.chapters.length === 0) {
        return <div className="text-center text-red-400 p-8">Error: Invalid lesson data.</div>;
    }

    const currentChapter = lesson.chapters[currentChapterIndex];
    const currentStep = currentChapter.steps[currentStepIndex];

    const handleStepComplete = (isCorrect: boolean = true, masteryLevel: number = 5) => {
        // Update Score
        if (isCorrect) {
            setScore(prev => prev + 10);
        }

        // Generate Review Item if needed
        if (!isCorrect || masteryLevel < 4) {
            const newItem: ReviewItem = {
                id: currentStep.id,
                topic: lesson.topic,
                question: currentStep.title,
                nextReviewDate: Date.now() + (isCorrect ? 24 * 60 * 60 * 1000 : 0),
                masteryLevel: masteryLevel
            };
            setReviewItems(prev => [...prev, newItem]);
        }
    };

    const handleNext = () => {
        // If it's a passive step, mark complete logic is handled by the component usually, 
        // but here we just navigate.

        if (currentStepIndex < currentChapter.steps.length - 1) {
            // Next step in same chapter
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // End of Chapter
            // Mark chapter as completed
            setCompletedChapters(prev => {
                const newSet = new Set(prev);
                newSet.add(currentChapter.id);
                return newSet;
            });

            // Return to Map
            setTimeout(() => {
                setViewMode('MAP');
                // Optional: Auto-select next chapter if available?
                // For now, let user click the next unlocked chapter.
            }, 500);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        } else {
            // Back to map if at start of chapter?
            setViewMode('MAP');
        }
    };

    const handleChapterClick = (index: number) => {
        setCurrentChapterIndex(index);
        setCurrentStepIndex(0); // Start from beginning of chapter
        setViewMode('LESSON');
    };

    if (viewMode === 'MAP') {
        return (
            <div className="w-full h-screen flex flex-col bg-bg-primary overflow-hidden">
                {/* Header */}
                <div className="w-full h-16 border-b border-white/10 flex items-center justify-between px-6 bg-bg-secondary/50 backdrop-blur-md z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onExit}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                            title="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <span className="text-accent">Topic:</span> {lesson.topic}
                        </h2>
                    </div>
                    <div className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        Score: {score}
                    </div>
                </div>

                {/* Map View */}
                <div className="flex-1 overflow-hidden">
                    <LessonMap
                        chapters={lesson.chapters}
                        currentChapterIndex={currentChapterIndex}
                        completedChapters={completedChapters}
                        onChapterClick={handleChapterClick}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-bg-primary overflow-hidden">
            {/* Header / Navigation Nodes (Slim Version) */}
            <div className="w-full h-16 border-b border-white/10 flex items-center justify-between px-6 bg-bg-secondary/50 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('MAP')}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                        title="Back to Map"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <span className="text-accent">{currentChapter.title}</span>
                        <span className="text-text-secondary">/</span>
                        <span>{currentStep.title}</span>
                    </h2>
                </div>

                {/* Progress Nodes (Steps within Chapter) */}
                <div className="flex items-center gap-2">
                    {currentChapter.steps.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;

                        return (
                            <div
                                key={step.id}
                                className={twMerge(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    isActive ? "bg-accent scale-125" :
                                        isCompleted ? "bg-green-500" : "bg-white/10"
                                )}
                            />
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                        Score: {score}
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 min-h-0">
                <WorkspaceLayout
                    step={currentStep}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onComplete={handleStepComplete}
                    isFirst={currentStepIndex === 0}
                    isLast={currentStepIndex === currentChapter.steps.length - 1}
                />
            </div>
        </div>
    );
};

export default LessonContainer;
