import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { StatCard } from '../components/PageParts';

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
    resolvedComplaints: 0
  });

  const [deptAttendance, setDeptAttendance] = useState({ library: 0, preschool: 0, others: 0 });
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
    });
    const { count } = await query;
    return count || 0;
  };

  const loadStats = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalStaff, pendingLeaves, adminApproved, prajaReviewed, approvedLeaves, rejectedLeaves,
      presentToday, absentToday, lateToday, onLeaveToday, departments,
      openComplaints, inProgressComplaints, resolvedComplaints, attendanceData
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
      supabase.from('attendance').select('status, users(departments(department_type))').eq('date', today)
    ]);

    const deptBreakdown = { library: 0, preschool: 0, others: 0 };
    (attendanceData.data || []).forEach(row => {
        if (row.status === 'Present') {
            const type = row.users?.departments?.department_type;
            if (type === 'Library') deptBreakdown.library += 1;
            else if (type === 'Preschool') deptBreakdown.preschool += 1;
            else deptBreakdown.others += 1;
        }
    });

    setDeptAttendance(deptBreakdown);
    setStats({
      totalStaff, pendingLeaves, adminApprovedLeaves: adminApproved, prajaReviews: prajaReviewed,
      approvedLeaves, rejectedLeaves, laborLeaves: adminApproved, presentToday,
      absentToday, lateToday, onLeaveToday, departments,
      complaints: openComplaints + inProgressComplaints, openComplaints,
      inProgressComplaints, resolvedComplaints
    });

    setLoading(false);
  };

  const cardsByRole = {
    Admin: [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['clipboard', t('pending_admin_leaves'), stats.pendingLeaves, 'need_first_approval'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress']
    ],
    Secretary: [
      ['clipboard', t('final_leave_approvals'), stats.adminApprovedLeaves + stats.prajaReviews, 'waiting_final_decision'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['users', t('total_staff'), stats.totalStaff, 'active']
    ],
    Chairman: [
      ['clipboard', t('labor_leave_approvals'), stats.laborLeaves, 'labor_leave_only'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['users', t('total_staff'), stats.totalStaff, 'active']
    ],
    'Praja Officer': [
      ['clipboard', t('library_preschool_reviews'), stats.adminApprovedLeaves, 'need_review_note'],
      ['alert', t('complaints'), stats.complaints, 'library_preschool_complaints']
    ]
  };

  const actionsByRole = {
    Admin: [['users', t('register_staff'), 'add_manage_employees', '/staff'], ['building', t('departments'), 'manage_departments', '/departments'], ['clipboard', t('leave_requests'), 'first_approval_workflow', '/leave-requests'], ['check', t('attendance'), 'review_attendance', '/attendance'], ['alert', t('complaints'), 'track_complaints', '/complaints'], ['audit', t('audit_logs'), 'system_activity_logs', '/audit-logs']],
    Secretary: [['clipboard', t('leave_requests'), 'final_approval_except_labor', '/leave-requests'], ['check', t('attendance'), 'review_attendance', '/attendance'], ['alert', t('complaints'), 'update_complaint_process', '/complaints'], ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'], ['report', t('reports'), 'view_all_reports', '/reports']],
    Chairman: [['clipboard', t('leave_requests'), 'approve_labor_leave_only', '/leave-requests'], ['check', t('attendance'), 'review_attendance', '/attendance'], ['alert', t('complaints'), 'update_complaint_process', '/complaints'], ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'], ['report', t('reports'), 'view_reports', '/reports']],
    'Praja Officer': [['clipboard', t('leave_requests'), 'review_library_preschool_leave', '/leave-requests'], ['check', t('attendance'), 'review_library_preschool_attendance', '/attendance'], ['alert', t('complaints'), 'handle_library_preschool_complaints', '/complaints'], ['megaphone', t('announcements'), 'send_notices', '/announcements'], ['report', t('reports'), 'library_preschool_reports', '/reports']]
  };

  const leaveChart = [
    [t('pending'), stats.pendingLeaves],
    [t('admin_approved'), stats.adminApprovedLeaves],
    [t('praja_reviewed'), stats.prajaReviews],
    [t('approved'), stats.approvedLeaves],
    [t('rejected'), stats.rejectedLeaves]
  ];

  const complaintChart = [
    [t('open'), stats.openComplaints],
    [t('in_progress'), stats.inProgressComplaints],
    [t('resolved'), stats.resolvedComplaints]
  ];

  const cards = cardsByRole[role] || cardsByRole.Admin;
  const actions = actionsByRole[role] || actionsByRole.Admin;

  if (loading) {
    return <Layout><div className="empty">{t('loading') || 'Loading...'}</div></Layout>;
  }

  return (
    <Layout>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <div>
          <div className="pro-kicker" style={{ color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>
            {getRoleText(role, t)} {t('workspace') || 'Workspace'}
          </div>
          <h2 style={{ fontSize: 32, margin: '8px 0', fontWeight: 800 }}>
            {t('welcome') || 'Welcome'}, {user.full_name || t('user')}
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.85)', fontSize: '14px' }}>
            {t('role_based_dashboard') || 'Role-based access view'}
          </p>
        </div>
      </div>

      <div className="pro-grid stats-grid" style={{ marginBottom: 24 }}>
        {cards.map(([icon, label, value, note]) => (
          <StatCard key={label} icon={icon} label={label} value={value} note={t(note) || note} />
        ))}
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '18px', fontWeight: 700 }}>
            <h3>{t('department_attendance')}</h3>
          </h3>
        </div>
        <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div style={{ padding: '20px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="icon-box" style={{ padding: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '10px' }}><AppIcon name="book" size={24} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{t('library') !== 'library' ? t('library') : 'පුස්තකාලය'}</h4>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{deptAttendance.library} <span style={{fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)'}}>{t('present') !== 'present' ? t('present') : 'පැමිණ ඇත'}</span></div>
            </div>
          </div>

          <div style={{ padding: '20px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="icon-box" style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '10px' }}><AppIcon name="users" size={24} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{t('preschool') !== 'preschool' ? t('preschool') : 'පෙර පාසල'}</h4>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{deptAttendance.preschool} <span style={{fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)'}}>{t('present') !== 'present' ? t('present') : 'පැමිණ ඇත'}</span></div>
            </div>
          </div>

          <div style={{ padding: '20px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="icon-box" style={{ padding: '12px', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '10px' }}><AppIcon name="building" size={24} /></div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{t('other_departments') !== 'other_departments' ? t('other_departments') : 'වෙනත් දෙපාර්තමේන්තු'}</h4>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{deptAttendance.others} <span style={{fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)'}}>{t('present') !== 'present' ? t('present') : 'පැමිණ ඇත'}</span></div>
            </div>
          </div>

        </div>
      </div>

      
      <div className="pro-grid cards-grid" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <DashboardChart title={t('leave_status_overview')} icon="clipboard" data={leaveChart} />
        <DashboardChart title={t('complaint_status_overview')} icon="alert" data={complaintChart} />
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '18px', fontWeight: 700 }}>{t('quick_actions')}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {actions.map(([icon, title, text, path]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{ textAlign: 'left', margin: 0, padding: '20px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              type="button"
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="icon-box" style={{ padding: '10px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AppIcon name={icon} size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>{title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{t(text) !== text ? t(text) : text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function DashboardChart({ title, icon, data }) {
  const total = data.reduce((sum, [, value]) => sum + Number(value || 0), 0);

  return (
    <div className="pro-card" style={{ margin: 0, backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px' }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', margin: 0, fontSize: '16px', fontWeight: 600 }}>
          <AppIcon name={icon} size={18} />
          {title}
        </h3>
        <span className="badge badge-neutral" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{total}</span>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {data.map(([label, value]) => {
          const percent = total > 0 ? Math.round((Number(value || 0) / total) * 100) : 0;

          return (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>{label}</span>
                <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
              </div>

              <div style={{ height: 8, borderRadius: 999, backgroundColor: 'var(--gray-100)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    transition: 'width .4s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRoleText(roleName, t) {
  if (roleName === 'Praja Officer') return t('praja_officer') !== 'praja_officer' ? t('praja_officer') : 'ප්‍රජා නිලධාරී';
  if (roleName === 'Admin') return t('admin') !== 'admin' ? t('admin') : 'පරිපාලක';
  if (roleName === 'Secretary') return t('secretary') !== 'secretary' ? t('secretary') : 'ලේකම්';
  if (roleName === 'Chairman') return t('chairman') !== 'chairman' ? t('chairman') : 'සභාපති';
  return roleName;
}

export default Dashboard;