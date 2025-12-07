const prisma = require('../prisma');
const { generateOTP, verifyOTP } = require('../utils/otpService');
const jwt = require('jsonwebtoken');
const logAction = require('../utils/auditLogger');
const crypto = require('crypto');

const requestOTP = async (req, res) => {
  try {
    const { reg_no, method } = req.body; // method: 'email' or 'phone'

    // Check eligibility
    const voter = await prisma.eligibleVoter.findUnique({
      where: { reg_no },
    });

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found in eligibility list' });
    }

    if (voter.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Voter is blocked' });
    }

    // Check if already voted (check Verification table)
    const existingVerification = await prisma.verification.findUnique({
      where: { voter_id: voter.id },
    });

    if (existingVerification && existingVerification.consumed_at) {
      return res.status(400).json({ message: 'Ballot already consumed' });
    }

    // Generate OTP
    // Use email or phone as identifier for OTP service
    const identifier = method === 'email' ? voter.email : voter.phone;
    if (!identifier) {
      return res.status(400).json({ message: `No ${method} on record for this voter` });
    }

    generateOTP(identifier);

    // Log attempt
    // await logAction(null, 'REQUEST_OTP', 'Voter', voter.id, { method });

    res.json({ message: `OTP sent to ${method} on file` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error requesting OTP' });
  }
};

const verifyAndGetToken = async (req, res) => {
  try {
    const { reg_no, otp, method } = req.body;

    const voter = await prisma.eligibleVoter.findUnique({
      where: { reg_no },
    });

    if (!voter) return res.status(404).json({ message: 'Voter not found' });

    const identifier = method === 'email' ? voter.email : voter.phone;
    const isValid = verifyOTP(identifier, otp);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate Single-Use Ballot Token
    // We'll create a random token string, hash it for storage, and send plain to user
    const ballotToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(ballotToken).digest('hex');

    // Store in Verifications table
    await prisma.verification.upsert({
      where: { voter_id: voter.id },
      update: {
        otp_hash: 'verified', // simplified
        ballot_token: tokenHash,
        verified_at: new Date(),
      },
      create: {
        voter_id: voter.id,
        otp_hash: 'verified',
        ballot_token: tokenHash,
        verified_at: new Date(),
        issued_at: new Date(),
      },
    });

    // Also create a Ballot record (unlinked to voter identity ideally, but for now we link via token)
    // Actually, to keep it secret, we might just validate the token at vote time.
    // But we need to track if it's used. The Verification table tracks issuance.
    // The Ballot table tracks consumption.

    await logAction(null, 'VERIFY_SUCCESS', 'Voter', voter.id, { method });

    res.json({ message: 'Verification successful', ballotToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

module.exports = { requestOTP, verifyAndGetToken };
