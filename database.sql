CREATE DATABASE syncore_db;

USE syncore_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('Signatory', 'Pharmacy', 'Admin') NOT NULL
);

INSERT INTO users (username, password, user_type)
VALUES ('signatory', 'signatory', '1');

INSERT INTO users (username, password, user_type)
VALUES ('pharmacy', 'pharmacy', '2');

INSERT INTO users (username, password, user_type)
VALUES ('admin', 'admin', '3');

CREATE TABLE `syncore_db`.`supplier` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(255) NOT NULL,
    `contact_person` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `address` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
