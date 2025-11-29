import type { LessonPlan, ReviewItem } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
    saveLesson: async (lesson: LessonPlan, userId: number = 1) => {
        try {
            const response = await fetch(`${API_BASE_URL}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: lesson.id,
                    topic: lesson.topic,
                    mode: lesson.mode,
                    content: JSON.stringify(lesson), // Store full lesson as JSON string
                    createdAt: lesson.createdAt,
                    userId
                })
            });
            if (!response.ok) throw new Error('Failed to save lesson');
            return await response.json();
        } catch (error) {
            console.error('API Error (saveLesson):', error);
            // Non-blocking error for MVP
        }
    },

    getHistory: async (userId: number = 1) => {
        try {
            const response = await fetch(`${API_BASE_URL}/history/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch history');
            return await response.json();
        } catch (error) {
            console.error('API Error (getHistory):', error);
            return [];
        }
    },

    updateProgress: async (lessonId: string, progress: number, score: number, status: 'IN_PROGRESS' | 'COMPLETED', userId: number = 1) => {
        try {
            await fetch(`${API_BASE_URL}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    lessonId,
                    progress,
                    score,
                    status
                })
            });
        } catch (error) {
            console.error('API Error (updateProgress):', error);
        }
    },

    findLesson: async (topic: string, mode: string, userId: number = 1) => {
        try {
            const params = new URLSearchParams({ topic, mode, userId: userId.toString() });
            const response = await fetch(`${API_BASE_URL}/lessons/find?${params}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Failed to search lesson');
            return await response.json();
        } catch (error) {
            console.error('API Error (findLesson):', error);
            return null;
        }
    }
};
