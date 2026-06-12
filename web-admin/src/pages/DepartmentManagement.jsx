import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';

const SvgIcon = ({ children, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const EditIcon = () => <SvgIcon><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></SvgIcon>;
const TrashIcon = () => <SvgIcon color="#ff4d4f"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></SvgIcon>;

function DepartmentManagement() {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [staffCounts, setStaffCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ department_name: '', department_type: 'Regular', description: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => { loadDepartments(); loadStaffCounts(); }, []);

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    setDepartments(data || []);
    setLoading(false);
  };

  const loadStaffCounts = async () => {
    const { data } = await supabase.from('users').select('department_id');
    const counts = {};
    (data || []).forEach(u => { if (u.department_id) counts[u.department_id] = (counts[u.department_id] || 0) + 1; });
    setStaffCounts(counts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('departments').update(formData).eq('id', editing);
    } else {
      await supabase.from('departments').insert([formData]);
    }
    setShowModal(false);
    setEditing(null);
    setFormData({ department_name: '', department_type: 'Regular', description: '', image_url: '' });
    loadDepartments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await supabase.from('departments').delete().eq('id', id);
      loadDepartments();
    }
  };

  const getTranslationKey = (name) => name?.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => dept.department_name.toLowerCase().includes(searchQuery.toLowerCase()) && (typeFilter === 'All' || dept.department_type === typeFilter));
  }, [departments, searchQuery, typeFilter]);

  if (loading) return <Layout><div style={styles.loading}>{t('loading')}</div></Layout>;

  return (
    <Layout>
      <div style={styles.container}>
        {/* පිරිසිදු Professional Header එක */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconBox}><AppIcon name="building" size={24} /></span>
              {t('department_management')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('department_management')}</p>
          </div>
          <button onClick={() => { setShowModal(true); setEditing(null); setFormData({ department_name: '', department_type: 'Regular', description: '', image_url: '' }); }} style={styles.primaryBtn}>
            <AppIcon name="plus" size={17} /> {t('add_department')}
          </button>
        </div>

        <div style={styles.departmentsGrid}>
          {filteredDepartments.map((dept) => (
            <div key={dept.id} style={styles.thumbnailCard} onMouseEnter={() => setHoveredId(dept.id)} onMouseLeave={() => setHoveredId(null)}>
              <img src={dept.image_url || `https://picsum.photos/seed/dept${dept.id}/400/250`} alt={dept.department_name} style={styles.thumbnailImage} />
              <div style={styles.thumbnailOverlay}></div>
              {hoveredId === dept.id && (
                <div style={styles.actionFloat}>
                  <button onClick={() => { setEditing(dept.id); setFormData(dept); setShowModal(true); }} style={styles.iconBtn}><EditIcon /></button>
                  <button onClick={() => handleDelete(dept.id)} style={styles.iconBtn}><TrashIcon /></button>
                </div>
              )}
              <div style={styles.thumbnailContent}>
                <h3 style={styles.thumbnailTitle}> {t(getTranslationKey(dept.department_name))}</h3>
                <span style={styles.staffCountBox}>{staffCounts[dept.id] || 0} {t('staff')}</span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
  <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
    <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
      
  
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>{editing ? t('edit_department') : t('new_department')}</h2>
        <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '5px' }}>
          <AppIcon name="x" size={20} />
        </button>
      </div>

     
      <form onSubmit={handleSubmit} style={styles.modalBody}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('department_name')}</label>
          <input style={styles.input} value={formData.department_name} onChange={e => setFormData({...formData, department_name: e.target.value})} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Image URL</label>
          <input style={styles.input} value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} />
        </div>
        <button 
  type="submit" 
  style={{
    ...styles.primaryBtn, 
    width: 'auto',         
    padding: '10px 24px',  
    alignSelf: 'flex-end' 
  }}
>
  {editing ? t('update') : t('create')}
</button>
      </form>
    </div>
  </div>
)}
      </div>
    </Layout>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: colors.bgPrimary, minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--text-secondary)', margin: 0 },
  primaryBtn: { padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  secondaryBtn: { padding: '12px 24px', backgroundColor: 'var(--card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },

  filterBar: { display: 'flex', gap: '16px', marginBottom: '24px', padding: '0 24px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '8px', flex: '1', minWidth: '250px' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: 'var(--text-primary)' },
  filterSelect: { padding: '10px 16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--card)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer' },

  departmentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, padding: '0 24px', marginBottom: '40px' },
  thumbnailCard: { position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '220px', backgroundColor: 'var(--card)', cursor: 'default' },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' },

  actionFloat: { position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' },
  iconBtn: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },

  thumbnailContent: { position: 'absolute', bottom: '16px', left: '16px', right: '16px' },
  thumbnailTitle: { color: '#ffffff', margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.6)', letterSpacing: '0.5px' },
  thumbnailMeta: { display: 'flex', alignItems: 'center', gap: '10px' },
  glassBadge: { background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '6px', color: '#ffffff', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' },
  staffCountBox: { color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.5)' },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 },
  modalBox: { backgroundColor: 'var(--card)', borderRadius: '12px', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  closeBtn: { width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 24 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box', cursor: 'pointer' },
  textarea: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16, color: 'var(--text-secondary)' }
};

export default DepartmentManagement;