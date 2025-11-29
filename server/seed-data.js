const http = require('http');

// Helper function to make POST requests
function post(path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${responseBody}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

const lessons = [
    {
        id: 'seed-lesson-quantum',
        topic: 'Quantum Entanglement',
        mode: 'FEYNMAN',
        createdAt: Date.now() - 10000000,
        steps: [
            {
                id: 'step-q1',
                type: 'CONCEPT',
                title: 'The Spooky Action',
                content: {
                    id: 'vis-q1',
                    visual_type: 'SLIDE',
                    title: 'What is Entanglement?',
                    content: 'Quantum entanglement is a phenomenon where two particles become linked, such that the state of one cannot be described independently of the other, even when separated by large distances.',
                    status: 'READY',
                    generator_version: '1.0'
                }
            },
            {
                id: 'step-q2',
                type: 'ANALOGY',
                title: 'The Magic Coins',
                content: {
                    id: 'vis-q2',
                    visual_type: 'SLIDE',
                    title: 'Coin Flip Analogy',
                    content: 'Imagine two magic coins. No matter how far apart they are, if you flip one and it lands Heads, the other one INSTANTLY lands Tails. They are connected by an invisible thread of information.',
                    status: 'READY',
                    generator_version: '1.0'
                }
            },
            {
                id: 'step-q3',
                type: 'QUIZ',
                title: 'Check Understanding',
                content: {
                    id: 'vis-q3',
                    visual_type: 'SLIDE',
                    title: 'Quiz',
                    content: 'Test your knowledge on entanglement.',
                    status: 'READY',
                    generator_version: '1.0'
                },
                quizConfig: {
                    template_id: 'T1_DragSort',
                    data: {
                        question: 'Order the steps of creating an entangled pair:',
                        options: ['Generate Pair', 'Separate Particles', 'Measure State'],
                        correctOrder: ['Generate Pair', 'Separate Particles', 'Measure State']
                    }
                }
            }
        ]
    },
    {
        id: 'seed-lesson-react',
        topic: 'React useEffect',
        mode: 'INTERVIEW',
        createdAt: Date.now() - 5000000,
        steps: [
            {
                id: 'step-r1',
                type: 'CONCEPT',
                title: 'The Lifecycle Hook',
                content: {
                    id: 'vis-r1',
                    visual_type: 'SLIDE',
                    title: 'useEffect Explained',
                    content: '`useEffect` lets you perform side effects in function components. It serves the same purpose as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` in React classes.',
                    status: 'READY',
                    generator_version: '1.0'
                }
            },
            {
                id: 'step-r2',
                type: 'FLASHCARD',
                title: 'Interview Question',
                content: {
                    id: 'vis-r2',
                    visual_type: 'SLIDE',
                    title: 'Dependency Array',
                    content: 'What happens if the dependency array is empty?',
                    status: 'READY',
                    generator_version: '1.0'
                },
                flashcard: {
                    front: 'What does an empty dependency array `[]` mean in useEffect?',
                    back: 'It means the effect will only run ONCE after the initial render, similar to `componentDidMount`.'
                }
            }
        ]
    },
    {
        id: 'seed-lesson-photo',
        topic: 'Photosynthesis',
        mode: 'FEYNMAN',
        createdAt: Date.now() - 2000000,
        steps: [
            {
                id: 'step-p1',
                type: 'CONCEPT',
                title: 'Solar Power Plant',
                content: {
                    id: 'vis-p1',
                    visual_type: 'DIAGRAM',
                    title: 'The Process',
                    content: 'graph LR\n  Sun[Sunlight] --> Leaf\n  CO2[Carbon Dioxide] --> Leaf\n  Water --> Leaf\n  Leaf --> Sugar[Glucose]\n  Leaf --> Oxygen',
                    status: 'READY',
                    generator_version: '1.0'
                }
            },
            {
                id: 'step-p2',
                type: 'QUIZ',
                title: 'Key Input',
                content: {
                    id: 'vis-p2',
                    visual_type: 'SLIDE',
                    title: 'What drives it?',
                    content: 'Photosynthesis requires energy to proceed.',
                    status: 'READY',
                    generator_version: '1.0'
                },
                quizConfig: {
                    template_id: 'T3_FillBlank',
                    data: {
                        text_parts: ['The primary energy source for photosynthesis is ', '.'],
                        correct_answers: ['Sunlight']
                    }
                }
            }
        ]
    }
];

async function seed() {
    console.log('🌱 Starting database seed...');

    for (const lesson of lessons) {
        try {
            console.log(`Saving lesson: ${lesson.topic}...`);

            // Match the API expectation: wrap lesson in content
            const payload = {
                id: lesson.id,
                topic: lesson.topic,
                mode: lesson.mode,
                content: JSON.stringify(lesson),
                createdAt: lesson.createdAt,
                userId: 1
            };

            await post('/lessons', payload);

            // Simulate some progress
            if (lesson.topic === 'Quantum Entanglement') {
                console.log(`Updating progress for: ${lesson.topic}...`);
                await post('/progress', {
                    userId: 1,
                    lessonId: lesson.id,
                    progress: 100,
                    score: 80,
                    status: 'COMPLETED'
                });
            } else if (lesson.topic === 'React useEffect') {
                console.log(`Updating progress for: ${lesson.topic}...`);
                await post('/progress', {
                    userId: 1,
                    lessonId: lesson.id,
                    progress: 50,
                    score: 0,
                    status: 'IN_PROGRESS'
                });
            }
        } catch (err) {
            console.error(`Failed to seed ${lesson.topic}:`, err.message);
        }
    }

    console.log('✅ Seeding complete! Refresh your dashboard.');
}

seed();
