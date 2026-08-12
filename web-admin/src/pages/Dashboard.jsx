import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, EmptyState } from '../components/PageParts';
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
import UserActivityCard from "../components/ActivityCards/UserActivityCard";
import TaskActivityCard from "../components/ActivityCards/TaskActivityCard";
import LeaveActivityCard from "../components/ActivityCards/LeaveActivityCard";
import AnnouncementActivityCard from "../components/ActivityCards/AnnouncementActivityCard";
import ComplaintActivityCard from "../components/ActivityCards/ComplaintActivityCard";
import DefaultActivityCard from "../components/ActivityCards/DefaultActivityCard";

function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const activeLanguage = String(
    language ||
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [stats, setStats] = useState({
    totalStaff: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    laborLeaves: 0,
    departments: 0,
    complaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    pendingProfileRequests: 0,
    auditLogs: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getRoleDisplayName = (userObj) => {
    if (!userObj) return isSinhala ? 'පරිපාලක' : 'Admin';

    const rolesObj = userObj?.roles;
    if (rolesObj) {
      if (isSinhala && rolesObj.role_name_si) return rolesObj.role_name_si;
      if (isTamil && rolesObj.role_name_ta) return rolesObj.role_name_ta;
    }

    const rawRole = String(
      userObj?.roles?.role_name ||
      userObj?.role ||
      userObj?.role_name ||
      'Admin'
    ).toLowerCase().trim();

    if (isSinhala) {
      if (rawRole.includes('admin')) return 'පරිපාලක';
      if (rawRole.includes('cc')) return 'සම්බන්ධීකරණ නිලධාරී';
      if (rawRole.includes('chairman')) return 'සභාපති';
      if (rawRole.includes('secretary')) return 'ලේකම්';
      if (rawRole.includes('subject')) return 'විෂය භාර නිලධාරී';
      if (rawRole.includes('staff')) return 'කාර්ය මණ්ඩලය';
    } else if (isTamil) {
      if (rawRole.includes('admin')) return 'நிர்வாகி';
      if (rawRole.includes('cc')) return 'ஒருங்கிணைப்பாளர்';
      if (rawRole.includes('chairman')) return 'தலைவர்';
      if (rawRole.includes('secretary')) return 'செயலாளர்';
      if (rawRole.includes('subject')) return 'விடய அதிகாரி';
      if (rawRole.includes('staff')) return 'ஊழியர்';
    }

    return userObj?.roles?.role_name || userObj?.role || userObj?.role_name || 'Admin';
  };

  const role =
    user?.roles?.role_name ||
    user?.role ||
    user?.role_name ||
    'Admin';

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countRows = async (table, filters = []) => {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });

      filters.forEach((filter) => {
        if (filter.type === 'eq') query = query.eq(filter.column, filter.value);
        if (filter.type === 'lt') query = query.lt(filter.column, filter.value);
        if (filter.type === 'neq') query = query.neq(filter.column, filter.value);
      });

      const { count, error } = await query;
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  };

  const getComplaintCount = async (status) => {
    let query = supabase
      .from('complaints')
      .select('id');

    if (status) {
      query = query.eq('status', status);
    }

    if (role === 'Chairman' || role === 'Secretary') {
      const { data: recipients } = await supabase
        .from('complaint_recipients')
        .select('complaint_id')
        .eq('recipient_id', user.id);

      const complaintIds =
        recipients?.map(r => r.complaint_id) || [];

      if (complaintIds.length === 0) {
        return 0;
      }

      query = query.in('id', complaintIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return 0;
    }

    return data?.length || 0;
  };

  const loadStats = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalStaff,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      departments,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      pendingProfileRequests,
      auditLogsCount
    ] = await Promise.all([
      countRows('users', [{ type: 'eq', column: 'is_active', value: true }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Pending' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Praja Reviewed' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Approved' }]),
      countRows('leave_requests', [{ type: 'eq', column: 'status', value: 'Rejected' }]),
      countRows('departments'),
      getComplaintCount('Open'),
      getComplaintCount('In Progress'),
      getComplaintCount('Resolved'),
      getComplaintCount('Closed'),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'Pending' }]),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'In Progress' }]),
      countRows('tasks', [{ type: 'eq', column: 'status', value: 'Done' }]),
      countRows('tasks', [{ type: 'neq', column: 'status', value: 'Done' }, { type: 'lt', column: 'due_date', value: today }]),
      countRows('profile_change_requests', [{ type: 'eq', column: 'status', value: 'pending' }]),
      countRows('audit_logs')
    ]);
    
    const { data: auditLogsData } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users(
          id,
          full_name,
          email,
          role_id,
          roles(
            role_name,
            role_name_si,
            role_name_ta
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      totalStaff,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      departments,
      complaints: openComplaints + inProgressComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      pendingProfileRequests,
      auditLogs: auditLogsCount
    });

    setRecentActivities(auditLogsData || []);
    setLoading(false);
  };

  const formatNameWithPrefix = (name = '') => {
    if (!name) return '';
    let cleaned = name.trim();
    cleaned = cleaned.replace(/^(mr|mrs|ms|dr)\.?(\s+|$)/i, (match, prefix) => {
      const lower = prefix.toLowerCase();
      let formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
      return formatted + '. ';
    });
    return cleaned;
  };

  const getProcessedActivities = () => {
    return recentActivities.map(log => {
      let processedLog = { ...log };
      
      if (processedLog.users) {
        const formattedName = formatNameWithPrefix(processedLog.users.full_name);
        processedLog.users.full_name = formattedName;
        processedLog.user = processedLog.users; 
      } else {
        processedLog.user = {};
      }
      
      return processedLog;
    });
  };

  const cardsByRole = {
    Admin: [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['users', t('profile_requests'), stats.pendingProfileRequests, 'pending_profile_requests'],
      ['audit', t('audit_logs'), stats.auditLogs, 'recent_system_activity']
    ],
    Secretary: [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['clipboard', t('final_leave_approvals'), stats.approvedLeaves, 'waiting_final_decision'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    'Subject Officer': [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['clipboard', t('leave_requests'), stats.pendingLeaves, 'need_first_approval'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    'CC Officer': [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['clipboard', t('leave_requests'), stats.pendingLeaves, 'waiting_final_decision'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ],
    Chairman: [
      ['users', t('total_staff'), stats.totalStaff, 'active'],
      ['building', t('departments'), stats.departments, 'total_departments'],
      ['clipboard', t('labor_leave_approvals'), stats.laborLeaves, 'labor_leave_only'],
      ['alert', t('complaints'), stats.complaints, 'open_in_progress'],
      ['clipboard', t('pending_tasks'), stats.pendingTasks, 'tasks_to_complete']
    ]
  };

  const actionsByRole = {
    Admin: [
      ['users', t('staff_management'), t('manage_staff'), '/staff'],
      ['building', t('departments'), t('manage_departments'), '/departments'],
      ['users', t('profile_requests'), t('pending_profile_requests'), '/profile-requests'],
      ['audit', t('audit_logs'), t('recent_system_activity'), '/audit-logs']
    ],
    Secretary: [
      ['users', t('staff_management'), 'view_staff_information', '/staff'],
      ['building', t('departments'), 'view_departments', '/departments'],
      ['clipboard', t('leave_requests'), 'leave_management_workflow', '/leave-requests'],
      ['alert', t('complaints'), 'update_complaint_process', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_all_reports', '/reports']
    ],
    'Subject Officer': [
      ['users', t('staff_management'), 'register_staff_permission', '/staff'],
      ['building', t('departments'), 'view_departments', '/departments'],
      ['clipboard', t('leave_requests'), 'leave_management_workflow', '/leave-requests'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_reports', '/reports']
    ],
    'CC Officer': [
      ['users', t('staff_management'), 'view_staff_information', '/staff'],
      ['building', t('departments'), 'view_departments', '/departments'],
      ['clipboard', t('leave_requests'), 'leave_management_workflow', '/leave-requests'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_reports', '/reports']
    ],
    Chairman: [
      ['users', t('staff_management'), 'view_staff_information', '/staff'],
      ['building', t('departments'), 'view_departments', '/departments'],
      ['clipboard', t('leave_requests'), 'approve_labor_leave_only', '/leave-requests'],
      ['alert', t('complaints'), 'update_complaint_process', '/complaints'],
      ['clipboard', t('task_allocation'), 'manage_staff_tasks', '/tasks'],
      ['megaphone', t('announcements'), 'send_scheduled_notices', '/announcements'],
      ['report', t('reports'), 'view_reports', '/reports']
    ]
  };

  const leaveChart = [
    [t('pending'), stats.pendingLeaves, 'pending'],
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
                 
        <div className="empty" style={styles.loading}>
          <div className="spinner-icon" />
          {t('loading') || 'Loading...'}</div>
      </Layout>
    );
  }

  const processedActivities = getProcessedActivities();

  return (
    <Layout>
      <div
        className="page-hero"
        style={{
          background: 'linear-gradient(#7a0018,#b11226,#d32f2f)',
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
            {getRoleDisplayName(user)} {t('workspace') || 'Workspace'}
          </div>

          <h2
            style={{
              fontSize: 34,
              margin: '0 0 10px 0',
              fontWeight: 800,
              lineHeight: 1.2
            }}
          >
            {new Date().getHours() < 12
              ? t('good_morning')
              : new Date().getHours() < 18
              ? t('good_afternoon')
              : t('good_evening')}
            , {getRoleDisplayName(user)}!
          </h2>

          <p style={{ margin: 0, color: 'rgba(255,255,255,.86)', fontSize: 15 }}>
            {t('manage_users_departments') || 'Role based dashboard for your assigned responsibilities.'}
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

      {role !== 'Admin' && (
        <div
          className="pro-grid cards-grid"
          style={{
            marginBottom: 24,
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          <DashboardChart
            title={t('leave_status_overview')}
            icon="clipboard"
            data={leaveChart}
            isSinhala={isSinhala}
            isTamil={isTamil}
            t={t}
          />

          {(role === 'Chairman' || role === 'Secretary') && (
            <DashboardChart
              title={t('complaint_status_overview')}
              icon="alert"
              data={complaintChart}
              isSinhala={isSinhala}
              isTamil={isTamil}
              t={t}
            />
          )}
          <DashboardChart
            title={t('task_status_overview')}
            icon="clipboard"
            data={taskChart}
            isSinhala={isSinhala}
            isTamil={isTamil}
            t={t}
          />
        </div>
      )}

      <div className="pro-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{t('quick_actions')}</h3>
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
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {t(text) !== text ? t(text) : text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pro-card" style={{ padding: '24px', borderRadius: '12px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('recent_activity')}
          </h3>
        </div>

        {processedActivities.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t('no_records_found')}</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {processedActivities.map((log) => {
              let details = {};
              
              try {
                if (log.new_value) {
                  let parsed = typeof log.new_value === 'string' ? JSON.parse(log.new_value) : log.new_value;
                  if (typeof parsed === 'string') parsed = JSON.parse(parsed); 
                  details = parsed || {};
                }
              } catch (e) {
                details = {};
              }

              if (log.entity_type === "users") {
                return <UserActivityCard key={log.id} log={log} details={details} t={t} />;
              }
              if (log.entity_type === "tasks") {
                return <TaskActivityCard key={log.id} log={log} details={details} t={t} />;
              }
              if (log.entity_type === "leave_requests") {
                return <LeaveActivityCard key={log.id} log={log} details={details} t={t} />;
              }
              if (log.entity_type === "announcements") {
                return <AnnouncementActivityCard key={log.id} log={log} details={details} t={t} />;
              }
              if (log.entity_type === "complaints") {
                return <ComplaintActivityCard key={log.id} log={log} details={details} t={t} />;
              }

              return <DefaultActivityCard key={log.id} log={log} details={details} t={t} />;
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

function DashboardChart({ title, icon, data, isSinhala, isTamil, t }) {
  const total = data.reduce((sum, [, value]) => sum + Number(value || 0), 0);

  const pieData = data
    .filter(([, value]) => Number(value || 0) > 0)
    .map(([label, value, key]) => ({
      name: label,
      value: Number(value || 0),
      key
    }));

  const noDataText = isSinhala ? 'දත්ත නොමැත' : isTamil ? 'தரவுகள் இல்லை' : 'No data available';

  return (
    <div className="pro-card" style={{ margin: 0, padding: '20px', borderRadius: '12px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <AppIcon name={icon} size={18} />
          {title}
        </h3>

        <span className="badge badge-neutral">{total}</span>
      </div>

      {total === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 14, padding: 20, textAlign: 'center' }}>
          {noDataText}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text-primary)' }}>
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

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--text-secondary)'
  }
};

export default Dashboard;