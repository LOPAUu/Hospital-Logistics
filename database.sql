CREATE DATABASE syncore_db;

USE syncore_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('Signatory', 'Pharmacy', 'Admin') NOT NULL
);

INSERT INTO users (username, password_hash, user_type)
VALUES ('CEO', '7a9fec60195477c930a09035192fb1a805a371e9', 'CEO');

INSERT INTO users (username, password_hash, user_type)
VALUES ('pharmacy', 'adfa59cc50d2bd2ce3af0061ed4925fdc37019ba', 'Pharmacy');

INSERT INTO users (username, password_hash, user_type)
VALUES ('admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'Admin');

