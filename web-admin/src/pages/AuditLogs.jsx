import React, { useState, useEffect } from 'react';
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
  
  // 🔴 Filters State
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // අලුත් Role Filter එක
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadRoles();
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Roles ටික Database එකෙන් ලබාගැනීම
  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*');
    setRoles(data || []);
  };

  const loadLogs = async () => {
    // 🔴 Role දත්ත ලබාගැනීම සඳහා query එක යාවත්කාලීන කර ඇත
    let query = supabase
      .from('audit_logs')
      .select('*, users(full_name, email, role_id, roles(role_name))')
      .order('created_at', { ascending: false });

    if (filter) query = query.ilike('action', `%${filter}%`);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data } = await query;
    let fetchedLogs = data || [];

    // 🔴 Role එක අනුව Frontend Filtering (මොකද සමහර logs system generated ඒවා නිසා users null වෙන්න පුළුවන්)
    if (roleFilter !== 'all') {
      fetchedLogs = fetchedLogs.filter(log => String(log.users?.role_id) === String(roleFilter));
    }

    setLogs(fetchedLogs);
    setLoading(false);
  };

  const resetFilters = () => {
    setFilter(''); 
    setStartDate(''); 
    setEndDate(''); 
    setRoleFilter('all'); // Role filter එකත් reset කිරීම
    setTimeout(loadLogs, 0);
  };

  const getActionColor = (action = '') => {
    if (action.includes('APPROVE')) return colors.success;
    if (action.includes('REJECT')) return colors.error;
    return colors.gray500;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  if (loading) { return <Layout><div style={styles.loading}>{t('loading')}</div></Layout>; }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}><span style={styles.titleIconBox}><AppIcon name="audit" size={24} /></span>{t('audit_logs')}</h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('audit_logs')}</p>
          </div>
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.filtersGrid}>
            
            {/* Action Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}><AppIcon name="audit" size={16} />{t('search_action')}</label>
              <input type="text" placeholder={t('search_action')} value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterInput} />
            </div>

            {/* 🔴 Supervisor Change 12: Role Filter Dropdown */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}><AppIcon name="users" size={16} />{t('role') || 'Role'}</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{t('all_roles') || 'All Roles'}</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{t(getTranslationKey(r.role_name)) || r.role_name}</option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}><AppIcon name="calendar" size={16} />{t('start_date')}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>&nbsp;</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={loadLogs} style={styles.primaryBtn}>{t('apply_filters')}</button>
                <button onClick={resetFilters} style={styles.secondaryBtn}>{t('reset')}</button>
              </div>
            </div>

          </div>
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}><h2 style={styles.cardTitle}>{t('system_activity_logs')}</h2></div>
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
                    <td style={styles.td}>{new Date(log.created_at).toLocaleString()}</td>
                    
                    {/* 🔴 Table Data: නමට යටින් Role එකත් පෙන්වීම */}
                    <td style={styles.td}>
                      <strong>{log.users?.full_name || t('manual') || 'System'}</strong><br/>
                      <small style={{ color: 'var(--muted)' }}>
                        {log.users?.roles?.role_name ? (t(getTranslationKey(log.users.roles.role_name)) || log.users.roles.role_name) : 'System/Auto'}
                      </small>
                    </td>

                    <td style={styles.td}><span style={{ ...styles.actionBadge, backgroundColor: getActionColor(log.action) }}>{log.action}</span></td>
                    <td style={styles.td}>{log.entity_type} (ID: {log.entity_id})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: { display: 'flex', padding: 24, backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--muted)', margin: 0 },
  filtersCard: { backgroundColor: 'var(--bg-secondary)', padding: 24, borderRadius: 12, margin: '24px', border: '1px solid var(--border)' },
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, alignItems: 'end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  filterLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 },
  filterInput: { padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--gray-50)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' },
  filterSelect: { padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--gray-50)', color: 'var(--text)', width: '100%', boxSizing: 'border-box', cursor: 'pointer' },
  dateInput: { padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--gray-50)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' },
  primaryBtn: { padding: '12px 24px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  secondaryBtn: { padding: '12px 24px', backgroundColor: 'var(--gray-100)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  contentCard: { backgroundColor: 'var(--bg-secondary)', borderRadius: 12, margin: '0 24px', border: '1px solid var(--border)' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: { padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text)', borderBottom: '2px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '16px', fontSize: 14, color: 'var(--text)' },
  actionBadge: { padding: '6px 12px', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, display: 'inline-block' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16, color: 'var(--muted)' }
};

export default AuditLogs;