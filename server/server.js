// server/server.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/user');
const expenseRoutes   = require('./routes/expenses');
const goalRoutes      = require('./routes/goals');
const emergencyRoutes = require('./routes/emergency');
console.log(process.env.SUPABASE_URL);
const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/expenses',  expenseRoutes);
app.use('/api/goals',     goalRoutes);
app.use('/api/emergency', emergencyRoutes);
app.get('/ping', (req, res) => res.send('pong'));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});
