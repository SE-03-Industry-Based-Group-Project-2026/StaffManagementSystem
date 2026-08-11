const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { checkPrivilege } = require('../middleware/checkPrivilege');

const REPORT_ROLES = [
  'Admin',
  'Secretary',
  'Chairman',
  'CC Officer',
  'Subject Officer'
];

async function getCurrentUser(authId) {
  const { data } = await supabase
    .from('users')
    .select(`
      id,
      title,
      full_name,
      email,
      department_id,
      roles(role_name),
      departments(
        department_name,
        department_name_si,
        department_name_ta,
        department_type
      )
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

router.get('/leave-summary', authenticate, checkPrivilege('reports_view'), async (req, res) => {
  try {
    const { start_date, end_date, department_id, user_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        attachment_url,
        users!leave_requests_user_id_fkey(
          id,
          title,
          full_name,
          email,
          department_id,
          designations(designation_en, designation_si, designation_ta),
          departments(
            department_name,
            department_name_si,
            department_name_ta,
            department_type
          )
        ),
        leave_types(
          name_en,
          name_si,
          name_ta
        )
      `)
      .order('created_at', { ascending: false });

    query = applyDateFilter(query, 'created_at', start_date, end_date);

    if (department_id) {
      query = query.eq('users.department_id', department_id);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const rows = filterByRole(data || [], currentUser, department_id);
    const groupedRows = Object.values(
      rows.reduce((acc, row) => {
        const user = row.users;

        if (!user) return acc;

        if (!acc[user.id]) {
          acc[user.id] = {
            user: {
              id: user.id,
              full_name: `${user.title ? user.title + '. ' : ''}${user.full_name}`,
              email: user.email,
              department: user.departments?.department_name || '',
              department_si: user.departments?.department_name_si || '',
              department_ta: user.departments?.department_name_ta || '',
              designation: user.designations?.designation_en || '',
              designation_si: user.designations?.designation_si || '',
              designation_ta: user.designations?.designation_ta || '',
            },
            total_days: 0,
            leave_count: 0,
            records: []
          };
        }

        acc[user.id].records.push(row);
        acc[user.id].leave_count++;
        acc[user.id].total_days += Number(row.no_of_days || 0);

        return acc;
      }, {})
    );

    const statusCounts = countByStatus(rows, [
      'Pending',
      'Subject Officer Approved',
      'CC Officer Approved',
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
      details: groupedRows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/complaints', authenticate, checkPrivilege('reports_view'), async (req, res) => {
  try {
    const { start_date, end_date, department_id, user_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('complaints')
      .select(`
        *,
        users!complaints_user_id_fkey(
          id,
          title,
          full_name,
          email,
          department_id,
          departments(
            department_name,
            department_name_si,
            department_name_ta,
            department_type
          )
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

    if (user_id) {
      query = query.eq('user_id', user_id);
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

router.get('/tasks', authenticate, checkPrivilege('reports_view'), async (req, res) => {
  try {
    const { start_date, end_date, department_id, user_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(
          id,
          title,
          full_name,
          email,
          department_id,
          departments(
            department_name,
            department_name_si,
            department_name_ta,
            department_type
          )
        ),
        assigned_by_user:users!tasks_assigned_by_fkey(full_name, email),
        departments(
          department_name,
          department_name_si,
          department_name_ta,
          department_type
        )
      `)
      .order('due_date', { ascending: false });

    query = applyDateFilter(query, 'due_date', start_date, end_date);

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    if (user_id) {
      query = query.eq('assigned_to', user_id);
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

router.get('/staff', authenticate, checkPrivilege('reports_view'), async (req, res) => {
  try {
    const { department_id, user_id } = req.query;
    const currentUser = await getCurrentUser(req.user.id);

    let query = supabase
      .from('users')
      .select(`
        *,
        joined_date,
        designations(id, designation_en, designation_si, designation_ta),
        roles(id, role_name),
        departments(id, department_name, department_type, department_name_si, department_name_ta)
      `)
      .order('created_at', { ascending: false });

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    if (user_id) {
      query = query.eq('id', user_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    let rows = data || [];

    const adminRolesToExclude = [
      'admin',
      'system administrator',
      'chairman',
      'secretary',
      'pradeshiya secretary',
      'cc officer',
      'subject officer'
    ];

    rows = rows.filter((u) => {
      const roleName = String(u.roles?.role_name || '').toLowerCase().trim();
      return !adminRolesToExclude.includes(roleName);
    });

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

router.get('/employees', authenticate, checkPrivilege('reports_view'), async (req, res) => {
  try {
    const { department_id } = req.query;
    
    let query = supabase
      .from('users')
      .select('*, roles(role_name), departments(department_name)');

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const excludedRoles = [
      'admin', 
      'system administrator', 
      'chairman', 
      'secretary', 
      'cc officer', 
      'subject officer'
    ];

    const filteredEmployees = (data || []).filter(emp => {
      const roleName = String(emp.roles?.role_name || '').toLowerCase().trim();
      return !excludedRoles.includes(roleName);
    });

    res.json(filteredEmployees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;