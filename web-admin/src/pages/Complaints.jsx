import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import { useLocation } from 'react-router-dom';

function Complaints() {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => { 
    loadComplaints(); 
    loadAllDepartments(); 
  }, []);

  const loadComplaints = async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*, users(full_name, email), departments(department_name, department_type)')
      .order('created_at', { ascending: false });
      
    let rows = data || [];
    if (role === 'Praja Officer') rows = rows.filter(c => ['Library', 'Preschool'].includes(c.departments?.department_type));
    setComplaints(rows);
  };

  const loadAllDepartments = async () => {
    const { data } = await supabase.from('departments').select('department_name');
    setAllDepartments(data || []);
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const matchStatus = filter === 'all' || String(c.status).toLowerCase() === filter;
      const cDeptName = c.departments?.department_name || 'N/A';
      const matchDept = deptFilter === 'all' || cDeptName === deptFilter;
      return matchStatus && matchDept;
    });
  }, [complaints, filter, deptFilter]);

  const canUpdate = ['Admin', 'Secretary', 'Chairman', 'Praja Officer'].includes(role);
  const canPrajaNote = role === 'Praja Officer';

  const updateComplaint = async (status) => {
    if (!selected) return;
    await supabase.from('complaints').update({ status, updated_at: new Date().toISOString() }).eq('id', selected.id);
    await supabase.from('notifications').insert([{
      user_id: selected.user_id, title: 'Complaint Status Updated',
      message: `Your complaint "${selected.title}" is now ${status}. ${note || ''}`,
      is_auto_generated: true, is_read: false, created_at: new Date().toISOString()
    }]);
    setSelected(null); setNote(''); loadComplaints();
  };

  const sendPrajaNote = async () => {
    const { data: admins } = await supabase.from('users').select('id, roles(role_name)').in('roles.role_name', ['Admin', 'Secretary']);
    const notices = (admins || []).map(a => ({
      user_id: a.id, title: 'Praja Officer Review Note',
      message: `Complaint: ${selected.title}. Note: ${note}`,
      is_auto_generated: true, is_read: false, created_at: new Date().toISOString()
    }));
    if (notices.length) await supabase.from('notifications').insert(notices);
    setSelected(null); setNote('');
  };

  return (
    <Layout>
      <PageHero icon="alert" title={t('complaints')} subtitle={t('notifications_subtitle')} />
      
      <div className="pro-grid stats-grid">
        <StatCard icon="alert" label={t('total_complaints')} value={complaints.length} />
        <StatCard icon="alert" label={t('pending')} value={complaints.filter(c => c.status === 'Open').length} />
        <StatCard icon="clipboard" label={t('open_in_progress')} value={complaints.filter(c => c.status === 'In Progress').length} />
        <StatCard icon="check" label={t('completed')} value={complaints.filter(c => c.status === 'Resolved').length} />
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {['all', 'open', 'in progress', 'resolved'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? t('all') : f === 'open' ? t('pending') : f === 'in progress' ? t('open_in_progress') : t('completed')}
          </button>
        ))}
        
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="tab active">
          <option value="all">{t('all_departments') || 'All Departments'}</option>
          {allDepartments.map(dept => (
            <option key={dept.department_name} value={dept.department_name}>
              {/* 🔴 මෙතනදී පරිවර්තනය වෙයි */}
              {t(getTranslationKey(dept.department_name)) !== getTranslationKey(dept.department_name) 
                ? t(getTranslationKey(dept.department_name)) 
                : dept.department_name}
            </option>
          ))}
        </select>
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head">
          <h3 style={{ color: 'var(--text)' }}>{t('complaints')}</h3>
          <span className="badge badge-neutral">{filtered.length} {t('records')}</span>
        </div>
        
        {filtered.length === 0 ? (
          <EmptyState icon="alert" title={t('no_complaints')} text={t('there_is_nothing_to_display_yet')} />
        ) : (
          <div className="pro-grid">
            {filtered.map(c => (
              <div className="pro-card" key={c.id} style={{ margin: 0, backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{c.title}</h3>{statusBadge(c.status)}
                </div>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{c.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span className="badge badge-neutral">{c.users?.full_name}</span>
                  <span className="badge badge-neutral">{t(getTranslationKey(c.departments?.department_name))}</span>
                </div>
                <button className="btn btn-soft" onClick={() => setSelected(c)}><AppIcon name="search" /> {t('edit')}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--card)' }}>
            <div className="modal-head">
              <h3 style={{ color: 'var(--text)' }}>{t('edit')}</h3>
              <button className="btn btn-soft" onClick={() => setSelected(null)}><AppIcon name="x" /></button>
            </div>
            <div className="modal-body" style={{ color: 'var(--text)' }}>
              <p><b>{t('name_title')}:</b> {selected.title}</p>
              <p><b>{t('user')}:</b> {selected.users?.full_name}</p>
              <p><b>{t('description')}:</b><br />{selected.description}</p>
              <div className="field">
                <label style={{ color: 'var(--text)' }}>{t('remarks')}</label>
                <textarea className="textarea" rows="4" value={note} onChange={e => setNote(e.target.value)} style={{ backgroundColor: 'var(--gray-50)', color: 'var(--text)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
                {canPrajaNote && <button className="btn btn-primary" onClick={sendPrajaNote}>{t('save')}</button>}
                {canUpdate && (
                  <>
                    <button className="btn btn-soft" onClick={() => updateComplaint('In Progress')}>{t('open_in_progress')}</button>
                    <button className="btn btn-primary" onClick={() => updateComplaint('Resolved')}>{t('completed')}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
export default Complaints;