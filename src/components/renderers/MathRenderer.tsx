import React, { useEffect, useRef, useState } from 'react';
import functionPlot from 'function-plot';
import { Play, Pause, RefreshCw, Settings2 } from 'lucide-react';
import type { VisualAsset } from '../../types';

interface MathRendererProps {
    asset: VisualAsset;
}

interface Parameter {
    name: string;
    min: number;
    max: number;
    step: number;
    value: number;
    label?: string;
}

interface InteractivePoint {
    name: string;
    x: number;
    y: number;
    color?: string;
    label?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ asset }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [offset, setOffset] = useState(0);
    const animationRef = useRef<number>();

    // Parse config or use defaults
    const config = typeof asset.config_json === 'string'
        ? JSON.parse(asset.config_json)
        : asset.config_json || {};

    const functions = config.functions || [{ fn: 'x^2', color: 'steelblue' }];
    const animate = config.animate || false;

    // Initialize parameters state
    const [params, setParams] = useState<Record<string, number>>(() => {
        const initialParams: Record<string, number> = {};

        // Load slider parameters
        if (config.parameters) {
            config.parameters.forEach((p: Parameter) => {
                initialParams[p.name] = p.value;
            });
        }

        // Load point parameters (P_x, P_y)
        if (config.points) {
            config.points.forEach((p: InteractivePoint) => {
                initialParams[`${p.name}_x`] = p.x;
                initialParams[`${p.name}_y`] = p.y;
            });
        }

        return initialParams;
    });

    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        try {
            // Prepare data with offset for animation and parameter substitution
            const data = functions.map((f: any) => {
                let fn = f.fn;

                // Apply animation offset if playing
                if (animate && isPlaying) {
                    fn = fn.replace(/x/g, `(x - ${offset})`);
                }

                // Apply parameters using scope
                return {
                    ...f,
                    fn: fn,
                    scope: params
                };
            });

            // Add interactive points to data
            if (config.points) {
                config.points.forEach((p: InteractivePoint) => {
                    data.push({
                        points: [[params[`${p.name}_x`], params[`${p.name}_y`]]],
                        fnType: 'points',
                        graphType: 'scatter',
                        color: p.color || 'red',
                        attr: {
                            r: 5,
                            opacity: 0.8
                        }
                    });
                });
            }

            // Destroy previous instance to avoid memory leaks or conflicts
            // Note: function-plot usually handles updates, but for React refs it's safer to re-init or update carefully
            // Here we re-render. Ideally we should use chart.update() but function-plot React integration is manual.

            const chart = functionPlot({
                target: containerRef.current,
                width,
                height,
                yAxis: { domain: [-10, 10] },
                xAxis: { domain: [-10, 10] },
                grid: true,
                data
            });

            chartRef.current = chart;
        } catch (e) {
            console.error("Math plot error:", e);
        }

    }, [functions, animate, isPlaying, offset, params]);

    // Animation Loop
    useEffect(() => {
        if (isPlaying && animate) {
            let start = Date.now();
            const loop = () => {
                const now = Date.now();
                const dt = (now - start) / 1000;
                setOffset(prev => (prev + dt * 2) % 20 - 10); // Loop from -10 to 10
                start = now;
                animationRef.current = requestAnimationFrame(loop);
            };
            animationRef.current = requestAnimationFrame(loop);
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, animate]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                // Trigger re-render
                setOffset(prev => prev);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleParamChange = (name: string, value: number) => {
        setParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-white dark:bg-slate-900 overflow-hidden">
            <div
                ref={containerRef}
                className="flex-1 w-full h-full overflow-hidden"
                id="math-plot-container"
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 pointer-events-none">

                {/* Parameter Sliders */}
                {((config.parameters && config.parameters.length > 0) || (config.points && config.points.length > 0)) && showControls && (
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-64 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Parameters</h4>
                            <button onClick={() => setShowControls(false)} className="text-slate-400 hover:text-slate-600">
                                <Settings2 size={14} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Standard Parameters */}
                            {config.parameters?.map((p: Parameter) => (
                                <div key={p.name} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.label || p.name}</span>
                                        <span className="font-mono text-slate-600 dark:text-slate-300">{params[p.name]?.toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={p.min}
                                        max={p.max}
                                        step={p.step}
                                        value={params[p.name] || 0}
                                        onChange={(e) => handleParamChange(p.name, parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            ))}

                            {/* Point Coordinates */}
                            {config.points?.map((p: InteractivePoint) => (
                                <div key={p.name} className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                                    <div className="text-xs font-bold text-slate-500">{p.label || p.name}</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-mono text-slate-500">x</span>
                                            <span className="font-mono text-slate-600 dark:text-slate-300">{params[`${p.name}_x`]?.toFixed(1)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={-10}
                                            max={10}
                                            step={0.1}
                                            value={params[`${p.name}_x`] || 0}
                                            onChange={(e) => handleParamChange(`${p.name}_x`, parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-mono text-slate-500">y</span>
                                            <span className="font-mono text-slate-600 dark:text-slate-300">{params[`${p.name}_y`]?.toFixed(1)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={-10}
                                            max={10}
                                            step={0.1}
                                            value={params[`${p.name}_y`] || 0}
                                            onChange={(e) => handleParamChange(`${p.name}_y`, parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Playback Controls */}
                <div className="flex gap-2 pointer-events-auto">
                    {((config.parameters && config.parameters.length > 0) || (config.points && config.points.length > 0)) && !showControls && (
                        <button
                            onClick={() => setShowControls(true)}
                            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-700 transition-all"
                            title="Show Parameters"
                        >
                            <Settings2 size={20} />
                        </button>
                    )}

                    {animate && (
                        <>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg transition-all"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button
                                onClick={() => setOffset(0)}
                                className="p-2 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white transition-all shadow-lg"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Function Legend */}
            <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/80 backdrop-blur p-2 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700 pointer-events-none">
                {functions.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color || 'steelblue' }}></span>
                        <span>y = {f.fn}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MathRenderer;
