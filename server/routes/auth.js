// server/routes/auth.js
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase = require('../db');
const router   = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password,
            avatar, role, dob, city,
            income, fixed, savings, goalType } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name, email, phone,
        password: hashed,
        avatar, role, dob, city,
        income,
        fixed_exp: fixed,
        savings_target: savings,
        goal_type: goalType
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { name: user.name, email: user.email } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ error: 'No account with this email' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { name: user.name, email: user.email } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;