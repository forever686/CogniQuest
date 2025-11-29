import type { VisualAsset, ContentRequest, LessonPlan } from '../types';
import { LESSON_GENERATION_PROMPT } from './prompt_templates';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `
You are CogniQuest AI, an advanced educational content generator.
Your goal is to convert user queries into structured visual learning assets.

OUTPUT FORMAT:
You must output ONLY valid JSON. No markdown code blocks, no explanations.
The JSON must match this structure:
{
  "visual_type": "SLIDE" | "DIAGRAM" | "ANIMATION",
  "title": "Concise Title",
  "content": "Markdown content for slides OR Mermaid code for diagrams OR JSON data for animations",
  "image_url": "Optional keyword for image search (e.g. 'french revolution')",
  "config_json": { ...optional interactive template data... }
}

ROUTING LOGIC:
- History, Literature, Language -> "SLIDE" (Rich text + Image)
- Processes, Systems, Flows, Biology -> "DIAGRAM" (Mermaid.js). IMPORTANT: Output ONLY the Mermaid code. No explanations or markdown formatting outside the code.
- Algorithms, Math, Physics, Trends -> "ANIMATION" (JSON data for Recharts/Framer)

ANIMATION DATA STRUCTURE (Critical):
For "ANIMATION", the "content" field must be a JSON string matching:
{
  "type": "sorting" | "bar_race" | "trend",
  "description": "Short description",
  "steps": [
    {
      "name": "Step 1",
      "description": "What happens here",
      "data": [
        { "name": "Label A", "value": 10 },
        { "name": "Label B", "value": 20 }
      ]
    }
  ]
}
IMPORTANT: "data" inside steps MUST be an array of objects with "name" and "value" keys. Do NOT use simple arrays like [1, 2, 3].

INTERACTIVE TEMPLATES (Optional):
If the content involves ordering or filling blanks, add "config_json":
- DragSort: { "template_id": "T1_DragSort", "data": { "items": [...], "correct_order": [...] }, "hint": "..." }
- FillBlank: { "template_id": "T3_FillBlank", "data": { "text_parts": ["Prefix ", " Suffix"], "correct_answers": ["Answer"] }, "hint": "..." }
`;

export const deepseekService = {
    generateContent: async (request: ContentRequest): Promise<VisualAsset> => {
        if (!API_KEY || API_KEY.includes('placeholder')) {
            console.warn('DeepSeek API Key is missing or placeholder. Falling back to Mock.');
            throw new Error('API_KEY_MISSING');
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: `Generate content for: "${request.query}"` }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            let parsedContent;
            try {
                parsedContent = JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse AI response:', content);
                throw new Error('Invalid JSON response from AI');
            }

            return {
                id: `gen-${Date.now()}`,
                node_id: `topic-${Date.now()}`,
                visual_type: parsedContent.visual_type,
                title: parsedContent.title,
                content: parsedContent.content,
                image_url: parsedContent.image_url ? `https://source.unsplash.com/1600x900/?${encodeURIComponent(parsedContent.image_url)}` : undefined,
                config_json: parsedContent.config_json,
                generator_version: 'v2.2-deepseek',
                status: 'READY'
            };

        } catch (error) {
            console.error('DeepSeek Service Error:', error);
            throw error;
        }
    },

    generateLesson: async (request: ContentRequest): Promise<LessonPlan> => {
        if (!API_KEY || API_KEY.includes('placeholder')) {
            console.warn('DeepSeek API Key is missing or placeholder. Falling back to Mock.');
            throw new Error('API_KEY_MISSING');
        }

        const mode = request.mode || 'FEYNMAN';
        const context = request.documentContent ? `\n\nCONTEXT DOCUMENT:\n${request.documentContent}` : '';

        const prompt = `
    Create a structured lesson plan for the topic: "${request.query}".
    Mode: ${mode}
    Context: ${context}

    The output MUST be a valid JSON object with the following structure:
    {
        "topic": "Topic Name",
        "chapters": [
            {
                "id": "chapter-1",
                "title": "Chapter Title",
                "steps": [
                    {
                        "id": "step-1",
                        "type": "CONCEPT" | "ANALOGY" | "QUIZ" | "SUMMARY" | "FLASHCARD" | "ROLEPLAY",
                        "title": "Step Title",
                        "content": {
                            "visual_type": "SLIDE" | "DIAGRAM" | "ANIMATION" | "MATH_PLOT",
                            "title": "Visual Title",
                            "content": "Markdown content or code",
                            "config_json": {} // Optional config
                        },
                        "quizConfig": {} // Optional, for QUIZ type
                    }
                ]
            }
        ]
    }

    Requirements:
    1. Break the topic into logical chapters (e.g., Basics, Advanced, Practice).
    2. Each chapter should have a sequence of steps (Concept -> Analogy -> Quiz).
    3. Use "SLIDE" for text, "DIAGRAM" for Mermaid graphs, "ANIMATION" for processes.
    4. For MATH topics, use "MATH_PLOT" and LaTeX.
    `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: "You are an expert lesson planner." },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 3000,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            let parsedContent;
            try {
                parsedContent = JSON.parse(content);
            } catch (e) {
                console.error('Failed to parse AI response:', content);
                throw new Error('Invalid JSON response from AI');
            }

            // Post-process to ensure IDs and defaults
            const chapters = parsedContent.chapters.map((chapter: any, cIndex: number) => ({
                ...chapter,
                id: chapter.id || `chapter-${cIndex}`,
                steps: chapter.steps.map((step: any, sIndex: number) => ({
                    ...step,
                    id: step.id || `step-${cIndex}-${sIndex}`,
                    content: {
                        ...step.content,
                        id: `asset-${cIndex}-${sIndex}`,
                        node_id: `node-${cIndex}-${sIndex}`,
                        status: 'READY',
                        generator_version: 'deepseek-v1'
                    }
                }))
            }));

            return {
                id: `lesson-${Date.now()}`,
                topic: parsedContent.topic || request.query,
                mode: mode,
                chapters: chapters,
                createdAt: Date.now()
            };

        } catch (error) {
            console.error('DeepSeek Service Error:', error);
            throw error;
        }
    }
};
