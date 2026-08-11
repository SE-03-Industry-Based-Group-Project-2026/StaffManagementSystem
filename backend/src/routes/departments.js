const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { logAudit } = require('../services/auditService');

// Get all departments
router.get(
  '/all',
  authenticate,
  checkPrivilege('department_view'),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('department_name', { ascending: true });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data || []);
    } catch (error) {
      console.error('Load departments error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// Add department
router.post(
  '/add',
  authenticate,
  checkPrivilege('department_add'),
  async (req, res) => {
    try {
      const { department_name, department_name_si, department_name_ta, department_type, description, image_url } = req.body;
      
      const { data, error } = await supabase
        .from('departments')
        .insert([{ department_name, department_name_si, department_name_ta, department_type, description, image_url }])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, message: 'Department added successfully.', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// Update department
router.post(
  '/update',
  authenticate,
  checkPrivilege('department_edit'),
  async (req, res) => {
    try {
      const { id, department_name, department_name_si, department_name_ta, department_type, description, image_url } = req.body;

      const { data, error } = await supabase
        .from('departments')
        .update({ department_name, department_name_si, department_name_ta, department_type, description, image_url })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, message: 'Department updated successfully.', data });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

// Delete department
router.delete(
  '/delete/:id',
  authenticate,
  checkPrivilege('department_delete'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, message: 'Department deleted successfully.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;