-- Clinic Visit Logs and Vitals
CREATE TABLE IF NOT EXISTS clinic_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    attending_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    visit_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT NOT NULL,
    temperature_celsius NUMERIC(4,1),
    blood_pressure VARCHAR(15),
    pulse_rate_bpm INT,
    respiratory_rate INT,
    treatment_given TEXT,
    medication_administered TEXT,
    disposition VARCHAR(100) NOT NULL, -- E.g., "Returned to Class", "Sent Home"
    notes TEXT
);

-- Indexes for frequent queries
CREATE INDEX idx_clinic_visits_student_id ON clinic_visits(student_id);
CREATE INDEX idx_clinic_visits_timestamp ON clinic_visits(visit_timestamp DESC);