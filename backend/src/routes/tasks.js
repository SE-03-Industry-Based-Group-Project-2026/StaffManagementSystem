const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { translateToAllLanguages } = require('../services/translationService');

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Done'];

const normalizeText = (value = '') => String(value).trim().toLowerCase();

async function getCurrentUser(authId) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      department_id,
      designations(designation_en, designation_si, designation_ta),
      roles(role_name),
      departments(department_name, department_name_si, department_name_ta, department_type)
    `)
    .eq('auth_id', authId)
    .single();

  if (error || !data) return null;
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      department_id,
      designations(designation_en, designation_si, designation_ta),
      is_active,
      roles(role_name),
      departments(department_name, department_name_si, department_name_ta, department_type)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

async function getDepartmentById(id) {
  const { data, error } = await supabase
    .from('departments')
    .select('id, department_name, department_name_si, department_name_ta, department_type')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

function isDepartmentAllowedForRole(assigner, department) {
  const role = normalizeText(assigner.roles?.role_name);

  if (
    role === 'chairman' ||
    role === 'secretary' ||
    role === 'cc officer' ||
    role === 'subject officer'
  ) {
    return true;
  }

  const departmentType = normalizeText(department?.department_type);
  if (role === 'praja officer') {
    return ['library', 'preschool'].includes(departmentType);
  }

  return false;
}

function canAssignTask(assigner, assignee, department) {
  if (!assigner || !assignee || !department) return false;

  if (Number(assignee.department_id) !== Number(department.id)) return false;
  if (assignee.is_active === false) return false;

  return isDepartmentAllowedForRole(assigner, department);
}

router.post(
  '/assign',
  authenticate,
  checkPrivilege('task_assign'),
  async (req, res) => {
    try {
      const { title, description, assigned_to, department_id, due_date } = req.body;
      const cleanTitle = String(title || '').trim();
      const cleanDescription = String(description || '').trim();

      if (!cleanTitle || !assigned_to || !department_id || !due_date) {
        return res.status(400).json({
          error: 'Title, assigned staff, department and due date are required'
        });
      }

      const selectedDueDate = new Date(`${due_date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(selectedDueDate.getTime())) {
        return res.status(400).json({ error: 'Invalid due date' });
      }

      if (selectedDueDate < today) {
        return res.status(400).json({ error: 'Due date cannot be in the past' });
      }

      const [assigner, assignee, department] = await Promise.all([
        getCurrentUser(req.user.id),
        getUserById(assigned_to),
        getDepartmentById(department_id)
      ]);

      if (!assigner) return res.status(404).json({ error: 'Assigner not found' });
      if (!assignee) return res.status(404).json({ error: 'Assigned staff not found' });
      if (!department) return res.status(404).json({ error: 'Department not found' });

      if (!canAssignTask(assigner, assignee, department)) {
        return res.status(403).json({
          error: 'You are not allowed to assign a task to this staff member or department'
        });
      }

      const translatedTitle = await translateToAllLanguages(cleanTitle);
      const translatedDescription = cleanDescription
        ? await translateToAllLanguages(cleanDescription)
        : { en: '', si: '', ta: '' };

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: translatedTitle.en,
          description: translatedDescription.en,
          title_en: translatedTitle.en,
          title_si: translatedTitle.si,
          title_ta: translatedTitle.ta,
          description_en: translatedDescription.en,
          description_si: translatedDescription.si,
          description_ta: translatedDescription.ta,
          assigned_to: assignee.id,
          department_id: department.id,
          due_date,
          assigned_by: assigner.id,
          status: 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          assigned_to_user:users!tasks_assigned_to_fkey(full_name, email),
          assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
          departments(department_name, department_name_si, department_name_ta, department_type)
        `)
        .single();

      if (error) return res.status(400).json({ error: error.message });

      await Promise.all([
        createNotification({
          userId: assignee.id,
          notificationKey: 'task_assigned',
          payload: {
            assigned_by: assigner.full_name,
            task_title: cleanTitle
          },
          notificationType: 'Task',
          relatedEntity: 'tasks',
          relatedId: data.id,
          createdBy: assigner.id
        }),
        logAudit(
          assigner.id,
          'ASSIGN_TASK',
          'tasks',
          data.id,
          null, 
          {
            title: cleanTitle,
            assigned_to: assignee.full_name,
            due_date: due_date
          }
        )
      ]);

      return res.json({ success: true, message: 'Task assigned successfully', data });
    } catch (err) {
      console.error('Assign task error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

router.get(
  '/all',
  authenticate,
  checkPrivilege('task_view'),
  async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) return res.status(404).json({ error: 'User not found' });

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_user:users!tasks_assigned_to_fkey(
            id,
            full_name,
            email,
            department_id,
            roles(role_name),
            designations(designation_en, designation_si, designation_ta),
            departments(department_name, department_name_si, department_name_ta, department_type)
          ),
          assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
          departments(department_name, department_name_si, department_name_ta, department_type)
        `)
        .order('created_at', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });

      return res.json(data || []);
    } catch (err) {
      console.error('Load all tasks error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

router.get(
  '/my-tasks',
  authenticate,
  checkPrivilege('task_view'),
  async (req, res) => {
    try {
      const user = await getCurrentUser(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
          departments(department_name, department_name_si, department_name_ta, department_type)
        `)
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });
      return res.json(data || []);
    } catch (err) {
      console.error('Load my tasks error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

router.put('/status/:id', authenticate, async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status, progress_note } = req.body;

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid task status' });
    }

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(full_name),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email)
      `)
      .eq('id', taskId)
      .single();

    if (taskError || !task) return res.status(404).json({ error: 'Task not found' });

    if (Number(task.assigned_to) !== Number(user.id)) {
      return res.status(403).json({ error: 'You can update only your assigned tasks' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select(`*, departments(department_name, department_name_si, department_name_ta, department_type)`)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    const cleanProgressNote = String(progress_note || '').trim();

    await Promise.all([
      createNotification({
        userId: task.assigned_by,
        notificationKey: 'task_status_updated',
        payload: {
          updated_by: user.full_name,
          task_title: task.title,
          status,
          note: cleanProgressNote || ''
        },
        notificationType: 'Task',
        relatedEntity: 'tasks',
        relatedId: taskId,
        createdBy: user.id
      }),
      logAudit(
        user.id,
        'TASK_STATUS_UPDATED',
        'tasks',
        taskId,
        {
          status: task.status
        },
        {
          status,
          progress_note: cleanProgressNote
        }
      )
    ]);

    return res.json({ success: true, message: 'Task status updated successfully', data });
  } catch (err) {
    console.error('Update task status error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;