const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/positions', require('./src/routes/positionRoutes'));
app.use('/api/candidates', require('./src/routes/candidateRoutes'));
app.use('/api/voters', require('./src/routes/voterRoutes'));
app.use('/api/verify', require('./src/routes/verificationRoutes'));
app.use('/api/vote', require('./src/routes/voteRoutes'));
app.use('/api/public', require('./src/routes/dashboardRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

app.get('/', (req, res) => {
  res.send('Voteguard API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
