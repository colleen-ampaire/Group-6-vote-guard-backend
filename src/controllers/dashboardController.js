const prisma = require('../prisma');

const getStats = async (req, res) => {
  try {
    // Turnout
    const totalEligible = await prisma.eligibleVoter.count({ where: { status: 'ELIGIBLE' } });
    const totalVerified = await prisma.verification.count();
    const totalVoted = await prisma.ballot.count();

    // Results per position
    const positions = await prisma.position.findMany({
      include: {
        candidates: {
          include: {
            user: { select: { email: true } },
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });

    const results = positions.map(p => ({
      id: p.id,
      name: p.name,
      candidates: p.candidates.map(c => ({
        id: c.id,
        name: c.user.email,
        votes: c._count.votes
      }))
    }));

    res.json({
      turnout: {
        eligible: totalEligible,
        verified: totalVerified,
        voted: totalVoted,
      },
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = { getStats };
