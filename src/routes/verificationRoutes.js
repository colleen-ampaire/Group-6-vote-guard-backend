const express = require('express');
const { requestOTP, verifyAndGetToken } = require('../controllers/verificationController');
const { otpLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/otp/request', otpLimiter, requestOTP);
router.post('/otp/verify', verifyAndGetToken);

module.exports = router;
