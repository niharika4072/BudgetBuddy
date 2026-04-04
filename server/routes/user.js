// server/routes/user.js
const express  = require('express');
const supabase = require('../db');
const auth     = require('../middleware');
const router   = express.Router();

// GET profile
router.get('/me', auth, (req, res) => {
  supabase
    .from('users')
    .select('name, email, phone, avatar, role, dob, city, income, fixed_exp, savings_target, goal_type, created_at')
    .eq('id', req.user.id)
    .single()
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ user: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// UPDATE profile
router.put('/update', auth, (req, res) => {
  const { name, phone, city, income, fixed_exp, savings_target, avatar } = req.body;
  const updates = {};
  if (name !== undefined)           updates.name = name;
  if (phone !== undefined)          updates.phone = phone;
  if (city !== undefined)           updates.city = city;
  if (income !== undefined)         updates.income = income;
  if (fixed_exp !== undefined)      updates.fixed_exp = fixed_exp;
  if (savings_target !== undefined) updates.savings_target = savings_target;
  if (avatar !== undefined)         updates.avatar = avatar;

  supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single()
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ user: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;