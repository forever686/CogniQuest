import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface GuidePanelProps {
    title: string;
    content: string;
    onAskQuestion?: (question: string) => void;
    roleplayConfig?: {
        characterName: string;
        initialMessage: string;
        avatar?: string;
    };
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const GuidePanel: React.FC<GuidePanelProps> = ({ title, content, onAskQuestion, roleplayConfig }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize roleplay or reset on step change
    useEffect(() => {
        if (roleplayConfig) {
            setMessages([{ role: 'ai', content: roleplayConfig.initialMessage }]);
        } else {
            setMessages([]);
        }
    }, [roleplayConfig, title]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        if (roleplayConfig) {
            // Roleplay Mode
            const newMessages: Message[] = [...messages, { role: 'user', content: text }];
            setMessages(newMessages);

            // Mock AI Response
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: `(Mock Response as ${roleplayConfig.characterName}) You said: "${text}". That's interesting! Tell me more.`
                }]);
            }, 1000);
        } else {
            // Standard Tutor Mode
            onAskQuestion?.(text);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${roleplayConfig ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {roleplayConfig ? <Bot size={16} /> : <MessageSquare size={16} />}
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {roleplayConfig ? roleplayConfig.characterName : 'AI Tutor'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {roleplayConfig ? 'Roleplay Mode' : 'Always here to help'}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Standard Content (Only if NOT in roleplay, or as context) */}
                {!roleplayConfig && (
                    <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            AI
                        </div>
                        <div className="flex-1">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-sm">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-base">{title}</h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {typeof content === 'string' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                            }}
                                        >
                                            {content}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-slate-500 italic">
                                            {typeof content === 'object'
                                                ? JSON.stringify(content, null, 2).slice(0, 100) + '...'
                                                : String(content)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-1 text-xs text-slate-400 ml-1">Just now</div>
                        </div>
                    </div>
                )}

                {/* Chat Messages (Roleplay or Q&A) */}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user'
                            ? 'bg-slate-200 text-slate-600'
                            : (roleplayConfig ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600')
                            }`}>
                            {msg.role === 'user' ? <User size={14} /> : (roleplayConfig ? <Bot size={14} /> : 'AI')}
                        </div>
                        <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block rounded-2xl p-3 text-sm leading-relaxed shadow-sm text-left ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={roleplayConfig ? `Reply to ${roleplayConfig.characterName}...` : "Ask a question..."}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-slate-400 transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-500 transition-colors">
                        <MessageSquare size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidePanel;
