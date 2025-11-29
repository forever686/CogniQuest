import React, { useState, useEffect } from 'react';
import type { VisualAsset } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnimationRendererProps {
    asset: VisualAsset;
}

const AnimationRenderer: React.FC<AnimationRendererProps> = ({ asset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const parseContent = () => {
            try {
                // 1. Try to parse as JSON first
                let parsedData: any = null;
                if (typeof asset.content === 'string') {
                    try {
                        parsedData = JSON.parse(asset.content);
                    } catch (e) {
                        // Not JSON, likely Markdown content for sequential reveal
                        console.log("Content is not JSON, treating as raw content");
                    }
                } else {
                    parsedData = asset.content;
                }

                // 2. Handle Sequential Reveal (Markdown List)
                if (!parsedData && asset.config_json?.animation_type === 'sequential_reveal') {
                    const lines = (asset.content as string).split('\n').filter(line => line.trim().length > 0);
                    const title = lines.find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || 'Animation';
                    const items = lines.filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.trim().match(/^\d+\./));

                    parsedData = {
                        type: 'sequential_reveal',
                        title: title,
                        description: title,
                        steps: items.map((item, index) => ({
                            description: item.replace(/^[-*]\s*|^\d+\.\s*/, ''),
                            content: item
                        }))
                    };
                }

                // 3. If still no parsed data but we have raw content, try to wrap it
                if (!parsedData && typeof asset.content === 'string') {
                    parsedData = {
                        type: 'text_display',
                        description: 'Content',
                        steps: [{ description: 'View Content', content: asset.content }]
                    };
                }

                if (parsedData) {
                    // Handle double-stringified case
                    if (typeof parsedData === 'string') {
                        try {
                            parsedData = JSON.parse(parsedData);
                        } catch (e) { /* ignore */ }
                    }

                    // Normalize Data
                    if (!parsedData.type && parsedData.steps) {
                        parsedData.type = 'sorting';
                    }

                    if (parsedData.steps && parsedData.type !== 'sequential_reveal') {
                        parsedData.steps = parsedData.steps.map((step: any) => {
                            if (Array.isArray(step.data) && typeof step.data[0] === 'number') {
                                step.data = step.data.map((val: number, idx: number) => ({
                                    name: String(idx + 1),
                                    value: val
                                }));
                            }
                            return step;
                        });
                    }

                    setData(parsedData);
                    setError(null);
                } else {
                    setError("Could not parse animation data");
                }

            } catch (e) {
                console.error("Failed to parse animation data", e);
                setError("Failed to load animation");
            }
        };

        parseContent();
    }, [asset.content, asset.config_json]);

    useEffect(() => {
        let interval: any;
        if (isPlaying && data && data.steps) {
            interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= data.steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 2000); // 2 seconds per step for better readability
        }
        return () => clearInterval(interval);
    }, [isPlaying, data]);

    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
    if (!data) return <div className="p-8 text-center">Loading Animation Data...</div>;

    const renderChart = () => {
        if (data.type === 'sequential_reveal') {
            return (
                <div className="w-full h-full flex flex-col items-start justify-center p-8 overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold mb-6 text-text-primary">{data.title}</h2>
                    <div className="space-y-4 w-full max-w-3xl">
                        <AnimatePresence>
                            {data.steps.slice(0, currentStep + 1).map((step: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
                                >
                                    <div className="mt-1 p-1 rounded-full bg-accent/20 text-accent">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                    <div className="text-lg text-text-primary">
                                        <ReactMarkdown>{step.content}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            );
        }

        if (data.type === 'bar_race' || data.type === 'sorting') {
            const stepData = data.steps[currentStep];
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stepData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        />
                        <Bar dataKey="value" fill="#6366f1" animationDuration={500} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }
        if (data.type === 'trend') {
            const stepData = data.full_data.slice(0, currentStep + 1);
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stepData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} animationDuration={500} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        // Fallback for text display
        if (data.type === 'text_display') {
            return (
                <div className="w-full h-full p-8 overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>
                            {data.steps[0].content}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        console.warn("Unsupported Animation Type. Data:", data);
        return <div>Unsupported Animation Type: {data?.type}</div>;
    };

    return (
        <div className="w-full h-full flex flex-col bg-bg-secondary p-4">
            <div className="flex-1 min-h-0 flex justify-center items-center overflow-hidden relative">
                {renderChart()}
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-text-primary truncate max-w-[60%]">
                        {data.description || "Animation"}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                            className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-lg bg-accent hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-accent/20"
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / (data.steps?.length || data.full_data?.length || 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="text-sm text-text-secondary">
                    Step {currentStep + 1} / {data.steps?.length || data.full_data?.length || 0}
                </div>
            </div>
        </div>
    );
};

export default AnimationRenderer;
