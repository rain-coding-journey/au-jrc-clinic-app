const db = require('../../config/db');

const getStudentByNumber = async (req, res) => {
  const { student_number } = req.params;

  try {
    const query = `
      SELECT s.*, 
             shr.allergies, shr.existing_conditions, shr.current_medications, shr.blood_type, shr.immunization_history
      FROM students s
      LEFT JOIN student_health_records shr ON s.id = shr.student_id
      WHERE s.student_number = $1
    `;
    const { rows } = await db.query(query, [student_number]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student record not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get Student Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getStudentByNumber };