const prisma = require('../prisma');
const generateCSV = require('../utils/csvGenerator');

const downloadTurnoutReport = async (req, res) => {
  try {
    const voters = await prisma.eligibleVoter.findMany({
      include: { verification: true }
    });

    const data = voters.map(v => ({
      RegNo: v.reg_no,
      Name: v.name,
      Program: v.program,
      Status: v.status,
      Verified: v.verification ? 'Yes' : 'No',
      VerifiedAt: v.verification?.verified_at ? new Date(v.verification.verified_at).toLocaleString() : '',
      Voted: v.verification?.consumed_at ? 'Yes' : 'No'
    }));

    const csv = generateCSV(data, ['RegNo', 'Name', 'Program', 'Status', 'Verified', 'VerifiedAt', 'Voted']);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('turnout_report.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report');
  }
};

const downloadResultsReport = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      include: {
        candidates: {
          include: {
            user: { select: { email: true } },
            _count: { select: { votes: true } }
          }
        }
      }
    });

    const data = [];
    positions.forEach(p => {
      p.candidates.forEach(c => {
        data.push({
          Position: p.name,
          Candidate: c.user.email,
          Votes: c._count.votes
        });
      });
    });

    const csv = generateCSV(data, ['Position', 'Candidate', 'Votes']);

    res.header('Content-Type', 'text/csv');
    res.attachment('results_report.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report');
  }
};

const downloadAuditLog = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      include: { actor: { select: { email: true } } }
    });

    const data = logs.map(l => ({
      ID: l.id,
      Timestamp: new Date(l.created_at).toLocaleString(),
      Actor: l.actor?.email || 'System',
      Action: l.action,
      Entity: l.entity,
      EntityID: l.entity_id,
      Details: JSON.stringify(l.payload)
    }));

    const csv = generateCSV(data, ['ID', 'Timestamp', 'Actor', 'Action', 'Entity', 'EntityID', 'Details']);

    res.header('Content-Type', 'text/csv');
    res.attachment('audit_log.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report');
  }
};

module.exports = { downloadTurnoutReport, downloadResultsReport, downloadAuditLog };
