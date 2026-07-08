import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { StatCard } from '../components/PageParts';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import CountUp from 'react-countup';

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingLeaves: 0,
    adminApprovedLeaves: 0,
    prajaReviewedLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    laborLeaves: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    departments: 0,
    complaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });

  const [deptAttendance, setDeptAttendance] = useState({
    library: 0,
    preschool: 0,
    others: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countRows = async (table, filters = []) => {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    filters.forEach((filter) => {
      if (filter.type === 'eq') query = query.eq(filter.column, filter.value);
      if (filter.type === 'lt') query = query.lt(filter.column, filter.value);
      if (filter.type === 'neq') query = query.neq(filter.column, filter.value);
    });

    const { count } = await query;
    return count || 0;
  };

  const loadStats = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalStaff,
      pendingLeaves,
      adminApproved,
      prajaReviewed,
      approvedLeaves,
      rejectedLeaves,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      departments,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      attendanceData,
      auditData
    ] = await Promise.all([
      countRows('users', [{ type: 'eq', column: 'is_active', value: true }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Pending' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Admin Approved' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Praja Reviewed' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Approved' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Rejected' }]),
      countRows('attendance', [{ type: 'eq', column: 'date', value: today }, { type: 'eq', column: 'status', value: 'Present' }]),
      countRows('attendance', [{ type: 'eq', column: 'date', value: today }, { type: 'eq', column: 'status', value: 'Absent' }]),
      countRows('attendance', [{ type: 'eq', column: 'date', value: today }, { type: 'eq', column: 'status', value: 'Late' }]),
      countRows('attendance', [{ type: 'eq', column: 'date', value: today }, { type: 'eq', column: 'status', value: 'On Leave' }]),
      countRows('departments'),
      countRows('complaints', [{ type: 'eq', column: 'status', value: 'Open' }]),
      countRows('complaints', [{ type: 'eq', column: 'status', value: 'In Progress' }]),
      countRows('complaints', [{ type: 'eq', column: 'status', value: 'Resolved' }]),
      countRows('complaints', [{ type: 'eq', column: 'status', value: 'Closed' }]),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'Pending' }]),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'In Progress' }]),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'Done' }]),
      countRows('tasks', [{ type: 'neq', column: 'status', value: 'Done' }, { type: 'lt', column: 'due_date', value: today }]),
      supabase.from('attendance').select('status, users(departments(department_type))').eq('date', today),
      supabase.from('audit_logs').select('*, users(full_name, roles(role_name))').order('created_at', { ascending: false }).limit(5)
    ]);

    const deptBreakdown = { library: 0, preschool: 0, others: 0 };

    (attendanceData.data || []).forEach((row) => {
      if (row.status === 'Present') {
        const type = row.users?.departments?.department_type;
        if (type === 'Library') deptBreakdown.library += 1;
        else if (type === 'Preschool') deptBreakdown.preschool += 1;
        else deptBreakdown.others += 1;
      }
    });

    setDeptAttendance(deptBreakdown);

    setStats({
      totalStaff,
      pendingLeaves,
      adminApprovedLeaves: adminApproved,
      prajaReviewedLeaves: prajaReviewed,
      approvedLeaves,
      rejectedLeaves,
      laborLeaves: adminApproved,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      departments,
      complaints: openComplaints + inProgressComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    });

    setRecentActivities(auditData.data || []);
    setLoading(false);
  };

  const cardsByRole = {
    Admin: [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['clipboard', t('pending_admin_leaves'), stats.pendingLeaves, 'need_first_approval'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    Secretary: [
      ['clipboard', t('final_leave_approvals'), stats.adminApprovedLeaves + stats.prajaReviewedLeaves, 'waiting_final_decision'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    Chairman: [
      ['clipboard', t('labor_leave_approvals'), stats.laborLeaves, 'labor_leave_only'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    'Praja Officer': [
      ['clipboard', t('library_preschool_reviews'), stats.adminApprovedLeaves, 'need_review_note'],
      ['alert', t('complaints'), stats.complaints, 'library_preschool_complaints'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ]
  };

  const actionsByRole = {
    Admin: [
      ['users', t('register_staff'), 'add_manage_employees', '/staff'],
      ['building', t('departments'), 'manage_departments', '/departments'],
      ['clipboard', t('leave_requests'), 'first_approval_workflow', '/leave-requests'],
      ['check', t('attendance'), 'review_attendance', '/attendance'],
      ['alert', t('complaints'), 'track_complaints', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['report', t('reports'), 'view_all_reports', '/reports'],
      ['audit', t('audit_logs'), 'system_activity_logs', '/audit-logs']
    ],
    Secretary: [
      ['clipboard', t('leave_requests'), 'final_approval_except_labor', '/leave-requests'],
      ['check', t('attendance'), 'review_attendance', '/attendance'],
      ['alert', t('complaints'), 'update_complaint_process', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_all_reports', '/reports']
    ],
    Chairman: [
      ['clipboard', t('leave_requests'), 'approve_labor_leave_only', '/leave-requests'],
      ['check', t('attendance'), 'review_attendance', '/attendance'],
      ['alert', t('complaints'), 'update_complaint_process', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_reports', '/reports']
    ],
    'Praja Officer': [
      ['clipboard', t('leave_requests'), 'review_library_preschool_leave', '/leave-requests'],
      ['check', t('attendance'), 'review_library_preschool_attendance', '/attendance'],
      ['alert', t('complaints'), 'handle_library_preschool_complaints', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_notices', '/announcements'],
      ['report', t('reports'), 'library_preschool_reports', '/reports']
    ]
  };

  const leaveChart = [
    [t('pending'), stats.pendingLeaves, 'pending'],
    [t('admin_approved'), stats.adminApprovedLeaves, 'admin_approved'],
    [t('praja_reviewed'), stats.prajaReviewedLeaves, 'praja_reviewed'],
    [t('approved'), stats.approvedLeaves, 'approved'],
    [t('rejected'), stats.rejectedLeaves, 'rejected']
  ];

  const complaintChart = [
    [t('open'), stats.openComplaints, 'open'],
    [t('in_progress'), stats.inProgressComplaints, 'in_progress'],
    [t('resolved'), stats.resolvedComplaints, 'resolved'],
    [t('closed'), stats.closedComplaints, 'closed']
  ];

  const taskChart = [
    [t('pending'), stats.pendingTasks, 'pending'],
    [t('in_progress'), stats.inProgressTasks, 'in_progress'],
    [t('completed'), stats.completedTasks, 'completed'],
    [t('overdue'), stats.overdueTasks, 'overdue']
  ];

  const cards = cardsByRole[role] || cardsByRole.Admin;
  const actions = actionsByRole[role] || actionsByRole.Admin;

  if (loading) {
    return (
      <Layout>
        <div className="empty">{t('loading') || 'Loading...'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="page-hero"
        style={{
          background: 'linear-gradient(135deg, #8b0000, #b11226)',
          color: '#fff',
          padding: '34px 36px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 18px 35px rgba(139,0,0,.18)'
        }}
      >
        <div>
          <div
            className="pro-kicker"
            style={{
              color: 'rgba(255,255,255,.75)',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              marginBottom: 10
            }}
          >
            {getRoleText(role, t)} {t('workspace') || 'Workspace'}
          </div>

          <h2 style={{ fontSize: 34, margin: '0 0 10px 0', fontWeight: 800, lineHeight: 1.2 }}>
            {new Date().getHours() < 12
              ? 'Good Morning'
              : new Date().getHours() < 18
              ? 'Good Afternoon'
              : 'Good Evening'}
            , {user.full_name || t('user')}
          </h2>

          <p style={{ margin: 0, color: 'rgba(255,255,255,.86)', fontSize: 15 }}>
            {t('role_based_dashboard') || 'Role based dashboard for your assigned responsibilities.'}
          </p>
        </div>
      </div>

      <div className="pro-grid stats-grid" style={{ marginBottom: 24 }}>
        {cards.map(([icon, label, value, note]) => (
          <StatCard
            key={label}
            icon={icon}
            label={label}
            value={<CountUp end={value} duration={1.5} />}
            note={t(note) || note}
          />
        ))}
      </div>

      <div className="pro-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            {t('department_attendance')}
          </h3>
        </div>

        <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <MiniInfoCard icon="book" title={t('library')} value={deptAttendance.library} note={t('present')} color="#0284c7" bg="#e0f2fe" />
          <MiniInfoCard icon="users" title={t('preschool')} value={deptAttendance.preschool} note={t('present')} color="#16a34a" bg="#dcfce7" />
          <MiniInfoCard icon="building" title={t('other_departments')} value={deptAttendance.others} note={t('present')} color="#9333ea" bg="#f3e8ff" />
        </div>
      </div>

      <div className="pro-grid cards-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <DashboardChart title={t('leave_status_overview')} icon="clipboard" data={leaveChart} />
        <DashboardChart title={t('complaint_status_overview')} icon="alert" data={complaintChart} />
        <DashboardChart title={t('task_status_overview')} icon="clipboard" data={taskChart} />
      </div>

      <div className="pro-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{t('quick_actions')}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {actions.map(([icon, title, text, path]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                textAlign: 'left',
                margin: 0,
                padding: '20px',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                width: '100%',
                cursor: 'pointer'
              }}
              type="button"
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div
                  className="icon-box"
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AppIcon name={icon} size={20} />
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>{title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {t(text) !== text ? t(text) : text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pro-card" style={{ padding: '24px', borderRadius: '12px' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            {t('recent_activity')}
          </h3>
        </div>

        {recentActivities.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t('no_records_found')}</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {recentActivities.map((log, index) => {
              const activity = getActivityColor(log.action);

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                    padding: '16px',
                    background:
                      index === 0
                        ? 'linear-gradient(135deg, rgba(155,17,30,.06), rgba(255,255,255,.9))'
                        : 'var(--gray-50)',
                    border: '1px solid var(--border)',
                    borderRadius: 14
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: activity.bg,
                      color: activity.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <AppIcon name={getActivityIcon(log.action)} size={19} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong style={{ fontSize: 14, color: 'var(--text)' }}>
                        {formatAction(log.action)}
                      </strong>

                      <small style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {formatTimeAgo(log.created_at)}
                      </small>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                      {log.users?.full_name || 'System'} • {log.entity_type || '-'} #{log.entity_id || '-'}
                    </div>

                    {index === 0 && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 8,
                          padding: '4px 8px',
                          borderRadius: 999,
                          backgroundColor: 'rgba(155,17,30,.1)',
                          color: '#9b111e',
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function MiniInfoCard({ icon, title, value, note, color, bg }) {
  return (
    <div
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,.95), rgba(248,250,252,.9))',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div style={{ padding: '12px', backgroundColor: bg, color, borderRadius: '10px' }}>
        <AppIcon name={icon} size={24} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          {title}
        </h4>

        <div style={{ fontSize: '20px', fontWeight: 700 }}>
          {value}{' '}
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
            {note}
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardChart({ title, icon, data }) {
  const total = data.reduce((sum, [, value]) => sum + Number(value || 0), 0);

  const pieData = data
    .filter(([, value]) => Number(value || 0) > 0)
    .map(([label, value, key]) => ({
      name: label,
      value: Number(value || 0),
      key
    }));

  return (
    <div className="pro-card" style={{ margin: 0, padding: '20px', borderRadius: '12px' }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '16px', fontWeight: 600 }}>
          <AppIcon name={icon} size={18} />
          {title}
        </h3>

        <span className="badge badge-neutral">{total}</span>
      </div>

      {total === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 14, padding: 20, textAlign: 'center' }}>
          No data available
        </div>
      ) : (
        <>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {pieData.map((item) => (
                    <Cell key={item.key} fill={getStatusColor(item.key)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gap: 14, marginTop: 10 }}>
            {data.map(([label, value, key]) => {
              const percent = total > 0 ? Math.round((Number(value || 0) / total) * 100) : 0;

              return (
                <div key={`${label}-${key}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>

                  <div style={{ height: 8, borderRadius: 999, backgroundColor: 'var(--gray-100)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: getStatusColor(key),
                        transition: 'width .4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function getStatusColor(key = '') {
  const colors = {
    pending: '#f59e0b',
    admin_approved: '#2563eb',
    praja_reviewed: '#7c3aed',
    approved: '#16a34a',
    rejected: '#dc2626',
    open: '#f97316',
    in_progress: '#2563eb',
    resolved: '#16a34a',
    closed: '#64748b',
    completed: '#16a34a',
    overdue: '#dc2626'
  };

  return colors[key] || '#64748b';
}

function getActivityIcon(action = '') {
  if (action.includes('LEAVE')) return 'clipboard';
  if (action.includes('COMPLAINT')) return 'alert';
  if (action.includes('TASK')) return 'clipboard';
  if (action.includes('ATTENDANCE')) return 'check';
  if (action.includes('ANNOUNCEMENT')) return 'megaphone';
  return 'audit';
}

function getActivityColor(action = '') {
  if (action.includes('APPROVE')) return { bg: '#dcfce7', color: '#16a34a' };
  if (action.includes('REJECT')) return { bg: '#fee2e2', color: '#dc2626' };
  if (action.includes('COMPLAINT')) return { bg: '#ffedd5', color: '#f97316' };
  if (action.includes('TASK')) return { bg: '#dbeafe', color: '#2563eb' };
  return { bg: '#f1f5f9', color: '#64748b' };
}

function formatAction(action = '') {
  return action
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day ago`;

  return date.toLocaleDateString();
}

function getRoleText(roleName, t) {
  if (roleName === 'Praja Officer') return t('praja_officer') !== 'praja_officer' ? t('praja_officer') : 'Praja Officer';
  if (roleName === 'Admin') return t('admin') !== 'admin' ? t('admin') : 'Admin';
  if (roleName === 'Secretary') return t('secretary') !== 'secretary' ? t('secretary') : 'Secretary';
  if (roleName === 'Chairman') return t('chairman') !== 'chairman' ? t('chairman') : 'Chairman';
  return roleName;
}

export default Dashboard;