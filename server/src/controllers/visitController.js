const db = require('../../config/db');

const createVisit = async (req, res) => {
  const {
    student_id,
    chief_complaint,
    temperature_celsius,
    blood_pressure,
    pulse_rate_bpm,
    respiratory_rate,
    treatment_given,
    medication_administered,
    disposition,
    notes
  } = req.body;

  const attending_staff_id = req.user.id;

  try {
    const insertQuery = `
      INSERT INTO clinic_visits 
      (student_id, attending_staff_id, chief_complaint, temperature_celsius, blood_pressure, pulse_rate_bpm, respiratory_rate, treatment_given, medication_administered, disposition, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      student_id,
      attending_staff_id,
      chief_complaint,
      temperature_celsius,
      blood_pressure,
      pulse_rate_bpm,
      respiratory_rate,
      treatment_given,
      medication_administered,
      disposition,
      notes
    ];

    const { rows } = await db.query(insertQuery, values);
    const newVisit = rows[0];

    // High fever alert check
    const alertTriggered = temperature_celsius && parseFloat(temperature_celsius) >= 38.5;

    res.status(201).json({
      status: 'success',
      message: 'Visit record logged successfully.',
      data: newVisit,
      alert_triggered: alertTriggered,
      alert_message: alertTriggered ? 'High temperature alert flagged for this patient.' : null
    });
  } catch (error) {
    console.error('Create Visit Error:', error);
    res.status(500).json({ message: 'Failed to record clinic visit.' });
  }
};

const getRecentVisits = async (req, res) => {
  try {
    const query = `
      SELECT cv.*, s.first_name, s.last_name, s.student_number, s.strand_or_course
      FROM clinic_visits cv
      JOIN students s ON cv.student_id = s.id
      ORDER BY cv.visit_timestamp DESC
      LIMIT 20;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Get Recent Visits Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { createVisit, getRecentVisits };