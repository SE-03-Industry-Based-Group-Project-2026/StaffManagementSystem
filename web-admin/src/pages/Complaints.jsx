import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Complaints() {
  const { t } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadComplaints();
    loadAllDepartments();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadComplaints = async () => {
    try {
      const token = localStorage.getItem('supabase_token');

      const res = await fetch(`${API_BASE}/complaints/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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

  const loadAllDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('department_name')
      .order('department_name');

    setAllDepartments(data || []);
  };

  const filtered = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return complaints.filter((c) => {
      const matchStatus = filter === 'all' || String(c.status).toLowerCase() === filter;
      const deptName = c.departments?.department_name || '';
      const userName = c.users?.full_name || '';

      const matchDept = deptFilter === 'all' || deptName === deptFilter;

      const matchSearch =
        !keyword ||
        c.title?.toLowerCase().includes(keyword) ||
        c.description?.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        userName.toLowerCase().includes(keyword) ||
        String(c.status || '').toLowerCase().includes(keyword);

      return matchStatus && matchDept && matchSearch;
    });
  }, [complaints, filter, deptFilter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      open: complaints.filter((c) => c.status === 'Open').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
      closed: complaints.filter((c) => c.status === 'Closed').length
    };
  }, [complaints]);

  const canUpdate = ['Admin', 'Secretary', 'Chairman', 'Praja Officer'].includes(role);
  const canPrajaNote = role === 'Praja Officer';

  const updateComplaint = async (status) => {
    if (!selected) return;

    try {
      const token = localStorage.getItem('supabase_token');

      const res = await fetch(`${API_BASE}/complaints/status/${selected.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      title: 'Praja Officer Review Note',
      message: `Complaint: ${selected.title}. Note: ${note}`,
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
    if (f === 'open') return tr('open', 'Open');
    if (f === 'in progress') return t('open_in_progress');
    if (f === 'resolved') return tr('resolved', 'Resolved');
    if (f === 'closed') return tr('closed', 'Closed');
    return f;
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
          {['all', 'open', 'in progress', 'resolved', 'closed'].map((f) => (
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
            className="tab active"
          >
            <option value="all">{t('all_departments') || 'All Departments'}</option>
            {allDepartments.map((dept) => (
              <option key={dept.department_name} value={dept.department_name}>
                {tr(getTranslationKey(dept.department_name), dept.department_name)}
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
            {filtered.map((c) => (
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
                  <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{c.title}</h3>
                  {statusBadge(c.status)}
                </div>

                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{c.description}</p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span className="badge badge-neutral">
                    <AppIcon name="users" size={13} /> {c.users?.full_name || '-'}
                  </span>

                  <span className="badge badge-neutral">
                    <AppIcon name="building" size={13} />{' '}
                    {tr(getTranslationKey(c.departments?.department_name), c.departments?.department_name || '-')}
                  </span>

                  <span className="badge badge-neutral">
                    <AppIcon name="calendar" size={13} />{' '}
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>

                <button
                  className="btn btn-soft"
                  onClick={() => {
                    setSelected(c);
                    setNote('');
                  }}
                  type="button"
                >
                  <AppIcon name="search" /> {tr('review_complaint', 'Review Complaint')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--card)' }}>
            <div className="modal-head">
              <h3 style={{ color: 'var(--text)' }}>{tr('review_complaint', 'Review Complaint')}</h3>
              <button className="btn btn-soft" onClick={() => setSelected(null)} type="button">
                <AppIcon name="x" />
              </button>
            </div>

            <div className="modal-body" style={{ color: 'var(--text)' }}>
              <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
                <p><b>{t('name_title')}:</b><br />{selected.title}</p>
                <p><b>{t('user')}:</b><br />{selected.users?.full_name || '-'}</p>
                <p><b>{t('department')}:</b><br />{tr(getTranslationKey(selected.departments?.department_name), selected.departments?.department_name || '-')}</p>
                <p><b>{tr('complaint_date', 'Complaint Date')}:</b><br />{selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</p>
                <p><b>{t('status')}:</b><br />{statusBadge(selected.status)}</p>
              </div>

              <p style={{ marginTop: 16 }}>
                <b>{t('description')}:</b><br />
                {selected.description}
              </p>

              <div className="field">
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
                      {tr('mark_in_progress', 'Mark In Progress')}
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() => updateComplaint('Resolved')}
                      type="button"
                    >
                      {tr('mark_resolved', 'Mark Resolved')}
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => updateComplaint('Closed')}
                      type="button"
                    >
                      {tr('close_complaint', 'Close Complaint')}
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