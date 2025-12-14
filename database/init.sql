-- Create Database
CREATE DATABASE IF NOT EXISTS medical_health_record;
USE medical_health_record;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
    patient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_unique_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    allergies LONGTEXT,
    medical_history LONGTEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_unique_id (patient_unique_id)
);

-- Create Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_unique_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    experience_years INT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_license (license_number)
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    appointment_time DATETIME NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Create Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    record_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    record_unique_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    diagnosis VARCHAR(255) NOT NULL,
    treatment_plan LONGTEXT NOT NULL,
    medications LONGTEXT,
    test_results LONGTEXT,
    record_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_record_type (record_type)
);

-- Create Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prescription_unique_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration_days INT NOT NULL,
    instructions LONGTEXT,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_expiry_date (expiry_date)
);

-- Insert sample data
INSERT INTO patients (patient_unique_id, first_name, last_name, email, phone_number, date_of_birth, gender, address, city, state, zip_code, blood_group) VALUES
('PAT-001', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '9876543210', '1990-05-15', 'Male', '123 MG Road', 'Bangalore', 'Karnataka', '560001', 'O+'),
('PAT-002', 'Priya', 'Singh', 'priya.singh@email.com', '9876543211', '1992-08-22', 'Female', '456 Brigade Road', 'Bangalore', 'Karnataka', '560002', 'A+'),
('PAT-003', 'Arun', 'Patel', 'arun.patel@email.com', '9876543212', '1985-03-10', 'Male', '789 Indiranagar', 'Bangalore', 'Karnataka', '560008', 'B+');

INSERT INTO doctors (doctor_unique_id, first_name, last_name, email, phone_number, specialization, license_number, hospital_name, experience_years) VALUES
('DOC-001', 'Dr. Amit', 'Sharma', 'amit.sharma@hospital.com', '9876543220', 'Cardiologist', 'MCI-001', 'Apollo Hospital', 15),
('DOC-002', 'Dr. Neha', 'Gupta', 'neha.gupta@hospital.com', '9876543221', 'General Practitioner', 'MCI-002', 'Fortis Hospital', 10),
('DOC-003', 'Dr. Vikram', 'Singh', 'vikram.singh@hospital.com', '9876543222', 'Orthopedist', 'MCI-003', 'Max Hospital', 12);

COMMIT;
