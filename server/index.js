require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for large lesson data

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cogniquest',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection & Seed Default User
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL Database');

        // Seed default user for MVP
        const seedQuery = `INSERT IGNORE INTO users (id, username, total_xp) VALUES (1, 'Captain', 0)`;
        connection.query(seedQuery, (seedErr) => {
            if (seedErr) console.error('Error seeding default user:', seedErr);
            else console.log('Default user verified/seeded');
            connection.release();
        });
    }
});

// --- API Routes ---

// 1. Save Lesson
app.post('/api/lessons', (req, res) => {
    const { id, topic, mode, content, createdAt, userId } = req.body;

    // For MVP, if no userId, we might use a default or create a guest user. 
    // Here we assume userId 1 exists or is passed.
    // Ensure content is stringified for LONGTEXT
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const validUserId = userId || 1; // Default to ID 1 for now

    const query = `
        INSERT INTO lessons (id, user_id, topic, mode, content, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE content = VALUES(content), created_at = VALUES(created_at)
    `;

    db.query(query, [id, validUserId, topic, mode, contentStr, createdAt], (err, result) => {
        if (err) {
            console.error('Error saving lesson:', err);
            return res.status(500).json({ error: 'Failed to save lesson', details: err.message });
        }

        // Also update history
        const historyQuery = `
            INSERT INTO learning_history (user_id, lesson_id, last_accessed, status)
            VALUES (?, ?, ?, 'IN_PROGRESS')
            ON DUPLICATE KEY UPDATE last_accessed = ?
        `;

        db.query(historyQuery, [validUserId, id, Date.now(), Date.now()], (histErr) => {
            if (histErr) console.error('Error updating history:', histErr);
        });

        res.json({ message: 'Lesson saved successfully' });
    });
});

// 2. Get History
app.get('/api/history/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT h.*, l.topic, l.mode 
        FROM learning_history h
        JOIN lessons l ON h.lesson_id = l.id
        WHERE h.user_id = ?
        ORDER BY h.last_accessed DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching history:', err);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }
        res.json(results);
    });
});

// 3. Get Lesson Details
app.get('/api/lessons/:id', (req, res) => {
    const lessonId = req.params.id;
    const query = 'SELECT * FROM lessons WHERE id = ?';

    db.query(query, [lessonId], (err, results) => {
        if (err) {
            console.error('Error fetching lesson:', err);
            return res.status(500).json({ error: 'Failed to fetch lesson' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const lesson = results[0];
        // Parse JSON content
        try {
            const parsedContent = JSON.parse(lesson.content);
            return res.json(parsedContent);
        } catch (e) {
            console.error('Error parsing lesson content JSON:', e);
        }

        res.json(lesson);
    });
});

// 4. Update Progress
app.post('/api/progress', (req, res) => {
    const { userId, lessonId, progress, score, status } = req.body;

    const query = `
        UPDATE learning_history 
        SET progress = ?, score = ?, status = ?, last_accessed = ?
        WHERE user_id = ? AND lesson_id = ?
    `;

    db.query(query, [progress, score, status, Date.now(), userId, lessonId], (err, result) => {
        if (err) {
            console.error('Error updating progress:', err);
            return res.status(500).json({ error: 'Failed to update progress' });
        }
        res.json({ message: 'Progress updated' });
    });
});

// 5. Find Lesson (Smart Caching)
app.get('/api/lessons/find', (req, res) => {
    const { topic, mode, userId } = req.query;

    // Simple fuzzy search for topic
    const query = `
        SELECT * FROM lessons 
        WHERE user_id = ? 
        AND mode = ? 
        AND topic LIKE ? 
        ORDER BY created_at DESC 
        LIMIT 1
    `;

    const searchUserId = parseInt(userId) || 1;

    db.query(query, [searchUserId, mode, `%${topic}%`], (err, results) => {
        if (err) {
            console.error('Error searching for lesson:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const lesson = results[0];
            try {
                const parsedContent = JSON.parse(lesson.content);
                return res.json(parsedContent);
            } catch (e) {
                console.error('Error parsing cached lesson:', e);
            }
        }

        res.status(404).json({ message: 'Lesson not found' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
