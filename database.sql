CREATE DATABASE syncore_db;

USE syncore_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('Signatory', 'Pharmacy', 'Admin') NOT NULL
);

INSERT INTO users (username, password_hash, user_type)
VALUES ('CEO', 'CEO', '1');

INSERT INTO users (username, password_hash, user_type)
VALUES ('pharmacy', 'pharmacy', '2');

INSERT INTO users (username, password_hash, user_type)
VALUES ('admin', 'admin', '3');
