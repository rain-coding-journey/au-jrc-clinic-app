-- Student Electronic Health Records (EHR)
CREATE TABLE IF NOT EXISTS student_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    allergies TEXT[] DEFAULT '{}',
    existing_conditions TEXT[] DEFAULT '{}',
    current_medications TEXT[] DEFAULT '{}',
    blood_type VARCHAR(5),
    immunization_history JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key lookup index
CREATE INDEX idx_health_records_student_id ON student_health_records(student_id);