-- Create database if not exists
CREATE DATABASE IF NOT EXISTS taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'taskflow'@'localhost' IDENTIFIED BY 'bhup123';

-- Grant all privileges on taskflow database to taskflow user
GRANT ALL PRIVILEGES ON taskflow.* TO 'taskflow'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify
SELECT USER();
SHOW DATABASES;
