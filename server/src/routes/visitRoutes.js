const express = require('express');
const router = express.Router();
const { createVisit, getRecentVisits } = require('../controllers/visitController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbac');
const { logAudit } = require('../middleware/auditLogger');

router.use(verifyToken);

router.post(
  '/', 
  checkRole(['SUPER_ADMIN', 'CLINIC_STAFF', 'NURSE', 'PHYSICIAN']), 
  logAudit('CREATE_CLINIC_VISIT', 'CLINIC_VISIT'),
  createVisit
);

router.get(
  '/recent', 
  checkRole(['SUPER_ADMIN', 'CLINIC_STAFF', 'NURSE', 'PHYSICIAN', 'EDUCATOR']), 
  getRecentVisits
);

module.exports = router;