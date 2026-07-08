import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

function Announcements() {
  const { t } = useLanguage();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    department_id: '',
    expires_at: '',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadAnnouncements();
    loadDepartments();
  }, []);

  useEffect(() => {
    const openId = location.state?.openId;
    if (!openId || announcements.length === 0) return;

    const found = announcements.find((item) => String(item.id) === String(openId));
    if (found) {
      setSelectedAnnouncement(found);
      setShowModal(true);
    }
  }, [location.state, announcements]);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadAnnouncements = async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('announcements')
      .select('*, users(full_name), departments(department_name)')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    setAnnouncements(data || []);
    setLoading(false);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    setDepartments(data || []);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      department_id: '',
      expires_at: '',
      priority: 'Medium'
    });
  };

  const openCreateModal = () => {
    setSelectedAnnouncement(null);
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (e, announcement) => {
    e.stopPropagation();

    if (announcement.created_by !== user.id) {
      showError(t('access_denied_authorized') || 'You do not have permission to edit this announcement.');
      return;
    }

    setSelectedAnnouncement(announcement);
    setIsEditing(true);
    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      department_id: announcement.department_id || '',
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : '',
      priority: announcement.priority || 'Medium'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setIsEditing(false);
    resetForm();
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    setSending(true);

    const payload = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      department_id: formData.department_id || null,
      expires_at: formData.expires_at || null,
      priority: formData.priority || 'Medium'
    };

    if (isEditing && selectedAnnouncement) {
      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', selectedAnnouncement.id);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('update_success') || 'Announcement updated successfully');
        closeModal();
        loadAnnouncements();
      }
    } else {
      const { error } = await supabase.from('announcements').insert([
        {
          ...payload,
          created_by: user.id
        }
      ]);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('sent_success'));
        closeModal();
        loadAnnouncements();
      }
    }

    setSending(false);
  };

  const filteredAnnouncements = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return announcements.filter((ann) => {
      const deptName = ann.departments?.department_name || '';
      return (
        !keyword ||
        ann.title?.toLowerCase().includes(keyword) ||
        ann.message?.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        ann.priority?.toLowerCase().includes(keyword)
      );
    });
  }, [announcements, searchTerm]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      total: announcements.length,
      urgent: announcements.filter((a) => a.priority === 'Urgent').length,
      scheduled: announcements.filter((a) => a.expires_at).length,
      publishedToday: announcements.filter((a) => new Date(a.created_at).toDateString() === today).length
    };
  }, [announcements]);

  const getPriorityStyle = (priority) => {
    if (priority === 'Urgent') return { bg: '#fee2e2', color: '#dc2626' };
    if (priority === 'High') return { bg: '#ffedd5', color: '#f97316' };
    if (priority === 'Medium') return { bg: '#dbeafe', color: '#2563eb' };
    return { bg: '#f1f5f9', color: '#64748b' };
  };

  const translatePriority = (priority) => {
    if (priority === 'Urgent') return tr('urgent', 'Urgent');
    if (priority === 'High') return tr('high', 'High');
    if (priority === 'Medium') return tr('medium', 'Medium');
    return tr('low', 'Low');
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
      <div style={styles.container} className="container">
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconWrap}>
                <AppIcon name="megaphone" size={24} />
              </span>
              {t('announcements')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('announcements')}</p>
          </div>

          <button onClick={openCreateModal} style={styles.primaryBtn} type="button">
            <AppIcon name="plus" size={18} />
            {t('send_announcement')}
          </button>
        </div>

        <div style={styles.statsRow}>
          <StatBox icon="megaphone" label={t('total_announcements')} value={stats.total} />
          <StatBox icon="alert" label={tr('urgent_notices', 'Urgent Notices')} value={stats.urgent} tone="urgent" />
          <StatBox icon="calendar" label={tr('scheduled_notices', 'Scheduled Notices')} value={stats.scheduled} tone="scheduled" />
          <StatBox icon="check" label={tr('published_today', 'Published Today')} value={stats.publishedToday} tone="success" />
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>{t('total_announcements_all') || 'Total Announcements'}</h2>
              <p style={styles.cardSubtitle}>
                {filteredAnnouncements.length} {tr('records', 'records')}
              </p>
            </div>

            <div style={styles.searchWrap}>
              <AppIcon name="search" size={16} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tr('search_announcements', 'Search announcements')}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.list}>
            {filteredAnnouncements.length === 0 ? (
              <div style={styles.emptyBox}>
                <AppIcon name="megaphone" size={38} />
                <h3>{tr('no_announcements_found', 'No announcements found')}</h3>
                <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
              </div>
            ) : (
              filteredAnnouncements.map((ann) => {
                const priorityStyle = getPriorityStyle(ann.priority || 'Medium');

                return (
                  <div key={ann.id} style={styles.announcementItem} onClick={() => openViewModal(ann)}>
                    <div style={styles.announcementTop}>
                      <div style={styles.titleRow}>
                        <div>
                          <h3 style={styles.announcementTitle}>{ann.title}</h3>

                          <div style={styles.badgeRow}>
                            <span style={{ ...styles.priorityBadge, backgroundColor: priorityStyle.bg, color: priorityStyle.color }}>
                              {translatePriority(ann.priority || 'Medium')}
                            </span>

                            {ann.expires_at && (
                              <span style={styles.scheduledBadge}>
                                {tr('expires', 'Expires')}: {new Date(ann.expires_at).toLocaleString('en-GB')}
                              </span>
                            )}
                          </div>
                        </div>

                        {ann.created_by === user.id && (
                          <button onClick={(e) => openEditModal(e, ann)} style={styles.miniEditBtn} type="button">
                            {t('edit')}
                          </button>
                        )}
                      </div>

                      <div style={styles.metaRow}>
                        <span style={styles.metaItem}>
                          <AppIcon name="users" size={14} /> {ann.users?.full_name || '-'}
                        </span>
                        <span style={styles.metaItem}>
                          <AppIcon name="building" size={14} />
                          {ann.departments?.department_name
                            ? tr(getTranslationKey(ann.departments.department_name), ann.departments.department_name)
                            : t('all_departments')}
                        </span>
                        <span style={styles.metaItem}>
                          <AppIcon name="calendar" size={14} /> {new Date(ann.created_at).toLocaleString('en-GB')}
                        </span>
                      </div>
                    </div>

                    <div style={styles.announcementBody}>
                      <p style={styles.announcementMessage}>{ann.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showModal && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {selectedAnnouncement && !isEditing
                    ? t('announcement_details')
                    : isEditing
                    ? t('edit_announcement')
                    : t('send_announcement')}
                </h2>
                <button onClick={closeModal} style={styles.closeBtn}>×</button>
              </div>

              {selectedAnnouncement && !isEditing ? (
                <div style={styles.modalBody}>
                  <div style={styles.modalNoticeHead}>
                    <h3 style={styles.announcementTitle}>{selectedAnnouncement.title}</h3>
                    <span
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityStyle(selectedAnnouncement.priority || 'Medium').bg,
                        color: getPriorityStyle(selectedAnnouncement.priority || 'Medium').color
                      }}
                    >
                      {translatePriority(selectedAnnouncement.priority || 'Medium')}
                    </span>
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>👤 {selectedAnnouncement.users?.full_name || '-'}</span>
                    <span style={styles.metaItem}>
                      🏢{' '}
                      {selectedAnnouncement.departments?.department_name
                        ? tr(getTranslationKey(selectedAnnouncement.departments.department_name), selectedAnnouncement.departments.department_name)
                        : t('all_departments')}
                    </span>
                    <span style={styles.metaItem}>📅 {new Date(selectedAnnouncement.created_at).toLocaleString('en-GB')}</span>
                  </div>

                  {selectedAnnouncement.expires_at && (
                    <div style={{ marginTop: 12 }}>
                      <span style={styles.scheduledBadge}>
                        {tr('expires', 'Expires')}: {new Date(selectedAnnouncement.expires_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                  )}

                  <div style={{ ...styles.announcementBody, marginTop: 18 }}>
                    <p style={styles.announcementMessage}>{selectedAnnouncement.message}</p>
                  </div>

                  <div style={styles.modalActions}>
                    <button type="button" onClick={closeModal} style={styles.secondaryBtn}>{t('cancel')}</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendAnnouncement} style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('name_title')} *</label>
                    <input
                      type="text"
                      placeholder={t('name_title')}
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('priority', 'Priority')}</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      style={styles.select}
                    >
                      <option value="Low">{tr('low', 'Low')}</option>
                      <option value="Medium">{tr('medium', 'Medium')}</option>
                      <option value="High">{tr('high', 'High')}</option>
                      <option value="Urgent">{tr('urgent', 'Urgent')}</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('department')}</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      style={styles.select}
                    >
                      <option value="">{t('all_departments')}</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {tr(getTranslationKey(dept.department_name), dept.department_name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('expire_time') || 'Expiry Date & Time'}</label>
                    <input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('description')} *</label>
                    <textarea
                      placeholder={t('description')}
                      rows="5"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.modalActions}>
                    <button type="button" onClick={closeModal} style={styles.secondaryBtn}>{t('cancel')}</button>
                    <button type="submit" disabled={sending} style={styles.primaryBtn}>
                      {sending ? t('loading') : isEditing ? t('update') : t('add')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatBox({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--gray-100)', color: colors.primary },
    urgent: { bg: '#fee2e2', color: '#dc2626' },
    scheduled: { bg: '#dbeafe', color: '#2563eb' },
    success: { bg: '#dcfce7', color: '#16a34a' }
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
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer'
  },
  miniEditBtn: {
    padding: '6px 12px',
    backgroundColor: 'var(--primary-soft)',
    color: colors.primary,
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
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
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap'
  },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  cardSubtitle: { margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--bg-primary)',
    minWidth: 260
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'var(--text)',
    width: '100%',
    fontSize: 14
  },
  list: { padding: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  announcementItem: {
    padding: 20,
    backgroundColor: 'var(--gray-50)',
    borderRadius: 12,
    border: '1px solid var(--border)',
    cursor: 'pointer'
  },
  announcementTop: { marginBottom: 12 },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start'
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 8px 0'
  },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  priorityBadge: {
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    display: 'inline-block'
  },
  scheduledBadge: {
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    display: 'inline-block'
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    fontSize: 13,
    color: 'var(--muted)',
    marginTop: 10
  },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6 },
  announcementBody: { paddingTop: 12, borderTop: '1px solid var(--border)' },
  announcementMessage: {
    fontSize: 14,
    color: 'var(--muted)',
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  emptyBox: {
    padding: 46,
    textAlign: 'center',
    color: 'var(--muted)'
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
    borderRadius: 12,
    width: '100%',
    maxWidth: 620,
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
  modalTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'var(--gray-100)',
    color: 'var(--muted)',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: { padding: 24 },
  modalNoticeHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start'
  },
  formGroup: { marginBottom: 20 },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 8
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--gray-50)'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--gray-50)',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: 'var(--gray-50)'
  },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--muted)'
  }
};

export default Announcements;