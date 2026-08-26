CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL,
    medication_id UUID NOT NULL REFERENCES medications(medication_id),
    prescribing_staff_id UUID NOT NULL,
    dosage_instructions TEXT NOT NULL,
    quantity_prescribed INT NOT NULL CHECK (quantity_prescribed > 0),
    quantity_dispensed INT NOT NULL DEFAULT 0 CHECK (quantity_dispensed >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    date_prescribed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);