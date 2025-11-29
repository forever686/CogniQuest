import React, { useState } from 'react';
import InputSection from './components/InputSection';
import LessonContainer from './components/LessonContainer';
import ReviewDashboard from './components/ReviewDashboard';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { deepseekService } from './services/deepseek';
import { mockAIService } from './services/mockAI';
import { apiService } from './services/api';
import type { LessonPlan, LessonMode, ReviewItem } from './types';

type ViewState = 'DASHBOARD' | 'NEW_TOPIC' | 'LESSON' | 'REVIEW';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [loading, setLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonPlan | null>(null);
  const [reviewData, setReviewData] = useState<{ score: number; reviewItems: ReviewItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, mode: LessonMode, documentContent?: string) => {
    setLoading(true);
    setCurrentLesson(null);
    setReviewData(null);
    setError(null);

    try {
      // 1. Smart Caching: Check DB first
      console.log(`Checking cache for: ${query} (${mode})`);
      const cachedLesson = await apiService.findLesson(query, mode);

      if (cachedLesson) {
        console.log("Found cached lesson!", cachedLesson);
        setCurrentLesson(cachedLesson);
        setView('LESSON');
        setLoading(false);
        return;
      }

      // 2. Try DeepSeek if not found
      console.log(`Cache miss. Generating new lesson...`);
      const lesson = await deepseekService.generateLesson({
        query,
        mode,
        documentContent,
        timestamp: Date.now()
      });

      // Save to Backend
      await apiService.saveLesson(lesson);

      setCurrentLesson(lesson);
      setView('LESSON');
    } catch (err: any) {
      console.warn("DeepSeek failed or not configured, falling back to Mock AI.", err);

      // Fallback to Mock AI if API key missing or error
      if (err.message === 'API_KEY_MISSING' || err.message.includes('Failed to fetch')) {
        try {
          const lesson = await mockAIService.generateLesson({
            query,
            mode,
            documentContent,
            timestamp: Date.now()
          });
          setCurrentLesson(lesson);
          setView('LESSON');
        } catch (mockErr) {
          console.error("Mock AI also failed", mockErr);
          setError("Failed to generate lesson. Please try again.");
        }
      } else {
        setError(`Generation Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (lesson: LessonPlan) => {
    // Save imported lesson to DB so it's in history
    try {
      await apiService.saveLesson(lesson);
      setCurrentLesson(lesson);
      setView('LESSON');
    } catch (e) {
      console.error("Failed to save imported lesson", e);
      setError("Failed to save imported lesson");
    }
  };

  const handleLessonComplete = async (results: { score: number; reviewItems: ReviewItem[] }) => {
    // Update progress in backend
    if (currentLesson) {
      await apiService.updateProgress(currentLesson.id, 100, results.score, 'COMPLETED');
    }

    setReviewData(results);
    setView('REVIEW');
  };

  const handleResumeLesson = (lesson: LessonPlan) => {
    setCurrentLesson(lesson);
    setView('LESSON');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent/30 flex flex-col">

      {/* Global Header - Only show for Dashboard and New Topic */}
      {view !== 'LESSON' && (
        <div className="container mx-auto px-4 pt-8 flex-none">
          <header className="text-center cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400 mb-2">
              CogniQuest 智求
            </h1>
            <p className="text-text-secondary text-lg">
              您的 AI 驱动学习引擎
            </p>
          </header>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">

        {view === 'DASHBOARD' && (
          <div className="container mx-auto px-4 py-8 flex-1">
            <Dashboard
              onStartNew={() => setView('NEW_TOPIC')}
              onResume={handleResumeLesson}
            />
          </div>
        )}

        {view === 'NEW_TOPIC' && (
          <div className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-center max-w-2xl w-full relative">
            <button
              onClick={() => setView('DASHBOARD')}
              className="absolute top-0 left-4 -mt-12 text-text-secondary hover:text-white flex items-center gap-2"
            >
              ← 返回仪表盘
            </button>
            <InputSection onSearch={handleSearch} onImport={handleImport} isLoading={loading} />
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
          </div>
        )}

        {view === 'LESSON' && currentLesson && (
          <div className="w-full h-screen flex flex-col overflow-hidden">
            {/* Back button is now inside LessonContainer header or we can add a small floating one if needed. 
                 But LessonContainer has its own header, so we might want to pass a 'onExit' prop or similar.
                 For now, let's keep the 'Back to Dashboard' button but make it absolute or integrated.
                 Actually, the new LessonContainer header has a 'Topic' display. 
                 Let's add a small absolute back button or rely on the user finishing.
                 Wait, the user wants an IDE feel. Usually there is a 'Home' button.
                 Let's wrap it in a full div.
             */}
            <ErrorBoundary>
              <LessonContainer
                lesson={currentLesson}
                onComplete={handleLessonComplete}
                onExit={() => setView('DASHBOARD')}
              />
            </ErrorBoundary>
          </div>
        )}

        {view === 'REVIEW' && reviewData && (
          <div className="container mx-auto px-4 py-8 flex-1">
            <ReviewDashboard
              score={reviewData.score}
              totalSteps={10}
              reviewItems={reviewData.reviewItems}
              onHome={() => setView('DASHBOARD')}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
