const prisma = require('../prisma');
const logAction = require('../utils/auditLogger');

const applyForPosition = async (req, res) => {
  try {
    const { position_id, manifesto_url, photo_url } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if already applied
    const existing = await prisma.candidate.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied for a position' });
    }

    const candidate = await prisma.candidate.create({
      data: {
        user_id: userId,
        position_id: parseInt(position_id),
        manifesto_url,
        photo_url,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error applying for position' });
  }
};

const getCandidates = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        user: { select: { email: true } },
        position: { select: { name: true } },
      },
    });
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching candidates' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id: parseInt(id) },
      data: { status, reason },
    });

    // Log to AuditLog
    await logAction(req.user.id, 'UPDATE_CANDIDATE_STATUS', 'Candidate', candidate.id, { status, reason });

    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating status' });
  }
};

module.exports = { applyForPosition, getCandidates, updateStatus };
