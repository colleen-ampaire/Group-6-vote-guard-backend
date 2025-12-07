const prisma = require('../prisma');
const crypto = require('crypto');
const logAction = require('../utils/auditLogger');

const getBallotData = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token exists and is valid
    const verification = await prisma.verification.findFirst({
      where: { ballot_token: tokenHash },
    });

    if (!verification) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (verification.consumed_at) {
      return res.status(403).json({ message: 'Ballot already consumed' });
    }

    // Fetch positions and candidates
    const positions = await prisma.position.findMany({
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          include: { user: { select: { email: true } } } // Maybe show name if available
        }
      }
    });

    res.json({ positions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching ballot data' });
  }
};

const castVote = async (req, res) => {
  try {
    const { votes } = req.body; // Array of { position_id, candidate_id }
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Transaction to ensure atomicity
    await prisma.$transaction(async (prisma) => {
      // 1. Validate Token
      const verification = await prisma.verification.findFirst({
        where: { ballot_token: tokenHash },
      });

      if (!verification) throw new Error('Invalid token');
      if (verification.consumed_at) throw new Error('Ballot already consumed');

      // 2. Create Ballot Record
      const ballot = await prisma.ballot.create({
        data: {
          token_hash: tokenHash,
          consumed_at: new Date(),
        }
      });

      // 3. Record Votes
      for (const v of votes) {
        await prisma.vote.create({
          data: {
            ballot_id: ballot.id,
            position_id: parseInt(v.position_id),
            candidate_id: parseInt(v.candidate_id),
          }
        });
      }

      // 4. Invalidate Token (Mark as consumed in Verifications)
      await prisma.verification.update({
        where: { id: verification.id },
        data: { consumed_at: new Date() }
      });
    });

    await logAction(null, 'CAST_VOTE', 'Ballot', 'HIDDEN', { count: votes.length });

    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Error casting vote' });
  }
};

module.exports = { getBallotData, castVote };
