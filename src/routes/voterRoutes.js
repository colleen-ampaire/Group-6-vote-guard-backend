const express = require('express');
const multer = require('multer');
const { importVoters, getVoters } = require('../controllers/voterController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/import', authMiddleware, upload.single('file'), importVoters);
router.get('/', authMiddleware, getVoters);

module.exports = router;
