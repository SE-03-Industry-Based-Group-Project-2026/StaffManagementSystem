const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { logAudit } = require('../services/auditService');

/**
 * Update user profile (Signature / Avatar / Phone)
 * Protected by profile_edit privilege
 */
router.put(
  '/update',
  authenticate,
  checkPrivilege('profile_edit'),
  async (req, res) => {
    try {
      const { avatar_url, signature_url, phone } = req.body;

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (signature_url !== undefined) updateData.signature_url = signature_url;
      if (phone !== undefined) updateData.phone = phone;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('auth_id', req.user.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      await logAudit(
        data.id,
        'UPDATE_PROFILE',
        'users',
        data.id,
        null,
        { updated_fields: Object.keys(updateData) }
      );

      return res.json({ success: true, message: 'Profile updated successfully', data });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

module.exports = router;