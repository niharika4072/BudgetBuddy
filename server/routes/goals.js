// server/routes/goals.js
const express  = require('express');
const supabase = require('../db');
const auth     = require('../middleware');
const router   = express.Router();

// GET all goals for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ goals: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, target, saved, monthly, deadline, priority } = req.body;

    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{
        user_id: req.user.id,
        name,
        icon: icon || '🎯',
        target,
        saved: saved || 0,
        monthly: monthly || 0,
        deadline: deadline || null,
        priority: priority || 'medium'
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, target, saved, monthly, deadline, priority } = req.body;

    const { data, error } = await supabase
      .from('savings_goals')
      .update({ name, icon, target, saved, monthly, deadline, priority })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEPOSIT into a goal
router.post('/:id/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Get current goal
    const { data: goal } = await supabase
      .from('savings_goals')
      .select('saved')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const newSaved = parseFloat(goal.saved) + parseFloat(amount);

    // Update saved amount
    const { data, error } = await supabase
      .from('savings_goals')
      .update({ saved: newSaved })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Record deposit in history
    await supabase
      .from('goal_deposits')
      .insert([{
        goal_id: req.params.id,
        user_id: req.user.id,
        amount
      }]);

    res.json({ goal: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;