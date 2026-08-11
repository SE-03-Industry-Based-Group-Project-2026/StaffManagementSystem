const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

function createAuthClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is missing');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });

    if (error || !data?.user || !data?.session) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        roles(role_name),
        departments(department_name, department_type)
      `)
      .eq('auth_id', data.user.id)
      .single();

    if (userError || !userData) {
      await supabase.auth.admin.signOut(data.session.access_token, 'global');
      return res.status(404).json({ error: 'Staff profile was not found' });
    }

    if (userData.is_active === false) {
      await supabase.auth.admin.signOut(data.session.access_token, 'global');
      return res.status(403).json({ error: 'This staff account has been deactivated' });
    }

    await supabase.from('audit_logs').insert([
      {
        user_id: userData.id,
        action: 'USER_LOGIN',
        entity_type: 'users',
        entity_id: userData.id,
        created_at: new Date().toISOString()
      }
    ]);

    return res.json({
      success: true,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: userData.id,
        auth_id: data.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        designation: userData.designation,
        role_id: userData.role_id,
        role: userData.roles?.role_name,
        roles: userData.roles,
        department_id: userData.department_id,
        department: userData.departments?.department_name,
        department_type: userData.departments?.department_type,
        departments: userData.departments,
        is_active: userData.is_active,
        signature_url: userData.signature_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (String(new_password).length < 8) {
      return res.status(400).json({ error: 'New password must contain at least 8 characters' });
    }

    if (String(current_password) === String(new_password)) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth_id', req.user.id)
      .single();

    if (userError || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authClient = createAuthClient();
    const { error: verificationError } = await authClient.auth.signInWithPassword({
      email: currentUser.email,
      password: String(current_password)
    });

    if (verificationError) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password: String(new_password) }
    );

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    await supabase.from('audit_logs').insert([
      {
        user_id: currentUser.id,
        action: 'CHANGE_PASSWORD',
        entity_type: 'users',
        entity_id: currentUser.id,
        created_at: new Date().toISOString()
      }
    ]);

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await supabase.auth.admin.signOut(token, 'global');
    }

    if (req.userData?.id) {
      await supabase.from('audit_logs').insert([
        {
          user_id: req.userData.id,
          action: 'USER_LOGOUT',
          entity_type: 'users',
          entity_id: req.userData.id,
          created_at: new Date().toISOString()
        }
      ]);
    }

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.json({ success: true, message: 'Logged out successfully' });
  }
});

module.exports = router;