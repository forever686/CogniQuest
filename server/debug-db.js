require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cogniquest'
});

db.connect();

db.query('SELECT id, topic, mode, user_id FROM lessons ORDER BY created_at DESC LIMIT 5', (err, results) => {
    if (err) console.error(err);
    else console.log('Recent Lessons:', results);
    db.end();
});
