import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '../services/toastService';
import AppIcon from '../components/AppIcon';
import '../styles/pro-admin.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const formatNameWithPrefix = (title = '', name = '') => {
  let cleanTitle = String(title || '').trim();
  let cleanName = String(name || '').trim();

  if (!cleanName) return 'N/A';

  if (cleanTitle) {
    const lower = cleanTitle.toLowerCase().replace('.', '');
    if (['mr', 'mrs', 'ms', 'dr'].includes(lower)) {
      cleanTitle = lower.charAt(0).toUpperCase() + lower.slice(1) + '.';
    }
    return `${cleanTitle} ${cleanName}`;
  }

  const matched = cleanName.match(/^(mr|mrs|ms|dr)\.?\s+/i);
  if (matched) {
    const lower = matched[1].toLowerCase();
    const formattedTitle = lower.charAt(0).toUpperCase() + lower.slice(1) + '.';
    cleanName = cleanName.replace(/^(mr|mrs|ms|dr)\.?\s+/i, '');
    return `${formattedTitle} ${cleanName}`;
  }

  return cleanName;
};

function TaskAllocation() {
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

  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: [],
    department_id: '',
    due_date: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedInRole =
    currentUser?.roles?.role_name ||
    currentUser?.role ||
    currentUser?.role_name ||
    '';
  const loggedInDepartmentId = currentUser?.department_id || '';
  const isDepartmentHead = loggedInRole === 'Department Head';

  // Department Head කෙනෙක් නම් ඩිපාර්ට්මන්ට් ෆිල්ටර් එක ස්වයංක්‍රීයව ලොක් කිරීම
  useEffect(() => {
    if (isDepartmentHead && loggedInDepartmentId) {
      setSelectedDept(String(loggedInDepartmentId));
    }
  }, [isDepartmentHead, loggedInDepartmentId]);

  useEffect(() => {
    loadData();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getAuthHeaders = async () => {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
    }

    const token =
      session?.access_token ||
      localStorage.getItem('supabase_token');

    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getTranslationKey = (name) =>
    !name ? '' : name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');

  const isPrajaDepartment = (department) => {
    const name = String(department?.department_name || '')
      .trim()
      .toLowerCase();

    const type = String(department?.department_type || '')
      .trim()
      .toLowerCase();

    return (
      type === 'library' ||
      type === 'preschool' ||
      name === 'library services' ||
      name === 'preschool education'
    );
  };

  const loadData = async () => {
    try {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, department_name, department_name_si, department_name_ta, department_type')
        .order('department_name');

      const { data: staffData } = await supabase
        .from('users')
        .select('id, title, full_name, department_id, designations(id, designation_en, designation_si, designation_ta), roles(role_name, role_name_si, role_name_ta), departments(department_name, department_name_si, department_name_ta, department_type)')
        .eq('is_active', true)
        .order('full_name');

      const res = await fetch(`${API_BASE}/tasks/all`, {
        headers: await getAuthHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || tr('failed_to_load_tasks', 'Failed to load tasks'));
        setTasks([]);
      } else {
        setTasks(data || []);
      }

      let filteredDepartments = deptData || [];

      if (loggedInRole === 'Praja Officer') {
        filteredDepartments = filteredDepartments.filter(isPrajaDepartment);
      } else if (isDepartmentHead) {
        filteredDepartments = filteredDepartments.filter(
          (d) => String(d.id) === String(loggedInDepartmentId)
        );
      }

      const allowedDepartmentIds = new Set(
        filteredDepartments.map((d) => String(d.id))
      );

      const filteredStaff = (staffData || []).filter((s) =>
        allowedDepartmentIds.has(String(s.department_id))
      );

      setDepartments(filteredDepartments);
      setStaff(filteredStaff);

      if (
        (loggedInRole === 'Praja Officer' || isDepartmentHead) &&
        filteredDepartments.length > 0
      ) {
        setFormData((prev) => ({
          ...prev,
          department_id:
            prev.department_id || String(filteredDepartments[0].id),
          assigned_to: []
        }));
      }
    } catch (err) {
      console.error(err);

      if (
        err.message?.toLowerCase().includes('token') ||
        err.message?.toLowerCase().includes('authentication')
      ) {
        showError(err.message);
      } else {
        showError(tr('failed_connect_backend', 'Failed to connect backend'));
      }
    }
  };

  const resetForm = () => {
    const defaultDepartmentId =
      (loggedInRole === 'Praja Officer' || isDepartmentHead) && departments.length > 0
        ? String(departments[0].id)
        : '';

    setFormData({
      title: '',
      description: '',
      assigned_to: [],
      department_id: defaultDepartmentId,
      due_date: ''
    });

    if (!isDepartmentHead) {
      setSelectedDept('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/tasks/assign`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || tr('failed_to_assign_task', 'Failed to assign task'));
        setSubmitting(false);
        return;
      }

      showSuccess(data.message || tr('task_assigned_successfully', 'Task assigned successfully'));
      resetForm();
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);

      if (
        err.message?.toLowerCase().includes('token') ||
        err.message?.toLowerCase().includes('authentication')
      ) {
        showError(err.message);
      } else {
        showError(tr('failed_connect_backend', 'Failed to connect backend'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'Done') return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.due_date < today;
  };

  const translateStatus = (status) => {
    if (!status) return tr('pending', 'Pending');
    return tr(getTranslationKey(status), status);
  };

  const getStatusBadge = (status, overdue = false) => {
    if (overdue) {
      return <span style={{ ...styles.statusBadge, color: '#dc2626', backgroundColor: '#fee2e2' }}>{tr('overdue', 'Overdue')}</span>;
    }

    const color = status === 'Done' ? '#16a34a' : status === 'In Progress' ? '#2563eb' : '#ea580c';
    const bg = status === 'Done' ? '#dcfce7' : status === 'In Progress' ? '#dbeafe' : '#ffedd5';

    return <span style={{ ...styles.statusBadge, color, backgroundColor: bg }}>{translateStatus(status || 'Pending')}</span>;
  };

  const filteredTasks = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return tasks.filter((task) => {
      // 🌟 Department Head කෙනෙක් නම් තමන්ගේ department එකේ tasks පමණක් පෙන්වීම
      if (isDepartmentHead && loggedInDepartmentId) {
        if (Number(task.department_id) !== Number(loggedInDepartmentId)) {
          return false;
        }
      }

      const assignedUser = task.assigned_to_user;
      const formattedAssignedName = formatNameWithPrefix(assignedUser?.title, assignedUser?.full_name).toLowerCase();

      const titleMatch =
        !keyword ||
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword) ||
        formattedAssignedName.includes(keyword) ||
        task.departments?.department_name?.toLowerCase().includes(keyword);

      const deptMatch = selectedDept === '' || String(task.department_id) === String(selectedDept);

      return titleMatch && deptMatch;
    });
  }, [tasks, searchTerm, selectedDept, isDepartmentHead, loggedInDepartmentId]);

  const stats = useMemo(() => {
    return {
      total: filteredTasks.length,
      pending: filteredTasks.filter((task) => (task.status || 'Pending') === 'Pending').length,
      inProgress: filteredTasks.filter((task) => task.status === 'In Progress').length,
      done: filteredTasks.filter((task) => task.status === 'Done').length,
      overdue: filteredTasks.filter((task) => isOverdue(task)).length
    };
  }, [filteredTasks]);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container">
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconBox}>
                <AppIcon name="clipboard" size={24} />
              </span>
              {t('task_allocation')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('task_allocation')}</p>
          </div>

          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} type="button">
            <AppIcon name="plus" size={17} />
            {t('assign')}
          </button>
        </div>

        <div className="pro-grid stats-grid" style={{ marginBottom: 20 }}>
          <StatBox icon="clipboard" label={tr('total_tasks', 'Total Tasks')} value={stats.total} />
          <StatBox icon="alert" label={t('pending')} value={stats.pending} tone="warning" />
          <StatBox icon="report" label={tr('in_progress', 'In Progress')} value={stats.inProgress} tone="info" />
          <StatBox icon="check" label={tr('done', 'Done')} value={stats.done} tone="success" />
          <StatBox icon="calendar" label={tr('overdue', 'Overdue')} value={stats.overdue} tone="danger" />
        </div>

        <div className="pro-card" style={styles.filterCard}>
          <div style={styles.searchBox}>
            <AppIcon name="search" size={16} />
            <input
              placeholder={tr('search_tasks', 'Search tasks')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            className="select"
            style={{
              ...styles.filterSelect,
              backgroundColor: isDepartmentHead ? 'var(--gray-100)' : 'var(--bg-primary)',
              cursor: isDepartmentHead ? 'not-allowed' : 'pointer'
            }}
            onChange={(e) => !isDepartmentHead && setSelectedDept(e.target.value)}
            value={selectedDept}
            disabled={isDepartmentHead}
          >
            <option value="">{t('all_departments') || 'All Departments'}</option>
            {departments.map((d) => {
              const deptDisplayName = isSinhala
                ? (d.department_name_si || d.department_name)
                : isTamil
                ? (d.department_name_ta || d.department_name)
                : d.department_name;
              return (
                <option key={d.id} value={String(d.id)}>
                  {deptDisplayName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="pro-card" style={{ paddingBottom: '24px' }}>
          <div className="card-head">
            <h3>{t('task_allocation')}</h3>
            <span className="badge badge-neutral">
              {filteredTasks.length} {t('records')}
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div style={styles.emptyCell}>
              <AppIcon name="clipboard" size={36} />
              <div style={{ marginTop: 8 }}>{tr('no_tasks_found', 'No tasks found')}</div>
            </div>
          ) : (
            /* 🌟 MODERN TASK CARDS GRID VIEW */
            <div style={styles.taskCardsGrid}>
              {filteredTasks.map((task) => {
                const deptObj = task.departments;
                const deptText = deptObj
                  ? (isSinhala ? (deptObj.department_name_si || deptObj.department_name) : isTamil ? (deptObj.department_name_ta || deptObj.department_name) : deptObj.department_name)
                  : 'N/A';

                const staffUser = task.assigned_to_user;
                const formattedStaffName = staffUser ? formatNameWithPrefix(staffUser.title, staffUser.full_name) : 'N/A';
                const overdue = isOverdue(task);

                return (
                  <div key={task.id} style={styles.taskCard}>
                    <div style={styles.cardTopRow}>
                      <span style={styles.taskRefBadge}>Task #{task.id}</span>
                      {getStatusBadge(task.status, overdue)}
                    </div>

                    <h3 style={styles.taskTitle}>{task.title}</h3>
                    {task.description && (
                      <p style={styles.taskDesc}>{task.description}</p>
                    )}

                    <div style={styles.taskMetaBox}>
                      <div style={styles.taskMetaRow}>
                        <AppIcon name="user" size={14} color="var(--muted)" />
                        <span style={styles.taskMetaText}><strong>{t('staff') || 'Staff'}:</strong> {formattedStaffName}</span>
                      </div>
                      <div style={styles.taskMetaRow}>
                        <AppIcon name="building" size={14} color="var(--muted)" />
                        <span style={styles.taskMetaText}><strong>{t('department') || 'Dept'}:</strong> {deptText}</span>
                      </div>
                      <div style={styles.taskMetaRow}>
                        <AppIcon name="calendar" size={14} color="var(--muted)" />
                        <span style={styles.taskMetaText}><strong>{tr('due_date', 'Due Date')}:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>

                    <div style={styles.progressSection}>
                      <div style={styles.progressLabelRow}>
                        <span>{t('progress') || 'Progress'}</span>
                        <span>{overdue ? '100% (Overdue)' : task.status === 'Done' ? '100%' : task.status === 'In Progress' ? '60%' : '30%'}</span>
                      </div>
                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            width: overdue
                              ? '100%'
                              : task.status === 'Done' || task.status === 'Completed'
                              ? '100%'
                              : task.status === 'In Progress'
                              ? '60%'
                              : '30%',
                            backgroundColor: overdue
                              ? '#dc2626'
                              : task.status === 'Done' || task.status === 'Completed'
                              ? '#16a34a'
                              : task.status === 'In Progress'
                              ? '#2563eb'
                              : '#ea580c',
                            height: '100%',
                            borderRadius: '10px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
              onClick={() => setShowModal(false)}
            >
              <div className="pro-card" style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                  <h3>{t('assign_new_task') || 'Assign New Task'}</h3>
                  <button className="btn btn-soft" type="button" onClick={() => setShowModal(false)}>
                    <AppIcon name="x" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                  <div className="field">
                    <label>{t('title') || 'Title'}</label>
                    <input
                      className="input"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>{tr('task_description', 'Task Description')}</label>
                    <textarea
                      className="textarea"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>{t('department') || 'Department'}</label>
                    <select
                      className="select"
                      required
                      value={formData.department_id}
                      onChange={(e) => {
                        if (!isDepartmentHead) {
                          setSelectedDept(e.target.value);
                        }
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                          assigned_to: []
                        });
                      }}
                      disabled={isDepartmentHead}
                      style={isDepartmentHead ? { backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                    >
                      {!isDepartmentHead && (
                        <option value="">
                          {t('select_department') || 'Select Department'}
                        </option>
                      )}

                      {departments.map((d) => {
                        const deptDisplayName = isSinhala
                          ? (d.department_name_si || d.department_name)
                          : isTamil
                          ? (d.department_name_ta || d.department_name)
                          : d.department_name;
                        return (
                          <option key={d.id} value={String(d.id)}>
                            {deptDisplayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="field">
                    <label>{t('staff') || 'Staff'}</label>
                    
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        id="select_all_staff"
                        checked={formData.assigned_to === 'all'}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            assigned_to: e.target.checked ? 'all' : []
                          });
                        }}
                      />
                      <label htmlFor="select_all_staff" style={{ cursor: 'pointer', fontWeight: 600 }}>
                      {isSinhala ? 'සියලුම දෙපාර්තමේන්තු සාමාජිකයින්ට' : isTamil ? 'அனைத்து துறை உறுப்பினர்களுக்கும்' : 'All Department Members'}
                      </label>
                    </div>

                    {formData.assigned_to !== 'all' && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', display: 'grid', gap: '8px' }}>
                        {staff
                          .filter((s) => String(s.department_id) === String(formData.department_id))
                          .map((s) => {
                            const desigObj = s.designations;
                            const desigText = desigObj
                              ? (isSinhala ? (desigObj.designation_si || desigObj.designation_en) : isTamil ? (desigObj.designation_ta || desigObj.designation_en) : desigObj.designation_en)
                              : '';
                            const formattedStaffName = formatNameWithPrefix(s.title, s.full_name);
                            const isChecked = Array.isArray(formData.assigned_to) && formData.assigned_to.includes(s.id);

                            return (
                              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                  type="checkbox"
                                  value={s.id}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentSelected = Array.isArray(formData.assigned_to) ? [...formData.assigned_to] : [];
                                    if (e.target.checked) {
                                      currentSelected.push(s.id);
                                    } else {
                                      const index = currentSelected.indexOf(s.id);
                                      if (index > -1) currentSelected.splice(index, 1);
                                    }
                                    setFormData({ ...formData, assigned_to: currentSelected });
                                  }}
                                />
                                {formattedStaffName} {desigText ? `(${desigText})` : ''}
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  <div className="field">
                    <label>{tr('due_date', 'Due Date')}</label>
                    <input
                      type="date"
                      className="input"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-soft" type="button" disabled={submitting} onClick={() => { resetForm(); setShowModal(false); }}>
                      {t('cancel') || 'Cancel'}
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? (tr('assigning', 'Assigning...') || 'Assigning...') : (t('assign') || 'Assign')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}

function StatBox({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    warning: { bg: '#ffedd5', color: '#ea580c' },
    info: { bg: '#dbeafe', color: '#2563eb' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    danger: { bg: '#fee2e2', color: '#dc2626' }
  };

  const selected = toneMap[tone] || toneMap.default;

  return (
    <div className="pro-card" style={styles.statCard}>
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
  statCard: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 20
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { fontSize: 24, fontWeight: 800, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 4 },
  filterCard: {
    marginBottom: 18,
    padding: 18,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 12px',
    backgroundColor: 'var(--gray-50)',
    minWidth: 300
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    color: 'var(--text)'
  },
  filterSelect: { width: 240 },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'inline-block'
  },
  
  /* 🌟 MODERN TASK CARDS GRID STYLES */
  taskCardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '24px' },
  taskCard: { backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  cardTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  taskRefBadge: { fontSize: '11px', fontWeight: 700, color: 'var(--muted)', backgroundColor: 'var(--gray-100)', padding: '2px 8px', borderRadius: '4px' },
  taskTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px 0' },
  taskDesc: { fontSize: '13.5px', color: 'var(--muted)', margin: '0 0 14px 0', lineHeight: 1.4 },
  taskMetaBox: { borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', margin: '0 0 14px 0', display: 'flex', flexDirection: 'column', gap: '8px' },
  taskMetaRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text)' },
  taskMetaText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  progressSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  progressLabelRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--muted)' },
  progressTrack: { width: '100%', backgroundColor: 'var(--gray-200)', borderRadius: '10px', height: '8px', overflow: 'hidden' },

  emptyCell: {
    textAlign: 'center',
    padding: 50,
    color: 'var(--muted)'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalBox: {
    width: '540px',
    padding: '24px'
  }
};

export default TaskAllocation;