import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { showSuccess, showError } from '../services/toastService';
import '../styles/pro-admin.css';

function ProfileRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem('user') || '{}');
  const { t } = useLanguage();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('profile_change_requests')
      .select(`
        *,
        requester:users!profile_change_requests_user_id_fkey(full_name, email),
        approver:users!profile_change_requests_approved_by_fkey(full_name, email)
      `)
      .order('requested_at', { ascending: false });

    if (error) showError(error.message);
    setRequests(data || []);
    setLoading(false);
  };

  const approveRequest = async (req) => {
    const field = req.field_name;
    if (!['password', 'email'].includes(field)) {
      await supabase.from('users').update({ [field]: req.new_value }).eq('id', req.user_id);
    }

    const { error } = await supabase
      .from('profile_change_requests')
      .update({ status: 'Approved', approved_by: admin.id, approved_at: new Date().toISOString() })
      .eq('id', req.id);

    if (error) { showError(error.message); return; }

    // 🔴 Supervisor Change 6: Send Notification upon approval
    await supabase.from('notifications').insert({
      user_id: req.user_id, title: 'Profile Update Approved', message: `Your request to change ${req.field_name} has been approved by the Admin.`,
      is_read: false, is_auto_generated: true, notification_type: 'Profile', related_entity: 'profile_request', related_id: req.id, created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({ user_id: admin.id, action: 'APPROVE_PROFILE_REQUEST', entity_type: 'profile_change_requests', entity_id: req.id });
    showSuccess(t('profile_request_approved_toast') || 'Profile request approved');
    loadRequests();
  };

  const rejectRequest = async (req) => {
    const { error } = await supabase
      .from('profile_change_requests')
      .update({ status: 'Rejected', approved_by: admin.id, approved_at: new Date().toISOString() })
      .eq('id', req.id);

    if (error) { showError(error.message); return; }

    await supabase.from('notifications').insert({
      user_id: req.user_id, title: 'Profile Update Rejected', message: `Your request to change ${req.field_name} has been rejected by the Admin.`,
      is_read: false, is_auto_generated: true, notification_type: 'Profile', related_entity: 'profile_request', related_id: req.id, created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({ user_id: admin.id, action: 'REJECT_PROFILE_REQUEST', entity_type: 'profile_change_requests', entity_id: req.id });
    showSuccess(t('profile_request_rejected_toast') || 'Profile request rejected');
    loadRequests();
  };

  const badgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-success';
    if (status === 'Rejected') return 'badge badge-danger';
    return 'badge badge-warning';
  };

  const getStatusText = (status) => {
    if (status === 'Approved') return t('approved');
    if (status === 'Rejected') return t('rejected');
    return t('pending');
  };

  if (loading) { return <Layout><div className="empty">{t('loading')}</div></Layout>; }

  return (
    <Layout>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg,#7a0000,#9b111e)' }}>
        <div className="page-title">
          <div className="icon-box" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}><AppIcon name="users" /></div>
          <div>
            <h2 style={{ color: '#fff' }}>{t('profile_requests')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>{t('review_profile_requests')}</p>
          </div>
        </div>
      </div>

      <div className="pro-grid stats-grid">
        <div className="stat-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          <div><div className="stat-label" style={{ color: 'var(--text)' }}>{t('pending')}</div><div className="stat-value" style={{ color: 'var(--text)' }}>{requests.filter((r) => r.status === 'Pending').length}</div></div>
          <AppIcon name="bell" size={34} />
        </div>
        <div className="stat-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          <div><div className="stat-label" style={{ color: 'var(--text)' }}>{t('approved')}</div><div className="stat-value" style={{ color: 'var(--text)' }}>{requests.filter((r) => r.status === 'Approved').length}</div></div>
          <AppIcon name="check" size={34} />
        </div>
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head">
          <h3 style={{ color: 'var(--text)' }}>{t('profile_change_requests')}</h3>
          <span className="badge badge-neutral">{requests.length} {t('records')}</span>
        </div>

        <div className="table-wrap">
          <table className="pro-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                <th style={{ color: 'var(--text)' }}>{t('employee')}</th>
                <th style={{ color: 'var(--text)' }}>{t('field')}</th>
                <th style={{ color: 'var(--text)' }}>{t('old_value')}</th>
                
                {/* 🔴 Supervisor Change 6: Changed 'New Value' to 'Updated Value' */}
                <th style={{ color: 'var(--text)' }}>{t('updated_value') || 'Updated Value'}</th>
                
                <th style={{ color: 'var(--text)' }}>{t('status')}</th>
                <th style={{ color: 'var(--text)' }}>{t('requested_at')}</th>
                <th style={{ color: 'var(--text)' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text)' }}>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td><strong>{req.requester?.full_name}</strong><br /><small style={{ color: 'var(--muted)' }}>{req.requester?.email}</small></td>
                  <td>{req.field_name}</td>
                  
                  {/* 🔴 Supervisor Change 6: Privacy issue fixed - Passwords show as empty/dots */}
                  <td>{req.field_name === 'password' ? <span style={{color: 'var(--muted)', fontStyle: 'italic'}}>Hidden for privacy</span> : req.old_value || '-'}</td>
                  <td>{req.field_name === 'password' ? <span style={{color: 'var(--muted)', fontStyle: 'italic'}}>Hidden for privacy</span> : req.new_value || '-'}</td>
                  
                  <td><span className={badgeClass(req.status)}>{getStatusText(req.status)}</span></td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>
                    {req.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => approveRequest(req)}><AppIcon name="check" size={16} />{t('approve')}</button>
                        <button className="btn btn-danger" onClick={() => rejectRequest(req)}><AppIcon name="x" size={16} />{t('reject')}</button>
                      </div>
                    ) : ( <span className="badge badge-neutral">{t('completed')}</span> )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default ProfileRequests;