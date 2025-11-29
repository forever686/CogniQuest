import React from 'react';
import type { VisualAsset } from '../types';
import SlideRenderer from './renderers/SlideRenderer';
import DiagramRenderer from './renderers/DiagramRenderer';
import AnimationRenderer from './renderers/AnimationRenderer';
import MathRenderer from './renderers/MathRenderer';
import { clsx } from 'clsx';

interface VisualContainerProps {
    asset: VisualAsset;
}

const VisualContainer: React.FC<VisualContainerProps> = ({ asset }) => {
    // Handle undefined asset (e.g. malformed data)
    if (!asset) {
        return (
            <div className="w-full h-full flex items-center justify-center glass-panel rounded-3xl p-8 bg-red-500/10 border-red-500/20">
                <div className="text-center text-red-400">
                    <h3 className="text-lg font-bold mb-2">Content Error</h3>
                    <p className="text-sm">Missing visual asset data.</p>
                </div>
            </div>
        );
    }

    // Handle string asset (legacy or invalid data fallback)
    if (typeof asset === 'string') {
        return (
            <div className="w-full glass-panel rounded-3xl overflow-hidden shadow-2xl p-8 bg-bg-secondary/50 animate-fade-in">
                <div className="prose prose-invert max-w-none">
                    <p>{asset}</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (asset.visual_type) {
            case 'SLIDE':
                return <SlideRenderer asset={asset} />;
            case 'DIAGRAM':
                return <DiagramRenderer asset={asset} />;
            case 'ANIMATION':
                return <AnimationRenderer asset={asset} />;
            case 'MATH_PLOT':
                return <MathRenderer asset={asset} />;
            default:
                return <div className="text-red-500 p-4">Unknown visual type: {asset.visual_type}</div>;
        }
    };

    return (
        <div className={clsx(
            "w-full h-full flex flex-col glass-panel rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 animate-fade-in",
            "hover:shadow-accent/20"
        )}>
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <span className={clsx(
                        "px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                        asset.visual_type === 'SLIDE' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                            asset.visual_type === 'DIAGRAM' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                                "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    )}>
                        Level {asset.visual_type === 'SLIDE' ? '1' : asset.visual_type === 'DIAGRAM' ? '2' : '3'}
                    </span>
                    <h2 className="font-bold text-lg text-text-primary">{asset.title}</h2>
                </div>
                <div className="text-xs text-text-secondary font-mono opacity-50">
                    {asset.generator_version}
                </div>
            </div>

            <div className="relative flex-1 overflow-y-auto bg-bg-secondary/50 custom-scrollbar">
                {renderContent()}
            </div>

            <div className="p-4 border-t border-glass-border flex justify-end gap-2 bg-white/5">
                <button className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-accent transition-colors flex items-center gap-1">
                    <span>✨ Regenerate</span>
                </button>
            </div>
        </div>
    );
};

export default VisualContainer;
