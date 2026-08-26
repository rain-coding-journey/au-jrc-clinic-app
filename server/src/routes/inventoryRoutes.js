// server/src/routes/inventory.routes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// GET /api/v1/inventory - Get all medications & stock status
router.get('/', inventoryController.getAllInventory);

// POST /api/v1/inventory/adjust - Restock or write off stock
router.post('/adjust', inventoryController.adjustStock);

module.exports = router;