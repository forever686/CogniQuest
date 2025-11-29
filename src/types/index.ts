export type VisualType = 'SLIDE' | 'DIAGRAM' | 'ANIMATION' | 'MATH_PLOT';

export type VisualStatus = 'GENERATING' | 'READY' | 'ERROR' | 'DEPRECATED';

export interface VisualAsset {
    id: string;
    node_id: string; // The concept/topic ID
    visual_type: VisualType;
    title: string;
    content: string; // Markdown text for slides, or code for diagrams
    image_url?: string; // For slides
    config_json?: any; // For interactive templates or diagram config
    generator_version: string;
    status: VisualStatus;
}

export interface ContentRequest {
    query: string;
    mode?: LessonMode;
    documentContent?: string;
    timestamp: number;
}

export interface InteractiveTemplateData {
    template_id?: 'T1_DragSort' | 'T2_Connection' | 'T3_FillBlank' | 'T4_Hotspot' | 'T4_MultipleChoice' | 'T5_TrueFalse';
    data?: any;
    hint?: string;
    // Legacy support
    type?: string;
    question?: string;
    questions?: any[]; // For Multiple Choice and True/False
    answers?: string[];
    options?: string[];
    correctOrder?: string[];
    correct_answer?: boolean; // For True/False
}

export type LessonMode = 'FEYNMAN' | 'INTERVIEW';

export type StepType = 'CONCEPT' | 'ANALOGY' | 'QUIZ' | 'SUMMARY' | 'FLASHCARD' | 'ROLEPLAY';

export interface LessonStep {
    id: string;
    type: StepType;
    title: string;
    content: VisualAsset; // Reusing VisualAsset for the visual content of the step
    quizConfig?: InteractiveTemplateData; // If type is QUIZ
    flashcard?: {
        front: string;
        back: string;
    }; // If type is FLASHCARD
}

export interface LessonChapter {
    id: string;
    title: string;
    steps: LessonStep[];
}

export interface LessonPlan {
    id: string;
    topic: string;
    mode: LessonMode;
    chapters: LessonChapter[];
    createdAt: number;
}

export interface ReviewItem {
    id: string; // stepId
    topic: string;
    question: string;
    nextReviewDate: number; // Timestamp
    masteryLevel: number; // 0-5
}
