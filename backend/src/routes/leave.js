const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { translateToAllLanguages } = require('../services/translationService');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const SECRETARY_ROLE_ID = 2;
const SUBJECT_OFFICER_ROLE_ID = 4;
const CC_OFFICER_ROLE_ID = 8;

async function getCurrentUser(authId) {
  const { data } = await supabase
    .from('users')
    .select(`
      *,
      roles(role_name),
      departments(
        department_name,
        department_name_si,
        department_name_ta
      )
    `)
    .eq('auth_id', authId)
    .single();
  return data;
}

async function safeTranslate(text) {
  if (!text?.trim()) return { en: '', si: '', ta: '' };
  try {
    const res = await translateToAllLanguages(text);
    return { en: res?.en || text, si: res?.si || text, ta: res?.ta || text };
  } catch (err) {
    return { en: text, si: text, ta: text };
  }
}


async function ensureLeaveBalanceForYear(userId, year) {
  try {
    const { data: existing } = await supabase
      .from('user_leave_balances')
      .select('id')
      .eq('user_id', userId)
      .eq('year', year)
      .limit(1);

    if (existing && existing.length > 0) return;

    const { data: leaveTypes } = await supabase
      .from('leave_types')
      .select('*');

    if (leaveTypes && leaveTypes.length > 0) {
      const newBalances = leaveTypes.map((lt) => ({
        user_id: userId,
        leave_type_id: lt.id,
        year: year,
        allocated_days: lt.max_days || 0,
        used_days: 0,
        remaining_days: lt.max_days || 0
      }));

      await supabase.from('user_leave_balances').insert(newBalances);
    }
  } catch (err) {
    console.error('Error ensuring leave balance for year:', err);
  }
}

/* 0. Submit Leave Request  */
router.post('/apply', authenticate, checkPrivilege('leave_add'), async (req, res) => {
  try {
    let { leave_type_id, start_date, end_date, no_of_days, reason, coverage_officer_id } = req.body;
    const currentUser = await getCurrentUser(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'All required leave fields must be filled' });
    }

    // 🌟 ලීව් එකක් දමන විට අදාළ වසරට අදාළ Balance එක ඇත්දැයි පරීක්ෂා කර ස්වයංක්‍රීයව සෑදීම
    const requestYear = Number(start_date.substring(0, 4));
    await ensureLeaveBalanceForYear(currentUser.id, requestYear);

    const { data: leaveTypeData } = await supabase
      .from('leave_types')
      .select('name_en')
      .eq('id', Number(leave_type_id))
      .single();

    const leaveTypeName = leaveTypeData?.name_en?.toLowerCase() || '';
    const isHalfDay = leaveTypeName.includes('half');
    const isShortLeave = leaveTypeName.includes('short');

    if (isHalfDay) {
      no_of_days = 0.5;
    } else if (isShortLeave) {
      no_of_days = 0; 
    } else if (!no_of_days) {
      return res.status(400).json({ error: 'Number of days is required' });
    }

    /* Short Leave Monthly Limit Check (Max 2 per month, renews every month) */
    if (isShortLeave) {
      const now = new Date(start_date);
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
      const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

      const { data: existingShortLeaves } = await supabase
        .from('leave_requests')
        .select('id, leave_types!inner(name_en)')
        .eq('user_id', currentUser.id)
        .ilike('leave_types.name_en', '%short%')
        .neq('status', 'Rejected')
        .gte('start_date', firstDay)
        .lte('start_date', lastDay);

      if (existingShortLeaves && existingShortLeaves.length >= 2) {
        return res.status(400).json({ 
          error: 'Monthly short leave limit (2) for this month has already been reached.' 
        });
      }
    }

    const cleanReason = String(reason || '').trim();

    const { data: leaveData, error: insertError } = await supabase
      .from('leave_requests')
      .insert([
        {
          user_id: currentUser.id,
          leave_type_id: Number(leave_type_id),
          start_date,
          end_date,
          no_of_days: Number(no_of_days),
          reason: cleanReason,
          coverage_officer_id: coverage_officer_id ? Number(coverage_officer_id) : null,
          status: 'Pending',
          approval_stage: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    const { data: subjectOfficer } = await supabase
      .from('users')
      .select('id, full_name, email, role_id, is_active')
      .eq('role_id', SUBJECT_OFFICER_ROLE_ID)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (subjectOfficer?.id) {
      await createNotification({
        userId: subjectOfficer.id,
        notificationKey: 'leave_requires_approval',
        payload: { employee_name: currentUser.full_name || 'Employee' },
        notificationType: 'Leave',
        relatedEntity: 'leave_requests',
        relatedId: leaveData.id,
        createdBy: currentUser.id,
        isAutoGenerated: true,
        isForMobile: true
      });
    }

    await logAudit(currentUser.id, 'LEAVE_APPLIED', 'leave_requests', leaveData.id);

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveData
    });
  } catch (error) {
    console.error('Submit leave error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* 1. Subject Officer Approval Route */
router.all('/subject-approve/:id', authenticate, checkPrivilege('leave_approve'), async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const cleanRemark = String(req.body.remark || '').trim();
    const currentUser = await getCurrentUser(req.user.id);

    // 🌟 දැඩි අත්සන පරීක්ෂාව (Strict Signature Validation)
    const sig = String(currentUser?.signature_url || '').trim();
    if (!sig || sig === 'null' || sig === 'undefined') {
      return res.status(400).json({ error: 'Please save your digital signature before approving' });
    }

    const { data: leaveRequest, error: findError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (findError || !leaveRequest) return res.status(404).json({ error: 'Leave request not found' });

    const { data: userData } = await supabase
      .from('users')
      .select(`
        full_name,
        staff_category,
        designations(
          designation_en,
          designation_si,
          designation_ta
        )
      `)
      .eq('id', leaveRequest.user_id)
      .single();

    const designationName = userData?.designations?.designation_en || '';
    const isLabour = userData?.staff_category === 'Labour' || designationName.toLowerCase().includes('labour');

    if (isLabour || leaveRequest.status !== 'Pending') {
      return res.status(403).json({ error: 'Subject Officer can only approve pending non-labour leave requests' });
    }

    const translatedRemark = await safeTranslate(cleanRemark);
    const approvedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Subject Approved',
        supervisor_id: currentUser.id,
        supervisor_remark: translatedRemark.en,
        subject_signature: currentUser.signature_url,
        admin_approved_at: approvedAt,
        admin_approved_by: currentUser.id,
        approval_stage: 'subject_approved',
        updated_at: approvedAt
      })
      .eq('id', leaveId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: ccOfficer } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', CC_OFFICER_ROLE_ID)
      .single();

    if (ccOfficer) {
      await createNotification({
        userId: ccOfficer.id,
        notificationKey: 'leave_requires_approval',
        payload: { employee_name: userData?.full_name || 'Employee' },
        notificationType: 'Leave',
        relatedEntity: 'leave_requests',
        relatedId: leaveId,
        createdBy: currentUser.id
      });
    }

    await logAudit(currentUser.id, 'SUBJECT_APPROVED', 'leave_requests', leaveId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* 2. CC Officer Approval Route */
router.all('/cc-approve/:id', authenticate, checkPrivilege('leave_approve'), async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const cleanRemark = String(req.body.remark || '').trim();
    const currentUser = await getCurrentUser(req.user.id);

    const sig = String(currentUser?.signature_url || '').trim();
    if (!sig || sig === 'null' || sig === 'undefined') {
      return res.status(400).json({ error: 'Please save your digital signature before approving' });
    }

    const { data: leaveRequest, error: findError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (findError || !leaveRequest) return res.status(404).json({ error: 'Leave request not found' });

    if (leaveRequest.status !== 'Subject Approved') {
      return res.status(403).json({ error: 'Leave request must be approved by Subject Officer first' });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', leaveRequest.user_id)
      .single();

    const translatedRemark = await safeTranslate(cleanRemark);
    const approvedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'CC Approved',
        supervisor_id: currentUser.id,
        supervisor_remark: translatedRemark.en,
        cc_signature: currentUser.signature_url,
        cc_approved_at: approvedAt,
        cc_approved_by: currentUser.id,
        approval_stage: 'cc_approved',
        updated_at: approvedAt
      })
      .eq('id', leaveId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: secretary } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', SECRETARY_ROLE_ID)
      .single();

    if (secretary) {
      await createNotification({
        userId: secretary.id,
        notificationKey: 'leave_requires_final_approval',
        payload: { employee_name: userData?.full_name || 'Employee' },
        notificationType: 'Leave',
        relatedEntity: 'leave_requests',
        relatedId: leaveId,
        createdBy: currentUser.id
      });
    }

    await logAudit(currentUser.id, 'CC_APPROVED', 'leave_requests', leaveId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* 3. Final Approve Route (Secretary & Chairman) - Updates Leave Balance */
router.all('/final-approve/:id', authenticate, checkPrivilege('leave_approve'), async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const cleanRemark = String(req.body.remark || '').trim();
    const currentUser = await getCurrentUser(req.user.id);

    // 🌟 දැඩි අත්සන පරීක්ෂාව (Strict Signature Validation)
    const sig = String(currentUser?.signature_url || '').trim();
    if (!sig || sig === 'null' || sig === 'undefined') {
      return res.status(400).json({ error: 'Please save your digital signature before approving' });
    }

    const { data: leaveRequest, error: findError } = await supabase
      .from('leave_requests')
      .select('*, leave_types(name_en)')
      .eq('id', leaveId)
      .single();

    if (findError || !leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const role = currentUser.roles?.role_name;

    const { data: userData } = await supabase
      .from('users')
      .select(`
        full_name,
        staff_category,
        designations(designation_en)
      `)
      .eq('id', leaveRequest.user_id)
      .single();

    const designationName = userData?.designations?.designation_en || '';
    const isLabour = userData?.staff_category === 'Labour' || designationName.toLowerCase().includes('labour');

    if (role === 'Chairman' && !isLabour) {
      return res.status(403).json({ error: 'Chairman can approve only Labour leave requests' });
    }
    if (role === 'Secretary' && isLabour) {
      return res.status(403).json({ error: 'Secretary cannot approve Labour leave requests' });
    }

    const translatedRemark = await safeTranslate(cleanRemark);
    const approvedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Approved',
        supervisor_id: currentUser.id,
        supervisor_remark: translatedRemark.en,
        final_approved_at: approvedAt,
        final_approved_by: currentUser.id,
        secretary_signature: role === 'Secretary' ? currentUser.signature_url : null,
        chairman_signature: role === 'Chairman' ? currentUser.signature_url : null,
        approval_stage: 'completed',
        updated_at: approvedAt
      })
      .eq('id', leaveId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const year = Number(leaveRequest.start_date.substring(0, 4));
    

    await ensureLeaveBalanceForYear(leaveRequest.user_id, year);

    const leaveTypeName = leaveRequest.leave_types?.name_en?.toLowerCase() || '';
    
    let targetLeaveTypeId = leaveRequest.leave_type_id;
    let deductDays = Number(leaveRequest.no_of_days);

    if (leaveTypeName.includes('half')) {
      const { data: casualType } = await supabase
        .from('leave_types')
        .select('id')
        .ilike('name_en', '%casual%')
        .single();

      if (casualType) {
        targetLeaveTypeId = casualType.id;
        deductDays = 0.5; 
      }
    } else if (leaveTypeName.includes('short')) {
      deductDays = 0;
    }

    if (deductDays > 0) {
      const { data: balance } = await supabase
        .from('user_leave_balances')
        .select('id, used_days, remaining_days')
        .eq('user_id', leaveRequest.user_id)
        .eq('leave_type_id', targetLeaveTypeId)
        .eq('year', year)
        .single();

      if (balance) {
        const newUsedDays = Number(balance.used_days) + deductDays;
        const newRemainingDays = Math.max(Number(balance.remaining_days) - deductDays, 0);

        await supabase
          .from('user_leave_balances')
          .update({
            used_days: newUsedDays,
            remaining_days: newRemainingDays
          })
          .eq('id', balance.id);
      }
    }

    await createNotification({
      userId: leaveRequest.user_id,
      notificationKey: 'leave_final_approved',
      payload: {
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        approved_by: currentUser.full_name
      },
      notificationType: 'Leave',
      relatedEntity: 'leave_requests',
      relatedId: leaveId,
      createdBy: currentUser.id
    });

    if (leaveRequest.coverage_officer_id) {
      await createNotification({
        userId: leaveRequest.coverage_officer_id,
        notificationKey: 'acting_officer_assigned',
        payload: {
          employee_name: userData?.full_name || 'Employee',
          start_date: leaveRequest.start_date
        },
        notificationType: 'Leave',
        relatedEntity: 'leave_requests',
        relatedId: leaveId,
        createdBy: currentUser.id
      });
    }

    await logAudit(
      currentUser.id,
      role === 'Secretary' ? 'SECRETARY_APPROVED' : 'CHAIRMAN_APPROVED',
      'leave_requests',
      leaveId
    );

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* 4. Reject Leave Request Route */
router.all('/reject/:id', authenticate, checkPrivilege('leave_reject'), async (req, res) => {
  try {
    const leaveId = Number(req.params.id);
    const cleanRemark = String(req.body.remark || '').trim();
    const signature = req.body.signature || null;
    const currentUser = await getCurrentUser(req.user.id);

    const { data: leaveRequest, error: findError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveId)
      .single();

    if (findError || !leaveRequest) return res.status(404).json({ error: 'Leave request not found' });

    const translatedRemark = await safeTranslate(cleanRemark);
    const updatedAt = new Date().toISOString();

    const roleName = currentUser.roles?.role_name;
    let signatureColumn = {};

    if (signature) {
      if (roleName === 'Subject Officer') {
        signatureColumn = { subject_signature: signature };
      } else if (roleName === 'CC Officer') {
        signatureColumn = { cc_signature: signature };
      } else if (roleName === 'Secretary') {
        signatureColumn = { secretary_signature: signature };
      } else if (roleName === 'Chairman') {
        signatureColumn = { chairman_signature: signature };
      }
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Rejected',
        supervisor_id: currentUser.id,
        supervisor_remark: translatedRemark.en,
        updated_at: updatedAt,
        ...signatureColumn
      })
      .eq('id', leaveId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await createNotification({
      userId: leaveRequest.user_id,
      notificationKey: 'leave_request_rejected',
      payload: {
        start_date: leaveRequest.start_date,
        end_date: leaveRequest.end_date,
        rejected_by: currentUser.full_name
      },
      notificationType: 'Leave',
      relatedEntity: 'leave_requests',
      relatedId: leaveId,
      createdBy: currentUser.id
    });

    await logAudit(currentUser.id, 'LEAVE_REJECTED', 'leave_requests', leaveId);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* 5. Get All Leave Requests based on Role */
router.get('/all-requests', authenticate, checkPrivilege('leave_view'), async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);
    const role = currentUser?.roles?.role_name;

    const { data: rawRequests, error: leaveError } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (leaveError) return res.status(400).json({ error: leaveError.message });
    if (!rawRequests || rawRequests.length === 0) return res.json([]);

    const { data: usersData } = await supabase
      .from('users')
      .select(`
        id,
        title,
        full_name,
        email,
        phone,
        staff_category,
        department_id,
        designations(
          designation_en,
          designation_si,
          designation_ta
        ),
        departments(
          department_name,
          department_name_si,
          department_name_ta,
          department_type
        )
      `);

    const { data: leaveTypesData } = await supabase
      .from('leave_types')
      .select('name_en, name_si, name_ta, max_days, id');

    const usersMap = new Map((usersData || []).map(u => [u.id, u]));
    const leaveTypesMap = new Map((leaveTypesData || []).map(lt => [lt.id, lt]));

    let enrichedRequests = rawRequests.map(req => {
      const user = usersMap.get(req.user_id) || null;
      const actingUser = req.coverage_officer_id ? usersMap.get(req.coverage_officer_id) : null;
      const leaveType = leaveTypesMap.get(req.leave_type_id) || null;

      return {
        ...req,
        users: user,
        acting_user: actingUser,
        leave_types: leaveType
      };
    });

    let filtered = enrichedRequests;
    if (role === 'Subject Officer') {
      filtered = enrichedRequests.filter(i => ['Pending', 'Subject Approved', 'CC Approved', 'Approved', 'Rejected'].includes(i.status));
    } else if (role === 'CC Officer') {
      filtered = enrichedRequests.filter(i => ['Subject Approved', 'CC Approved', 'Approved', 'Rejected'].includes(i.status));
    } else if (role === 'Secretary') {
      filtered = enrichedRequests.filter(i => (i.users?.staff_category !== 'Labour') && ['Subject Approved', 'CC Approved', 'Approved', 'Rejected'].includes(i.status));
    } else if (role === 'Chairman') {
      filtered = enrichedRequests.filter(i => (i.users?.staff_category === 'Labour') && ['Pending', 'Approved', 'Rejected'].includes(i.status));
    }

    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/* Get Current User Leave Balances */
router.get('/my-leave-balances', authenticate, checkPrivilege('leave_view'), async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);
    const year = Number(req.query.year) || new Date().getFullYear();


    await ensureLeaveBalanceForYear(currentUser.id, year);

    const { data: balances, error } = await supabase
      .from('user_leave_balances')
      .select(`
        id,
        year,
        allocated_days,
        used_days,
        remaining_days,
        leave_types (
          id,
          name_en,
          name_si,
          name_ta,
          max_days
        )
      `)
      .eq('user_id', currentUser.id)
      .eq('year', year);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ success: true, data: balances || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;