const express = require('express');
const { getBallotData, castVote } = require('../controllers/voteController');

const router = express.Router();

router.get('/ballot', getBallotData);
router.post('/', castVote);

module.exports = router;
