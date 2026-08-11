const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { translateToAllLanguages } = require('../services/translationService');
const { logAudit } = require('../services/auditService');
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
 * Submit complaint - Staff
 */
router.post(
  '/submit',
  authenticate,
  checkPrivilege('complaints_add'),
  async (req, res) => {
    try {
      const { department_id, title, description } = req.body;
      const cleanTitle = String(title || '').trim();
      const cleanDescription = String(description || '').trim();

      if (!department_id) return res.status(400).json({ error: 'Department is required' });
      if (!cleanTitle) return res.status(400).json({ error: 'Complaint title is required' });
      if (!cleanDescription) return res.status(400).json({ error: 'Complaint description is required' });

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const [translatedTitle, translatedDescription] = await Promise.all([
        translateToAllLanguages(cleanTitle),
        translateToAllLanguages(cleanDescription)
      ]);

      const { data, error } = await supabase
        .from('complaints')
        .insert([
          {
            user_id: currentUser.id,
            department_id: Number(department_id),
            title: translatedTitle.en,
            description: translatedDescription.en,
            title_en: translatedTitle.en,
            title_si: translatedTitle.si,
            title_ta: translatedTitle.ta,
            description_en: translatedDescription.en,
            description_si: translatedDescription.si,
            description_ta: translatedDescription.ta,
            status: 'Open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await logAudit(currentUser.id, 'COMPLAINT_CREATED', 'complaints', data.id, null, {
        title_en: translatedTitle.en,
        title_si: translatedTitle.si,
        title_ta: translatedTitle.ta
      });

      return res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Submit complaint error:', error);
      return res.status(500).json({ error: error.message || 'Complaint could not be submitted' });
    }
  }
);

/*
 * Get all permitted complaints
 */
router.get(
  '/all',
  authenticate,
  checkPrivilege('complaints_view'),
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const role = currentUser.roles?.role_name || '';

      let query = supabase
        .from('complaints')
        .select(`
          *,
          users!complaints_user_id_fkey(full_name, email),
          departments!complaints_department_id_fkey(department_name, department_name_si, department_name_ta, department_type)
        `)
        .order('created_at', { ascending: false });
      
      if (role === 'Chairman' || role === 'Secretary') {
        const { data: recipients, error: recipientError } = await supabase
          .from('complaint_recipients')
          .select('complaint_id')
          .eq('recipient_id', currentUser.id);

        if (recipientError) return res.status(400).json({ error: recipientError.message });

        const complaintIds = recipients.map(r => r.complaint_id);
        if (complaintIds.length === 0) return res.json([]);

        query = query.in('id', complaintIds);
      }

      if (role === 'Supervisor' && currentUser.department_id) {
        query = query.eq('department_id', currentUser.department_id);
      }

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });

      return res.json(data || []);
    } catch (error) {
      console.error('Get complaints error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

/*
 * Reply to complaint
 */
router.post(
  '/reply',
  authenticate,
  checkPrivilege('complaints_reply'),
  async (req, res) => {
    try {
      const { complaint_id, reply_message } = req.body;
      const cleanReply = String(reply_message || '').trim();

      if (!complaint_id) return res.status(400).json({ error: 'Complaint ID is required' });
      if (!cleanReply) return res.status(400).json({ error: 'Reply message is required' });

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`*, departments(department_name, department_type)`)
        .eq('id', complaint_id)
        .single();

      if (complaintError || !complaint) return res.status(404).json({ error: 'Complaint not found' });

      const translatedReply = await translateToAllLanguages(cleanReply);

      const { data, error } = await supabase
        .from('complaint_replies')
        .insert([
          {
            complaint_id: Number(complaint_id),
            replied_by: currentUser.id,
            reply_message: translatedReply.en,
            reply_message_en: translatedReply.en,
            reply_message_si: translatedReply.si,
            reply_message_ta: translatedReply.ta,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await supabase
        .from('complaints')
        .update({ status: 'In Progress', updated_at: new Date().toISOString() })
        .eq('id', complaint_id);

      await createNotification({
        userId: complaint.user_id,
        notificationKey: 'complaint_reply',
        payload: {},
        notificationType: 'Complaint',
        relatedEntity: 'complaints',
        relatedId: Number(complaint_id),
        createdBy: currentUser.id
      });

      await logAudit(currentUser.id, 'COMPLAINT_REPLIED', 'complaint_replies', data.id, null, {
        reply: translatedReply.en
      });

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Reply complaint error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

/*
 * Update complaint status
 */
router.put(
  '/status/:id',
  authenticate,
  checkPrivilege('complaints_assign'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;

      const allowedStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid complaint status' });
      }

      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`*, users!complaints_user_id_fkey(full_name), departments!complaints_department_id_fkey(department_name, department_type)`)
        .eq('id', id)
        .single();

      if (complaintError || !complaint) return res.status(404).json({ error: 'Complaint not found' });

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const { data, error } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      const cleanRemark = String(remark || '').trim();
      if (cleanRemark) {
        const translatedRemark = await translateToAllLanguages(cleanRemark);
        await supabase
          .from('complaint_replies')
          .insert([
            {
              complaint_id: Number(id),
              replied_by: currentUser.id,
              reply_message: translatedRemark.en,
              reply_message_en: translatedRemark.en,
              reply_message_si: translatedRemark.si,
              reply_message_ta: translatedRemark.ta,
              created_at: new Date().toISOString()
            }
          ]);
      }

      await createNotification({
        userId: complaint.user_id,
        notificationKey: 'complaint_status_updated',
        payload: {
          complaint_title: complaint.title_en || complaint.title,
          status: status,
          remark: cleanRemark || ''
        },
        notificationType: 'Complaint',
        relatedEntity: 'complaints',
        relatedId: Number(id),
        createdBy: currentUser.id
      });

      await logAudit(currentUser.id, 'COMPLAINT_STATUS_UPDATED', 'complaints', Number(id), {
        status: complaint.status
      }, {
        status: status
      });

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Update complaint error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/replies/:complaint_id',
  authenticate,
  checkPrivilege('complaints_view'),
  async (req, res) => {
    try {
      const { complaint_id } = req.params;
      const { data, error } = await supabase
        .from('complaint_replies')
        .select(`*, users!complaint_replies_replied_by_fkey(full_name)`)
        .eq('complaint_id', complaint_id)
        .order('created_at', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      return res.json(data || []);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;