const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

// Send notification (Admin)
router.post('/send', authenticate, checkRole(['Admin', 'Supervisor']), async (req, res) => {
    const { user_id, title, message } = req.body;
    
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            user_id,
            title,
            message,
            is_read: false,
            is_auto_generated: false,
            created_by: req.userData.id,
            created_at: new Date()
        }])
        .select();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, data });
});

// Get my notifications (Staff)
router.get('/my', authenticate, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Mark notification as read
router.put('/read/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date() })
        .eq('id', id)
        .select();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true });
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date() })
        .eq('user_id', user.id)
        .eq('is_read', false);
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true });
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ count });
});

module.exports = router;