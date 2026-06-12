import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ADMIN_APPROVED = ['Admin Approved'];

const MiniIcon = ({ type, size = 16 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'phone') return (<svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.62.6A2 2 0 0 1 22 16.92z" /></svg>);
  if (type === 'whatsapp') return (<svg {...common}><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.8z" /><path d="M8.8 8.7c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c-.1.1-.2.3 0 .6.4.7 1 1.4 1.8 1.9.3.2.5.2.7 0l.6-.7c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.6 0 .5-.2 1.2-.8 1.5-.5.3-1.5.6-3.4-.2-2.8-1.2-4.6-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.2.6-1.8.8-2.2z" /></svg>);
  return (<svg {...common}><path d="M4 4h16v16H4z" /><path d="m22 6-10 7L2 6" /></svg>);
};

function LeaveTimeline({ request, t }) {
  const deptType = request.users?.departments?.department_type;
  const designation = request.users?.designation;
  const isLabourer = designation === 'Labourer';

  const steps = [
    { key: 'Pending', label: t('pending'), note: t('leave_submitted') },
    { key: 'Admin Approved', label: t('admin_approved'), note: t('admin_first_review') }
  ];

  if (deptType === 'Library' || deptType === 'Preschool') {
    steps.push({ key: 'Praja Reviewed', label: t('praja_reviewed'), note: t('praja_review_required') });
  }

  steps.push({
    key: 'Approved',
    label: isLabourer ? t('chairman_final_approval') : t('final_approval'),
    note: isLabourer ? t('chairman_approval_note') : t('secretary_approval_note')
  });

  if (request.status === 'Rejected') {
    steps.push({ key: 'Rejected', label: t('rejected'), note: t('leave_rejected') });
  }

  const currentIndex = steps.findIndex((s) => s.key === request.status);

  return (
    <div className="pro-card leave-timeline-card" style={{ marginTop: 16 }}>
      <div className="card-head"><h3>{t('approval_timeline')}</h3></div>
      <div className="leave-timeline">
        {steps.map((step, index) => {
          const done = request.status === 'Rejected' ? step.key === 'Rejected' || index < steps.length - 1 : index <= currentIndex;
          return (
            <div key={step.key} className={`timeline-step ${done ? 'done' : ''}`}>
              <div className="timeline-dot">{done ? <AppIcon name="check" size={15} /> : index + 1}</div>
              <div className="timeline-content">
                <strong>{step.label}</strong>
                <span>{step.note}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeaveRequests() {
  const { t } = useLanguage();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase_token');
      const res = await fetch(`${API_BASE}/leave/all-requests`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { window.alert(data.error || t('failed_load_leave_requests')); setRequests([]); return; }
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      window.alert(t('failed_connect_backend'));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, []);

  const visibleRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filter === 'all') return true;
      if (filter === 'admin') return ADMIN_APPROVED.includes(r.status);
      return String(r.status).toLowerCase().includes(filter);
    });
  }, [requests, filter]);

  useEffect(() => {
    const openId = location.state?.openId;
    if (!openId || requests.length === 0) return;
    const found = requests.find((item) => String(item.id) === String(openId));
    if (found) { setSelected(found); setRemark(''); }
  }, [location.state, requests]);

  // Government Rule Validation: නිවාඩු ලබා දීමේදී සීමාවන් පරීක්ෂා කිරීම
  const checkGovernmentRules = (req) => {
    if (req.no_of_days > 45) {
      return { valid: false, reason: 'Total leave exceeds the annual 45-day government cap.' };
    }
    if (req.no_of_days >= 6) {
      return { valid: false, reason: 'Consecutive leave cannot exceed 5 days without special executive approval.' };
    }
    // සති අන්ත සහ නිවාඩු දින පරීක්ෂාව
    const start = new Date(req.start_date);
    const day = start.getDay();
    if (day === 0 || day === 6) {
      return { valid: false, reason: 'Leave requests cannot be initiated on Weekends (Saturday/Sunday).' };
    }
    return { valid: true };
  };

  const canApprove = (req) => {
    const status = req.status;
    const designation = req.users?.designation;
    const deptType = req.users?.departments?.department_type;
    const isLabourer = designation === 'Labourer';

    if (role === 'Admin') return status === 'Pending';
    if (role === 'Praja Officer') return status === 'Admin Approved' && ['Library', 'Preschool'].includes(deptType);
    if (role === 'Secretary') {
      if (isLabourer) return false;
      return ['Library', 'Preschool'].includes(deptType) ? status === 'Praja Reviewed' : status === 'Admin Approved';
    }
    if (role === 'Chairman') return isLabourer && status === 'Admin Approved';
    return false;
  };

  const getApproveButtonText = () => {
    if (role === 'Admin') return t('admin_approve');
    if (role === 'Praja Officer') return t('submit_review');
    return t('final_approve');
  };

  const updateLeave = async (action) => {
    if (!selected) return;

    if (action === 'approve') {
      const validation = checkGovernmentRules(selected);
      if (!validation.valid) {
        window.alert(`Rule Restriction: ${validation.reason}`);
        return;
      }
    }

    try {
      const token = localStorage.getItem('supabase_token');
      let endpoint = '';

      if (action === 'reject') endpoint = `${API_BASE}/leave/reject/${selected.id}`;
      else if (role === 'Admin') endpoint = `${API_BASE}/leave/admin-approve/${selected.id}`;
      else if (role === 'Praja Officer') endpoint = `${API_BASE}/leave/praja-review/${selected.id}`;
      else endpoint = `${API_BASE}/leave/final-approve/${selected.id}`;

      const body = role === 'Praja Officer' && action === 'approve' ? { note: remark } : { remark };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) { window.alert(data.error || t('action_failed')); return; }

      window.alert(t('leave_request_updated_successfully'));
      setSelected(null);
      setRemark('');
      loadRequests();
    } catch (error) {
      console.error(error);
      window.alert(t('failed_connect_backend'));
    }
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const getTabLabel = (f) => {
    if (f === 'all') return t('all');
    if (f === 'pending') return t('pending');
    if (f === 'admin') return t('admin_approved');
    if (f === 'praja reviewed') return t('praja_reviewed');
    if (f === 'approved') return t('approved');
    if (f === 'rejected') return t('rejected');
    return f;
  };

  if (loading) {
    return (
      <Layout>
        <div className="empty">{t('loading')}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero icon="clipboard" title={t('leave_requests')} subtitle={t('leave_requests_subtitle')} />

      <div className="pro-grid stats-grid">
        <StatCard icon="clipboard" label={t('total_requests')} value={requests.length} />
        <StatCard icon="alert" label={t('pending_admin')} value={requests.filter((r) => r.status === 'Pending').length} />
        <StatCard icon="shield" label={t('final_review')} value={requests.filter((r) => ['Admin Approved', 'Praja Reviewed'].includes(r.status)).length} />
        <StatCard icon="check" label={t('approved')} value={requests.filter((r) => r.status === 'Approved').length} />
      </div>

      {/* 🔴 Supervisor Change: Tab Order Updated */}
      <div className="tabs">
        {['all', 'pending', 'approved', 'rejected', 'admin', 'praja reviewed'].map((f) => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} type="button">
            {getTabLabel(f)}
          </button>
        ))}
      </div>

      <div className="pro-card">
        <div className="card-head">
          <h3>{t('leave_requests')}</h3>
          <span className="badge badge-neutral">{visibleRequests.length} {t('records')}</span>
        </div>

        {visibleRequests.length === 0 ? (
          <EmptyState icon="clipboard" title={t('no_leave_requests_found')} text={t('nothing_to_display')} />
        ) : (
          <div className="table-wrap">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>{t('employee')}</th>
                  <th>{t('department')}</th>
                  <th>{t('leave_type')}</th>
                  <th>{t('leave_period')}</th>
                  <th>{t('days')}</th>
                  <th>{t('contact')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.users?.full_name}</strong><br /><small>{req.users?.email}</small></td>
                    <td>{t(getTranslationKey(req.users?.departments?.department_name))}<br /><small>{t(getTranslationKey(req.users?.departments?.department_type))}</small></td>
                    <td>{t(getTranslationKey(req.leave_types?.leave_type_name))}</td>
                    <td>{req.start_date} → {req.end_date}</td>
                    <td>{req.no_of_days}</td>
                    <td>{req.users?.phone ? <span className="badge badge-neutral">{req.users.phone}</span> : <span className="badge badge-neutral">{t('not_available')}</span>}</td>
                    <td>{statusBadge(req.status)}</td>
                    <td>
                      <button className="btn btn-soft" onClick={() => { setSelected(req); setRemark(''); }} type="button">
                        <AppIcon name="search" /> {t('review')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{t('review_leave_request')}</h3>
              <button className="btn btn-soft" onClick={() => setSelected(null)} type="button"><AppIcon name="x" /></button>
            </div>
            <div className="modal-body">
              <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
                <p><b>{t('employee')}:</b><br />{selected.users?.full_name}</p>
                <p><b>{t('email')}:</b><br />{selected.users?.email || '-'}</p>
                <p><b>{t('phone')}:</b><br />{selected.users?.phone || t('not_available')}</p>
                <p><b>{t('department')}:</b><br />{t(getTranslationKey(selected.users?.departments?.department_name))}</p>
                <p><b>{t('designation')}:</b><br />{t(getTranslationKey(selected.users?.designation || '-'))}</p>
                <p><b>{t('leave_type')}:</b><br />{t(getTranslationKey(selected.leave_types?.leave_type_name))}</p>
                <p><b>{t('leave_period')}:</b><br />{selected.start_date} → {selected.end_date}</p>
                <p><b>{t('days')}:</b><br />{selected.no_of_days}</p>
                <p><b>{t('status')}:</b><br />{statusBadge(selected.status)}</p>
              </div>

              <LeaveTimeline request={selected} t={t} />

              <div className="field" style={{ marginTop: 16 }}>
                <label>{t('remarks')}</label>
                <textarea className="textarea" rows="4" value={remark} placeholder={t('enter_remarks')} onChange={(e) => setRemark(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-danger" onClick={() => updateLeave('reject')} disabled={!canApprove(selected)} type="button">{t('reject')}</button>
                <button className="btn btn-primary" onClick={() => updateLeave('approve')} disabled={!canApprove(selected)} type="button">{getApproveButtonText()}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default LeaveRequests;