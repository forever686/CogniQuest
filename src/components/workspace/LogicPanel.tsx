import React from 'react';
import { Code, Calculator, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface LogicPanelProps {
    mode: 'CODE' | 'MATH' | 'LANG' | 'NONE';
    content?: string; // Code snippet, formula, or grammar rule
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const LogicPanel: React.FC<LogicPanelProps> = ({ mode, content, isCollapsed, onToggleCollapse }) => {
    if (mode === 'NONE') return null;

    const getIcon = () => {
        switch (mode) {
            case 'CODE': return <Code size={14} />;
            case 'MATH': return <Calculator size={14} />;
            case 'LANG': return <BookOpen size={14} />;
            default: return <Code size={14} />;
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'CODE': return 'Source Code';
            case 'MATH': return 'Derivation';
            case 'LANG': return 'Grammar Analysis';
            default: return 'Logic';
        }
    };

    return (
        <div className={`flex flex-col border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 ${isCollapsed ? 'h-10' : 'h-1/3 min-h-[200px]'}`}>
            {/* Header */}
            <button
                onClick={onToggleCollapse}
                className="h-10 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-200 dark:border-slate-700"
            >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    {getIcon()}
                    <span className="text-xs font-bold uppercase tracking-wider">{getTitle()}</span>
                </div>
                <div className="text-slate-400">
                    {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Content */}
            {!isCollapsed && (
                <div className="flex-1 overflow-auto bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 custom-scrollbar">
                    {/* Placeholder for actual editor/renderer */}
                    <pre className="whitespace-pre-wrap">
                        {content || '// No logic content available for this step.'}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default LogicPanel;
