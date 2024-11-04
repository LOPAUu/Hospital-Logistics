CREATE DATABASE LogisticsDB;

USE LogisticsDB;

-- Table for users with PostgreSQL equivalent to MySQL AUTO_INCREMENT
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- SERIAL is PostgreSQL's auto-incrementing integer
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('Signatory', 'Pharmacy', 'Admin')) NOT NULL  -- Use CHECK for ENUM-like behavior
);

-- Insert sample users with specified user types
INSERT INTO users (username, password, user_type)
VALUES ('signatory', 'signatory', 'Signatory');

INSERT INTO users (username, password, user_type)
VALUES ('pharmacy', 'pharmacy', 'Pharmacy');

INSERT INTO users (username, password, user_type)
VALUES ('admin', 'admin', 'Admin');

-- Table for suppliers with PostgreSQL timestamp handling
CREATE TABLE supplier (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for requisitions
CREATE TABLE requisitions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    billing VARCHAR(255) NOT NULL,
    signatory1_approved BOOLEAN DEFAULT FALSE,
    signatory2_approved BOOLEAN DEFAULT FALSE,
    signatory3_approved BOOLEAN DEFAULT FALSE
);

-- Table for requisition items with PostgreSQL equivalent to MySQL's ON DELETE CASCADE
CREATE TABLE requisition_items (
    id SERIAL PRIMARY KEY,
    requisition_id INT NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,  -- NUMERIC is used instead of DECIMAL
    total NUMERIC(10, 2) NOT NULL
);
