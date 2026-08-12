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
    assigned_to: '',
    department_id: '',
    due_date: ''
  });

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

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const loggedInRole =
        currentUser?.roles?.role_name ||
        currentUser?.role ||
        currentUser?.role_name ||
        '';
      const loggedInDepartmentId = currentUser?.department_id || '';

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
      } else if (loggedInRole === 'Department Head') {
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
        loggedInRole === 'Praja Officer' &&
        filteredDepartments.length > 0
      ) {
        setFormData((prev) => ({
          ...prev,
          department_id:
            prev.department_id || String(filteredDepartments[0].id),
          assigned_to: ''
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
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const loggedInRole =
      currentUser?.roles?.role_name ||
      currentUser?.role ||
      currentUser?.role_name ||
      '';

    const defaultDepartmentId =
      loggedInRole === 'Praja Officer' && departments.length > 0
        ? String(departments[0].id)
        : '';

    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      department_id: defaultDepartmentId,
      due_date: ''
    });

    setSelectedDept('');
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
  }, [tasks, searchTerm, selectedDept]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => (task.status || 'Pending') === 'Pending').length,
      inProgress: tasks.filter((task) => task.status === 'In Progress').length,
      done: tasks.filter((task) => task.status === 'Done').length,
      overdue: tasks.filter((task) => isOverdue(task)).length
    };
  }, [tasks]);

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

          <button className="btn btn-primary" onClick={() => setShowModal(true)} type="button">
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
            style={styles.filterSelect}
            onChange={(e) => setSelectedDept(e.target.value)}
            value={selectedDept}
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

        <div className="pro-card">
          <div className="card-head">
            <h3>{t('task_allocation')}</h3>
            <span className="badge badge-neutral">
              {filteredTasks.length} {t('records')}
            </span>
          </div>

          <div className="table-wrap">
            <table className="pro-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>{t('title') || 'Title'}</th>
                  <th>{t('staff') || 'Staff'}</th>
                  <th>{t('department') || 'Department'}</th>
                  <th>{tr('due_date', 'Due Date')}</th>
                  <th>{t('status') || 'Status'}</th>
                  <th>{t('progress') || 'Progress'}</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyCell}>
                      <AppIcon name="clipboard" size={28} />
                      <div style={{ marginTop: 8 }}>{tr('no_tasks_found', 'No tasks found')}</div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const deptObj = task.departments;
                    const deptText = deptObj
                      ? (isSinhala ? (deptObj.department_name_si || deptObj.department_name) : isTamil ? (deptObj.department_name_ta || deptObj.department_name) : deptObj.department_name)
                      : 'N/A';

                    const staffUser = task.assigned_to_user;
                    const formattedStaffName = staffUser ? formatNameWithPrefix(staffUser.title, staffUser.full_name) : 'N/A';

                    return (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <>
                              <br />
                              <small style={{ color: 'var(--muted)' }}>{task.description}</small>
                            </>
                          )}
                        </td>

                        <td>
                          {formattedStaffName}
                          {staffUser?.designations && (
                            <>
                              <br />
                              <small style={{ color: 'var(--muted)' }}>
                                ({
                                  isSinhala 
                                    ? (staffUser.designations.designation_si || staffUser.designations.designation_en)
                                    : isTamil 
                                    ? (staffUser.designations.designation_ta || staffUser.designations.designation_en)
                                    : staffUser.designations.designation_en
                                })
                              </small>
                            </>
                          )}
                        </td>

                        <td>{deptText}</td>

                        <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                        <td>{getStatusBadge(task.status, isOverdue(task))}</td>

                        <td>
                          <div style={styles.progressTrack}>
                            <div
                              style={{
                                width: isOverdue(task)
                                  ? '100%'
                                  : task.status === 'Done' || task.status === 'Completed'
                                  ? '100%'
                                  : task.status === 'In Progress'
                                  ? '60%'
                                  : '30%',
                                backgroundColor: isOverdue(task)
                                  ? '#dc2626'
                                  : task.status === 'Done' || task.status === 'Completed'
                                  ? '#16a34a'
                                  : task.status === 'In Progress'
                                  ? '#2563eb'
                                  : '#ea580c',
                                height: '100%',
                                borderRadius: '10px',
                                transition: 'width 0.4s ease, background-color 0.4s ease'
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
                        setSelectedDept(e.target.value);
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                          assigned_to: ''
                        });
                      }}
                    >
                      {(() => {
                        const currentUser = JSON.parse(
                          localStorage.getItem('user') || '{}'
                        );
                        const loggedInRole =
                          currentUser?.roles?.role_name ||
                          currentUser?.role ||
                          currentUser?.role_name ||
                          '';

                        return loggedInRole !== 'Praja Officer' ? (
                          <option value="">
                            {t('select_department') || 'Select Department'}
                          </option>
                        ) : null;
                      })()}

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
                    <select
                      className="select"
                      required
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <option value="">{t('select_staff') || 'Select Staff'}</option>
                      {staff
                        .filter(
                          (s) =>
                            String(s.department_id) === String(formData.department_id)
                        )
                        .map((s) => {
                          const desigObj = s.designations;
                          const desigText = desigObj
                            ? (isSinhala ? (desigObj.designation_si || desigObj.designation_en) : isTamil ? (desigObj.designation_ta || desigObj.designation_en) : desigObj.designation_en)
                            : '';

                          const formattedStaffName = formatNameWithPrefix(s.title, s.full_name);

                          return (
                            <option key={s.id} value={s.id}>
                              {formattedStaffName} {desigText ? `(${desigText})` : ''}
                            </option>
                          );
                        })}
                    </select>
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
  progressTrack: {
    width: '120px',
    backgroundColor: '#eee',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden'
  },
  emptyCell: {
    textAlign: 'center',
    padding: 32,
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