const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Staff Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        return res.status(401).json({ error: error.message });
    }
    
    // Get user details
    const { data: userData } = await supabase
        .from('users')
        .select('*, roles(role_name), departments(department_name, department_type)')
        .eq('auth_id', data.user.id)
        .single();
    
    res.json({
        success: true,
        token: data.session.access_token,
        user: {
            id: data.user.id,
            email: data.user.email,
            full_name: userData?.full_name,
            role: userData?.roles?.role_name,
            department: userData?.departments?.department_name,
            department_type: userData?.departments?.department_type
        }
    });
});

// Change Password
router.post('/change-password', authenticate, async (req, res) => {
    const { current_password, new_password } = req.body;
    
    const { error } = await supabase.auth.updateUser({
        password: new_password
    });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, message: 'Password changed successfully' });
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
        await supabase.auth.admin.signOut(token);
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;