import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import toast from 'react-hot-toast';
import { formatSriLankaDateTime } from '../utils/dateTime';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Complaints() {
  const { t, language } = useLanguage();
  const location = useLocation();
  
  const activeLanguage = String(
    language ||
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [complaints, setComplaints] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.roles?.role_name || user?.role || user?.role_name || 'Admin';
  const isPrajaOfficer = role === 'Praja Officer';

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('supabase_token') || '';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const isPrajaDepartment = (department) => {
    const name = String(department?.department_name || '').trim().toLowerCase();
    const type = String(department?.department_type || '').trim().toLowerCase();

    return (
      ['library', 'library service', 'preschool', 'pre school', 'pre-school', 'preschool service', 'pre school service'].includes(type) ||
      name.includes('library') ||
      name.includes('preschool') ||
      name.includes('pre school') ||
      name.includes('pre-school')
    );
  };

  useEffect(() => {
    loadComplaints();
    loadAllDepartments();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getLocalizedText = (item, field) => {
    if (!item) return '';
    const langKey = `${field}_${activeLanguage}`;
    return item[langKey] || item[field] || item[`${field}_en`] || '';
  };

  const getLocalizedDepartmentName = (dept) => {
    if (!dept) return '-';
    
    return isSinhala
      ? (dept.department_name_si || dept.department_name || '-')
      : isTamil
      ? (dept.department_name_ta || dept.department_name || '-')
      : (dept.department_name || '-');
  };

  const getLocalizedCategory = (category) => {
    if (!category) return '-';
    const c = String(category).trim().toLowerCase();
    
    if (c === 'other') return tr('complaint_type_other', 'Other');
    if (c === 'service') return tr('complaint_type_service', 'Service');
    if (c === 'corruption') return tr('complaint_type_corruption', 'Corruption');
    if (c === 'suggestion') return tr('complaint_type_suggestion', 'Suggestion');
    
    return category;
  };
  
  const getLocalizedStatus = (status) => {
    if (!status) return '-';
    const s = String(status).trim();
    
    if (s === 'Open') return tr('complaint_status_open', 'Open');
    if (s === 'In Progress') return tr('complaint_status_in_progress', 'In Progress');
    if (s === 'Resolved') return tr('complaint_status_resolved', 'Resolved');
    if (s === 'Closed') return tr('complaint_status_closed', 'Closed');
    
    return s;
  };

  const loadComplaints = async () => {
    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`${API_BASE}/complaints/all`, {
        headers
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Complaints load error:', data);
        toast.error(data.error || tr('failed_to_load_complaints', 'Failed to load complaints'));
        setComplaints([]);
        return;
      }

      setComplaints(data || []);
    } catch (err) {
      console.error(err);
      toast.error(tr('failed_connect_backend', 'Failed to connect backend'));
      setComplaints([]);
    }
  };

  useEffect(() => {
    if (!location.state?.openId || complaints.length === 0) return;

    const complaint = complaints.find(
      c => String(c.id) === String(location.state.openId)
    );

    if (complaint) {
      setSelected(complaint);
      setNote('');
    }
  }, [location.state, complaints]);

  const loadAllDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');

    if (error) {
      toast.error(error.message);
      setAllDepartments([]);
      return;
    }

    const visibleDepartments = isPrajaOfficer
      ? (data || []).filter(isPrajaDepartment)
      : (data || []);

    setAllDepartments(visibleDepartments);
  };

  const filtered = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return complaints.filter((c) => {
      const roleMatch = !isPrajaOfficer || isPrajaDepartment(c.departments);
      const matchStatus = filter === 'all' || String(c.status).toLowerCase() === filter;
      
      const deptName = getLocalizedDepartmentName(c.departments);
      const origDeptName = c.departments?.department_name || '';
      const userName = c.users?.full_name || '';

      const matchDept =
        deptFilter === 'all' ||
        String(c.department_id) === String(deptFilter) ||
        origDeptName === deptFilter;

      const titleText = getLocalizedText(c, 'title');
      const descText = getLocalizedText(c, 'description');

      const matchSearch =
        !keyword ||
        titleText.toLowerCase().includes(keyword) ||
        descText.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        origDeptName.toLowerCase().includes(keyword) ||
        userName.toLowerCase().includes(keyword) ||
        String(c.status || '').toLowerCase().includes(keyword);

      return roleMatch && matchStatus && matchDept && matchSearch;
    });
  }, [complaints, filter, deptFilter, searchTerm, isPrajaOfficer, activeLanguage]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      open: complaints.filter((c) => c.status === 'Open').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
      closed: complaints.filter((c) => c.status === 'Closed').length
    };
  }, [complaints]);


  const canUpdate = ['Secretary', 'Chairman'].includes(role);
  const canPrajaNote = role === 'Praja Officer';

  const updateComplaint = async (status) => {
    if (!selected) return;

    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`${API_BASE}/complaints/status/${selected.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status,
          remark: note
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || tr('failed_to_update_complaint', 'Failed to update complaint'));
        return;
      }

      toast.success(tr('complaint_updated_successfully', 'Complaint updated successfully'));
      setSelected(null);
      setNote('');
      loadComplaints();
    } catch (err) {
      console.error(err);
      toast.error(tr('failed_connect_backend', 'Failed to connect backend'));
    }
  };

  const sendPrajaNote = async () => {
    if (!note.trim()) {
      toast.error(tr('review_note_required', 'Review note is required'));
      return;
    }

    const { data: admins } = await supabase
      .from('users')
      .select('id, roles(role_name)')
      .in('roles.role_name', ['Admin', 'Secretary']);

    const notices = (admins || []).map((a) => ({
      user_id: a.id,
      title: t('praja_officer_review_note'),
      message: `Complaint: ${getLocalizedText(selected, 'title')}. Note: ${note}`,
      is_auto_generated: true,
      is_read: false,
      created_at: new Date().toISOString()
    }));

    if (notices.length) {
      await supabase.from('notifications').insert(notices);
    }

    toast.success(tr('review_note_sent_successfully', 'Review note sent successfully'));
    setSelected(null);
    setNote('');
  };

  const getTabLabel = (f) => {
    if (f === 'all') return t('all');
    if (f === 'in progress') return t('open_in_progress');
    if (f === 'resolved') return tr('resolved', 'Resolved');
    if (f === 'closed') return tr('closed', 'Closed');
    return f;
  };

  const isImageFile = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('supabase.co/storage/v1/object/public');
  };

  return (
    <Layout>
      <PageHero icon="alert" title={t('complaints')} subtitle={t('notifications_subtitle')} />

      <div className="pro-grid stats-grid">
        <StatCard icon="alert" label={t('total_complaints')} value={stats.total} />
        <StatCard icon="alert" label={tr('open', 'Open')} value={stats.open} />
        <StatCard icon="clipboard" label={t('open_in_progress')} value={stats.inProgress} />
        <StatCard icon="check" label={tr('resolved', 'Resolved')} value={stats.resolved} />
        <StatCard icon="report" label={tr('closed', 'Closed')} value={stats.closed} />
      </div>

      <div
        className="pro-card"
        style={{
          marginBottom: 18,
          padding: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {['all', 'in progress', 'resolved', 'closed'].map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              type="button"
            >
              {getTabLabel(f)}
            </button>
          ))}

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="tab"
            style={{
              backgroundColor: 'var(--bg-secondary, #fff)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 500,
              maxWidth: '240px',
              textOverflow: 'ellipsis'
            }}
          >
            <option value="all">{t('all_departments') || 'All Departments'}</option>
            {allDepartments.map((dept) => (
              <option key={dept.id} value={dept.department_name}>
                {getLocalizedDepartmentName(dept)}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 12px',
            backgroundColor: 'var(--gray-50)',
            minWidth: 260
          }}
        >
          <AppIcon name="search" size={16} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tr('search_complaints', 'Search complaints')}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              color: 'var(--text)'
            }}
          />
        </div>
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head">
          <h3 style={{ color: 'var(--text)' }}>{t('complaints')}</h3>
          <span className="badge badge-neutral">
            {filtered.length} {t('records')}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="alert"
            title={t('no_complaints')}
            text={t('there_is_nothing_to_display_yet')}
          />
        ) : (
          <div className="pro-grid">
            {filtered.map((c) => {
              const deptDisplay = getLocalizedDepartmentName(c.departments);

              return (
                <div
                  className="pro-card"
                  key={c.id}
                  style={{
                    margin: 0,
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{getLocalizedText(c, 'title')}</h3>
                  {statusBadge(c.status, getLocalizedStatus(c.status))}
                  </div>

                  <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{getLocalizedText(c, 'description')}</p>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="badge badge-neutral">
                      <AppIcon name="users" size={13} /> {c.users?.full_name || '-'}
                    </span>

                    <span className="badge badge-neutral">
                      <AppIcon name="building" size={13} /> {deptDisplay}
                    </span>

                    <span className="badge badge-neutral">
                      <AppIcon name="calendar" size={13} />{' '}
                      {c.created_at ? formatSriLankaDateTime(c.created_at) : '-'}
                    </span>

                    {c.attachment_url && (
                      <span className="badge badge-neutral" style={{ color: 'var(--primary, #0066cc)' }}>
                        <AppIcon name="file" size={13} /> {tr('has_attachment', 'ඇමුණුමක් ඇත')}
                      </span>
                    )}
                  </div>

                  <button
                    className={`btn ${c.status === 'Closed' ? 'btn-soft' : 'btn-primary'}`}
                    disabled={c.status === 'Closed'}
                    onClick={() => {
                      setSelected(c);
                      setNote('');
                    }}
                    type="button"
                    style={{
                      cursor: c.status === 'Closed' ? 'not-allowed' : 'pointer',
                      opacity: c.status === 'Closed' ? 0.65 : 1
                    }}
                  >
                    <AppIcon name="search" size={16} />
                    <span>
                      {c.status === 'Closed'
                        ? t('already_completed')
                        : tr('complaint_details')}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal View */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--card)', maxWidth: '650px' }}>
            <div className="modal-head">
              <h3 style={{ color: 'var(--text)' }}>{tr('review_complaint', 'Review Complaint')}</h3>
              <button className="btn btn-soft" onClick={() => setSelected(null)} type="button">
                <AppIcon name="x" />
              </button>
            </div>

            <div className="modal-body" style={{ color: 'var(--text)' }}>
              <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                <p><b>{t('name_title')}:</b><br />{getLocalizedText(selected, 'title')}</p>
                <p><b>{t('user')}:</b><br />{selected.users?.full_name || '-'}</p>
                
                <p><b>{t('department')}:</b><br />{getLocalizedDepartmentName(selected.departments)}</p>
                
                <p><b>{t('complaint_date')}:</b><br />{selected.created_at ? formatSriLankaDateTime(selected.created_at) : '-'}</p>
                <p>
                  <b>{t('status')}:</b><br/>
                  <span className={`badge badge-${selected.status.toLowerCase().replace(/\s/g,'-')}`}>
                    {getLocalizedStatus(selected.status)}
                  </span>
                </p>
                {selected.category && (
                  <p>
                    <b>{tr('category','Category')}:</b><br/>
                    {getLocalizedCategory(selected.category)}
                  </p>
                )}
              </div>

              <p style={{ marginTop: 16 }}>
                <b>{t('description')}:</b><br />
                {getLocalizedText(selected, 'description')}
              </p>

              {selected.attachment_url && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--text)', marginTop: 0, marginBottom: 12 }}>
                    {tr('attachment')}
                  </h4>

                  <div style={{ marginBottom: 12 }}>
                    <a
                      href={selected.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-soft"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <AppIcon name="search" size={15} />
                      <span>{t('open_attachment')}</span>
                    </a>
                  </div>

                  {isImageFile(selected.attachment_url) && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>
                        {t('attachment_preview')}:
                      </p>
                      <a href={selected.attachment_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selected.attachment_url}
                          alt="Attachment Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--gray-50)',
                            padding: '4px'
                          }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="field" style={{ marginTop: 16 }}>
                <label style={{ color: 'var(--text)' }}>{t('remarks')}</label>
                <textarea
                  className="textarea"
                  rows="4"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('enter_remarks')}
                  style={{
                    backgroundColor: 'var(--gray-50)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
                {canPrajaNote && (
                  <button className="btn btn-primary" onClick={sendPrajaNote} type="button">
                    {t('save')}
                  </button>
                )}

                {canUpdate && (
                  <>
                    <button
                      className="btn btn-soft"
                      onClick={() => updateComplaint('In Progress')}
                      type="button"
                    >
                      {t('mark_in_progress')}
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() => updateComplaint('Resolved')}
                      type="button"
                    >
                     {t('mark_resolved')}
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => updateComplaint('Closed')}
                      type="button"
                    >
                     {t('close_complaint')}
                    </button>
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