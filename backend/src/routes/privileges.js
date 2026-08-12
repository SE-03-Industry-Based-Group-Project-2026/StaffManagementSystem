const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { logAudit } = require('../services/auditService');

// ============================================================
// 1. GET ALL PRIVILEGES FOR SELECTED ROLE
//    Required privilege: system_privilege_view
// ============================================================

router.get(
  '/all',
  authenticate,
  checkPrivilege('system_privilege_view'),
  async (req, res) => {
    try {
      const roleId = Number(req.query.role_id);

      if (!roleId) {
        return res.status(400).json({
          error: 'role_id is required'
        });
      }

      // --------------------------------------------------------
      // Get role
      // --------------------------------------------------------

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, role_name')
        .eq('id', roleId)
        .single();

      if (roleError || !roleData) {
        return res.status(404).json({
          error: 'Role not found'
        });
      }

      // --------------------------------------------------------
      // Get modules, privileges and role privileges
      // --------------------------------------------------------

      const [
        modulesRes,
        privilegesRes,
        rolePrivilegesRes
      ] = await Promise.all([

        supabase
          .from('system_privilege_categories')
          .select('*')
          .order('display_order', { ascending: true }),

        supabase
          .from('system_privileges')
          .select('*')
          .order('category_id', { ascending: true })
          .order('display_order', { ascending: true }),

        supabase
          .from('role_privileges')
          .select('privilege_id, is_enabled')
          .eq('role_id', roleId)
      ]);

      // --------------------------------------------------------
      // Error checking
      // --------------------------------------------------------

      if (modulesRes.error) {
        return res.status(400).json({
          error: modulesRes.error.message
        });
      }

      if (privilegesRes.error) {
        return res.status(400).json({
          error: privilegesRes.error.message
        });
      }

      if (rolePrivilegesRes.error) {
        return res.status(400).json({
          error: rolePrivilegesRes.error.message
        });
      }

      // --------------------------------------------------------
      // Create privilege map
      // --------------------------------------------------------

      const rolePrivilegeMap = new Map();

      (rolePrivilegesRes.data || []).forEach((item) => {
        rolePrivilegeMap.set(
          Number(item.privilege_id),
          item.is_enabled === true
        );
      });

      // --------------------------------------------------------
      // Build module structure
      // --------------------------------------------------------

      const result = (modulesRes.data || []).map((module) => {

        const modulePrivileges = (privilegesRes.data || [])
          .filter(
            (privilege) =>
              Number(privilege.category_id) === Number(module.id)
          )
          .map((privilege) => ({

            id: privilege.id,

            category_id: privilege.category_id,

            module_id: module.id,

            module_key: module.category_key,

            module_name_en: module.category_name_en,

            module_name_si: module.category_name_si,

            module_name_ta: module.category_name_ta,

            privilege_key: privilege.privilege_key,

            privilege_name_en: privilege.privilege_name_en,

            privilege_name_si: privilege.privilege_name_si,

            privilege_name_ta: privilege.privilege_name_ta,

            display_order: privilege.display_order,

            // Important:
            // If no role_privileges row exists,
            // privilege is considered FALSE.

            is_enabled:
              rolePrivilegeMap.get(Number(privilege.id)) === true
          }));

        return {
          module_id: module.id,

          module_key: module.category_key,

          module_name_en: module.category_name_en,

          module_name_si: module.category_name_si,

          module_name_ta: module.category_name_ta,

          display_order: module.display_order,

          privileges: modulePrivileges
        };
      });

      // --------------------------------------------------------
      // Response
      // --------------------------------------------------------

      return res.json({
        success: true,

        role_id: roleId,

        role_name: roleData.role_name,

        modules: result
      });

    } catch (error) {

      console.error(
        'Get privileges error:',
        error
      );

      return res.status(500).json({
        error: 'Failed to load privileges'
      });
    }
  }
);


// ============================================================
// 2. UPDATE ROLE PRIVILEGES
//    Required privilege: system_privilege_manage
// ============================================================

router.post(
  '/update',
  authenticate,
  checkPrivilege('system_privilege_manage'),
  async (req, res) => {

    try {

      const {
        role_id,
        privileges
      } = req.body;

      const roleId = Number(role_id);

      // --------------------------------------------------------
      // Validate request
      // --------------------------------------------------------

      if (!roleId) {
        return res.status(400).json({
          error: 'role_id is required'
        });
      }

      if (!Array.isArray(privileges)) {
        return res.status(400).json({
          error: 'privileges must be an array'
        });
      }

      // --------------------------------------------------------
      // Check role exists
      // --------------------------------------------------------

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, role_name')
        .eq('id', roleId)
        .single();

      if (roleError || !roleData) {
        return res.status(404).json({
          error: 'Role not found'
        });
      }

      // --------------------------------------------------------
      // Prevent editing Admin privileges manually
      //
      // Admin already has complete access through
      // checkPrivilege() Admin bypass.
      // --------------------------------------------------------

      if (roleData.role_name === 'Admin') {
        return res.status(400).json({
          error: 'Admin privileges cannot be modified manually'
        });
      }

      // --------------------------------------------------------
      // Prepare bulk payload
      // --------------------------------------------------------

      const bulkPayload = privileges
        .filter(
          (privilege) =>
            Number(privilege.privilege_id)
        )
        .map((privilege) => ({

          role_id: roleId,

          privilege_id:
            Number(privilege.privilege_id),

          is_enabled:
            privilege.is_enabled === true,

          updated_at:
            new Date().toISOString()

        }));

      // --------------------------------------------------------
      // No valid privileges
      // --------------------------------------------------------

      if (bulkPayload.length === 0) {
        return res.status(400).json({
          error: 'No valid privileges provided'
        });
      }

      // --------------------------------------------------------
      // Update / Insert role privileges
      // --------------------------------------------------------

      const { error: bulkError } = await supabase
        .from('role_privileges')
        .upsert(
          bulkPayload,
          {
            onConflict: 'role_id,privilege_id'
          }
        );

      if (bulkError) {

        console.error(
          'Bulk privilege update error:',
          bulkError
        );

        return res.status(400).json({
          error: bulkError.message
        });
      }

      // --------------------------------------------------------
      // Audit log
      // --------------------------------------------------------

      try {

        await logAudit(
          req.user.id,
          'SYSTEM_PRIVILEGES_UPDATED',
          'roles',
          roleId,
          null,
          {
            role_id: roleId,

            role_name:
              roleData.role_name,

            privilege_count:
              bulkPayload.length
          }
        );

      } catch (auditError) {

        console.error(
          'Audit log error:',
          auditError
        );

        // Do NOT fail the privilege update
        // because audit logging failed.
      }

      // --------------------------------------------------------
      // Success response
      // --------------------------------------------------------

      return res.json({

        success: true,

        message:
          'Privileges updated successfully.',

        role_id:
          roleId,

        role_name:
          roleData.role_name,

        updated_count:
          bulkPayload.length
      });

    } catch (error) {

      console.error(
        'Update privileges error:',
        error
      );

      return res.status(500).json({
        error: 'Failed to update privileges'
      });
    }
  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;