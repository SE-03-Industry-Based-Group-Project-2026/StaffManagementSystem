import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StaffManagement() {
  const { t } = useLanguage();

  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    designation: '',
    role_id: '',
    department_id: ''
  });

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role_id === 6 || currentUser?.role === 'Admin' || currentUser?.role_name === 'Admin';

  useEffect(() => {
    loadStaff();
    loadRoles();
    loadDepartments();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*, roles(role_name), departments(department_name, department_type)')
      .order('created_at', { ascending: false });

    if (error) showError(error.message);
    setStaff(data || []);
    setLoading(false);
  };

  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*').order('role_name');
    setRoles(data || []);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    setDepartments(data || []);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      designation: '',
      role_id: '',
      department_id: ''
    });
  };

  const openRegisterModal = () => {
    resetForm();
    setEditing(null);
    setShowModal(true);
  };

  const openEditModal = (staffMember) => {
    setEditing(staffMember.id);
    setFormData({
      email: staffMember.email || '',
      password: '',
      full_name: staffMember.full_name || '',
      phone: staffMember.phone || '',
      designation: staffMember.designation || '',
      role_id: staffMember.role_id || '',
      department_id: staffMember.department_id || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      showError(tr('full_name_required', 'Full name is required'));
      return false;
    }

    if (!formData.role_id) {
      showError(tr('role_required', 'Role is required'));
      return false;
    }

    if (!formData.department_id) {
      showError(tr('department_required', 'Department is required'));
      return false;
    }

    if (!editing) {
      if (!formData.email.trim()) {
        showError(tr('email_required', 'Email is required'));
        return false;
      }

      if (!formData.password.trim()) {
        showError(tr('password_required', 'Password is required'));
        return false;
      }

      if (formData.password.length < 6) {
        showError(tr('password_min_length', 'Password must be at least 6 characters'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    if (editing) {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone || null,
          designation: formData.designation || null,
          role_id: parseInt(formData.role_id, 10),
          department_id: parseInt(formData.department_id, 10)
        })
        .eq('id', editing);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('staff_updated_success'));
        closeModal();
        loadStaff();
      }
    } else {
      try {
        const response = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            full_name: formData.full_name.trim(),
            phone: formData.phone || null,
            designation: formData.designation || null,
            role_id: parseInt(formData.role_id, 10),
            department_id: parseInt(formData.department_id, 10)
          })
        });

        const result = await response.json();

        if (response.ok) {
          showSuccess(t('staff_registered_success'));
          closeModal();
          loadStaff();
        } else {
          showError(result.error || tr('staff_register_failed', 'Failed to register staff'));
        }
      } catch (error) {
        showError(error.message);
      }
    }

    setSubmitting(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess(!currentStatus ? tr('staff_activated', 'Staff activated') : tr('staff_deactivated', 'Staff deactivated'));
    loadStaff();
  };

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return staff.filter((s) => {
      const matchSearch =
        !keyword ||
        s.full_name?.toLowerCase().includes(keyword) ||
        s.email?.toLowerCase().includes(keyword) ||
        s.phone?.toLowerCase().includes(keyword) ||
        s.designation?.toLowerCase().includes(keyword);

      const matchRole = roleFilter === 'all' || String(s.role_id) === String(roleFilter);
      const matchDept = deptFilter === 'all' || String(s.department_id) === String(deptFilter);

      return matchSearch && matchRole && matchDept;
    });
  }, [staff, searchTerm, roleFilter, deptFilter]);

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
              <span style={styles.titleIconWrap}>
                <AppIcon name="users" size={24} />
              </span>
              {t('staff_management')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('staff_management')}</p>
          </div>

          {isAdmin && (
            <button onClick={openRegisterModal} style={styles.primaryBtn}>
              <AppIcon name="plus" size={18} />
              {t('register_staff')}
            </button>
          )}
        </div>

        <div style={styles.statsRow}>
          <InfoCard icon="users" label={t('total_staff')} value={staff.length} />
          <InfoCard icon="check" label={t('active')} value={staff.filter((s) => s.is_active).length} tone="success" />
          <InfoCard icon="alert" label={tr('inactive_staff', 'Inactive Staff')} value={staff.filter((s) => !s.is_active).length} tone="danger" />
        </div>

        <div style={styles.tableCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>{t('staff_members')}</h2>
              <p style={styles.cardSubtitle}>
                {filteredStaff.length} {tr('records', 'records')}
              </p>
            </div>

            <div style={styles.filterContainer}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tr('search_staff', 'Search staff')}
                style={styles.searchInput}
              />

              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{tr('all_roles', 'All Roles')}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {tr(getTranslationKey(r.role_name), r.role_name)}
                  </option>
                ))}
              </select>

              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{tr('all_departments', 'All Departments')}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {tr(getTranslationKey(d.department_name), d.department_name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div style={styles.emptyState}>
              <AppIcon name="users" size={36} />
              <h3>{tr('no_staff_found', 'No staff found')}</h3>
              <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
            </div>
          ) : (
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
                          <div style={styles.avatar}>{s.full_name?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <strong>{s.full_name}</strong>
                            <br />
                            <small style={styles.designation}>
                              {s.designation ? tr(getTranslationKey(s.designation), s.designation) : '-'}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>{s.email}</td>
                      <td style={styles.td}>{s.phone || '-'}</td>

                      <td style={styles.td}>
                        <span style={styles.typeBadge}>
                          {tr(getTranslationKey(s.roles?.role_name), s.roles?.role_name || '-')}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {tr(getTranslationKey(s.departments?.department_name), s.departments?.department_name || '-')}
                      </td>

                      <td style={styles.td}>
                        <button
                          onClick={() => toggleStatus(s.id, s.is_active)}
                          style={{
                            ...styles.statusBtn,
                            backgroundColor: s.is_active ? colors.success : colors.error
                          }}
                        >
                          {s.is_active ? t('active') : t('inactive')}
                        </button>
                      </td>

                      <td style={styles.td}>
                        <button onClick={() => openEditModal(s)} style={styles.editBtn}>
                          <AppIcon name="edit" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '540px' }}>
            <div className="modal-head">
              <div>
                <h3>{editing ? t('edit_staff') : t('register_staff')}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                  {tr('enter_staff_details', 'Enter staff details')}
                </p>
              </div>
              <button className="btn btn-soft" onClick={closeModal}>
                <AppIcon name="x" />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!editing && (
                  <>
                    <div className="field">
                      <label>{t('email')}</label>
                      <input
                        className="input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>{tr('password', 'Password')}</label>
                      <input
                        className="input"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="field">
                  <label>{t('full_name')}</label>
                  <input
                    className="input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="field">
                  <label>{t('phone')}</label>
                  <input
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>{tr('designation', 'Designation')}</label>
                  <input
                    className="input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>{t('role')}</label>
                  <select
                    className="select"
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    required
                  >
                    <option value="">{tr('select_role', 'Select Role')}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {tr(getTranslationKey(r.role_name), r.role_name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>{t('department')}</label>
                  <select
                    className="select"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    required
                  >
                    <option value="">{tr('select_department', 'Select Department')}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {tr(getTranslationKey(d.department_name), d.department_name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button type="button" className="btn btn-soft" onClick={closeModal}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? tr('saving', 'Saving...') : t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--gray-100)', color: colors.primary },
    success: { bg: '#dcfce7', color: colors.success },
    danger: { bg: '#fee2e2', color: colors.error }
  };

  const selected = toneMap[tone] || toneMap.default;

  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconBox, backgroundColor: selected.bg, color: selected.color }}>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 24,
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
  titleIconWrap: {
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
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 24,
    padding: '0 24px'
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 20,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid var(--border)'
  },
  statIconBox: {
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 4 },
  tableCard: {
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  cardSubtitle: { margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 },
  filterContainer: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  searchInput: {
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    minWidth: 220
  },
  filterSelect: {
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
  },
  emptyState: {
    padding: 50,
    textAlign: 'center',
    color: 'var(--muted)'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
    borderBottom: '2px solid var(--border)'
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '16px', fontSize: 14, color: 'var(--text)' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600
  },
  designation: { color: 'var(--muted)' },
  typeBadge: {
    padding: '4px 10px',
    backgroundColor: 'var(--gray-100)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text)',
    fontWeight: 600
  },
  statusBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600
  },
  editBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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

export default StaffManagement;