import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ADMIN_APPROVED = ['Admin Approved'];

const MiniIcon = ({ type, size = 16 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  if (type === 'phone') {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.62.6A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }

  if (type === 'whatsapp') {
    return (
      <svg {...common}>
        <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.8z" />
        <path d="M8.8 8.7c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c-.1.1-.2.3 0 .6.4.7 1 1.4 1.8 1.9.3.2.5.2.7 0l.6-.7c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.6 0 .5-.2 1.2-.8 1.5-.5.3-1.5.6-3.4-.2-2.8-1.2-4.6-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.2.6-1.8.8-2.2z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 4h16v16H4z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
};

function getLeaveTypeName(leaveType, lang = 'en') {
  if (!leaveType) return '-';

  if (lang === 'si') return leaveType.name_si || leaveType.name_en || '-';
  if (lang === 'ta') return leaveType.name_ta || leaveType.name_en || '-';

  return leaveType.name_en || '-';
}

function LeaveTimeline({ request, t }) {
  const deptType = request.users?.departments?.department_type;
  const designation = request.users?.designation;
  const isLabourer = designation === 'Labourer';

  const steps = [
    { key: 'Pending', label: t('pending'), note: t('leave_submitted') },
    { key: 'Admin Approved', label: t('admin_approved'), note: t('admin_first_review') }
  ];

  if (deptType === 'Library' || deptType === 'Preschool') {
    steps.push({
      key: 'Praja Reviewed',
      label: t('praja_reviewed'),
      note: t('praja_review_required')
    });
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
      <div className="card-head">
        <h3>{t('approval_timeline')}</h3>
      </div>

      <div className="leave-timeline">
        {steps.map((step, index) => {
          const done =
            request.status === 'Rejected'
              ? step.key === 'Rejected' || index < steps.length - 1
              : index <= currentIndex;

          return (
            <div key={step.key} className={`timeline-step ${done ? 'done' : ''}`}>
              <div className="timeline-dot">
                {done ? <AppIcon name="check" size={15} /> : index + 1}
              </div>

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
  const { t, language } = useLanguage();
  const location = useLocation();

  const lang = language || localStorage.getItem('language') || 'en';

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase_token');

      const res = await fetch(`${API_BASE}/leave/all-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('failed_load_leave_requests'));
        setRequests([]);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t('failed_connect_backend'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const openId = location.state?.openId;
    if (!openId || requests.length === 0) return;

    const found = requests.find((item) => String(item.id) === String(openId));
    if (found) {
      setSelected(found);
      setRemark('');
    }
  }, [location.state, requests]);

  const isShortLeave = (req) => {
    return req.leave_types?.name_en?.toLowerCase().includes('short');
  };

  const formatSriLankaPhone = (phone = '') => {
    const digits = String(phone).replace(/\D/g, '');

    if (!digits) return '';
    if (digits.startsWith('94')) return digits;
    if (digits.startsWith('0')) return `94${digits.slice(1)}`;

    return digits;
  };

  const contactLinks = (req) => {
    const phone = req.users?.phone || '';
    const email = req.users?.email || '';
    const name = req.users?.full_name || '';
    const leaveType = getLeaveTypeName(req.leave_types, lang);

    const whatsappPhone = formatSriLankaPhone(phone);

    const plainMessage = `Hello ${name}, regarding your ${leaveType} from ${req.start_date} to ${req.end_date}.`;
    const encodedMessage = encodeURIComponent(plainMessage);
    const emailBody = encodeURIComponent(plainMessage);

    return {
      phone,
      email,
      call: phone ? `tel:${phone}` : null,
      mail: email ? `mailto:${email}?subject=Leave Request Update&body=${emailBody}` : null,
      whatsapp: whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${encodedMessage}` : null
    };
  };

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const finalReview = requests.filter((r) =>
      ['Admin Approved', 'Praja Reviewed'].includes(r.status)
    ).length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    const totalDays = requests.reduce((sum, r) => sum + Number(r.no_of_days || 0), 0);
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, pending, finalReview, approved, rejected, totalDays, approvalRate };
  }, [requests]);

  const visibleRequests = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return requests.filter((r) => {
      const matchTab =
        filter === 'all' ||
        (filter === 'admin' && ADMIN_APPROVED.includes(r.status)) ||
        String(r.status).toLowerCase().includes(filter);

      const deptName = r.users?.departments?.department_name || '';
      const leaveType = getLeaveTypeName(r.leave_types, lang);
      const employee = r.users?.full_name || '';
      const email = r.users?.email || '';

      const matchSearch =
        !keyword ||
        employee.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        leaveType.toLowerCase().includes(keyword) ||
        String(r.status || '').toLowerCase().includes(keyword);

      return matchTab && matchSearch;
    });
  }, [requests, filter, searchTerm, lang]);

  const checkGovernmentRules = (req) => {
    if (req.no_of_days > 45) {
      return {
        valid: false,
        reason: tr(
          'leave_rule_annual_cap',
          'Total leave exceeds the annual 45-day government cap.'
        )
      };
    }

    if (req.no_of_days >= 6 && !isShortLeave(req)) {
      return {
        valid: false,
        reason: tr(
          'leave_rule_consecutive_cap',
          'Consecutive leave cannot exceed 5 days without special executive approval.'
        )
      };
    }

    const start = new Date(req.start_date);
    const day = start.getDay();

    if (day === 0 || day === 6) {
      return {
        valid: false,
        reason: tr(
          'leave_rule_weekend',
          'Leave requests cannot be initiated on weekends.'
        )
      };
    }

    return { valid: true };
  };

  const canApprove = (req) => {
    const status = req.status;
    const designation = req.users?.designation;
    const deptType = req.users?.departments?.department_type;
    const isLabourer = designation === 'Labourer';

    if (role === 'Admin') return status === 'Pending';

    if (role === 'Praja Officer') {
      return status === 'Admin Approved' && ['Library', 'Preschool'].includes(deptType);
    }

    if (role === 'Secretary') {
      if (isLabourer) return false;
      return ['Library', 'Preschool'].includes(deptType)
        ? status === 'Praja Reviewed'
        : status === 'Admin Approved';
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

    if (action === 'reject' && !remark.trim()) {
      toast.error(tr('reject_reason_required', 'Reject reason is required.'));
      return;
    }

    if (action === 'approve' && role === 'Praja Officer' && !remark.trim()) {
      toast.error(tr('praja_review_note_required', 'Praja review note is required.'));
      return;
    }

    if (action === 'approve') {
      const validation = checkGovernmentRules(selected);

      if (!validation.valid) {
        toast.error(`${tr('rule_restriction', 'Rule Restriction')}: ${validation.reason}`);
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

      const body =
        role === 'Praja Officer' && action === 'approve'
          ? { note: remark }
          : { remark };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('action_failed'));
        return;
      }

      toast.success(t('leave_request_updated_successfully'));
      setSelected(null);
      setRemark('');
      loadRequests();
    } catch (error) {
      console.error(error);
      toast.error(t('failed_connect_backend'));
    }
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
      <PageHero
        icon="clipboard"
        title={t('leave_requests')}
        subtitle={t('leave_requests_subtitle')}
      />

      <div className="pro-grid stats-grid">
        <StatCard icon="clipboard" label={t('total_requests')} value={stats.total} />
        <StatCard icon="alert" label={t('pending_admin')} value={stats.pending} />
        <StatCard icon="shield" label={t('final_review')} value={stats.finalReview} />
        <StatCard icon="check" label={t('approved')} value={stats.approved} />
        <StatCard icon="report" label={tr('approval_rate', 'Approval Rate')} value={`${stats.approvalRate}%`} />
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected', 'admin', 'praja reviewed'].map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              type="button"
            >
              {getTabLabel(f)}
            </button>
          ))}
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
            placeholder={tr('search_leave_requests', 'Search leave requests')}
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

      <div className="pro-card">
        <div className="card-head">
          <h3>{t('leave_requests')}</h3>
          <span className="badge badge-neutral">
            {visibleRequests.length} {t('records')}
          </span>
        </div>

        {visibleRequests.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title={t('no_leave_requests_found')}
            text={t('nothing_to_display')}
          />
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
                {visibleRequests.map((req) => {
                  const links = contactLinks(req);
                  const leaveTypeName = getLeaveTypeName(req.leave_types, lang);

                  return (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.users?.full_name}</strong>
                        <br />
                        <small>{req.users?.email}</small>
                      </td>

                      <td>
                        {tr(
                          getTranslationKey(req.users?.departments?.department_name),
                          req.users?.departments?.department_name || '-'
                        )}
                        <br />
                        <small>
                          {tr(
                            getTranslationKey(req.users?.departments?.department_type),
                            req.users?.departments?.department_type || '-'
                          )}
                        </small>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-neutral">
                            {leaveTypeName}
                          </span>

                          {isShortLeave(req) && (
                            <span className="badge badge-info">
                              {tr('monthly_limit', 'Monthly Limit')}: 2
                            </span>
                          )}
                        </div>
                      </td>

                      <td>{req.start_date} → {req.end_date}</td>
                      <td>{req.no_of_days}</td>

                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {links.call && (
                            <a className="btn btn-soft" href={links.call} title={t('call') || 'Call'}>
                              <MiniIcon type="phone" />
                            </a>
                          )}

                          {links.mail && (
                            <a className="btn btn-soft" href={links.mail} title={t('email') || 'Email'}>
                              <MiniIcon type="email" />
                            </a>
                          )}

                          {links.whatsapp && (
                            <a
                              className="btn btn-soft"
                              href={links.whatsapp}
                              target="_blank"
                              rel="noreferrer"
                              title="WhatsApp"
                            >
                              <MiniIcon type="whatsapp" />
                            </a>
                          )}

                          {!links.call && !links.mail && !links.whatsapp && (
                            <span className="badge badge-neutral">{t('not_available')}</span>
                          )}
                        </div>
                      </td>

                      <td>{statusBadge(req.status)}</td>

                      <td>
                        <button
                          className="btn btn-soft"
                          onClick={() => {
                            setSelected(req);
                            setRemark('');
                          }}
                          type="button"
                        >
                          <AppIcon name="search" /> {t('review')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              <button
                className="btn btn-soft"
                onClick={() => setSelected(null)}
                type="button"
              >
                <AppIcon name="x" />
              </button>
            </div>

            <div className="modal-body">
              <div
                className="pro-grid"
                style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}
              >
                <p>
                  <b>{t('employee')}:</b>
                  <br />
                  {selected.users?.full_name}
                </p>

                <p>
                  <b>{t('email')}:</b>
                  <br />
                  {selected.users?.email || '-'}
                </p>

                <p>
                  <b>{t('phone')}:</b>
                  <br />
                  {selected.users?.phone || t('not_available')}
                </p>

                <p>
                  <b>{t('department')}:</b>
                  <br />
                  {tr(
                    getTranslationKey(selected.users?.departments?.department_name),
                    selected.users?.departments?.department_name || '-'
                  )}
                </p>

                <p>
                  <b>{t('designation')}:</b>
                  <br />
                  {tr(
                    getTranslationKey(selected.users?.designation),
                    selected.users?.designation || '-'
                  )}
                </p>

                <p>
                  <b>{t('leave_type')}:</b>
                  <br />
                  {getLeaveTypeName(selected.leave_types, lang)}
                  {isShortLeave(selected) && (
                    <>
                      <br />
                      <span className="badge badge-info">
                        {tr('monthly_limit', 'Monthly Limit')}: 2
                      </span>
                    </>
                  )}
                </p>

                <p>
                  <b>{t('leave_period')}:</b>
                  <br />
                  {selected.start_date} → {selected.end_date}
                </p>

                <p>
                  <b>{t('days')}:</b>
                  <br />
                  {selected.no_of_days}
                </p>

                <p>
                  <b>{t('status')}:</b>
                  <br />
                  {statusBadge(selected.status)}
                </p>

                <p>
                  <b>{tr('submitted_date', 'Submitted Date')}:</b>
                  <br />
                  {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}
                </p>

                <p>
                  <b>{tr('admin_approved_date', 'Admin Approved Date')}:</b>
                  <br />
                  {selected.admin_approved_at
                    ? new Date(selected.admin_approved_at).toLocaleString()
                    : '-'}
                </p>

                <p>
                  <b>{tr('final_approved_date', 'Final Approved Date')}:</b>
                  <br />
                  {selected.final_approved_at
                    ? new Date(selected.final_approved_at).toLocaleString()
                    : '-'}
                </p>
              </div>

              <LeaveTimeline request={selected} t={t} />

              <div className="field" style={{ marginTop: 16 }}>
                <label>{t('remarks')}</label>
                <textarea
                  className="textarea"
                  rows="4"
                  value={remark}
                  placeholder={t('enter_remarks')}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-end',
                  marginTop: 20
                }}
              >
                <button
                  className="btn btn-danger"
                  onClick={() => updateLeave('reject')}
                  disabled={!canApprove(selected)}
                  type="button"
                >
                  {t('reject')}
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => updateLeave('approve')}
                  disabled={!canApprove(selected)}
                  type="button"
                >
                  {getApproveButtonText()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default LeaveRequests;