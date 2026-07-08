const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

async function getCurrentUser(authId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role_id, department_id, roles(role_name)')
    .eq('auth_id', authId)
    .single();

  if (error || !data) return null;
  return data;
}

async function notifyUser(userId, title, message, relatedId = null) {
  if (!userId) return;

  await supabase.from('notifications').insert([{
    user_id: userId,
    title,
    message,
    is_auto_generated: true,
    is_read: false,
    notification_type: 'Leave',
    related_entity: 'leave_requests',
    related_id: relatedId,
    created_at: new Date()
  }]);
}

async function notifyRoles(roleNames, title, message, relatedId = null) {
  const { data: users } = await supabase
    .from('users')
    .select('id, roles!inner(role_name)')
    .in('roles.role_name', roleNames)
    .eq('is_active', true);

  for (const user of users || []) {
    await notifyUser(user.id, title, message, relatedId);
  }
}

async function getLeaveRequest(id) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      users!leave_requests_user_id_fkey(
        id,
        full_name,
        email,
        phone,
        designation,
        department_id,
        departments(
          department_name,
          department_type
        )
      ),
      leave_types(name_en, name_si, name_ta, max_days),
      leave_forms(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

async function deductLeaveBalance(userId, leaveTypeId, days) {
  const year = new Date().getFullYear();

  const { data: balance } = await supabase
    .from('user_leave_balances')
    .select('id, remaining_days')
    .eq('user_id', userId)
    .eq('leave_type_id', leaveTypeId)
    .eq('year', year)
    .single();

  if (!balance) return;

  await supabase
    .from('user_leave_balances')
    .update({
      remaining_days: Number(balance.remaining_days) - Number(days)
    })
    .eq('id', balance.id);
}

async function markAttendanceAsLeave(leaveRequest) {
  let currentDate = new Date(leaveRequest.start_date);
  const endDate = new Date(leaveRequest.end_date);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    await supabase.from('attendance').upsert([{
      user_id: leaveRequest.user_id,
      date: dateStr,
      status: 'On Leave',
      is_auto_marked: true,
      remarks: 'Auto marked after leave approval'
    }], {
      onConflict: 'user_id,date'
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

/**
 * Staff applies leave with Government Constraints
 */
router.post('/apply', authenticate, checkRole(['Staff']), async (req, res) => {
  try {
    const { leave_type_id, start_date, end_date, no_of_days, reason } = req.body;

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 🏛️ 1. WEEKEND CHECK CIRCULAR
    const startDateObj = new Date(start_date);
    const startDay = startDateObj.getDay(); // 0 = Sunday, 6 = Saturday
    if (startDay === 0 || startDay === 6) {
      return res.status(400).json({ 
        error: 'Leave requests cannot be initiated on Weekends (Saturday/Sunday) as per government regulations.' 
      });
    }

    // 🏛️ 2. CONSECUTIVE 5-DAY LIMIT (6 days or more is blocked)
    if (Number(no_of_days) >= 6) {
      return res.status(400).json({
        error: 'Maximum consecutive leave allowed is 5 days without special ministry approval.'
      });
    }

    const year = new Date().getFullYear();

    // 🏛️ 3. GOVERNMENT ANNUAL 45-DAY CAP VALIDATION
    const { data: annualLeaves } = await supabase
      .from('leave_requests')
      .select('no_of_days')
      .eq('user_id', user.id)
      .eq('status', 'Approved')
      .gte('start_date', `${year}-01-01`)
      .lte('end_date', `${year}-12-31`);

    const totalTaken = (annualLeaves || []).reduce((sum, item) => sum + Number(item.no_of_days), 0);
    if (totalTaken + Number(no_of_days) > 45) {
      return res.status(400).json({ 
        error: `Leave restriction: This request exceeds the annual 45-day government cap. Current usage: ${totalTaken} days.` 
      });
    }

    const { data: balance } = await supabase
      .from('user_leave_balances')
      .select('remaining_days')
      .eq('user_id', user.id)
      .eq('leave_type_id', leave_type_id)
      .eq('year', year)
      .single();

    if (!balance || Number(balance.remaining_days) < Number(no_of_days)) {
      return res.status(400).json({ error: 'Insufficient leave balance' });
    }

    const { data: leaveRequest, error } = await supabase
      .from('leave_requests') 
      .insert([{
        user_id: user.id,
        leave_type_id,
        start_date,
        end_date,
        no_of_days,
        reason,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // విගණන සටහන තැබීම (Audit Trail)
    await supabase.from('audit_logs').insert([{
        user_id: user.id,
        action: 'SUBMIT_LEAVE_REQUEST',
        entity_type: 'leave_requests',
        entity_id: leaveRequest.id
    }]);

    await notifyRoles(
      ['Admin'],
      'New Leave Request',
      `${user.full_name} submitted a leave request for ${no_of_days} day(s).`,
      leaveRequest.id
    );

    res.json({ success: true, data: leaveRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-requests', authenticate, checkRole(['Staff']), async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('leave_requests')
   .select('*, leave_types(name_en, name_si, name_ta, max_days), leave_forms(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/my-balance', authenticate, checkRole(['Staff']), async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from('user_leave_balances')
    .select('*, leave_types(name_en, name_si, name_ta, max_days)')
    .eq('user_id', user.id)
    .eq('year', year);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/all-requests', authenticate, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.id);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const role = currentUser.roles?.role_name;

  let query = supabase
    .from('leave_requests')
    .select(`
      *,
      users!leave_requests_user_id_fkey(
        id,
        full_name,
        email,
        phone,
        designation,
        department_id,
        departments(
          department_name,
          department_type
        )
      ),
      leave_types(name_en, name_si, name_ta, max_days),
      leave_forms(*),
      praja_reviews(*)
    `)
    .order('created_at', { ascending: false });

  if (role === 'Staff') {
    query = query.eq('user_id', currentUser.id);
  }
  /*if (role === 'Admin') {
    query = query.eq('status', 'Pending');
  }*/
  if (role === 'Praja Officer') {
    query = query.eq('status', 'Admin Approved');
  }
  if (role === 'Secretary') {
    query = query.in('status', ['Admin Approved', 'Praja Reviewed']);
  }
  if (role === 'Chairman') {
    query = query.eq('status', 'Admin Approved');
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  let filteredData = data || [];

  if (role === 'Praja Officer') {
    filteredData = filteredData.filter((item) =>
      ['Library', 'Preschool'].includes(item.users?.departments?.department_type)
    );
  }

  if (role === 'Secretary') {
    filteredData = filteredData.filter((item) => {
      const deptType = item.users?.departments?.department_type;
      const designation = item.users?.designation;
      const isLabourer = designation === 'Labourer';

      if (isLabourer) return false;
      if (deptType === 'Library' || deptType === 'Preschool') {
        return item.status === 'Praja Reviewed';
      }
      return item.status === 'Admin Approved';
    });
  }

  if (role === 'Chairman') {
    filteredData = filteredData.filter((item) => item.users?.designation === 'Labourer');
  }

  res.json(filteredData);
});

router.put('/admin-approve/:id', authenticate, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const currentUser = await getCurrentUser(req.user.id);
    const leaveRequest = await getLeaveRequest(id);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending requests can be admin approved' });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Admin Approved',
        supervisor_id: currentUser.id,
        supervisor_remark: remark || null,
        admin_approved_at: new Date(),
        admin_approved_by: currentUser.id,
        approval_stage: 'final_review',
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // (Audit Trail)
    await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        action: 'ADMIN_APPROVE_LEAVE',
        entity_type: 'leave_requests',
        entity_id: id
    }]);

    const deptType = leaveRequest.users?.departments?.department_type;
    const designation = leaveRequest.users?.designation;
    const isLabourer = designation === 'Labourer';

    if (isLabourer) {
      await notifyRoles(
        ['Chairman'],
        'Labor Leave Needs Final Approval',
        `${leaveRequest.users?.full_name}'s 'Labourer Leave Needs Chairman Approval'.`,
        Number(id)
      );
    } else if (deptType === 'Library' || deptType === 'Preschool') {
      await notifyRoles(
        ['Praja Officer'],
        'Leave Request Needs Praja Review',
        `${leaveRequest.users?.full_name}'s leave request needs your review.`,
        Number(id)
      );
    } else {
      await notifyRoles(
        ['Secretary'],
        'Leave Request Needs Final Approval',
        `${leaveRequest.users?.full_name}'s leave request was approved by Admin.`,
        Number(id)
      );
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/praja-review/:id', authenticate, checkRole(['Praja Officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const currentUser = await getCurrentUser(req.user.id);
    const leaveRequest = await getLeaveRequest(id);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const deptType = leaveRequest.users?.departments?.department_type;
    if (!(deptType === 'Library' || deptType === 'Preschool')) {
      return res.status(403).json({ error: 'Praja Officer can review only Library or Preschool leaves' });
    }
    if (leaveRequest.status !== 'Admin Approved') {
      return res.status(400).json({ error: 'Only admin approved requests can be reviewed' });
    }
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Review note is required' });
    }

    await supabase.from('praja_reviews').insert([{
      leave_request_id: Number(id),
      reviewed_by: currentUser.id,
      note
    }]);

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
      status: 'Praja Reviewed',
      supervisor_id: currentUser.id,
      supervisor_remark: note,
      approval_stage: 'praja_reviewed',
      updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    //  (Audit Trail)
    await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        action: 'PRAJA_REVIEW_LEAVE',
        entity_type: 'leave_requests',
        entity_id: id
    }]);

    await notifyRoles(
      ['Secretary'],
      'Leave Request Reviewed by Praja Officer',
      `${leaveRequest.users?.full_name}'s Library/Preschool leave request is ready for final approval.`,
      Number(id)
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/final-approve/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    const currentUser = await getCurrentUser(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const role = currentUser.roles?.role_name;
    const leaveRequest = await getLeaveRequest(id);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const deptType = leaveRequest.users?.departments?.department_type;
    const designation = leaveRequest.users?.designation;
    const isLabourer = designation === 'Labourer';

    if (role === 'Chairman') {
      if (!isLabourer || leaveRequest.status !== 'Admin Approved') {
        return res.status(403).json({ error: 'Chairman can approve only admin-approved Labourer leave' });
      }
    } else if (role === 'Secretary') {
      if (isLabourer) {
        return res.status(403).json({ error: 'Secretary cannot approve Labourer leave' });
      }
      if ((deptType === 'Library' || deptType === 'Preschool') && leaveRequest.status !== 'Praja Reviewed') {
        return res.status(403).json({ error: 'Library/Preschool leave must be reviewed by Praja Officer first' });
      }
      if (!(deptType === 'Library' || deptType === 'Preschool') && leaveRequest.status !== 'Admin Approved') {
        return res.status(403).json({ error: 'Regular leave must be admin approved first' });
      }
    } else {
      return res.status(403).json({ error: 'Only Secretary or Chairman can final approve' });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Approved',
        supervisor_id: currentUser.id,
        supervisor_remark: remark || null,
        final_approved_at: new Date(),
        final_approved_by: currentUser.id,
        approval_stage: 'completed',
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await deductLeaveBalance(leaveRequest.user_id, leaveRequest.leave_type_id, leaveRequest.no_of_days);
    await markAttendanceAsLeave(leaveRequest);

    // (Audit Trail)
    await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        action: 'FINAL_APPROVE_LEAVE',
        entity_type: 'leave_requests',
        entity_id: id
    }]);

    await notifyUser(
      leaveRequest.user_id,
      'Leave Approved',
      `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been approved.`,
      Number(id)
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reject/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    if (!remark || !remark.trim()) {
  return res.status(400).json({ error: 'Reject reason is required' });
}

    const currentUser = await getCurrentUser(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const role = currentUser.roles?.role_name;
    const leaveRequest = await getLeaveRequest(id);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const deptType = leaveRequest.users?.departments?.department_type;
    const designation = leaveRequest.users?.designation;
    const isLabourer = designation === 'Labourer';

    let allowed = false;

    if (role === 'Admin' && leaveRequest.status === 'Pending') allowed = true;
    if (role === 'Praja Officer' && leaveRequest.status === 'Admin Approved' && (deptType === 'Library' || deptType === 'Preschool')) allowed = true;
    if (role === 'Secretary' && !isLabourer && ['Admin Approved', 'Praja Reviewed'].includes(leaveRequest.status)) allowed = true;
    if (role === 'Chairman' && isLabourer && leaveRequest.status === 'Admin Approved') allowed = true;

    if (!allowed) {
      return res.status(403).json({ error: 'You are not allowed to reject this leave request' });
    }

    const { data, error } = await supabase
  .from('leave_requests')
  .update({
    status: 'Rejected',
    supervisor_id: currentUser.id,
    supervisor_remark: remark || null,
    approval_stage: 'rejected',
    updated_at: new Date()
  })
  .eq('id', id)
  .select()
  .single();

    if (error) return res.status(400).json({ error: error.message });

    // විගණන සටහන තැබීම (Audit Trail)
    await supabase.from('audit_logs').insert([{
        user_id: currentUser.id,
        action: 'REJECT_LEAVE_REQUEST',
        entity_type: 'leave_requests',
        entity_id: id
    }]);

    await notifyUser(
      leaveRequest.user_id,
      'Leave Rejected',
      `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been rejected. Reason: ${remark || 'Not specified'}`,
      Number(id)
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/digital-form/:leave_request_id', authenticate, checkRole(['Staff']), async (req, res) => {
  const { leave_request_id } = req.params;
  const { form_details, digital_signature } = req.body;

  const user = await getCurrentUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { data: leaveRequest } = await supabase
    .from('leave_requests')
    .select('id, user_id')
    .eq('id', leave_request_id)
    .single();

  if (!leaveRequest || leaveRequest.user_id !== user.id) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const { data, error } = await supabase
    .from('leave_forms')
    .upsert([{
      leave_request_id,
      form_details,
      digital_signature,
      submitted_at: new Date()
    }], {
      onConflict: 'leave_request_id'
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, data });
});

router.get('/stats', authenticate, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const { count: staffCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['Pending', 'Admin Approved', 'Praja Reviewed']);

  const { count: presentToday } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('date', today)
    .eq('status', 'Present');

  res.json({
    totalStaff: staffCount || 0,
    pendingLeaves: pendingLeaves || 0,
    presentToday: presentToday || 0
  });
});

module.exports = router;