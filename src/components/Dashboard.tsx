import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, CheckCircle2, BookOpen, Plus } from 'lucide-react';
import { apiService } from '../services/api';
import type { LessonPlan } from '../types';

interface DashboardProps {
    onStartNew: () => void;
    onResume: (lesson: LessonPlan) => void;
}

interface HistoryItem {
    id: number; // history id
    lesson_id: string;
    topic: string;
    mode: string;
    progress: number;
    score: number;
    last_accessed: number;
    status: string;
    // We might need to fetch the full lesson content if resuming, 
    // but for the list we just need metadata.
    // The API returns joined data, so we might have access to content string or we fetch it on click.
    // For MVP, let's assume we fetch full lesson on click or it's embedded if small.
    // Actually, the list API returns metadata. We need a separate call for details if content is huge.
    // But for now, let's assume the list endpoint returns enough info or we fetch on click.
}

const Dashboard: React.FC<DashboardProps> = ({ onStartNew, onResume }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await apiService.getHistory(1); // Default User ID 1
                setHistory(data);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const handleResumeClick = async (lessonId: string) => {
        // Fetch full lesson details
        try {
            const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`);
            if (!response.ok) throw new Error('Failed to load lesson');
            const lesson = await response.json();
            // Backend now returns unpacked content, so lesson IS the LessonPlan
            // But keep a fallback just in case
            const parsedLesson = lesson.content ? (typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content) : lesson;
            onResume(parsedLesson);
        } catch (e) {
            console.error("Error resuming lesson:", e);
            alert("Failed to load lesson content. Please check backend connection.");
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
                <h2 className="text-3xl font-bold text-white mb-2">欢迎回来，Captain!</h2>
                <p className="text-text-secondary">
                    您已完成 <span className="text-accent font-bold">{history.filter(h => h.status === 'COMPLETED').length}</span> 节课程。
                    准备好学习新知识了吗？
                </p>

                <button
                    onClick={onStartNew}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-accent hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-5 h-5" />
                    开始新主题
                </button>
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    最近活动
                </h3>

                {loading ? (
                    <div className="text-center py-12 text-text-secondary">加载历史记录中...</div>
                ) : history.length === 0 ? (
                    <div className="glass-panel p-8 rounded-2xl text-center text-text-secondary opacity-60">
                        <BookOpen className="w-12 h-12 mx-auto mb-4" />
                        <p>暂无学习记录，开始您的第一课吧！</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleResumeClick(item.lesson_id)}
                                className="glass-panel p-5 rounded-xl cursor-pointer hover:bg-white/5 transition-all group border-l-4 border-l-transparent hover:border-l-accent"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.mode === 'INTERVIEW' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {item.mode === 'INTERVIEW' ? '面试准备' : '费曼学习'}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {new Date(item.last_accessed).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-white mb-2 group-hover:text-accent transition-colors line-clamp-1">
                                    {item.topic}
                                </h4>
                                <div className="flex items-center justify-between text-sm text-text-secondary">
                                    <div className="flex items-center gap-1">
                                        {item.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <PlayCircle className="w-4 h-4 text-accent" />
                                        )}
                                        <span>{item.status === 'COMPLETED' ? '已完成' : `${item.progress}%`}</span>
                                    </div>
                                    {item.score > 0 && (
                                        <span className="text-orange-400 font-medium">{item.score} pts</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
