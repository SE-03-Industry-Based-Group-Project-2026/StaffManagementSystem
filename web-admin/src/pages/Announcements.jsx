import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

// Professional SVG Icons Components
const SvgIcon = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const MegaphoneIcon = ({ size = 22, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}>
    <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l9-4v18l-9-4zM3 12h3M12 5v14" />
  </SvgIcon>
);

const PlusIcon = ({ size = 18, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><path d="M12 5v14M5 12h14" /></SvgIcon>
);

const BarChartIcon = ({ size = 22, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><path d="M3 21h18M7 17V10M12 17V6M17 17v-4" /></SvgIcon>
);

const CalendarIcon = ({ size = 22, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></SvgIcon>
);

const UserIcon = ({ size = 14, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></SvgIcon>
);

const BuildingIcon = ({ size = 14, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4M8 6h2M14 6h2M8 10h2M14 10h2M8 14h2M14 14h2" /></SvgIcon>
);

const ClockIcon = ({ size = 14, color = 'currentColor' }) => (
  <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></SvgIcon>
);

function Announcements() {
  const { t } = useLanguage();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // 🔴 සංස්කරණය කරන්නේදැයි බැලීමට
  
 
  const [formData, setFormData] = useState({ title: '', message: '', department_id: '', expires_at: '' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

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

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadAnnouncements = async () => {
    const now = new Date().toISOString();
    
    
    const { data } = await supabase
      .from('announcements')
      .select('*, users(full_name), departments(department_name)')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });

    setAnnouncements(data || []);
    setLoading(false);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*');
    setDepartments(data || []);
  };

  const openCreateModal = () => {
    setSelectedAnnouncement(null);
    setIsEditing(false);
    setFormData({ title: '', message: '', department_id: '', expires_at: '' });
    setShowModal(true);
  };

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditing(false);
    setShowModal(true);
  };

  
  const openEditModal = (e, announcement) => {
    e.stopPropagation(); // Card එක click වීම වළක්වයි
    if (announcement.created_by !== user.id) {
      showError(t('access_denied_authorized') || 'You do not have permission to edit this announcement.');
      return;
    }
    setSelectedAnnouncement(announcement);
    setIsEditing(true);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      department_id: announcement.department_id || '',
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    setSending(true);

    if (isEditing && selectedAnnouncement) {
     
      const { error } = await supabase
        .from('announcements')
        .update({
          title: formData.title,
          message: formData.message,
          department_id: formData.department_id || null,
          expires_at: formData.expires_at || null
        })
        .eq('id', selectedAnnouncement.id);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('update_success') || 'Announcement updated successfully');
        setShowModal(false);
        loadAnnouncements();
      }
    } else {
      // Insert logic: නව නිවේදනයක් ඇතුළත් කිරීම
      const { error } = await supabase.from('announcements').insert([
        {
          title: formData.title,
          message: formData.message,
          department_id: formData.department_id || null,
          expires_at: formData.expires_at || null,
          created_by: user.id
        }
      ]);

      if (error) {
        showError(error.message);
      } else {
        showSuccess(t('sent_success'));
        setShowModal(false);
        setFormData({ title: '', message: '', department_id: '', expires_at: '' });
        loadAnnouncements();
      }
    }
    setSending(false);
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
                <MegaphoneIcon color={colors.primary} size={24} />
              </span>
              {t('announcements')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('announcements')}</p>
          </div>

          <button onClick={openCreateModal} style={styles.primaryBtn} type="button">
            <PlusIcon /> {t('send_announcement')}
          </button>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIconBox}><BarChartIcon color={colors.textPrimary} /></div>
            <div>
              <div style={styles.statValue}>{announcements.length}</div>
              <div style={styles.statLabel}>{t('total_announcements')}</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}><CalendarIcon color={colors.textPrimary} /></div>
            <div>
              <div style={styles.statValue}>
                {announcements.filter((a) => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
              </div>
              <div style={styles.statLabel}>{t('marked_today')}</div>
            </div>
          </div>
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{t('total_announcements_all') || 'Total Announcements'}</h2>
          </div>

          <div style={styles.list}>
            {announcements.length === 0 ? (
              <div style={styles.emptyBox}>{t('there_is_nothing_to_display_yet')}</div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} style={styles.announcementItem} onClick={() => openViewModal(ann)}>
                  <div style={styles.announcementTop}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={styles.announcementTitle}>{ann.title}</h3>
                      
                      {ann.created_by === user.id && (
                        <button onClick={(e) => openEditModal(e, ann)} style={styles.miniEditBtn} type="button">
                          {t('edit')}
                        </button>
                      )}
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaItem}><UserIcon color={colors.textSecondary} /> {ann.users?.full_name || '-'}</span>
                      <span style={styles.metaItem}>
                        <BuildingIcon color={colors.textSecondary} />
                        {ann.departments?.department_name ? t(getTranslationKey(ann.departments.department_name)) : t('all_departments')}
                      </span>
                      <span style={styles.metaItem}><ClockIcon color={colors.textSecondary} /> {new Date(ann.created_at).toLocaleString('en-GB')}</span>
                    </div>
                  </div>

                  <div style={styles.announcementBody}>
                    <p style={styles.announcementMessage}>{ann.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {selectedAnnouncement && !isEditing ? t('announcement_details') : isEditing ? t('edit_announcement') : t('send_announcement')}
                </h2>
                <button onClick={() => setShowModal(false)} style={styles.closeBtn}>×</button>
              </div>

              {selectedAnnouncement && !isEditing ? (
                <div style={styles.modalBody}>
                  <h3 style={styles.announcementTitle}>{selectedAnnouncement.title}</h3>
                  <div style={styles.metaRow}>
                    <span style={styles.metaItem}>👤 {selectedAnnouncement.users?.full_name || '-'}</span>
                    <span style={styles.metaItem}>🏢 {selectedAnnouncement.departments?.department_name ? t(getTranslationKey(selectedAnnouncement.departments.department_name)) : t('all_departments')}</span>
                    <span style={styles.metaItem}>📅 {new Date(selectedAnnouncement.created_at).toLocaleString('en-GB')}</span>
                  </div>
                  <div style={{ ...styles.announcementBody, marginTop: 18 }}>
                    <p style={styles.announcementMessage}>{selectedAnnouncement.message}</p>
                  </div>
                  <div style={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} style={styles.secondaryBtn}>{t('cancel')}</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendAnnouncement} style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('name_title')} *</label>
                    <input type="text" placeholder={t('name_title')} required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={styles.input} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('department')}</label>
                    <select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} style={styles.select}>
                      <option value="">{t('all_departments')}</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{t(getTranslationKey(dept.department_name))}</option>
                      ))}
                    </select>
                  </div>

            
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('expire_time') || 'Expiry Date & Time'}</label>
                    <input type="datetime-local" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} style={styles.input} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{t('description')} *</label>
                    <textarea placeholder={t('description')} rows="5" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} style={styles.textarea} />
                  </div>

                  <div style={styles.modalActions}>
                    <button type="button" onClick={() => setShowModal(false)} style={styles.secondaryBtn}>{t('cancel')}</button>
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

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--text-secondary)', margin: 0 },
  primaryBtn: { padding: '12px 24px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  secondaryBtn: { padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  miniEditBtn: { padding: '4px 10px', backgroundColor: 'var(--primary-soft)', color: colors.primary, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24, padding: '0 24px' },
  statCard: { backgroundColor: 'var(--bg-secondary)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)' },
  statIconBox: { width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--gray-100)', borderRadius: 10 },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 },
  contentCard: { backgroundColor: 'var(--bg-secondary)', borderRadius: 12, margin: '0 24px', border: '1px solid var(--border)' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  list: { padding: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  announcementItem: { padding: 20, backgroundColor: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' },
  announcementTop: { marginBottom: 12 },
  announcementTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--text-secondary)' },
  metaItem: { display: 'flex', alignItems: 'center', gap: 6 },
  announcementBody: { paddingTop: 12, borderTop: '1px solid var(--border)' },
  announcementMessage: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 },
  emptyBox: { padding: 24, textAlign: 'center', color: 'var(--text-secondary)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 },
  modalBox: { backgroundColor: 'var(--card)', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  closeBtn: { width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 24 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box', backgroundColor: 'var(--gray-50)' },
  select: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box', backgroundColor: 'var(--gray-50)', cursor: 'pointer' },
  textarea: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', backgroundColor: 'var(--gray-50)' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16, color: 'var(--text-secondary)' }
};

export default Announcements;