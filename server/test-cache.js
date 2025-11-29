const http = require('http');

// 1. Save a dummy lesson
const lessonId = `cache-test-${Date.now()}`;
const topic = 'Cache Test Topic';
const lessonData = JSON.stringify({
    id: lessonId,
    topic: topic,
    mode: 'FEYNMAN',
    content: JSON.stringify({ title: 'Cached Lesson' }),
    createdAt: Date.now(),
    userId: 1
});

const saveOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/lessons',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': lessonData.length
    }
};

const reqSave = http.request(saveOptions, (res) => {
    console.log(`SAVE STATUS: ${res.statusCode}`);
    res.on('data', () => { });
    res.on('end', () => {
        // 2. Try to find it
        findLesson();
    });
});

reqSave.on('error', (e) => console.error(`Save error: ${e.message}`));
reqSave.write(lessonData);
reqSave.end();

function findLesson() {
    const params = new URLSearchParams({ topic: 'Cache Test', mode: 'FEYNMAN', userId: '1' });
    const findOptions = {
        hostname: 'localhost',
        port: 3001,
        path: `/api/lessons/find?${params.toString()}`,
        method: 'GET'
    };

    const reqFind = http.request(findOptions, (res) => {
        console.log(`FIND STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const result = JSON.parse(data);
            if (result.id === lessonId) {
                console.log('SUCCESS: Found cached lesson!');
            } else {
                console.log('FAILURE: Did not find the correct lesson.', result);
            }
        });
    });

    reqFind.on('error', (e) => console.error(`Find error: ${e.message}`));
    reqFind.end();
}
