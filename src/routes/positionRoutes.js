const express = require('express');
const { createPosition, getPositions, deletePosition } = require('../controllers/positionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPosition);
router.get('/', getPositions); // Public read? Or auth required? Let's make it public for now or auth.
router.delete('/:id', authMiddleware, deletePosition);

module.exports = router;
