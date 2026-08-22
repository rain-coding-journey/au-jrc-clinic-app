const express = require('express');
const router = express.Router();
const { getStudentByNumber } = require('../controllers/studentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbac');
const { logAudit } = require('../middleware/auditMiddleware');

router.get(
    '/:student_number',
    verifyToken,
    checkrole(['SUPER_ADMIN', 'CLINIC_STAFF', 'NURSE', 'PHYSICIAN']),
    logAudit('READ_STUDENT_PROFILE', 'STUDENT'),
    getStudentByNumber
);

module.exports = router;