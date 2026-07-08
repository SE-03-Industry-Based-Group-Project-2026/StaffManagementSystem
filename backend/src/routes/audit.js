const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

// Get audit logs (Admin only)
router.get('/', authenticate, checkRole(['Admin']), async (req, res) => {
    const { start_date, end_date, user_id, action } = req.query;
    
    let query = supabase
        .from('audit_logs')
        .select('*, users(full_name, email)')
        .order('created_at', { ascending: false });
    
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (user_id) query = query.eq('user_id', user_id);
    if (action) query = query.eq('action', action);
    
    const { data, error } = await query;
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Get audit log by entity
router.get('/entity/:entity_type/:entity_id', authenticate, checkRole(['Admin']), async (req, res) => {
    const { entity_type, entity_id } = req.params;
    
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users(full_name)')
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

module.exports = router;