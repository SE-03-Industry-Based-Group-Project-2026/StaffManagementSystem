import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { showSuccess, showError } from '../services/toastService';
import '../styles/pro-admin.css';

function ProfileRequests() {
  const { t } = useLanguage();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const admin = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadRequests();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

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

  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return requests.filter((req) => {
      return (
        !keyword ||
        req.requester?.full_name?.toLowerCase().includes(keyword) ||
        req.requester?.email?.toLowerCase().includes(keyword) ||
        req.field_name?.toLowerCase().includes(keyword) ||
        req.status?.toLowerCase().includes(keyword)
      );
    });
  }, [requests, searchTerm]);

  const approveRequest = async (req) => {
    const field = req.field_name;

    if (!['password', 'email'].includes(field)) {
      await supabase
        .from('users')
        .update({ [field]: req.new_value })
        .eq('id', req.user_id);
    }

    const { error } = await supabase
      .from('profile_change_requests')
      .update({
        status: 'Approved',
        approved_by: admin.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', req.id);

    if (error) {
      showError(error.message);
      return;
    }

    await supabase.from('notifications').insert({
      user_id: req.user_id,
      title: 'Profile Update Approved',
      message: `Your request to change ${req.field_name} has been approved by the Admin.`,
      is_read: false,
      is_auto_generated: true,
      notification_type: 'Profile',
      related_entity: 'profile_request',
      related_id: req.id,
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      user_id: admin.id,
      action: 'APPROVE_PROFILE_REQUEST',
      entity_type: 'profile_change_requests',
      entity_id: req.id
    });

    showSuccess(t('profile_request_approved_toast') || 'Profile request approved');
    loadRequests();
  };

  const rejectRequest = async (req) => {
    const { error } = await supabase
      .from('profile_change_requests')
      .update({
        status: 'Rejected',
        approved_by: admin.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', req.id);

    if (error) {
      showError(error.message);
      return;
    }

    await supabase.from('notifications').insert({
      user_id: req.user_id,
      title: 'Profile Update Rejected',
      message: `Your request to change ${req.field_name} has been rejected by the Admin.`,
      is_read: false,
      is_auto_generated: true,
      notification_type: 'Profile',
      related_entity: 'profile_request',
      related_id: req.id,
      created_at: new Date().toISOString()
    });

    await supabase.from('audit_logs').insert({
      user_id: admin.id,
      action: 'REJECT_PROFILE_REQUEST',
      entity_type: 'profile_change_requests',
      entity_id: req.id
    });

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

  const displayValue = (req, value) => {
    if (req.field_name === 'password') {
      return (
        <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
          {tr('hidden_for_privacy', 'Hidden for privacy')}
        </span>
      );
    }

    return value || '-';
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
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <span style={styles.titleIconBox}>
              <AppIcon name="users" size={24} />
            </span>
            {t('profile_requests')}
          </h1>
          <p style={styles.breadcrumb}>
            {t('dashboard')} / {t('profile_requests')}
          </p>
        </div>
      </div>

      <div className="pro-grid stats-grid">
        <div className="stat-card" style={styles.statCard}>
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>
              {t('pending')}
            </div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => r.status === 'Pending').length}
            </div>
          </div>
          <AppIcon name="bell" size={34} />
        </div>

        <div className="stat-card" style={styles.statCard}>
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>
              {t('approved')}
            </div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => r.status === 'Approved').length}
            </div>
          </div>
          <AppIcon name="check" size={34} />
        </div>

        <div className="stat-card" style={styles.statCard}>
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>
              {t('rejected')}
            </div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => r.status === 'Rejected').length}
            </div>
          </div>
          <AppIcon name="x" size={34} />
        </div>
      </div>

      <div className="pro-card" style={styles.card}>
        <div className="card-head">
          <div>
            <h3 style={{ color: 'var(--text)', margin: 0 }}>
              {t('profile_change_requests')}
            </h3>
            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 13 }}>
              {tr('review_profile_requests', 'Review profile update requests')}
            </p>
          </div>

          <span className="badge badge-neutral">
            {filteredRequests.length} {t('records')}
          </span>
        </div>

        <div style={styles.searchWrap}>
          <AppIcon name="search" size={16} />
          <input
            className="input"
            placeholder={tr('search_profile_requests', 'Search profile requests')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div className="table-wrap">
          <table className="pro-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                <th>{t('employee')}</th>
                <th>{t('field')}</th>
                <th>{t('old_value')}</th>
                <th>{t('updated_value') || 'Updated Value'}</th>
                <th>{t('status')}</th>
                <th>{t('requested_at')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyCell}>
                    {tr('no_profile_requests', 'No profile requests found')}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td>
                      <strong>{req.requester?.full_name || '-'}</strong>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>
                        {req.requester?.email || '-'}
                      </small>
                    </td>

                    <td>{req.field_name}</td>
                    <td>{displayValue(req, req.old_value)}</td>
                    <td>{displayValue(req, req.new_value)}</td>

                    <td>
                      <span className={badgeClass(req.status)}>
                        {getStatusText(req.status)}
                      </span>
                    </td>

                    <td>
                      {req.requested_at
                        ? new Date(req.requested_at).toLocaleString()
                        : '-'}
                    </td>

                    <td>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => approveRequest(req)}
                            type="button"
                          >
                            <AppIcon name="check" size={16} />
                            {t('approve')}
                          </button>

                          <button
                            className="btn btn-danger"
                            onClick={() => rejectRequest(req)}
                            type="button"
                          >
                            <AppIcon name="x" size={16} />
                            {t('reject')}
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          {t('completed')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
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
  breadcrumb: {
    fontSize: 14,
    color: 'var(--muted)',
    margin: 0
  },
  statCard: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)'
  },
  card: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)'
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px 16px'
  },
  searchInput: {
    maxWidth: 360,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    border: '1px solid var(--border)'
  },
  emptyCell: {
    textAlign: 'center',
    padding: 32,
    color: 'var(--muted)'
  }
};

export default ProfileRequests;