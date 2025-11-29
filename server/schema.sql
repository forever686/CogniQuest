CREATE DATABASE IF NOT EXISTS cogniquest;
USE cogniquest;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    total_xp INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table (Using LONGTEXT for JSON content compatibility with MySQL 5.5)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT,
    topic VARCHAR(255) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Learning History table
CREATE TABLE IF NOT EXISTS learning_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    lesson_id VARCHAR(50),
    progress INT DEFAULT 0,
    score INT DEFAULT 0,
    last_accessed BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
