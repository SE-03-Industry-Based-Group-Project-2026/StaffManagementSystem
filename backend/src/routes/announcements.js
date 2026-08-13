const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { translateToAllLanguages } = require('../services/translationService');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

/**
 * Helper: Retrieve detailed application user profile
 */
async function getCurrentUser(authId) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      auth_id,
      full_name,
      department_id,
      roles(role_name)
    `)
    .eq('auth_id', authId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Check whether Praja Officer can manage the selected department.
 */
async function validatePrajaDepartment(role, departmentId) {
  if (role !== 'Praja Officer') {
    return {
      allowed: true
    };
  }

  if (!departmentId) {
    return {
      allowed: false,
      error:
        'Praja Officer must select Library Services or Preschool Education.'
    };
  }

  const { data: department, error } = await supabase
    .from('departments')
    .select('department_type')
    .eq('id', departmentId)
    .maybeSingle();

  if (error || !department) {
    return {
      allowed: false,
      error: 'Department not found.'
    };
  }

  const allowedDepartmentTypes = [
    'Library',
    'Preschool'
  ];

  if (
    !allowedDepartmentTypes.includes(
      department.department_type
    )
  ) {
    return {
      allowed: false,
      error:
        'Praja Officer can manage announcements only for Library Services and Preschool Education.'
    };
  }

  return {
    allowed: true
  };
}

/**
 * SEND ANNOUNCEMENT
 */
router.post(
  '/send',
  authenticate,
  checkPrivilege('announcement_add'),
  async (req, res) => {
    try {
      const {
        title,
        message,
        department_id,
        scheduled_at,
        expires_at,
        priority
      } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          error: 'Announcement title is required.'
        });
      }

      if (!message || !String(message).trim()) {
        return res.status(400).json({
          error: 'Announcement message is required.'
        });
      }

      const currentUser = await getCurrentUser(req.user.id);

      if (!currentUser) {
        return res.status(404).json({
          error: 'Current user not found.'
        });
      }

      const role = currentUser.roles?.role_name || '';

      const departmentValidation = await validatePrajaDepartment(
        role,
        department_id
      );

      if (!departmentValidation.allowed) {
        return res.status(403).json({
          error: departmentValidation.error
        });
      }

      let translatedTitle;
      let translatedMessage;

      try {
        [translatedTitle, translatedMessage] = await Promise.all([
          translateToAllLanguages(title),
          translateToAllLanguages(message)
        ]);
      } catch (translationError) {
        console.error(
          'Announcement translation failed:',
          translationError
        );

        translatedTitle = {
          en: String(title).trim(),
          si: String(title).trim(),
          ta: String(title).trim()
        };

        translatedMessage = {
          en: String(message).trim(),
          si: String(message).trim(),
          ta: String(message).trim()
        };
      }

      let expiresAt = null;
      if (expires_at) {
        const parsedDate = new Date(expires_at);
        expiresAt = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null;
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: translatedTitle.en,
            message: translatedMessage.en,

            title_en: translatedTitle.en,
            title_si: translatedTitle.si,
            title_ta: translatedTitle.ta,

            message_en: translatedMessage.en,
            message_si: translatedMessage.si,
            message_ta: translatedMessage.ta,

            department_id: department_id || null,
            created_by: currentUser.id,

            priority: priority || 'Medium',

            scheduled_at: scheduled_at || new Date().toISOString(),

            expires_at: expiresAt,
            is_archived: false,

            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Announcement insert error:', error);
        return res.status(400).json({
          error: error.message
        });
      }

      // 🔔 Chairman, Secretary, Admin, CC/Subject Officers හැර අනෙක් සේවකයින්ට පමණක් නොටිෆිකේෂන් යැවීම
      try {
        const { data: activeUsers } = await supabase
          .from('users')
          .select(`
            id,
            roles(role_name)
          `)
          .eq('is_active', true);

        if (activeUsers && activeUsers.length > 0) {
          const excludedRoles = ['Admin', 'Secretary', 'Chairman', 'CC Officer', 'Subject Officer'];

          const targetUsers = activeUsers.filter(u => {
            const roleName = u.roles?.role_name;
            return !excludedRoles.includes(roleName);
          });

          if (targetUsers.length > 0) {
            const notificationPromises = targetUsers.map((u) =>
              createNotification({
                userId: u.id,
                notificationKey: 'announcement_created',
                title: 'New Announcement',
                message: `New notice posted: "${translatedTitle.en}"`,
                payload: {
                  announcement_title: translatedTitle.en,
                  announcement_id: data.id
                },
                notificationType: 'Announcement',
                relatedEntity: 'announcements',
                relatedId: data.id,
                createdBy: currentUser.id
              })
            );

            await Promise.all(notificationPromises);
          }
        }
      } catch (notifErr) {
        console.error('Failed to send announcement notifications:', notifErr);
      }

      await logAudit(
        currentUser.id,
        'ANNOUNCEMENT_CREATED',
        'announcements',
        data.id,
        null,
        {
          title: translatedTitle.en,
          message: translatedMessage.en,
          title_en: translatedTitle.en,
          title_si: translatedTitle.si,
          title_ta: translatedTitle.ta,
          department_id: department_id || null
        }
      );

      return res.status(201).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Send announcement error:', error);

      return res.status(500).json({
        error: 'Announcement could not be translated and sent.',
        details: error.message
      });
    }
  }
);


/**
 * UPDATE ANNOUNCEMENT
 */
router.put(
  '/:id',
  authenticate,
  checkPrivilege('announcement_edit'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        message,
        department_id,
        scheduled_at,
        expires_at,
        priority
      } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          error: 'Announcement title is required.'
        });
      }

      if (!message || !String(message).trim()) {
        return res.status(400).json({
          error: 'Announcement message is required.'
        });
      }

      const currentUser = await getCurrentUser(req.user.id);

      if (!currentUser) {
        return res.status(404).json({
          error: 'Current user not found.'
        });
      }

      const role = currentUser.roles?.role_name || '';

      const { data: existingAnnouncement } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingAnnouncement) {
        return res.status(404).json({
          error: 'Announcement not found.'
        });
      }

      const departmentValidation = await validatePrajaDepartment(
        role,
        department_id
      );

      if (!departmentValidation.allowed) {
        return res.status(403).json({
          error: departmentValidation.error
        });
      }

      let translatedTitle;
      let translatedMessage;

      try {
        [translatedTitle, translatedMessage] = await Promise.all([
          translateToAllLanguages(title),
          translateToAllLanguages(message)
        ]);
      } catch (translationError) {
        console.error('Announcement translation failed:', translationError);

        translatedTitle = {
          en: String(title).trim(),
          si: String(title).trim(),
          ta: String(title).trim()
        };

        translatedMessage = {
          en: String(message).trim(),
          si: String(message).trim(),
          ta: String(message).trim()
        };
      }

      let expiresAt = existingAnnouncement.expires_at;

      if (expires_at) {
        const parsedDate = new Date(expires_at);
        expiresAt = !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : existingAnnouncement.expires_at;
      }

      const { data, error } = await supabase
        .from('announcements')
        .update({
          title: translatedTitle.en,
          message: translatedMessage.en,

          title_en: translatedTitle.en,
          title_si: translatedTitle.si,
          title_ta: translatedTitle.ta,

          message_en: translatedMessage.en,
          message_si: translatedMessage.si,
          message_ta: translatedMessage.ta,

          department_id: department_id || null,

          priority:
            priority ||
            existingAnnouncement.priority ||
            'Medium',

          scheduled_at:
            scheduled_at ||
            existingAnnouncement.scheduled_at,

          expires_at: expiresAt,

          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      await logAudit(
        currentUser.id,
        'ANNOUNCEMENT_UPDATED',
        'announcements',
        Number(id),
        {
          title: existingAnnouncement.title,
          message: existingAnnouncement.message
        },
        {
          title: translatedTitle.en,
          message: translatedMessage.en,
          title_en: translatedTitle.en,
          title_si: translatedTitle.si,
          title_ta: translatedTitle.ta
        }
      );

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Update announcement error:', error);

      return res.status(500).json({
        error: 'Announcement could not be translated and updated.',
        details: error.message
      });
    }
  }
);


/**
 * DELETE ANNOUNCEMENT
 */
router.delete(
  '/:id',
  authenticate,
  checkPrivilege('announcement_delete'),
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user.id);

      if (!currentUser) {
        return res.status(404).json({
          error: 'Current user not found.'
        });
      }

      const role = currentUser.roles?.role_name || '';

      const { data: announcement, error: fetchError } = await supabase
        .from('announcements')
        .select(`
          *,
          departments(
            department_type
          )
        `)
        .eq('id', req.params.id)
        .single();

      if (fetchError || !announcement) {
        return res.status(404).json({
          error: 'Announcement not found.'
        });
      }

      if (role === 'Praja Officer') {
        const departmentType = announcement.departments?.department_type;

        if (
          departmentType !== 'Library' &&
          departmentType !== 'Preschool'
        ) {
          return res.status(403).json({
            error:
              'Praja Officer can delete only Library Services or Preschool Education announcements.'
          });
        }
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      await logAudit(
        currentUser.id,
        'ANNOUNCEMENT_DELETED',
        'announcements',
        Number(req.params.id),
        null,
        {
          title: announcement.title_en || announcement.title,
          message: announcement.message_en || announcement.message,
          title_en: announcement.title_en || announcement.title,
          department_id: announcement.department_id
        } 
      );
      
      return res.json({
        success: true
      });
    } catch (error) {
      console.error('Delete announcement error:', error);

      return res.status(500).json({
        error: error.message
      });
    }
  }
);


/**
 * GET ANNOUNCEMENTS 
 */
router.get(
  '/',
  authenticate,
  checkPrivilege('announcement_view'),
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user.id);

      if (!currentUser) {
        return res.status(404).json({
          error: 'Current user not found.'
        });
      }

      const role = currentUser.roles?.role_name || '';

      const nowIso = new Date().toISOString();

      let query = supabase
        .from('announcements')
        .select(`
          *,
          users(
            full_name,
            roles(role_name)
          ),
          departments(
            department_name,
            department_name_si,
            department_name_ta,
            department_type
          )
        `)
        .eq('is_archived', false)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`); 

      if (
        role !== 'Admin' &&
        role !== 'Secretary' &&
        role !== 'Chairman'
      ) {
        if (currentUser.department_id) {
          query = query.or(
            `department_id.is.null,department_id.eq.${currentUser.department_id}`
          );
        } else {
          query = query.is('department_id', null);
        }
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      return res.json(data || []);
    } catch (error) {
      console.error('Get announcements error:', error);

      return res.status(500).json({
        error: error.message
      });
    }
  }
);

module.exports = router;