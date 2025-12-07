const prisma = require('../prisma');
const fs = require('fs');
const csv = require('csv-parser');
const logAction = require('../utils/auditLogger');

const importVoters = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Process results
      let successCount = 0;
      for (const row of results) {
        try {
          // Expected format: reg_no,name,email,phone,program,status
          await prisma.eligibleVoter.upsert({
            where: { reg_no: row.reg_no },
            update: {
              name: row.name,
              email: row.email,
              phone: row.phone,
              program: row.program,
              status: row.status || 'ELIGIBLE',
            },
            create: {
              reg_no: row.reg_no,
              name: row.name,
              email: row.email,
              phone: row.phone,
              program: row.program,
              status: row.status || 'ELIGIBLE',
            },
          });
          successCount++;
        } catch (error) {
          errors.push({ row, error: error.message });
        }
      }

      // Cleanup file
      fs.unlinkSync(req.file.path);

      // Log action
      if (req.user) {
        await logAction(req.user.id, 'IMPORT_VOTERS', 'EligibleVoter', 'BATCH', { count: successCount, errors: errors.length });
      }

      res.json({ 
        message: 'Import processing complete', 
        successCount, 
        errorCount: errors.length,
        errors 
      });
    });
};

const getVoters = async (req, res) => {
  try {
    const voters = await prisma.eligibleVoter.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(voters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching voters' });
  }
};

module.exports = { importVoters, getVoters };
