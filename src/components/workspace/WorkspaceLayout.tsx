import React, { useState } from 'react';
import GuidePanel from './GuidePanel';
import StagePanel from './StagePanel';
import LogicPanel from './LogicPanel';
import type { LessonStep } from '../../types';

interface WorkspaceLayoutProps {
    step: LessonStep;
    onNext: () => void;
    onPrev: () => void;
    onComplete: (success: boolean, masteryLevel?: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ step, onNext, onPrev, onComplete, isFirst, isLast }) => {
    // Determine Logic Mode based on step type or content
    // For now, we'll infer it. Later we can add explicit fields to LessonStep.
    const getLogicMode = (): 'CODE' | 'MATH' | 'LANG' | 'NONE' => {
        if (step.content.visual_type === 'ANIMATION') return 'CODE'; // Animations usually have code
        // Add more logic here
        return 'NONE';
    };

    const logicMode = getLogicMode();
    const [isLogicCollapsed, setIsLogicCollapsed] = useState(logicMode === 'NONE');

    // Mock logic content for now
    const logicContent = logicMode === 'CODE' ?
        `// Bubble Sort Implementation
for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            swap(arr, j, j + 1);
        }
    }
}` : undefined;

    return (
        <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-black">
            {/* Left Pane: Guide (35%) */}
            <div className="w-full md:w-[35%] h-1/3 md:h-full flex-shrink-0 z-10 shadow-xl md:shadow-none border-r border-slate-200 dark:border-slate-800">
                <GuidePanel
                    title={step.title}
                    content={step.content.content}
                    roleplayConfig={step.type === 'ROLEPLAY' ? step.content.config_json : undefined}
                />
            </div>
            {/* Right Pane: Practice (65%) */}
            <div className="flex-1 h-2/3 md:h-full flex flex-col min-w-0">
                {/* Top: Stage */}
                <div className="flex-1 min-h-0 relative">
                    <StagePanel step={step} onComplete={onComplete} />
                </div>

                {/* Navigation Footer (New) */}
                <div className="h-14 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-30">
                    <button
                        onClick={onPrev}
                        disabled={isFirst}
                        className="px-4 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2"
                    >
                        Previous
                    </button>

                    <div className="flex-1"></div>

                    <button
                        onClick={onNext}
                        className="px-6 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-all font-medium text-sm flex items-center gap-2"
                    >
                        {isLast ? 'Finish' : 'Next Step'}
                    </button>
                </div>

                {/* Bottom: Logic */}
                <LogicPanel
                    mode={logicMode}
                    content={logicContent}
                    isCollapsed={isLogicCollapsed}
                    onToggleCollapse={() => setIsLogicCollapsed(!isLogicCollapsed)}
                />
            </div>
        </div>
    );
};

export default WorkspaceLayout;
