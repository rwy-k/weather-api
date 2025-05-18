-- Create the subscription database
CREATE DATABASE IF NOT EXISTS subscription_db;

-- Switch to the subscription database
USE subscription_db;

-- Create the subscription table
CREATE TABLE IF NOT EXISTS subscription (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    frequency VARCHAR(10) NOT NULL,
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show tables in the current database
SHOW TABLES;