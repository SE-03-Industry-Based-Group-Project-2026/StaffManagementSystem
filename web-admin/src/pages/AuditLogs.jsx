import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';

function AuditLogs() {
  const { t } = useLanguage();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadRoles();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*').order('role_name');
    setRoles(data || []);
  };

  const loadLogs = async () => {
    setLoading(true);

    let query = supabase
      .from('audit_logs')
      .select('*, users(full_name, email, role_id, roles(role_name))')
      .order('created_at', { ascending: false });

    if (filter) query = query.ilike('action', `%${filter}%`);
    if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

    const { data } = await query;
    let fetchedLogs = data || [];

    if (roleFilter !== 'all') {
      fetchedLogs = fetchedLogs.filter((log) => String(log.users?.role_id) === String(roleFilter));
    }

    setLogs(fetchedLogs);
    setLoading(false);
  };

  const resetFilters = async () => {
  setFilter('');
  setStartDate('');
  setEndDate('');
  setRoleFilter('all');

  const { data } = await supabase
    .from('audit_logs')
    .select('*, users(full_name, email, role_id, roles(role_name))')
    .order('created_at', { ascending: false });

  setLogs(data || []);
};

  const stats = useMemo(() => {
    return {
      total: logs.length,
      approvals: logs.filter((l) => l.action?.includes('APPROVE')).length,
      rejections: logs.filter((l) => l.action?.includes('REJECT')).length,
      system: logs.filter((l) => !l.users).length
    };
  }, [logs]);

  const getActionColor = (action = '') => {
    if (action.includes('APPROVE')) return colors.success;
    if (action.includes('REJECT')) return colors.error;
    if (action.includes('CREATE') || action.includes('ADD')) return colors.primary;
    if (action.includes('UPDATE') || action.includes('EDIT')) return '#2563eb';
    if (action.includes('DELETE')) return '#dc2626';
    return colors.gray500;
  };

  const formatAction = (action = '') => {
    return action
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>{t('loading')}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconBox}>
                <AppIcon name="audit" size={24} />
              </span>
              {t('audit_logs')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('audit_logs')}</p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <InfoCard icon="audit" label={tr('total_logs', 'Total Logs')} value={stats.total} />
          <InfoCard icon="check" label={tr('approvals', 'Approvals')} value={stats.approvals} tone="success" />
          <InfoCard icon="x" label={tr('rejections', 'Rejections')} value={stats.rejections} tone="danger" />
          <InfoCard icon="shield" label={tr('system_auto', 'System/Auto')} value={stats.system} tone="info" />
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="search" size={16} />
                {t('search_action')}
              </label>
              <input
                type="text"
                placeholder={t('search_action')}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="users" size={16} />
                {t('role') || 'Role'}
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">{t('all_roles') || 'All Roles'}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {tr(getTranslationKey(r.role_name), r.role_name)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="calendar" size={16} />
                {t('start_date')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="calendar" size={16} />
                {t('end_date')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>&nbsp;</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={loadLogs} style={styles.primaryBtn} type="button">
                  {t('apply_filters')}
                </button>
                <button onClick={resetFilters} style={styles.secondaryBtn} type="button">
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{t('system_activity_logs')}</h2>
            <span className="badge badge-neutral">
              {logs.length} {t('records')}
            </span>
          </div>

          {logs.length === 0 ? (
            <div style={styles.emptyState}>
              <AppIcon name="audit" size={38} />
              <h3>{tr('no_audit_logs_found', 'No audit logs found')}</h3>
              <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>{t('timestamp')}</th>
                    <th style={styles.th}>{t('user')}</th>
                    <th style={styles.th}>{t('action')}</th>
                    <th style={styles.th}>{t('details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={styles.tr}>
                      <td style={styles.td}>{new Date(log.created_at).toLocaleDateString()}  {new Date(log.created_at).toLocaleTimeString()}</td>

                      <td style={styles.td}>
                        <strong>{log.users?.full_name || tr('manual', 'System')}</strong>
                        <br />
                        <small style={{ color: 'var(--muted)' }}>
                          {log.users?.roles?.role_name
                            ? tr(getTranslationKey(log.users.roles.role_name), log.users.roles.role_name)
                            : tr('system_auto', 'System/Auto')}
                        </small>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.actionBadge,
                            backgroundColor: getActionColor(log.action)
                          }}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {log.entity_type || '-'} {log.entity_id ? `(ID: ${log.entity_id})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    danger: { bg: '#fee2e2', color: '#dc2626' },
    info: { bg: '#dbeafe', color: '#2563eb' }
  };

  const selected = toneMap[tone] || toneMap.default;

  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, backgroundColor: selected.bg, color: selected.color }}>
        <AppIcon name={icon} size={22} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: {
    display: 'flex',
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 12,
    border: '1px solid var(--border)'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  titleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'var(--primary-soft)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  breadcrumb: { fontSize: 14, color: 'var(--muted)', margin: 0 },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 16,
    marginBottom: 24,
    padding: '0 24px'
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 18,
    borderRadius: 12,
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { fontSize: 24, fontWeight: 800, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 3 },
  filtersCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 24,
    borderRadius: 12,
    margin: '0 24px 24px',
    border: '1px solid var(--border)'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 20,
    alignItems: 'end'
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  filterLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  filterInput: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box'
  },
  filterSelect: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  dateInput: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box'
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  secondaryBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--gray-100)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  contentCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 12,
    margin: '0 24px',
    border: '1px solid var(--border)'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  emptyState: {
    padding: 54,
    textAlign: 'center',
    color: 'var(--muted)'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: {
    padding: 16,
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
    borderBottom: '2px solid var(--border)'
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: 16, fontSize: 14, color: 'var(--text)' },
  actionBadge: {
    padding: '6px 12px',
  borderRadius: 999,
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  display: 'inline-block',
  maxWidth: 260,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--muted)'
  }
};

export default AuditLogs;