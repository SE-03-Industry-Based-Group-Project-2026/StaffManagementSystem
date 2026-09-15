const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { translateToAllLanguages } = require('../services/translationService');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

async function getCurrentUser(reqUser) {
  if (!reqUser) return null;

  const { data, error } = await supabase
    .from('users')
    .select(`id, auth_id, full_name, email, department_id, roles(role_name)`)
    .eq('email', reqUser.email) 
    .maybeSingle();

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
  async (req, res) => {
    try {
      const { department_id, title, description } = req.body;
      const cleanTitle = String(title || '').trim();
      const cleanDescription = String(description || '').trim();

      if (!department_id) return res.status(400).json({ error: 'Department is required' });
      if (!cleanTitle) return res.status(400).json({ error: 'Complaint title is required' });
      if (!cleanDescription) return res.status(400).json({ error: 'Complaint description is required' });

      const currentUser = await getCurrentUser(req.user);
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
            current_stage: 'department_head',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      // Notify Department Head
      const { data: deptHead } = await supabase
        .from('users')
        .select('id, roles!inner(role_name)')
        .eq('department_id', Number(department_id))
        .eq('roles.role_name', 'Department Head')
        .maybeSingle();

      if (deptHead) {
        await createNotification({
          userId: deptHead.id,
          notificationKey: 'complaint_requires_review',
          title: 'New Department Complaint',
          message: `New complaint received for your department: "${translatedTitle.en}"`,
          payload: { complaint_title: translatedTitle.en },
          notificationType: 'Complaint',
          relatedEntity: 'complaints',
          relatedId: data.id,
          createdBy: currentUser.id
        });
      }

      await logAudit(currentUser.id, 'COMPLAINT_CREATED', 'complaints', data.id, null, {
        title_en: translatedTitle.en
      });

      return res.status(201).json({ success: true, data });
    } catch (error) {
      console.error('Submit complaint error:', error);
      return res.status(500).json({ error: error.message || 'Complaint could not be submitted' });
    }
  }
);

/*
 * Get all permitted complaints based on role and stage
 */
router.get(
  '/all',
  authenticate,
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const role = currentUser.roles?.role_name || '';

      let query = supabase
        .from('complaints')
        .select(`
          id,
          title,
          description,
          title_en,
          title_si,
          title_ta,
          description_en,
          description_si,
          description_ta,
          status,
          current_stage,
          department_id,
          user_id,
          created_at,
          updated_at,
          users:user_id (id, full_name, email, signature_url),
          departments:department_id (department_name, department_name_si, department_name_ta, department_type)
        `)
        .order('created_at', { ascending: false });
      
      
      if (role === 'Department Head') {
        const deptId = currentUser.department_id || 6;
        query = query.eq('department_id', deptId);
      } else if (role === 'CC Officer') {
        query = query.eq('current_stage', 'cc_officer');
      } else if (role === 'Secretary') {
        query = query.eq('current_stage', 'secretary');
      } else if (role === 'Chairman') {
        query = query.eq('current_stage', 'chairman');
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase query error:', error.message);
        return res.status(400).json({ error: error.message });
      }

      return res.json(data || []);
    } catch (error) {
      console.error('Get complaints error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);
/*
 * Update complaint status and multi-stage forwarding with notifications & signatures
 */
router.put(
  '/status/:id',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remark, forward_to } = req.body;

      const currentUser = await getCurrentUser(req.user);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`*`)
        .eq('id', id)
        .maybeSingle();

      if (complaintError || !complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      let nextStatus = status;
      let nextStage = complaint.current_stage;

      if (status === 'Resolved' || status === 'Closed') {
        nextStatus = status;
        nextStage = 'completed';
      } else if (status === 'In Progress') {
        nextStatus = 'In Progress';
        if (forward_to === 'cc_officer') nextStage = 'cc_officer';
        else if (forward_to === 'secretary') nextStage = 'secretary';
        else if (forward_to === 'chairman') nextStage = 'chairman';
      }

      const { data, error } = await supabase
        .from('complaints')
        .update({ 
          status: nextStatus, 
          current_stage: nextStage,
          updated_at: new Date().toISOString() 
        })
        .eq('id', complaint.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      const cleanRemark = String(remark || '').trim();
      const translatedRemark = cleanRemark ? await translateToAllLanguages(cleanRemark) : { en: '', si: '', ta: '' };

      await supabase
        .from('complaint_replies')
        .insert([
          {
            complaint_id: complaint.id,
            replied_by: currentUser.id,
            reply_message: translatedRemark.en || `${currentUser.roles?.role_name || 'Officer'} updated status to ${nextStatus}`,
            reply_message_en: translatedRemark.en,
            reply_message_si: translatedRemark.si,
            reply_message_ta: translatedRemark.ta,
            created_at: new Date().toISOString()
          }
        ]);

      let targetRoleName = '';
      if (nextStage === 'cc_officer') targetRoleName = 'CC Officer';
      else if (nextStage === 'secretary') targetRoleName = 'Secretary';
      else if (nextStage === 'chairman') targetRoleName = 'Chairman';

      let targetUserId = complaint.user_id;

      if (targetRoleName) {
        const { data: nextUser } = await supabase
          .from('users')
          .select('id, roles!inner(role_name)')
          .eq('roles.role_name', targetRoleName)
          .limit(1)
          .maybeSingle();

        if (nextUser) {
          targetUserId = nextUser.id;
        }
      }

      await createNotification({
        userId: targetUserId,
        notificationKey: 'complaint_status_updated',
        title: 'Complaint Update',
        message: `Complaint #${complaint.id} status updated to: ${nextStatus}`,
        payload: {
          complaint_id: complaint.id,
          status: nextStatus,
          remark: cleanRemark || ''
        },
        notificationType: 'Complaint',
        relatedEntity: 'complaints',
        relatedId: complaint.id,
        createdBy: currentUser.id
      });

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Update complaint status error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

/*
 * Get replies and signatures for a specific complaint
 */
router.get(
  '/replies/:complaint_id',
  authenticate,
  async (req, res) => {
    try {
      const { complaint_id } = req.params;
      const lookupId = !isNaN(Number(complaint_id)) ? Number(complaint_id) : complaint_id;

      const { data, error } = await supabase
        .from('complaint_replies')
        .select(`
          *,
          users(
            full_name,
            signature_url,
            roles(role_name)
          )
        `)
        .eq('complaint_id', lookupId)
        .order('created_at', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      return res.json(data || []);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;