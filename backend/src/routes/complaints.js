const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

// Submit complaint (Staff)
router.post('/submit', authenticate, checkRole(['Staff']), async (req, res) => {
    const { department_id, title, description } = req.body;
    
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
        .from('complaints')
        .insert([{
            user_id: user.id,
            department_id,
            title,
            description,
            status: 'Open',
            created_at: new Date()
        }])
        .select()
        .single();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    // Log audit
    await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: 'SUBMIT_COMPLAINT',
        entity_type: 'complaints',
        entity_id: data.id
    }]);
    
    res.json({ success: true, data });
});

// Get my complaints (Staff)
router.get('/my-complaints', authenticate, checkRole(['Staff']), async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', req.user.id)
        .single();
    
    const { data, error } = await supabase
        .from('complaints')
        .select('*, departments(department_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Get all complaints (Admin/Supervisor)
router.get('/all', authenticate, checkRole(['Supervisor', 'Admin', 'Secretary', 'Chairman', 'Praja Officer']), async (req, res) => {
    let query = supabase
        .from('complaints')
        .select(`
  *,
  users!complaints_user_id_fkey(full_name, email),
  departments!complaints_department_id_fkey(department_name, department_type)
`)
        .order('created_at', { ascending: false });
    
    // Praja Officer sees only Library & Preschool
    if (req.userRole === 'Praja Officer') {
        query = query.in('departments.department_type', ['Library', 'Preschool']);
    }
    
    // Supervisor sees only their department
    if (req.userRole === 'Supervisor') {
        query = query.eq('department_id', req.userData.department_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

// Reply to complaint (Admin/Supervisor)
router.post('/reply', authenticate, checkRole(['Supervisor', 'Admin', 'Secretary', 'Chairman']), async (req, res) => {
    const { complaint_id, reply_message } = req.body;
    
    const { data, error } = await supabase
        .from('complaint_replies')
        .insert([{
            complaint_id,
            replied_by: req.userData.id,
            reply_message,
            created_at: new Date()
        }])
        .select();
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    // Update complaint status
    await supabase
        .from('complaints')
        .update({ status: 'In Progress', updated_at: new Date() })
        .eq('id', complaint_id);
    
    // Get complaint for notification
    const { data: complaint } = await supabase
        .from('complaints')
        .select('user_id')
        .eq('id', complaint_id)
        .single();
    
    // Notify staff
    await supabase.from('notifications').insert([{
        user_id: complaint.user_id,
        title: 'Complaint Reply',
        message: 'A reply has been added to your complaint',
        is_auto_generated: true
    }]);
    
    // Log audit
    await supabase.from('audit_logs').insert([{
        user_id: req.userData.id,
        action: 'REPLY_COMPLAINT',
        entity_type: 'complaint_replies',
        entity_id: data[0].id
    }]);
    
    res.json({ success: true, data });
});

// Update complaint status
router.put('/status/:id', authenticate, checkRole(['Admin', 'Secretary', 'Chairman', 'Praja Officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const allowedStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid complaint status' });
    }

    const { data: complaint } = await supabase
      .from('complaints')
     .select(`
  *,
  users!complaints_user_id_fkey(full_name),
  departments!complaints_department_id_fkey(department_name, department_type)
`)
      .eq('id', id)
      .single();

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (req.userRole === 'Praja Officer') {
      const deptType = complaint.departments?.department_type;
      if (!['Library', 'Preschool'].includes(deptType)) {
        return res.status(403).json({ error: 'Praja Officer can update only Library or Preschool complaints' });
      }
    }

    const { data, error } = await supabase
      .from('complaints')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    if (remark && remark.trim()) {
      await supabase.from('complaint_replies').insert([{
        complaint_id: Number(id),
        replied_by: req.userData.id,
        reply_message: remark,
        created_at: new Date()
      }]);
    }

    await supabase.from('notifications').insert([{
      user_id: complaint.user_id,
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaint.title}" is now ${status}.${remark ? ` Note: ${remark}` : ''}`,
      is_auto_generated: true,
      is_read: false,
      notification_type: 'Complaint',
      related_entity: 'complaints',
      related_id: Number(id),
      created_at: new Date()
    }]);

    await supabase.from('audit_logs').insert([{
      user_id: req.userData.id,
      action: `UPDATE_COMPLAINT_STATUS_${status.toUpperCase().replace(/\s+/g, '_')}`,
      entity_type: 'complaints',
      entity_id: Number(id),
      new_value: status
    }]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get replies for a complaint
router.get('/replies/:complaint_id', authenticate, async (req, res) => {
    const { complaint_id } = req.params;
    
    const { data, error } = await supabase
        .from('complaint_replies')
        .select(`
  *,
  users!complaint_replies_replied_by_fkey(full_name)
`)
        .eq('complaint_id', complaint_id)
        .order('created_at', { ascending: true });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
});

module.exports = router;