const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');

async function getCurrentUser(authId) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      department_id,
      roles(role_name)
    `)
    .eq('auth_id', authId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/*
 * Send manual notification
 */
router.post(
  '/send',
  authenticate,
  checkRole(['Admin', 'Supervisor']),
  async (req, res) => {
    try {
      const {
          user_id,
          notification_key,
          payload,
          notification_type,
          related_entity,
          related_id,
          title,      
          message,
          attachment_url
      } = req.body;

      if (!notification_key) {
        return res.status(400).json({ error: 'Notification key is required' });
      }

      if (!user_id) {
        return res.status(400).json({ error: 'Notification recipient is required' });
      }

      const currentUser = await getCurrentUser(req.user.id);

      if (!currentUser) {
        return res.status(404).json({ error: 'Current user not found' });
      }

      const finalPayload = payload || {};
      if (title && !finalPayload.title) finalPayload.title = title;
      if (message && !finalPayload.message) finalPayload.message = message;
      if (attachment_url && !finalPayload.attachment_url) finalPayload.attachment_url = attachment_url;

      
      const result = await createNotification({
        userId: user_id,
        title: title || finalPayload.title,
        message: message || finalPayload.message,
        notificationKey: notification_key,
        payload: finalPayload,
        notificationType: notification_type || 'General',
        relatedEntity: related_entity || null,
        relatedId: related_id || null,
        createdBy: currentUser.id
      });

      if (!result.success) {
        return res.status(400).json({ error: 'Notification could not be sent' });
      }

      return res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      console.error('Send notification error:', error);
      return res.status(500).json({
        error: error.message || 'Notification could not be sent'
      });
    }
  }
);

/*
 * Get logged-in user's notifications
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('is_for_mobile', true) 
      .gte('created_at', sevenDaysAgo.toISOString()) 
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/*
 * Get unread notification count
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('is_for_mobile', true)
      .eq('is_read', false)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ count: count || 0 });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/*
 * Mark one notification as read
 */
router.put('/read/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await getCurrentUser(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/*
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;