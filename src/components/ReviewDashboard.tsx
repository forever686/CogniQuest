import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import type { ReviewItem } from '../types';

interface ReviewDashboardProps {
    score: number;
    totalSteps: number;
    reviewItems: ReviewItem[];
    onHome: () => void;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ score, totalSteps, reviewItems, onHome }) => {
    const percentage = Math.round((score / (totalSteps * 10)) * 100); // Assuming 10 points per step

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-purple-500" />

                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center border-4 border-accent/20">
                        <Trophy className="w-12 h-12 text-accent" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">课程完成!</h2>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400 mb-4">
                    {score} <span className="text-2xl text-text-secondary font-medium">分</span>
                </div>
                <p className="text-text-secondary">
                    您掌握了 {percentage}% 的内容。
                </p>
            </div>

            {/* Spaced Repetition Queue */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    间隔重复队列
                </h3>

                {reviewItems.length === 0 ? (
                    <div className="glass-panel p-8 rounded-2xl text-center text-text-secondary">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p>完美得分！暂无需复习。</p>
                        <p className="text-sm opacity-60 mt-2">请在 3 天后回来复习以巩固记忆。</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {reviewItems.map((item) => (
                            <div key={item.id} className="glass-panel p-4 rounded-xl border-l-4 border-l-orange-500 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">需复习</span>
                                    <span className="text-xs text-text-secondary">
                                        {new Date(item.nextReviewDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-white">{item.question}</h4>
                                <p className="text-sm text-text-secondary">主题: {item.topic}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onHome}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/10 hover:border-white/20"
            >
                返回首页
            </button>
        </div>
    );
};

export default ReviewDashboard;
