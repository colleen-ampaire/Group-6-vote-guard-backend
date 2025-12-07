const express = require('express');
const { applyForPosition, getCandidates, updateStatus } = require('../controllers/candidateController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/apply', authMiddleware, applyForPosition);
router.get('/', authMiddleware, getCandidates);
router.patch('/:id/status', authMiddleware, updateStatus); // TODO: Add Officer check

module.exports = router;
