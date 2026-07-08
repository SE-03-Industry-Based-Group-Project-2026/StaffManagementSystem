const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, checkRole } = require('../middleware/auth');

const REPORT_ROLES = ['Admin', 'Secretary', 'Chairman', 'Praja Officer', 'Department Head'];

async function getCurrentUser(authId) {
  const { data } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      department_id,
      roles(role_name),
      departments(department_name, department_type)
    `)
    .eq('auth_id', authId)
    .single();

  return data || null;
}

function applyDateFilter(query, column, startDate, endDate) {
  if (startDate) query = query.gte(column, startDate);
  if (endDate) query = query.lte(column, endDate);
  return query;
}

function getDeptId(row) {
  return (
    row.department_id ||
    row.users?.department_id ||
    row.assigned_to_user?.department_id ||
    null
  );
}

function getDeptType(row) {
  return (
    row.users?.departments?.department_type ||
    row.assigned_to_user?.departments?.department_type ||
    row.departments?.department_type ||
    null
  );
}

function filterByRole(rows, currentUser, departmentId) {
  let filtered = rows || [];
  const role = currentUser?.roles?.role_name;

  if (role === 'Praja Officer') {
    filtered = filtered.filter((r) =>
      ['Library', 'Preschool'].includes(getDeptType(r))
    );
  }

  if (role === 'Department Head') {
    filtered = filtered.filter((r) =>
      Number(getDeptId(r)) === Number(currentUser.department_id)
    );
  }

  if (departmentId) {
    filtered = filtered.filter((r) =>
      Number(getDeptId(r)) === Number(departmentId)
    );
  }

  return filtered;
}

function filterComplaintsByRole(rows, currentUser, departmentId) {
  let filtered = rows || [];
  const role = currentUser?.roles?.role_name;

  if (role === 'Praja Officer') {
    filtered = filtered.filter((r) =>
      ['Library', 'Preschool'].includes(r.departments?.department_type)
    );
  }

  if (role === 'Department Head') {
    filtered = filtered.filter((r) =>
      Number(r.department_id) === Number(currentUser.department_id)
    );
  }

  if (departmentId) {
    filtered = filtered.filter((r) =>
      Number(r.department_id) === Number(departmentId)
    );
  }

  return filtered;
}

function countByStatus(rows, statuses) {
  const result = {};
  statuses.forEach((s) => {
    result[s] = rows.filter((r) => r.status === s).length;
  });
  return result;
}

router.get('/leave-summary', authenticate, checkRole(REPORT_ROLES), async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        users!leave_requests_user_id_fkey(
          id,
          full_name,
          email,
          department_id,
          departments(department_name, department_type)
        ),
        leave_types(leave_type_name)
      `)
      .order('created_at', { ascending: false });

    query = applyDateFilter(query, 'created_at', start_date, end_date);

    if (department_id) {
      query = query.eq('users.department_id', department_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const rows = filterByRole(data || [], currentUser, department_id);

    const statusCounts = countByStatus(rows, [
      'Pending',
      'Admin Approved',
      'Praja Reviewed',
      'Approved',
      'Rejected',
      'Cancelled'
    ]);

    res.json({
      success: true,
      summary: {
        total_records: rows.length,
        total_days: rows.reduce((sum, r) => sum + Number(r.no_of_days || 0), 0),
        ...statusCounts
      },
      details: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/attendance', authenticate, checkRole(REPORT_ROLES), async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('attendance')
      .select(`
        *,
        users!attendance_user_id_fkey(
          id,
          full_name,
          email,
          department_id,
          departments(department_name, department_type)
        )
      `)
      .order('date', { ascending: false });

    query = applyDateFilter(query, 'date', start_date, end_date);

    if (department_id) {
      query = query.eq('users.department_id', department_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const rows = filterByRole(data || [], currentUser, department_id);
    const statusCounts = countByStatus(rows, ['Present', 'Absent', 'Late', 'On Leave']);

    res.json({
      success: true,
      summary: {
        total_records: rows.length,
        ...statusCounts
      },
      details: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/complaints', authenticate, checkRole(REPORT_ROLES), async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('complaints')
      .select(`
        *,
        users!complaints_user_id_fkey(
          id,
          full_name,
          email,
          department_id,
          departments(department_name, department_type)
        ),
        departments!complaints_department_id_fkey(
          department_name,
          department_type
        )
      `)
      .order('created_at', { ascending: false });

    query = applyDateFilter(query, 'created_at', start_date, end_date);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const rows = filterComplaintsByRole(data || [], currentUser, department_id);
    const statusCounts = countByStatus(rows, ['Open', 'In Progress', 'Resolved', 'Closed']);

    res.json({
      success: true,
      summary: {
        total_records: rows.length,
        ...statusCounts
      },
      details: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tasks', authenticate, checkRole(REPORT_ROLES), async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(
          id,
          full_name,
          email,
          department_id,
          departments(department_name, department_type)
        ),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
        departments(department_name, department_type)
      `)
      .order('due_date', { ascending: false });

    query = applyDateFilter(query, 'due_date', start_date, end_date);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const rows = filterByRole(data || [], currentUser, department_id);
    const statusCounts = countByStatus(rows, ['Pending', 'In Progress', 'Done']);

    res.json({
      success: true,
      summary: {
        total_records: rows.length,
        ...statusCounts,
        overdue: rows.filter((r) => r.status !== 'Done' && r.due_date && r.due_date < today).length
      },
      details: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/staff', authenticate, checkRole(REPORT_ROLES), async (req, res) => {
  try {
    const { department_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('users')
      .select(`
        *,
        roles(role_name),
        departments(department_name, department_type)
      `)
      .order('created_at', { ascending: false });

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    let rows = data || [];

    if (currentUser?.roles?.role_name === 'Praja Officer') {
      rows = rows.filter((u) =>
        ['Library', 'Preschool'].includes(u.departments?.department_type)
      );
    }

    if (currentUser?.roles?.role_name === 'Department Head') {
      rows = rows.filter((u) =>
        Number(u.department_id) === Number(currentUser.department_id)
      );
    }

    const summary = {
      total_records: rows.length,
      active: rows.filter((u) => u.is_active).length,
      inactive: rows.filter((u) => !u.is_active).length
    };

    res.json({ success: true, summary, details: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;