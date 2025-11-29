import React, { useState, useRef } from 'react';
import { Search, Sparkles, GraduationCap, Briefcase, Upload, FileJson } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import DocumentUploader from './DocumentUploader';
import type { LessonMode, LessonPlan } from '../types';

interface InputSectionProps {
    onSearch: (query: string, mode: LessonMode, documentContent?: string) => void;
    onImport?: (lesson: LessonPlan) => void;
    isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSearch, onImport, isLoading }) => {
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<LessonMode>('FEYNMAN');
    const [documentContent, setDocumentContent] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query, mode, documentContent);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (onImport) {
                    onImport(json);
                }
            } catch (error) {
                console.error('Failed to parse imported lesson:', error);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">
            {/* Mode Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                    onClick={() => setMode('FEYNMAN')}
                    className={twMerge(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        mode === 'FEYNMAN'
                            ? "bg-accent text-white shadow-lg shadow-accent/20"
                            : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                >
                    <GraduationCap className="w-4 h-4" />
                    费曼学习法
                </button>
                <button
                    onClick={() => setMode('INTERVIEW')}
                    className={twMerge(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        mode === 'INTERVIEW'
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                >
                    <Briefcase className="w-4 h-4" />
                    面试准备
                </button>
            </div>

            <div className="w-full relative group">
                <div className={twMerge(
                    "absolute -inset-1 bg-gradient-to-r rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
                    mode === 'FEYNMAN' ? "from-accent to-blue-600" : "from-purple-600 to-pink-600"
                )}></div>

                <form
                    onSubmit={handleSubmit}
                    className="relative w-full glass-panel rounded-2xl p-2 flex items-center gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/50"
                >
                    <div className={twMerge("pl-4", mode === 'FEYNMAN' ? "text-accent" : "text-purple-500")}>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'FEYNMAN' ? "您想掌握什么概念？(例如：量子纠缠)" : "您准备面试什么主题？(例如：React Hooks)"}
                        className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-secondary/50 px-2 py-3"
                        disabled={isLoading}
                    />

                    <div className="flex items-center gap-2 pr-2">
                        <DocumentUploader
                            onUpload={(content, fileName) => setDocumentContent(content)}
                            onClear={() => setDocumentContent(undefined)}
                        />

                        {/* Import Button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={handleImportClick}
                            className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="导入课程 JSON"
                        >
                            <FileJson className="w-5 h-5" />
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className={twMerge(
                                "px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 shadow-lg",
                                isLoading || !query.trim()
                                    ? "bg-slate-400 cursor-not-allowed opacity-50"
                                    : mode === 'FEYNMAN'
                                        ? "bg-accent hover:bg-indigo-500 hover:shadow-accent/50"
                                        : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50",
                                "hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {isLoading ? (
                                <span>思考中...</span>
                            ) : (
                                <>
                                    <span>{mode === 'FEYNMAN' ? '开始学习' : '开始准备'}</span>
                                    <Search className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="flex gap-3 text-sm text-text-secondary">
                <span className="opacity-70">尝试:</span>
                <button onClick={() => { setQuery('French Revolution'); setMode('FEYNMAN'); }} className="hover:text-accent transition-colors underline decoration-dotted">历史</button>
                <button onClick={() => { setQuery('React Hooks'); setMode('INTERVIEW'); }} className="hover:text-purple-500 transition-colors underline decoration-dotted">面试</button>
                <button onClick={() => { setQuery('Bubble Sort'); setMode('FEYNMAN'); }} className="hover:text-accent transition-colors underline decoration-dotted">算法</button>
            </div>
        </div>
    );
};

export default InputSection;
