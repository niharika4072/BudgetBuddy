// server/routes/expenses.js
const express  = require('express');
const supabase = require('../db');
const auth     = require('../middleware');
const router   = express.Router();

console.log('EXPENSES ROUTER LOADED');

// GET all expenses
// ✅ Fixed — add auth
router.get('/', auth, (req, res) => {
  supabase
    .from('expenses')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ expenses: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// ADD expense
router.post('/', auth, (req, res) => {
  const { amount, description, category, date } = req.body;
  supabase
    .from('expenses')
    .insert([{
      user_id: req.user.id,
      amount, description, category,
      date: date || new Date().toISOString()
    }])
    .select()
    .single()
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ expense: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// DELETE expense
router.delete('/:id', auth, (req, res) => {
  supabase
    .from('expenses')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .then(({ error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;