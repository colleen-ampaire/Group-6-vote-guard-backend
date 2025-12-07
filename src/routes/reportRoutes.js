const express = require('express');
const { downloadTurnoutReport, downloadResultsReport, downloadAuditLog } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All reports require Admin access
// TODO: Add Admin check middleware or check in controller
router.get('/turnout', authMiddleware, downloadTurnoutReport);
router.get('/results', authMiddleware, downloadResultsReport);
router.get('/audit', authMiddleware, downloadAuditLog);

module.exports = router;
