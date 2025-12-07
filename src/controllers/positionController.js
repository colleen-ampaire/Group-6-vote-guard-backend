const logAction = require('../utils/auditLogger');

const createPosition = async (req, res) => {
  try {
    const { name, seats, opens_at, closes_at } = req.body;
    
    const position = await prisma.position.create({
      data: {
        name,
        seats: parseInt(seats),
        opens_at: new Date(opens_at),
        closes_at: new Date(closes_at),
      },
    });

    // Log action
    // Assuming req.user exists from auth middleware (need to add middleware to routes)
    if (req.user) {
      await logAction(req.user.id, 'CREATE_POSITION', 'Position', position.id, { name });
    }

    res.status(201).json(position);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating position' });
  }
};

const getPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching positions' });
  }
};

const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.position.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Position deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting position' });
  }
};

module.exports = { createPosition, getPositions, deletePosition };
