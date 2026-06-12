import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

const SvgIcon = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const UsersIcon = ({ size = 22, color = '#334155' }) => (
  <SvgIcon size={size} color={color}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </SvgIcon>
);

const CheckCircleIcon = ({ size = 22, color = '#15803d' }) => (
  <SvgIcon size={size} color={color}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></SvgIcon>
);

const PauseCircleIcon = ({ size = 22, color = '#0f4c81' }) => (
  <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></SvgIcon>
);

const PlusIcon = ({ size = 18, color = '#ffffff' }) => (
  <SvgIcon size={size} color={color}><path d="M12 5v14M5 12h14" /></SvgIcon>
);

const EditIcon = ({ size = 16, color = '#ffffff' }) => (
  <SvgIcon size={size} color={color}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></SvgIcon>
);

const TrashIcon = ({ size = 16, color = '#ffffff' }) => (
  <SvgIcon size={size} color={color}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></SvgIcon>
);

function StaffManagement() {
  const { t } = useLanguage();
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', phone: '', designation: '', role_id: '', department_id: '' });

  // 🔴 අලුතින් එකතු කළ State: Role සහ Department Filters සඳහා
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role_id === 6;

  useEffect(() => {
    loadStaff();
    loadRoles();
    loadDepartments();
  }, []);

  const loadStaff = async () => {
    const { data } = await supabase.from('users').select('*, roles(role_name), departments(department_name, department_type)').order('created_at', { ascending: false });
    setStaff(data || []);
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*');
    setRoles(data || []);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*');
    setDepartments(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (editing) {
      const { error } = await supabase.from('users').update({
        full_name: formData.full_name.trim(),
        phone: formData.phone || null,
        designation: formData.designation || null,
        role_id: parseInt(formData.role_id, 10),
        department_id: parseInt(formData.department_id, 10)
      }).eq('id', editing);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('staff_updated_success'));
        setShowModal(false); setEditing(null); loadStaff();
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.toLowerCase().trim(), password: formData.password,
            full_name: formData.full_name.trim(), phone: formData.phone || null,
            designation: formData.designation || null, role_id: parseInt(formData.role_id, 10),
            department_id: parseInt(formData.department_id, 10)
          })
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess(t('staff_registered_success'));
          setShowModal(false); loadStaff();
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError(error.message);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_staff'))) {
      await supabase.from('users').delete().eq('id', id);
      showSuccess(t('staff_deleted_success'));
      loadStaff();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    await supabase.from('users').update({ is_active: !currentStatus }).eq('id', id);
    showSuccess(`${t('staff')} ${!currentStatus ? t('active') : t('inactive')}!`);
    loadStaff();
  };

  const openEditModal = (staffMember) => {
    setEditing(staffMember.id);
    setFormData({
      full_name: staffMember.full_name, phone: staffMember.phone || '',
      designation: staffMember.designation || '', role_id: staffMember.role_id,
      department_id: staffMember.department_id
    });
    setShowModal(true);
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  // 🔴 Supervisor Change 5: Staff Filter Logic
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchRole = roleFilter === 'all' || String(s.role_id) === String(roleFilter);
      const matchDept = deptFilter === 'all' || String(s.department_id) === String(deptFilter);
      return matchRole && matchDept;
    });
  }, [staff, roleFilter, deptFilter]);

  if (loading) { return <Layout><div style={styles.loading}>{t('loading')}</div></Layout>; }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}><span style={styles.titleIconWrap}><UsersIcon size={24} color={colors.primary} /></span>{t('staff_management')}</h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('staff_management')}</p>
          </div>
          {isAdmin && <button onClick={() => { setShowModal(true); setEditing(null); }} style={styles.primaryBtn}><PlusIcon />{t('register_staff')}</button>}
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}><UsersIcon /></div>
            <div><div style={styles.statValue}>{staff.length}</div><div style={styles.statLabel}>{t('total_staff')}</div></div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, backgroundColor: 'var(--primary-soft)' }}><CheckCircleIcon /></div>
            <div><div style={styles.statValue}>{staff.filter((s) => s.is_active).length}</div><div style={styles.statLabel}>{t('active')}</div></div>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{t('staff_members')}</h2>
            
           
            <div style={styles.filterContainer}>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{t('all_roles') || 'All Roles'}</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{t(getTranslationKey(r.role_name)) || r.role_name}</option>
                ))}
              </select>

              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{t('all_departments') || 'All Departments'}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{t(getTranslationKey(d.department_name)) || d.department_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>{t('full_name')}</th>
                  <th style={styles.th}>{t('email')}</th>
                  <th style={styles.th}>{t('phone')}</th>
                  <th style={styles.th}>{t('role')}</th>
                  <th style={styles.th}>{t('department')}</th>
                  <th style={styles.th}>{t('status')}</th>
                  <th style={styles.th}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>{s.full_name?.charAt(0).toUpperCase()}</div>
                        <div><strong>{s.full_name}</strong><br /><small style={styles.designation}>{s.designation ? t(getTranslationKey(s.designation)) : '-'}</small></div>
                      </div>
                    </td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>{s.phone || '-'}</td>
                    <td style={styles.td}><span style={styles.typeBadge}>{t(getTranslationKey(s.roles?.role_name))}</span></td>
                    <td style={styles.td}>{t(getTranslationKey(s.departments?.department_name))}</td>
                    <td style={styles.td}>
                      <button onClick={() => toggleStatus(s.id, s.is_active)} style={{ ...styles.statusBtn, backgroundColor: s.is_active ? colors.success : colors.error }}>
                        {s.is_active ? t('active') : t('inactive')}
                      </button>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button onClick={() => openEditModal(s)} style={styles.editBtn}><EditIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
  <div className="modal-backdrop">
    <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '500px' }}>
      <div className="modal-head">
        <h3>{editing ? t('edit_staff') : t('register_staff')}</h3>
        <button className="btn btn-soft" onClick={() => setShowModal(false)}><AppIcon name="x" /></button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div className="field">
            <label>{t('full_name')}</label>
            <input className="input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
          </div>

          <div className="field">
            <label>{t('phone')}</label>
            <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="field">
            <label>{t('role')}</label>
            <select className="select" value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}>
              {roles.map(r => <option key={r.id} value={r.id}>{t(getTranslationKey(r.role_name))}</option>)}
            </select>
          </div>

          <div className="field">
            <label>{t('department')}</label>
            <select className="select" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
              {departments.map(d => <option key={d.id} value={d.id}>{t(getTranslationKey(d.department_name))}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>{t('save')}</button>
        </form>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--muted)', margin: 0 },
  primaryBtn: { padding: '12px 24px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24, padding: '0 24px' },
  statCard: { backgroundColor: 'var(--bg-secondary)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)' },
  statIconBox: { width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--gray-100)', borderRadius: 10 },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 4 },
  tableCard: { backgroundColor: 'var(--bg-secondary)', borderRadius: 12, margin: '0 24px', border: '1px solid var(--border)' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  
  filterContainer: { display: 'flex', gap: '12px' },
  filterSelect: { padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text)', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: { padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text)', borderBottom: '2px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '16px', fontSize: 14, color: 'var(--text)' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', backgroundColor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  typeBadge: { padding: '4px 10px', backgroundColor: 'var(--gray-100)', borderRadius: 6, fontSize: 12, color: 'var(--text)', fontWeight: 600 },
  statusBtn: { padding: '6px 12px', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  actionBtns: { display: 'flex', gap: 8 },
  editBtn: { width: 36, height: 36, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16, color: 'var(--muted)' }
};

export default StaffManagement;