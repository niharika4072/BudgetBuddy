// server/routes/emergency.js
const express  = require('express');
const supabase = require('../db');
const auth     = require('../middleware');
const router   = express.Router();

// GET emergency fund
router.get('/', auth, (req, res) => {
  supabase
    .from('emergency_fund')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ fund: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// SETUP emergency fund
router.post('/setup', auth, (req, res) => {
  const { expenses, income, contribution, location, months } = req.body;
  const target = expenses * months;
  supabase
    .from('emergency_fund')
    .select('id')
    .eq('user_id', req.user.id)
    .maybeSingle()
    .then(({ data: existing }) => {
      if (existing) {
        return supabase
          .from('emergency_fund')
          .update({ expenses, income, contribution, location, months, target })
          .eq('user_id', req.user.id)
          .select()
          .single();
      } else {
        return supabase
          .from('emergency_fund')
          .insert([{ user_id: req.user.id, expenses, income, contribution, location, months, target, current: 0 }])
          .select()
          .single();
      }
    })
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ fund: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// DEPOSIT
router.post('/deposit', auth, (req, res) => {
  const { amount, note } = req.body;
  supabase
    .from('emergency_fund')
    .select('current')
    .eq('user_id', req.user.id)
    .single()
    .then(({ data: fund, error }) => {
      if (error || !fund) return res.status(404).json({ error: 'Fund not set up' });
      const newCurrent = parseFloat(fund.current) + parseFloat(amount);
      return supabase
        .from('emergency_fund')
        .update({ current: newCurrent })
        .eq('user_id', req.user.id)
        .select()
        .single();
    })
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      supabase.from('emergency_transactions').insert([{ user_id: req.user.id, type: 'deposit', amount, note: note || '' }]);
      res.json({ fund: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// WITHDRAW
router.post('/withdraw', auth, (req, res) => {
  const { amount, note } = req.body;
  supabase
    .from('emergency_fund')
    .select('current')
    .eq('user_id', req.user.id)
    .single()
    .then(({ data: fund, error }) => {
      if (error || !fund) return res.status(404).json({ error: 'Fund not set up' });
      const newCurrent = Math.max(0, parseFloat(fund.current) - parseFloat(amount));
      return supabase
        .from('emergency_fund')
        .update({ current: newCurrent })
        .eq('user_id', req.user.id)
        .select()
        .single();
    })
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      supabase.from('emergency_transactions').insert([{ user_id: req.user.id, type: 'withdrawal', amount, note: note || '' }]);
      res.json({ fund: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// GET transactions
router.get('/transactions', auth, (req, res) => {
  supabase
    .from('emergency_transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false })
    .then(({ data, error }) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ transactions: data });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;