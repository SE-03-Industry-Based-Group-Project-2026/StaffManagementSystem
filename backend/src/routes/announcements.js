const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

// Send announcement (Admin only)
router.post('/send', authenticate, checkRole(['Admin', 'Secretary', 'Chairman', 'Praja Officer']), async (req, res) => {
    const { title, message, department_id, scheduled_at, expires_at } = req.body;
    
    const { data, error } = await supabase
        .from('announcements')
        .insert([{
            title,
            message,
            department_id: department_id || null,
            created_by: req.userData.id,
            scheduled_at: scheduled_at || new Date(),
            expires_at: expires_at || null,
            created_at: new Date()
        }])
        .select()
        .single();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    // Get users to notify
    let userQuery = supabase.from('users').select('id');
    
    if (department_id) {
        userQuery = userQuery.eq('department_id', department_id);
    }
    
    const { data: users } = await userQuery;
    
    // Create notifications for all users
    if (users && users.length > 0) {
        const notifications = users.map(user => ({
            user_id: user.id,
            title: 'New Announcement',
            message: title,
            is_auto_generated: true,
            created_at: new Date()
        }));
        
        await supabase.from('notifications').insert(notifications);
    }
    
    router.put('/:id', authenticate, checkRole(['Admin','Secretary','Chairman','Praja Officer']), async (req,res) => {
  const { title, message, department_id, scheduled_at, expires_at } = req.body;

  const { data, error } = await supabase
    .from('announcements')
    .update({
      title,
      message,
      department_id,
      scheduled_at,
      expires_at,
      updated_at: new Date()
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  await supabase.from('audit_logs').insert([{
    user_id: req.userData.id,
    action: 'EDIT_ANNOUNCEMENT',
    entity_type: 'announcements',
    entity_id: req.params.id
  }]);

  res.json({ success: true, data });
});
router.delete('/:id', authenticate, checkRole(['Admin','Secretary','Chairman','Praja Officer']), async (req,res) => {

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  await supabase.from('audit_logs').insert([{
    user_id: req.userData.id,
    action: 'DELETE_ANNOUNCEMENT',
    entity_type: 'announcements',
    entity_id: req.params.id
  }]);

  res.json({ success: true });
});
    // Log audit
    await supabase.from('audit_logs').insert([{
        user_id: req.userData.id,
        action: 'SEND_ANNOUNCEMENT',
        entity_type: 'announcements',
        entity_id: data.id
    }]);
    
    res.json({ success: true, data });
});

// Get announcements (Staff)
router.get('/', authenticate, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('department_id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
  .from('announcements')
  .select('*, users(full_name), departments(department_name)')
  .or(`department_id.is.null,department_id.eq.${user.department_id}`)
  .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
  .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

module.exports = router;