const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

async function getCurrentUser(authId) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      department_id,
      designation,
      roles(role_name),
      departments(department_name, department_type)
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
      designation,
      roles(role_name),
      departments(department_name, department_type)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

function canAssignTask(assigner, assignee, departmentId) {
  const role = assigner.roles?.role_name;
  const assigneeDeptName = assignee.departments?.department_name;
  const assigneeDeptType = assignee.departments?.department_type;

  if (role === 'Chairman') return true;

  if (role === 'Secretary') return true;

  if (role === 'Praja Officer') {
    return ['Library', 'Preschool'].includes(assigneeDeptType);
  }

  if (role === 'Admin') {
    return ['Engineering', 'Development & Planning'].includes(assigneeDeptName);
  }

  if (role === 'Department Head') {
    return Number(departmentId) === Number(assigner.department_id);
  }

  return false;
}

async function notifyUser(userId, title, message, relatedId) {
  await supabase.from('notifications').insert([{
    user_id: userId,
    title,
    message,
    is_read: false,
    is_auto_generated: true,
    notification_type: 'Task',
    related_entity: 'tasks',
    related_id: relatedId || null,
    created_at: new Date()
  }]);
}

// Assign task from web admin
router.post('/assign', authenticate, checkRole(['Admin', 'Praja Officer', 'Secretary', 'Chairman', 'Department Head']), async (req, res) => {
  try {
    const { title, description, assigned_to, department_id, frequency, due_date } = req.body;

    if (!title || !assigned_to || !department_id || !frequency || !due_date) {
      return res.status(400).json({ error: 'Title, assigned staff, department, frequency and due date are required' });
    }

    const allowedFrequency = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
    if (!allowedFrequency.includes(frequency)) {
      return res.status(400).json({ error: 'Invalid task frequency' });
    }

    const assigner = await getCurrentUser(req.user.id);
    const assignee = await getUserById(assigned_to);

    if (!assigner) return res.status(404).json({ error: 'Assigner not found' });
    if (!assignee) return res.status(404).json({ error: 'Assigned staff not found' });

    if (!canAssignTask(assigner, assignee, department_id)) {
      return res.status(403).json({ error: 'You are not allowed to assign this task to this staff member' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description,
        assigned_to,
        department_id,
        frequency,
        due_date,
        assigned_by: assigner.id,
        status: 'Pending',
        created_at: new Date()
      }])
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(full_name, email),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
        departments(department_name)
      `)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await notifyUser(
      assigned_to,
      'New Task Assigned',
      `${assigner.full_name} assigned you a ${frequency} task: ${title}`,
      data.id
    );

    await supabase.from('audit_logs').insert([{
      user_id: assigner.id,
      action: 'ASSIGN_TASK',
      entity_type: 'tasks',
      entity_id: data.id,
      new_value: title
    }]);

    res.json({ success: true, message: 'Task assigned successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Web admin task list
router.get('/all', authenticate, checkRole(['Admin', 'Praja Officer', 'Secretary', 'Chairman']), async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req.user.id);
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const role = currentUser.roles?.role_name;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(full_name, email, department_id, roles(role_name), departments(department_name, department_type)),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
        departments(department_name, department_type)
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    let rows = data || [];

    if (role === 'Admin') {
  rows = rows.filter(t =>
    ['Engineering', 'Development & Planning'].includes(t.departments?.department_name)
  );
}

    if (role === 'Praja Officer') {
      rows = rows.filter(t =>
        ['Library', 'Preschool'].includes(t.departments?.department_type)
      );
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mobile app: staff sees own tasks
router.get('/my-tasks', authenticate, checkRole(['Staff', 'Department Head', 'Secretary', 'Praja Officer']), async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
        departments(department_name, department_type)
      `)
      .eq('assigned_to', user.id)
      .order('due_date', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mobile app: update task status
router.put('/status/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress_note } = req.body;

    const allowedStatuses = ['Pending', 'In Progress', 'Done'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid task status' });
    }

    const user = await getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: task } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(full_name),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email)
      `)
      .eq('id', id)
      .single();

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.assigned_to !== user.id) {
      return res.status(403).json({ error: 'You can update only your assigned tasks' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await notifyUser(
      task.assigned_by,
      'Task Status Updated',
      `${user.full_name} updated "${task.title}" to ${status}.${progress_note ? ` Note: ${progress_note}` : ''}`,
      Number(id)
    );

    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      action: `UPDATE_TASK_STATUS_${status.toUpperCase().replace(/\s+/g, '_')}`,
      entity_type: 'tasks',
      entity_id: Number(id),
      new_value: status
    }]);

    res.json({ success: true, message: 'Task status updated successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;