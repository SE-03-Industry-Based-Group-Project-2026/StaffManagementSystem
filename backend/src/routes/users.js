const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');
const { logAudit } = require('../services/auditService');

// Get all staff members with Role-wise Privilege check
router.get(
  '/all',
  authenticate,
  checkRole([
    'Admin',
    'Secretary',
    'Chairman',
    'CC Officer',
    'Subject Officer'
  ]),
  async (req, res) => {
    try {
      const roleName = req.userRole; 
      const roleId = req.userData.role_id;

      // Admin හැර අනෙක් සියලුම Roles සඳහා System Privileges (ටොගල්) පරීක්ෂා කිරීම
      if (roleName !== 'Admin') {
        const { data: privData } = await supabase
          .from('role_privileges')
          .select('is_enabled, system_privileges!inner(privilege_key)')
          .eq('role_id', roleId)
          .eq('system_privileges.privilege_key', 'staff_view_profile')
          .maybeSingle();

        // System Privileges පුවරුවෙන් Off කර ඇත්නම් ප්‍රවේශය සම්පූර්ණයෙන්ම අවහිර කරයි
        if (!privData || privData.is_enabled !== true) {
          return res.status(403).json({ 
            error: `Access denied. This privilege is disabled for your role (${roleName}).` 
          });
        }
      }

      // ඩේටා ලබා දීම
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles(role_name),
          departments(department_name, department_name_si, department_name_ta, department_type),
          designations(id, designation_en, designation_si, designation_ta)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data || []);
    } catch (error) {
      console.error('Load staff error:', error);
      return res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
);

router.post(
  '/register',
  authenticate,
  checkRole(['Admin', 'Subject Officer']),
  async (req, res) => {
    try {
      const roleName = req.userRole;
      const roleId = req.userData.role_id;

      if (roleName !== 'Admin') {
        const { data: privData } = await supabase
          .from('role_privileges')
          .select('is_enabled, system_privileges!inner(privilege_key)')
          .eq('role_id', roleId)
          .eq('system_privileges.privilege_key', 'staff_add_staff')
          .maybeSingle();

        if (!privData || privData.is_enabled !== true) {
          return res.status(403).json({ 
            error: `Access denied. Add staff privilege is disabled for your role (${roleName}).` 
          });
        }
      }

      const {
        nic,
        title,
        email,
        password,
        full_name,
        phone,
        designation_id,
        staff_category,
        gender,
        birthday,
        joined_date,
        role_id,
        department_id,
        leave_year,
        casual_used,
        medical_used,
        short_used
      } = req.body;

      if (
        !nic ||
        !email ||
        !password ||
        !full_name ||
        !designation_id ||
        !department_id ||
        !role_id
      ) {
        return res.status(400).json({
          error: 'Required fields are missing.'
        });
      }

      // Check duplicate email
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists.' });
      }

      // Check duplicate NIC
      const { data: existingNic } = await supabase
        .from('users')
        .select('id')
        .eq('nic', nic)
        .maybeSingle();

      if (existingNic) {
        return res.status(400).json({ error: 'NIC already exists.' });
      }

      // Create Supabase Auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // Insert user
      const { data: userData, error: insertError } =
        await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            nic,
            title,
            full_name,
            email,
            phone,
            designation_id,
            department_id,
            role_id,
            staff_category,
            gender,
            birthday,
            joined_date,
            is_active: true
          })
          .select()
          .single();

      if (insertError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ error: insertError.message });
      }

      const currentYear = leave_year ? parseInt(leave_year, 10) : new Date().getFullYear();

      const { data: leaveTypes, error: ltError } = await supabase
        .from('leave_types')
        .select('*');

      if (!ltError && leaveTypes && leaveTypes.length > 0) {
        const balancesToInsert = leaveTypes.map((lt) => {
          const typeName = lt.name_en ? lt.name_en.toLowerCase() : '';
          let allocated = lt.max_days || 0;
          let used = 0;

          if (typeName.includes('casual')) {
            used = casual_used ? parseFloat(casual_used) : 0;
          } else if (typeName.includes('medical')) {
            used = medical_used ? parseFloat(medical_used) : 0;
          } else if (typeName.includes('short')) {
            used = short_used ? parseFloat(short_used) : 0;
          }

          const remaining = Math.max(allocated - used, 0);

          return {
            user_id: userData.id,
            leave_type_id: lt.id,
            year: currentYear,
            allocated_days: allocated,
            used_days: used,
            remaining_days: remaining
          };
        });

        await supabase.from('user_leave_balances').insert(balancesToInsert);
      }

      await supabase.from('audit_logs').insert([
        {
          user_id: req.userData?.id,
          action: 'STAFF_REGISTERED',
          entity_type: 'users',
          entity_id: userData.id,
          new_value: JSON.stringify({ title, full_name, email }),
          created_at: new Date().toISOString()
        }
      ]);

      return res.json({
        success: true,
        message: 'Staff registered successfully.'
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;