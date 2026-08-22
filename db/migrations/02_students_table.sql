-- Students / Patients Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number VARCHAR(50) UNIQUE NOT NULL, -- AU Student Number
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    academic_level VARCHAR(50) NOT NULL, -- E.g., Senior High School, College
    strand_or_course VARCHAR(100),       -- E.g., 11-ICT-1A, BSIT
    contact_number VARCHAR(20),
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_relation VARCHAR(50) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast student search by ID
CREATE INDEX idx_students_student_number ON students(student_number);