// server/src/controllers/inventoryController.js
const db = require('../config/db'); // Adjust path based on your db connection export

// Get all medications with stock levels and low-stock alerts
exports.getAllInventory = async (req, res) => {
  try {
    const query = `
      SELECT 
        medication_id, name, dosage_form, strength, standard_unit, stock_quantity, reorder_threshold,
        CASE WHEN stock_quantity <= reorder_threshold THEN true ELSE false END AS is_low_stock
      FROM medications
      WHERE is_active = true
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory items.' });
  }
};

// Manually adjust stock (restock, damaged, expired)
exports.adjustStock = async (req, res) => {
  const { medication_id, change_quantity, reason, notes } = req.body;
  const staff_id = req.user?.id || '00000000-0000-0000-0000-000000000000'; // From auth middleware

  try {
    await db.query('BEGIN');

    // Update stock quantity
    const updateRes = await db.query(
      `UPDATE medications 
       SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE medication_id = $2 RETURNING *`,
      [change_quantity, medication_id]
    );

    // Record adjustment in ledger
    await db.query(
      `INSERT INTO inventory_adjustments (medication_id, staff_id, change_quantity, reason, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [medication_id, staff_id, change_quantity, reason, notes]
    );

    await db.query('COMMIT');
    res.json({ message: 'Stock updated successfully', item: updateRes.rows[0] });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adjusting stock:', error);
    res.status(500).json({ error: 'Failed to update stock.' });
  }
};