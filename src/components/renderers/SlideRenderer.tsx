import React from 'react';
import type { VisualAsset } from '../../types';
import DragSortTemplate from '../templates/DragSortTemplate';
import FillBlankTemplate from '../templates/FillBlankTemplate';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { Volume2 } from 'lucide-react';
import { ttsService } from '../../services/tts';
import InteractiveText from '../InteractiveText';

interface SlideRendererProps {
    asset: VisualAsset;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ asset }) => {
    const [imageError, setImageError] = React.useState(false);

    // Check if this slide contains an interactive template
    const renderInteractive = () => {
        if (!asset.config_json) return null;

        const { template_id, data, hint } = asset.config_json;

        switch (template_id) {
            case 'T1_DragSort':
                return <DragSortTemplate data={data} hint={hint} />;
            case 'T3_FillBlank':
                return <FillBlankTemplate data={data} hint={hint} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full min-h-full flex flex-col md:flex-row">
            {/* Image Section */}
            {asset.image_url && !imageError && (
                <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 md:hidden"></div>
                    <img
                        src={asset.image_url}
                        alt={asset.title}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                </div>
            )}

            {/* Content Section */}
            <div className={`w-full ${asset.image_url && !imageError ? 'md:w-1/2' : 'w-full'} p-8 flex flex-col justify-center relative`}>
                <button
                    onClick={() => ttsService.speak(asset.content)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Read Aloud"
                >
                    <Volume2 size={20} />
                </button>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {typeof asset.content === 'string' ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 text-gradient" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-3 text-text-primary" {...props} />,
                                p: ({ node, children, ...props }) => {
                                    // Only use InteractiveText for simple string content to avoid nesting issues
                                    if (typeof children === 'string') {
                                        return (
                                            <div {...props} className="mb-4">
                                                <InteractiveText content={children} />
                                            </div>
                                        );
                                    }
                                    return <p className="text-text-secondary leading-relaxed mb-4" {...props}>{children}</p>;
                                }
                            }}
                        >
                            {asset.content}
                        </ReactMarkdown>
                    ) : (
                        <div className="text-red-500">
                            Error: Content is not a string. Type: {typeof asset.content}
                            <pre className="text-xs mt-2 bg-slate-100 p-2 rounded overflow-auto">
                                {JSON.stringify(asset.content, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Interactive Section */}
                {asset.config_json && (
                    <div className="mt-8 pt-6 border-t border-border">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
                            <span>Interactive Challenge</span>
                            <span className="w-full h-px bg-accent/20"></span>
                        </h3>
                        {renderInteractive()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlideRenderer;
