const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // This uses SERVICE KEY

// Register new staff - No authentication needed for this route
// The SERVICE KEY in supabase client handles it
router.post('/register', async (req, res) => {
    const { email, password, full_name, phone, designation, role_id, department_id, creator_id } = req.body;

    console.log('Register request received for:', email);

    // Validations
    if (!email || !password || !full_name || !role_id || !department_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Create auth user using SERVICE ROLE (bypasses auth)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email.toLowerCase().trim(),
            password: password,
            email_confirm: true,
            user_metadata: { full_name }
        });
        
        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({ error: authError.message });
        }
        
        // Create user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .insert([{
                auth_id: authUser.user.id,
                email: email.toLowerCase().trim(),
                full_name: full_name.trim(),
                phone: phone || null,
                designation: designation || null,
                role_id: parseInt(role_id),
                department_id: parseInt(department_id),
                is_active: true
            }])
            .select();
        
        if (profileError) {
            // Rollback - delete the auth user
            await supabase.auth.admin.deleteUser(authUser.user.id);
            console.error('Profile error:', profileError);
            return res.status(400).json({ error: profileError.message });
        }

        // 🏛️ AUDIT LOG ENTRY INTEGRATION
        // ලියාපදිංචි කළ ක්‍රියාව විගණන සටහනට එකතු කිරීම
        await supabase.from('audit_logs').insert([{
            user_id: creator_id || null, 
            action: 'REGISTER_NEW_STAFF',
            entity_type: 'users',
            entity_id: userProfile[0].id,
            created_at: new Date().toISOString()
        }]);
        
        console.log('User registered successfully:', email);
        res.json({ 
            success: true, 
            message: 'Staff registered successfully',
            data: userProfile[0] 
        });
        
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all staff - This still needs authentication
router.get('/all', async (req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select('*, roles(role_name), departments(department_name, department_type)')
        .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

module.exports = router;