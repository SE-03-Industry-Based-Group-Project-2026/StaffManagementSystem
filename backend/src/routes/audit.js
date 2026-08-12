const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');

/**
 * Convert action code into a frontend
 * translation key.
 */
function createActionTranslationKey(action) {
  if (!action) {
    return 'audit_unknown_action';
  }

  return `audit_${String(action)
    .trim()
    .toLowerCase()}`;
}

/**
 * Add end-of-day time when only a date
 * such as 2026-07-15 is supplied.
 */
function normalizeEndDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T23:59:59.999Z`;
  }

  return value;
}

/**
 * Get audit logs
 * Protected by audit_view privilege
 */
router.get(
  '/',
  authenticate,
  checkPrivilege('audit_view'),
  async (req, res) => {
    try {
      const {
        start_date,
        end_date,
        user_id,
        role_id,
        action,
        entity_type,
        limit = 500
      } = req.query;

      const parsedLimit = Math.min(
        Math.max(Number(limit) || 500, 1),
        1000
      );

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users(
            id,
            full_name,
            email,
            role_id,
            roles(
              role_name
            )
          )
        `)
        .order('created_at', {
          ascending: false
        })
        .limit(parsedLimit);

      if (start_date) {
        query = query.gte('created_at', start_date);
      }

      if (end_date) {
        query = query.lte('created_at', normalizeEndDate(end_date));
      }

      if (user_id) {
        query = query.eq('user_id', Number(user_id));
      }

      if (action) {
        query = query.ilike('action', `%${action}%`);
      }

      if (entity_type) {
        query = query.eq('entity_type', entity_type);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      let rows = (data || []).map((log) => ({
        ...log,
        action_translation_key: createActionTranslationKey(log.action)
      }));

      // Role filter safely applied here
      if (role_id && role_id !== 'all') {
        rows = rows.filter((log) => String(log.users?.role_id) === String(role_id));
      }

      return res.json(rows);
    } catch (error) {
      console.error('Load audit logs error:', error);

      return res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
);

/**
 * Get audit history for one entity
 */
router.get(
  '/entity/:entity_type/:entity_id',
  authenticate,
  checkPrivilege('audit_view'),
  async (req, res) => {
    try {
      const {
        entity_type,
        entity_id
      } = req.params;

      const parsedEntityId = Number(entity_id);

      if (!entity_type) {
        return res.status(400).json({
          error: 'Entity type is required'
        });
      }

      if (
        !Number.isInteger(parsedEntityId) ||
        parsedEntityId <= 0
      ) {
        return res.status(400).json({
          error: 'Invalid entity ID'
        });
      }

      const {
        data,
        error
      } = await supabase
        .from('audit_logs')
        .select(`
          *,
          users(
            full_name,
            email,
            role_id,
            roles(
              role_name
            )
          )
        `)
        .eq('entity_type', entity_type)
        .eq('entity_id', parsedEntityId)
        .order('created_at', {
          ascending: false
        });

      if (error) {
        return res.status(400).json({
          error: error.message
        });
      }

      const rows = (data || []).map(
        (log) => ({
          ...log,
          action_translation_key: createActionTranslationKey(
            log.action
          )
        })
      );

      return res.json(rows);
    } catch (error) {
      console.error(
        'Load entity audit logs error:',
        error
      );

      return res.status(500).json({
        error:
          error.message ||
          'Internal server error'
      });
    }
  }
);

module.exports = router;