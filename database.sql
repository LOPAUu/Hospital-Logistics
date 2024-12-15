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

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,  -- Unique identifier for each role
    role_name VARCHAR(50) NOT NULL UNIQUE  -- Role name (Admin, Manager, etc.)
);

INSERT INTO roles (role_name) VALUES
('Admin'),
('Warehouse Manager'),
('Inventory Clerk'),
('Delivery Personnel');

CREATE TABLE users (
    staff_id SERIAL PRIMARY KEY,  -- Unique identifier for each user
    username VARCHAR(50) NOT NULL,  -- Username for identification
    role VARCHAR(50) NOT NULL,  -- User's role (Admin, etc.)
    status VARCHAR(20) NOT NULL,  -- Active or Inactive status
    email VARCHAR(100) NOT NULL,  -- Email address for communication
    password VARCHAR(255) NOT NULL,  -- Hashed password (never store plain text passwords)
    phone VARCHAR(15),  -- Optional: phone number for contact
    emergency_contact VARCHAR(100),  -- Optional: emergency contact number
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
    FOREIGN KEY (role) REFERENCES roles(role_name)  -- Assuming you have a roles table
);



-- Table for suppliers with PostgreSQL timestamp handling
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_items (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL
);

-- Table for requisitions
CREATE TABLE requisitions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL, -- Replacing billing with company_name if applicable
    signatory1_approved BOOLEAN DEFAULT FALSE,
    signatory2_approved BOOLEAN DEFAULT FALSE,
    signatory3_approved BOOLEAN DEFAULT FALSE
);

CREATE TABLE requisition_items (
    id SERIAL PRIMARY KEY,
    requisition_id INT NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,  -- NUMERIC is used instead of DECIMAL
    total NUMERIC(10, 2) NOT NULL
);

ALTER TABLE requisitions
ADD COLUMN supplier_id INT REFERENCES suppliers(id);

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    requisition_id INTEGER NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create 'attachments' table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    requisition_id INTEGER NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the medicine_requests table (if not already created)
CREATE TABLE medicine_requests (
    medicine_request_id SERIAL PRIMARY KEY,
    request_status VARCHAR(50) NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(100),
    approval_date TIMESTAMP
);

-- Insert sample data
INSERT INTO medicine_requests (request_status, medicine_name, quantity, request_date, approved_by, approval_date)
VALUES 
    ('Pending', 101, 5, '2024-12-01 10:00:00', NULL, NULL),
    ('Approved', 102, 10, '2024-11-30 09:00:00', 'Dr. Smith', '2024-11-30 11:00:00'),
    ('Rejected', 103, 2, '2024-11-29 08:30:00', 'Dr. Johnson', '2024-11-29 12:30:00'),
    ('Pending', 104, 7, '2024-12-01 11:30:00', NULL, NULL);


--
select * from medicines
CREATE TABLE medicines (
    medicine_id SERIAL PRIMARY KEY,         -- Unique ID for each medicine
    sku VARCHAR(50) UNIQUE NOT NULL,        -- Stock Keeping Unit for tracking
    medicine_name VARCHAR(255) NOT NULL,    -- Name of the medicine
    quantity INT DEFAULT 0,                 -- Current stock quantity
    status VARCHAR(50) DEFAULT 'Active',    -- Status (e.g., Active, Inactive, Out of Stock)
    unit_cost DECIMAL(10, 2) NOT NULL,      -- Cost per unit
    unit_price DECIMAL(10, 2) NOT NULL,     -- Selling price per unit
    category VARCHAR(100),                  -- Medicine category (e.g., Pain Relief, Antibiotic)
    base_unit VARCHAR(50) DEFAULT 'pcs',    -- Base unit of measure (e.g., pcs, bottles)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date when the entry was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Last updated (initial value)
    po_number VARCHAR(100),                 -- Purchase Order number
    description TEXT,                       -- Detailed description of the medicine
    expiration_date DATE,                   -- Expiry date
    lot_position VARCHAR(50)                -- Shelf or storage location (e.g., A1, B2)
);

-- Trigger function to automatically update date 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON medicines
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert a wider range of sample medicines into the medicines table
INSERT INTO medicines 
(sku, medicine_name, quantity, status, unit_cost, unit_price, category, base_unit, po_number, description, expiration_date, lot_position) 
VALUES
    ('MED001', 'Paracetamol', 100, 'Active', 3.00, 5.50, 'Pain Relief', 'pcs', 'PO12345', 'Common pain reliever', '2025-12-31', 'A1'),
    ('MED002', 'Ibuprofen', 200, 'Active', 6.00, 10.00, 'Pain Relief', 'pcs', 'PO12346', 'Pain reliever/anti-inflammatory', '2025-11-30', 'B1'),
    ('MED003', 'Amoxicillin', 150, 'Active', 12.00, 20.00, 'Antibiotic', 'pcs', 'PO12347', 'Antibiotic for bacterial infections', '2025-06-30', 'C1'),
    ('MED004', 'Loratadine', 50, 'Active', 8.00, 15.00, 'Antihistamine', 'pcs', 'PO12348', 'Allergy relief medicine', '2025-12-15', 'D1'),
    ('MED005', 'Salbutamol', 75, 'Active', 18.00, 25.00, 'Asthma Inhaler', 'pcs', 'PO12349', 'Used for asthma relief', '2025-03-31', 'E1'),
    ('MED006', 'Cetirizine', 120, 'Active', 10.00, 18.00, 'Antihistamine', 'pcs', 'PO12350', 'Allergy relief medicine', '2025-08-31', 'F1'),
    ('MED007', 'Ciprofloxacin', 90, 'Active', 20.00, 30.00, 'Antibiotic', 'pcs', 'PO12351', 'Broad-spectrum antibiotic', '2025-01-31', 'A2'),
    ('MED008', 'Metformin', 110, 'Active', 35.00, 50.00, 'Diabetic Medication', 'pcs', 'PO12352', 'Used for Type 2 diabetes', '2026-06-30', 'B2'),
    ('MED009', 'Omeprazole', 130, 'Active', 20.00, 35.00, 'Antacid', 'pcs', 'PO12353', 'Used for stomach ulcers', '2025-02-28', 'C2'),
    ('MED010', 'Methylprednisolone', 40, 'Active', 75.00, 100.00, 'Steroid', 'pcs', 'PO12354', 'Anti-inflammatory steroid', '2025-05-15', 'D2'),
    ('MED011', 'Furosemide', 60, 'Active', 25.00, 40.00, 'Diuretic', 'pcs', 'PO12355', 'Used for fluid retention', '2025-10-31', 'E2'),
    ('MED012', 'Amlodipine', 80, 'Active', 30.00, 45.00, 'Antihypertensive', 'pcs', 'PO12356', 'Used for high blood pressure', '2026-01-31', 'F2'),
    ('MED013', 'Diphenhydramine', 90, 'Active', 15.00, 20.00, 'Antihistamine', 'pcs', 'PO12357', 'Used for allergies and sleep aid', '2025-04-30', 'A3'),
    ('MED014', 'Loperamide', 70, 'Active', 8.00, 12.00, 'Anti-diarrheal', 'pcs', 'PO12358', 'Relieves diarrhea symptoms', '2025-09-30', 'B3'),
    ('MED015', 'Paracetamol + Caffeine', 100, 'Active', 4.00, 7.00, 'Pain Relief', 'pcs', 'PO12359', 'Pain reliever and stimulant', '2025-03-31', 'C3'),
    ('MED016', 'Ambroxol', 150, 'Active', 15.00, 22.00, 'Mucolytic', 'pcs', 'PO12360', 'Breaks down mucus in lungs', '2025-07-31', 'D3'),
    ('MED017', 'Carbocisteine', 140, 'Active', 18.00, 25.00, 'Mucolytic', 'pcs', 'PO12361', 'Used for clearing mucus', '2025-11-30', 'E3'),
    ('MED018', 'Vitamin C', 200, 'Active', 6.00, 10.00, 'Vitamin Supplement', 'pcs', 'PO12362', 'Boosts immune system', '2026-12-31', 'F3'),
    ('MED019', 'Calcium Carbonate', 160, 'Active', 10.00, 15.00, 'Calcium Supplement', 'pcs', 'PO12363', 'Improves bone health', '2026-03-31', 'A4'),
    ('MED020', 'Vitamin D', 150, 'Active', 12.00, 20.00, 'Vitamin Supplement', 'pcs', 'PO12364', 'Supports calcium absorption', '2026-05-31', 'B4'),
    ('MED021', 'Laxative', 90, 'Active', 7.00, 12.00, 'Digestive Health', 'pcs', 'PO12365', 'Relieves constipation', '2025-12-31', 'C4'),
    ('MED022', 'Tamsulosin', 50, 'Active', 35.00, 50.00, 'Prostate Health', 'pcs', 'PO12366', 'Improves urinary flow', '2025-01-31', 'D4'),
    ('MED023', 'Levocetirizine', 80, 'Active', 12.00, 18.00, 'Antihistamine', 'pcs', 'PO12367', 'Used for allergy relief', '2025-06-30', 'E4'),
    ('MED024', 'Lidocaine', 70, 'Active', 30.00, 40.00, 'Local Anesthetic', 'pcs', 'PO12368', 'Relieves pain locally', '2025-08-31', 'F4');

CREATE TABLE pharmacy_customers (
    customer_id SERIAL PRIMARY KEY,        -- Unique ID for each customer
    full_name VARCHAR(100) NOT NULL,       -- Full name of the customer (required for prescriptions)
    contact_number VARCHAR(15),            -- Optional contact number
    date_of_birth DATE,                    -- Optional, useful for prescriptions requiring age verification
    senior_or_pwd VARCHAR(3),              -- 'Yes' or 'No' to indicate Senior/PWD status for discount eligibility
    status VARCHAR(20) DEFAULT 'Active',   -- Status (Active, Pending, etc.)
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When the customer registered
);

CREATE TABLE medicine_bought (
    purchase_id SERIAL PRIMARY KEY,        -- Unique purchase record ID
    customer_id INT,                       -- Foreign key to pharmacy_customers table
    medicine_id INT,                       -- Foreign key to medicines table
    quantity INT NOT NULL,                 -- Quantity of the medicine bought
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date of the purchase
    FOREIGN KEY (customer_id) REFERENCES pharmacy_customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);

select * from pharmacy_customers;
select * from medicine_bought;
drop table pharmacy_customers;
drop table medicine_bought;