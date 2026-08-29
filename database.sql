CREATE DATABASE IF NOT EXISTS medremind_db;
USE medremind_db;

CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    time TIME NOT NULL,
    description TEXT
);
