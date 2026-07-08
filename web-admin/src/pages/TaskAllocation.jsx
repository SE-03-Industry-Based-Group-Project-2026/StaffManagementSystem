import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '../services/toastService';
import AppIcon from '../components/AppIcon';
import '../styles/pro-admin.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TaskAllocation() {
  const { t } = useLanguage();

  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    department_id: '',
    frequency: 'Daily',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('supabase_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getTranslationKey = (name) =>
    !name ? '' : name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');

  const loadData = async () => {
    try {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, department_name, department_type')
        .order('department_name');

      const { data: staffData } = await supabase
        .from('users')
        .select('id, full_name, department_id, designation, roles(role_name), departments(department_name, department_type)')
        .eq('is_active', true)
        .order('full_name');

      const res = await fetch(`${API_BASE}/tasks/all`, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || tr('failed_to_load_tasks', 'Failed to load tasks'));
        setTasks([]);
      } else {
        setTasks(data || []);
      }

      setDepartments(deptData || []);
      setStaff(staffData || []);
    } catch (err) {
      console.error(err);
      showError(tr('failed_connect_backend', 'Failed to connect backend'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigned_to: '',
      department_id: '',
      frequency: 'Daily',
      due_date: ''
    });
    setSelectedDept('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/tasks/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || tr('failed_to_assign_task', 'Failed to assign task'));
        return;
      }

      showSuccess(data.message || tr('task_assigned_successfully', 'Task assigned successfully'));
      resetForm();
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showError(tr('failed_connect_backend', 'Failed to connect backend'));
    }
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'Done') return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.due_date < today;
  };

  const translateFrequency = (frequency) => {
    if (!frequency) return '-';
    return tr(String(frequency).toLowerCase(), frequency);
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
      const titleMatch =
        !keyword ||
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword) ||
        task.assigned_to_user?.full_name?.toLowerCase().includes(keyword) ||
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

  const progressWidth = (task) => {
    if (isOverdue(task)) return '85%';
    if (task.status === 'Done') return '100%';
    if (task.status === 'In Progress') return '60%';
    return '30%';
  };

  const progressColor = (task) => {
    if (isOverdue(task)) return '#dc2626';
    if (task.status === 'Done') return '#16a34a';
    if (task.status === 'In Progress') return '#2563eb';
    return '#ea580c';
  };

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
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {tr(getTranslationKey(d.department_name), d.department_name)}
              </option>
            ))}
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
                  <th>{tr('frequency', 'Frequency')}</th>
                  <th>{tr('due_date', 'Due Date')}</th>
                  <th>{t('status') || 'Status'}</th>
                  <th>{t('progress') || 'Progress'}</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyCell}>
                      <AppIcon name="clipboard" size={28} />
                      <div style={{ marginTop: 8 }}>{tr('no_tasks_found', 'No tasks found')}</div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
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

                      <td>{task.assigned_to_user?.full_name || 'N/A'}</td>

                      <td>
                        {task.departments?.department_name
                          ? tr(getTranslationKey(task.departments.department_name), task.departments.department_name)
                          : 'N/A'}
                      </td>

                      <td>{translateFrequency(task.frequency)}</td>
                      <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                      <td>{getStatusBadge(task.status, isOverdue(task))}</td>

                      <td>
                        <div style={styles.progressTrack}>
                          <div
                            style={{
                              width: progressWidth(task),
                              backgroundColor: progressColor(task),
                              height: '100%',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
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
                        setFormData({ ...formData, department_id: e.target.value, assigned_to: '' });
                      }}
                    >
                      <option value="">{t('select_department') || 'Select Department'}</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {tr(getTranslationKey(d.department_name), d.department_name)}
                        </option>
                      ))}
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
                        .filter((s) => String(s.department_id) === String(formData.department_id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>{tr('frequency', 'Frequency')}</label>
                    <select
                      className="select"
                      required
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    >
                      <option value="Daily">{tr('daily', 'Daily')}</option>
                      <option value="Weekly">{tr('weekly', 'Weekly')}</option>
                      <option value="Monthly">{tr('monthly', 'Monthly')}</option>
                      <option value="Yearly">{tr('yearly', 'Yearly')}</option>
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
                    <button className="btn btn-soft" type="button" onClick={() => { resetForm(); setShowModal(false); }}>
                      {t('cancel') || 'Cancel'}
                    </button>
                    <button className="btn btn-primary" type="submit">
                      {t('assign') || 'Assign'}
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