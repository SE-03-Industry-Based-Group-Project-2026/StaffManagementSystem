const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

// Mark attendance (Department Head, Secretary, Admin)
router.post('/mark', authenticate, checkRole(['Department Head', 'Secretary', 'Chairman']), async (req, res) => {
    const { user_id, date, check_in, check_out, status, remarks } = req.body;
    
    const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
        .from('attendance')
        .upsert([{
            user_id,
            date,
            check_in,
            check_out,
            status,
            remarks,
            marked_by: currentUser.id,
            is_auto_marked: false
        }])
        .select();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, data });
});

// Get attendance for a date
router.get('/date/:date', authenticate, async (req, res) => {
    const { date } = req.params;
    const { data: currentUser } = await supabase
        .from('users')
        .select('role_id, department_id, roles(role_name)')
        .eq('auth_id', req.user.id)
        .single();
    
    let query = supabase
        .from('attendance')
        .select('*, users(full_name, email, department_id, departments(department_name, department_type))')
        .eq('date', date);
    
    const roleName = currentUser?.roles?.role_name;
    
    if (roleName === 'Department Head') {
        query = query.eq('users.department_id', currentUser.department_id);
    } else if (roleName === 'Praja Officer') {
        query = query.in('users.departments.department_type', ['Library', 'Preschool']);
    }
    
    const { data, error } = await query;
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Get my attendance (Staff)
router.get('/my-attendance', authenticate, checkRole(['Staff']), async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Edit attendance record
router.put('/:id', authenticate, checkRole(['Department Head', 'Secretary', 'Chairman']), async (req, res) => {
    const { id } = req.params;
    const { check_in, check_out, status, remarks } = req.body;
    
    const { data, error } = await supabase
        .from('attendance')
        .update({ check_in, check_out, status, remarks })
        .eq('id', id)
        .select();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, data });
});

module.exports = router;