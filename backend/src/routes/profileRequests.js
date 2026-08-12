const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { logAudit } = require('../services/auditService');

/**
 * Get all profile change requests (Admin/Management view)
 */
router.get(
  '/',
  authenticate,
  checkPrivilege('profile_request_view'),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          requester:users!profile_change_requests_user_id_fkey(
            id,
            full_name,
            email,
            department_id,
            designation_id,
            departments(department_name, department_name_si, department_name_ta),
            designations(designation_en, designation_si, designation_ta)
          ),
          approver:users!profile_change_requests_approved_by_fkey(full_name, email)
        `)
        .order('requested_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data || []);
    } catch (err) {
      console.error('Get profile requests error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

/**
 * Approve profile change request
 */
router.put(
  '/approve/:id',
  authenticate,
  checkPrivilege('profile_request_manage'),
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);
      const { editValues } = req.body;

      if (!Number.isInteger(requestId) || requestId <= 0) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      const { data: reqData, error: reqError } = await supabase
        .from('profile_change_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (reqError || !reqData) {
        return res.status(404).json({ error: 'Profile request not found' });
      }

      // Update user profile values
      if (editValues) {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update(editValues)
          .eq('id', reqData.user_id);

        if (userUpdateError) {
          return res.status(400).json({ error: userUpdateError.message });
        }
      }

      const { data, error } = await supabase
        .from('profile_change_requests')
        .update({
          status: 'Approved',
          new_value: JSON.stringify(editValues),
          approved_by: req.user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      await logAudit(
        req.user.id,
        'APPROVE_PROFILE_REQUEST',
        'profile_change_requests',
        requestId,
        { status: reqData.status },
        { status: 'Approved', editValues }
      );

      return res.json({ success: true, message: 'Profile request approved successfully', data });
    } catch (err) {
      console.error('Approve profile request error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

/**
 * Reject profile change request
 */
router.put(
  '/reject/:id',
  authenticate,
  checkPrivilege('profile_request_manage'),
  async (req, res) => {
    try {
      const requestId = Number(req.params.id);

      if (!Number.isInteger(requestId) || requestId <= 0) {
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      const { data: reqData, error: reqError } = await supabase
        .from('profile_change_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (reqError || !reqData) {
        return res.status(404).json({ error: 'Profile request not found' });
      }

      const { data, error } = await supabase
        .from('profile_change_requests')
        .update({
          status: 'Rejected',
          approved_by: req.user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      await logAudit(
        req.user.id,
        'REJECT_PROFILE_REQUEST',
        'profile_change_requests',
        requestId,
        { status: reqData.status },
        { status: 'Rejected' }
      );

      return res.json({ success: true, message: 'Profile request rejected', data });
    } catch (err) {
      console.error('Reject profile request error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

module.exports = router;