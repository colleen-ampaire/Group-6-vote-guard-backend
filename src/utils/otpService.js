const crypto = require('crypto');

// In-memory store for OTPs (for demo purposes)
// In production, use Redis or Database with expiration
const otpStore = new Map();

const generateOTP = (identifier) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  
  // Store hash with expiration (5 mins)
  otpStore.set(identifier, { hash, expires: Date.now() + 5 * 60 * 1000 });
  
  // Mock sending OTP (Log to console)
  console.log(`[OTP SERVICE] OTP for ${identifier}: ${otp}`);
  
  return otp;
};

const verifyOTP = (identifier, otp) => {
  const record = otpStore.get(identifier);
  
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(identifier);
    return false;
  }
  
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  if (hash === record.hash) {
    otpStore.delete(identifier); // Consume OTP
    return true;
  }
  
  return false;
};

module.exports = { generateOTP, verifyOTP };
