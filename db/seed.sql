-- Seed Admin and Clinic Nurse (Password is 'Password123!')
-- Hash generated using bcrypt cost 10
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@arellano.edu.ph', '$2b$10$wT14M.e1P2yN8aK6E8L1.u4z4fE9iXv6K1L2M3N4O5P6Q7R8S9T0U', 'System Admin', 'SUPER_ADMIN'),
('22222222-2222-2222-2222-222222222222', 'nurse.jrc@arellano.edu.ph', '$2b$10$wT14M.e1P2yN8aK6E8L1.u4z4fE9iXv6K1L2M3N4O5P6Q7R8S9T0U', 'Nurse Joy - JRC', 'NURSE')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Student
INSERT INTO students (id, student_number, first_name, last_name, gender, date_of_birth, academic_level, strand_or_course, emergency_contact_name, emergency_contact_relation, emergency_contact_phone) VALUES
('33333333-3333-3333-3333-333333333333', '2026-10492', 'Juan', 'Dela Cruz', 'Male', '2008-05-15', 'Senior High School', '11-ICT-1A', 'Maria Dela Cruz', 'Mother', '09171234567')
ON CONFLICT (student_number) DO NOTHING;

-- Seed Health Record
INSERT INTO student_health_records (student_id, allergies, existing_conditions, blood_type) VALUES
('33333333-3333-3333-3333-333333333333', ARRAY['Penicillin', 'Peanuts'], ARRAY['Asthma'], 'O+')
ON CONFLICT (student_id) DO NOTHING;