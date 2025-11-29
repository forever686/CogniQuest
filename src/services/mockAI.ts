import type { VisualAsset, ContentRequest, LessonPlan } from '../types';

// Mock Database
const MOCK_DB: Record<string, VisualAsset> = {
    'french-revolution': {
        id: 'asset-001',
        node_id: 'topic-french-rev',
        visual_type: 'SLIDE',
        title: 'The French Revolution',
        content: '# Liberty, Equality, Fraternity\n\nThe French Revolution was a period of radical political and societal change in France that began with the Estates General of 1789 and ended with the formation of the French Consulate in November 1799.',
        image_url: 'https://images.unsplash.com/photo-1568607689150-17e625c1586e?auto=format&fit=crop&q=80&w=1000',
        generator_version: 'v2.2',
        status: 'READY'
    },
    'photosynthesis': {
        id: 'asset-002',
        node_id: 'topic-photosynthesis',
        visual_type: 'DIAGRAM',
        title: 'Photosynthesis Process',
        content: `graph TD
    A[Sunlight] --> B(Chloroplast)
    C[Water] --> B
    D[CO2] --> B
    B --> E[Glucose]
    B --> F[Oxygen]`,
        generator_version: 'v2.2',
        status: 'READY'
    },
    'sort-dynasties': {
        id: 'asset-003',
        node_id: 'topic-dynasties',
        visual_type: 'SLIDE',
        title: 'Chinese Dynasties',
        content: 'Sort the dynasties in chronological order.',
        config_json: {
            template_id: 'T1_DragSort',
            data: {
                items: ['Qin', 'Han', 'Tang', 'Song'],
                correct_order: ['Qin', 'Han', 'Tang', 'Song']
            },
            hint: 'Think: Qin Huang Han Wu...'
        },
        generator_version: 'v2.2',
        status: 'READY'
    },
    'bubble-sort': {
        id: 'asset-004',
        node_id: 'topic-bubble-sort',
        visual_type: 'ANIMATION',
        title: 'Bubble Sort Visualization',
        content: JSON.stringify({
            type: 'sorting',
            description: 'Bubble Sort Step-by-Step',
            steps: [
                { name: 'Step 1', data: [{ name: 'A', value: 5 }, { name: 'B', value: 3 }, { name: 'C', value: 8 }, { name: 'D', value: 1 }] },
                { name: 'Step 2', data: [{ name: 'A', value: 3 }, { name: 'B', value: 5 }, { name: 'C', value: 8 }, { name: 'D', value: 1 }] },
                { name: 'Step 3', data: [{ name: 'A', value: 3 }, { name: 'B', value: 5 }, { name: 'C', value: 1 }, { name: 'D', value: 8 }] },
                { name: 'Step 4', data: [{ name: 'A', value: 3 }, { name: 'B', value: 1 }, { name: 'C', value: 5 }, { name: 'D', value: 8 }] },
                { name: 'Step 5', data: [{ name: 'A', value: 1 }, { name: 'B', value: 3 }, { name: 'C', value: 5 }, { name: 'D', value: 8 }] }
            ]
        }),
        generator_version: 'v2.2',
        status: 'READY'
    }
};

export const mockAIService = {
    generateContent: async (request: ContentRequest): Promise<VisualAsset> => {
        // Legacy support: generate a lesson and return the first asset
        const lesson = await mockAIService.generateLesson(request);
        // Return the content of the first step of the first chapter
        return lesson.chapters[0].steps[0].content;
    },

    generateLesson: async (request: ContentRequest): Promise<LessonPlan> => {
        console.log(`Mock AI generating lesson for: ${request.query}, Mode: ${request.mode}`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mode = request.mode || 'FEYNMAN';

        // Mock Lesson Data
        return {
            id: `lesson-${Date.now()}`,
            topic: request.query,
            mode: mode,
            createdAt: Date.now(),
            chapters: [
                {
                    id: 'chapter-1',
                    title: 'Chapter 1: Core Concepts',
                    steps: [
                        {
                            id: 'step-1-1',
                            type: mode === 'INTERVIEW' ? 'FLASHCARD' : 'CONCEPT',
                            title: mode === 'INTERVIEW' ? 'Core Question' : 'Introduction',
                            content: {
                                id: 'asset-1-1',
                                node_id: 'node-1-1',
                                visual_type: 'SLIDE',
                                title: request.query,
                                content: mode === 'INTERVIEW'
                                    ? `# Interview Question\n\nExplain the core concept of **${request.query}**.`
                                    : `# What is ${request.query}?\n\nHere is a simple explanation of the concept...`,
                                image_url: 'https://source.unsplash.com/1600x900/?education',
                                generator_version: 'mock',
                                status: 'READY',
                                quizConfig: {
                                    template_id: 'T1_DragSort',
                                    data: { items: ['A', 'B'], correct_order: ['A', 'B'] }
                                }
                            },
                            flashcard: mode === 'INTERVIEW' ? {
                                front: `What is ${request.query}?`,
                                back: `It is a fundamental concept in...`
                            } : undefined
                        },
                        {
                            id: 'step-1-2',
                            type: 'ANALOGY',
                            title: 'Analogy',
                            content: {
                                id: 'asset-1-2',
                                node_id: 'node-1-2',
                                visual_type: 'SLIDE',
                                title: 'Real World Analogy',
                                content: `# Like a Pizza Shop...\n\nImagine ${request.query} is like a pizza shop where...`,
                                image_url: 'https://source.unsplash.com/1600x900/?pizza',
                                generator_version: 'mock',
                                status: 'READY'
                            }
                        }
                    ]
                },
                {
                    id: 'chapter-2',
                    title: 'Chapter 2: Practice',
                    steps: [
                        {
                            id: 'step-2-1',
                            type: 'QUIZ',
                            title: 'Quick Quiz',
                            content: {
                                id: 'asset-2-1',
                                node_id: 'node-2-1',
                                visual_type: 'SLIDE',
                                title: 'Test Your Knowledge',
                                content: 'Sort the following items:',
                                config_json: {
                                    template_id: 'T1_DragSort',
                                    data: {
                                        items: ['Step A', 'Step B', 'Step C'],
                                        correct_order: ['Step A', 'Step B', 'Step C']
                                    },
                                    hint: 'Order logically...'
                                },
                                generator_version: 'mock',
                                status: 'READY'
                            },
                            quizConfig: {
                                template_id: 'T1_DragSort',
                                data: { items: ['A', 'B'], correct_order: ['A', 'B'] }
                            }
                        }
                    ]
                }
            ]
        };
    }
};
