import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

function DepartmentManagement() {
  const { t } = useLanguage();

  const [departments, setDepartments] = useState([]);
  const [staffCounts, setStaffCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    department_type: 'Regular',
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    loadDepartments();
    loadStaffCounts();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const resetForm = () => {
    setFormData({
      department_name: '',
      department_type: 'Regular',
      description: '',
      image_url: ''
    });
  };

  const loadDepartments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');

    if (error) {
      showError(error.message);
      setDepartments([]);
    } else {
      setDepartments(data || []);
    }

    setLoading(false);
  };

  const loadStaffCounts = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('department_id, is_active');

    if (error) {
      showError(error.message);
      return;
    }

    const counts = {};

    (data || []).forEach((user) => {
      if (!user.department_id) return;

      if (!counts[user.department_id]) {
        counts[user.department_id] = { total: 0, active: 0 };
      }

      counts[user.department_id].total += 1;
      if (user.is_active) counts[user.department_id].active += 1;
    });

    setStaffCounts(counts);
  };

  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditing(dept.id);
    setFormData({
      department_name: dept.department_name || '',
      department_type: dept.department_type || 'Regular',
      description: dept.description || '',
      image_url: dept.image_url || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      department_name: formData.department_name.trim(),
      department_type: formData.department_type || 'Regular',
      description: formData.description || null,
      image_url: formData.image_url || null
    };

    if (editing) {
      const { error } = await supabase
        .from('departments')
        .update(payload)
        .eq('id', editing);

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess(t('update_success') || 'Updated successfully');
    } else {
      const { error } = await supabase
        .from('departments')
        .insert([payload]);

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess(t('create_success') || 'Created successfully');
    }

    closeModal();
    loadDepartments();
    loadStaffCounts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(tr('confirm_delete_department', 'Are you sure you want to delete this department?'))) return;

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess(t('delete_success') || 'Deleted successfully');
    loadDepartments();
    loadStaffCounts();
  };

  const departmentTypes = useMemo(() => {
    const unique = [...new Set(departments.map((d) => d.department_type).filter(Boolean))];
    return unique.length ? unique : ['Regular'];
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();

    return departments.filter((dept) => {
      const matchSearch =
        !keyword ||
        dept.department_name?.toLowerCase().includes(keyword) ||
        dept.department_type?.toLowerCase().includes(keyword) ||
        dept.description?.toLowerCase().includes(keyword);

      const matchType = typeFilter === 'All' || dept.department_type === typeFilter;

      return matchSearch && matchType;
    });
  }, [departments, searchQuery, typeFilter]);

  const totalStaff = Object.values(staffCounts).reduce((sum, item) => sum + item.total, 0);
  const activeStaff = Object.values(staffCounts).reduce((sum, item) => sum + item.active, 0);

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
                <AppIcon name="building" size={24} />
              </span>
              {t('department_management')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('department_management')}</p>
          </div>

          <button onClick={openCreateModal} style={styles.primaryBtn} type="button">
            <AppIcon name="plus" size={17} />
            {t('add_department')}
          </button>
        </div>

        <div style={styles.statsRow}>
        <InfoCard icon="building" label={t('departments')} value={departments.length} />
        <InfoCard icon="users" label={tr('total_staff', 'Total Staff')} value={totalStaff} tone="success" />
        <InfoCard icon="check" label={t('active')} value={activeStaff} tone="success" />
      </div>

        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <AppIcon name="search" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr('search_departments', 'Search departments')}
              style={styles.searchInput}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">{t('all') || 'All'}</option>
            {departmentTypes.map((type) => (
              <option key={type} value={type}>
                {tr(getTranslationKey(type), type)}
              </option>
            ))}
          </select>
        </div>

        {filteredDepartments.length === 0 ? (
          <div style={styles.emptyState}>
            <AppIcon name="building" size={38} />
            <h3>{tr('no_departments_found', 'No departments found')}</h3>
            <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
          </div>
        ) : (
          <div style={styles.departmentsGrid}>
            {filteredDepartments.map((dept) => {
              const countInfo = staffCounts[dept.id] || { total: 0, active: 0 };
              const typeKey = getTranslationKey(dept.department_type);

              return (
                <div
                  key={dept.id}
                  style={styles.thumbnailCard}
                  onMouseEnter={() => setHoveredId(dept.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <img
                    src={dept.image_url || `https://picsum.photos/seed/dept${dept.id}/400/250`}
                    alt={dept.department_name}
                    style={styles.thumbnailImage}
                  />

                  <div style={styles.thumbnailOverlay} />

              
              {hoveredId === dept.id && (
  <div style={styles.actionFloat}>
    <button
      onClick={() => openEditModal(dept)}
      style={{ ...styles.iconBtn, color: '#2563eb' }}
      type="button"
      title={t('edit')}
    >
      <AppIcon name="edit" size={17} />
    </button>

    <button
      onClick={() => handleDelete(dept.id)}
      style={{ ...styles.iconBtn, color: '#dc2626' }}
      type="button"
      title={t('delete')}
    >
      <AppIcon name="trash" size={17} />
    </button>
  </div>
)}
                  <div style={styles.thumbnailContent}>
                    <div style={styles.cardTopLine}>
                      <span style={styles.typeBadge}>{tr(typeKey, dept.department_type || 'Regular')}</span>
                    </div>

                    <h3 style={styles.thumbnailTitle}>
                      {tr(getTranslationKey(dept.department_name), dept.department_name)}
                    </h3>

                    {dept.description && (
                      <p style={styles.thumbnailDesc}>{dept.description}</p>
                    )}

                    <div style={styles.thumbnailMeta}>
                      <span style={styles.glassBadge}>
                        {countInfo.total} {t('staff')}
                      </span>
                      <span style={styles.glassBadge}>
                        {countInfo.active} {t('active')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{editing ? t('edit_department') : t('new_department')}</h2>
                <button onClick={closeModal} style={styles.closeBtn} type="button">
                  <AppIcon name="x" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>{t('department_name')}</label>
                  <input
                    style={styles.input}
                    required
                    value={formData.department_name}
                    onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>{tr('department_type', 'Department Type')}</label>
                  <select
                    style={styles.select}
                    value={formData.department_type}
                    onChange={(e) => setFormData({ ...formData, department_type: e.target.value })}
                  >
                    <option value="Regular">{tr('regular', 'Regular')}</option>
                    <option value="Library">{tr('library', 'Library')}</option>
                    <option value="Preschool">{tr('preschool', 'Preschool')}</option>
                    <option value="Technical">{tr('technical', 'Technical')}</option>
                    <option value="Administrative">{tr('administrative', 'Administrative')}</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>{tr('description', 'Description')}</label>
                  <textarea
                    style={styles.textarea}
                    rows="4"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>{tr('image_url', 'Image URL')}</label>
                  <input
                    style={styles.input}
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
                    {t('cancel')}
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    {editing ? t('update') : t('create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    warning: { bg: '#ffedd5', color: '#f97316' }
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
    backgroundColor: 'var(--card)',
    borderRadius: 12,
    border: '1px solid var(--border)'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
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
  breadcrumb: { fontSize: 14, color: 'var(--text-secondary)', margin: 0 },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center'
  },
  secondaryBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    marginBottom: 24,
    padding: '0 24px'
  },
  statCard: {
    backgroundColor: 'var(--card)',
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
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    padding: '0 24px',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    padding: '10px 16px',
    borderRadius: '8px',
    flex: 1,
    minWidth: '250px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  filterSelect: {
    padding: '10px 16px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    backgroundColor: 'var(--card)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  emptyState: {
    margin: '0 24px',
    padding: 54,
    textAlign: 'center',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12
  },
  departmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24,
    padding: '0 24px',
    marginBottom: '40px'
  },
  thumbnailCard: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '240px',
    backgroundColor: 'var(--card)',
    cursor: 'default',
    boxShadow: '0 12px 24px rgba(15,23,42,.08)'
  },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.35) 100%)'
  },
  actionFloat: { position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.primary,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  thumbnailContent: { position: 'absolute', bottom: '16px', left: '16px', right: '16px' },
  cardTopLine: { marginBottom: 8 },
  typeBadge: {
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: 999,
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    border: '1px solid rgba(255,255,255,0.3)'
  },
  thumbnailTitle: {
    color: '#ffffff',
    margin: '0 0 8px 0',
    fontSize: '21px',
    fontWeight: 800,
    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
    letterSpacing: '0.3px'
  },
  thumbnailDesc: {
    color: 'rgba(255,255,255,.85)',
    fontSize: 13,
    lineHeight: 1.4,
    margin: '0 0 10px 0',
    maxHeight: 38,
    overflow: 'hidden'
  },
  thumbnailMeta: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  glassBadge: {
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid rgba(255,255,255,0.3)'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20
  },
  modalBox: {
    backgroundColor: 'var(--card)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    padding: 24,
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'var(--gray-100)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: { padding: 24 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--text-secondary)'
  }
};

export default DepartmentManagement;