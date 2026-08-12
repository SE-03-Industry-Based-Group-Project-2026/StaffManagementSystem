import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import LeaveReviewModal from '../components/LeaveReviewModal';
import { useLeaveRequests } from '../hooks/useLeaveRequests';
import { supabase } from '../services/supabase';

const MiniIcon = ({ type, size = 16 }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'whatsapp') {
    return <svg {...common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
  }
  return <svg {...common}><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.8z" /></svg>;
};

function LeaveRequests() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const tr = (key, fallback) => (t(key) && t(key) !== key ? t(key) : fallback);
  
  const getStatusLabel = (status) => {
    if (!status) return '-';
    const s = String(status).toLowerCase();
    if (s.includes('approved')) return tr('approved', 'Approved');
    if (s === 'rejected') return tr('rejected', 'Rejected');
    if (s === 'pending') return tr('pending', 'Pending');
    return status;
  };

  const {
    visibleRequests,
    stats,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selected,
    setSelected,
    remark,
    setRemark,
    role,
    updateLeave
  } = useLeaveRequests(t, tr, language, location?.state);

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data } = await supabase.from('departments').select('id, department_name, department_name_si, department_name_ta');
        if (data) setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const isLabourRequest = (req) => {
    const desig = req.users?.designations;
    if (!desig) return false;
    const desigEn = String(desig.designation_en || '').toLowerCase();
    const desigSi = String(desig.designation_si || '');
    const desigTa = String(desig.designation_ta || '');

    return (
      desigEn.includes('labourer') ||
      desigSi.includes('කම්කරු') ||
      desigTa.includes('தொழிலாளி')
    );
  };

  const finalFilteredRequests = visibleRequests.filter((r) => {
    if (role === 'Chairman') {
      if (!isLabourRequest(r)) return false;
    } else {
      if (isLabourRequest(r)) return false;
    }

    if (selectedDept === 'all') return true;
    return String(r.users?.department_id) === String(selectedDept);
  });

  const formatSriLankaPhone = (phone = '') => {
    const digits = String(phone).replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('94')) return digits;
    if (digits.startsWith('0')) return `94${digits.slice(1)}`;
    return digits;
  };

  const contactDetails = (req) => {
    const phone = req.users?.phone || '';
    const whatsappPhone = formatSriLankaPhone(phone);
    return {
      phone: phone || '-',
      whatsapp: whatsappPhone ? `https://wa.me/${whatsappPhone}` : null
    };
  };

  const actingContactDetails = (req) => {
    const phone = req.acting_user?.phone || '';
    const whatsappPhone = formatSriLankaPhone(phone);
    return {
      phone: phone || '-',
      whatsapp: whatsappPhone ? `https://wa.me/${whatsappPhone}` : null
    };
  };

  const getAttachmentUrl = (rawUrl) => {
    if (!rawUrl) return null;
    let url = rawUrl;
    if (Array.isArray(rawUrl)) {
      url = rawUrl[0];
    } else if (typeof rawUrl === 'string' && rawUrl.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawUrl);
        url = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch (e) {
        url = rawUrl;
      }
    }
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    const { data } = supabase.storage.from('medical-documents').getPublicUrl(url);
    return data?.publicUrl || url;
  };

  const getTabsByRole = () => {
    const baseTabs = [
      { key: 'all', label: tr('all', 'All') },
      { key: 'pending', label: tr('pending', 'Pending') }
    ];

    if (role === 'Subject Officer') {
      baseTabs.push({ key: 'subject', label: tr('subject_officer_approved', 'Subject Approved') });
    } else if (role === 'CC Officer') {
      baseTabs.push({ key: 'cc', label: tr('cc_officer_approved', 'CC Approved') });
    } else if (role === 'Secretary') {
      baseTabs.push({ key: 'cc', label: tr('cc_officer_approved', 'CC Approved') });
    }

    baseTabs.push(
      { key: 'approved', label: tr('approved', 'Approved') },
      { key: 'rejected', label: tr('rejected', 'Rejected') }
    );

    return baseTabs;
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>
          <div style={styles.loadingBox}>
            <div className="spinner-icon" />
            <span>{t('loading') || 'Loading...'}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero icon="clipboard" title={t('leave_requests')} subtitle={t('leave_requests_subtitle')} />

      <div className="pro-grid stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="clipboard" label={t('total_requests')} value={stats.total} />
        <StatCard icon="alert" label={tr('pending_review', 'Pending Review')} value={stats.pending} />
        <StatCard icon="shield" label={tr('in_approval_flow', 'In Approval Flow')} value={stats.finalReview} />
        <StatCard icon="check" label={t('approved')} value={stats.approved} />
        <StatCard icon="report" label={tr('approval_rate', 'Approval Rate')} value={`${stats.approvalRate}%`} />
      </div>

      <div className="pro-card" style={{ marginTop: 20, marginBottom: 20, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {getTabsByRole().map((tab) => (
            <button
              key={tab.key}
              className={`tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
              type="button"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filter === tab.key ? '1px solid #8B0000' : '1px solid var(--border)',
                backgroundColor: filter === tab.key ? '#8B0000' : 'var(--gray-50)',
                color: filter === tab.key ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                lineHeight: 1.4
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 300, flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {language === 'si' ? 'දෙපාර්තමේන්තුව:' : language === 'ta' ? 'திணைக்களம்:' : 'Department:'}
            </span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '380px',
                lineHeight: 1.4
              }}
            >
              <option value="all">
                {language === 'si' ? 'සියලුම දෙපාර්තමේන්තු' : language === 'ta' ? 'அனைத்து திணைக்களங்களும்' : 'All Departments'}
              </option>
              {departments.map((dept) => {
                let displayName = dept.department_name;
                if (language === 'si' && dept.department_name_si) {
                  displayName = dept.department_name_si;
                } else if (language === 'ta' && dept.department_name_ta) {
                  displayName = dept.department_name_ta;
                }
                return (
                  <option key={dept.id} value={dept.id}>{displayName}</option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', minWidth: 280, backgroundColor: 'var(--bg-primary)' }}>
            <AppIcon name="search" size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'si' ? 'නිවාඩු ඉල්ලීම් සොයන්න...' : language === 'ta' ? 'விடுப்பு கோரிக்கைகளை தேடவும்...' : 'Search leave requests'}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div className="pro-card" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {finalFilteredRequests.length === 0 ? (
          <EmptyState icon="clipboard" title={t('no_leave_requests_found')} text={t('nothing_to_display')} />
        ) : (
          <div className="table-wrap">
            <table className="pro-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>{t('employee')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>{t('department')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>{t('leave_type')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>{t('leave_period')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>{language === 'si' ? 'කාර්යභාර නිලධාරී (Acting)' : 'Acting Officer'}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>{t('days')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>{tr('attachment', 'Attachment')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>{t('contact')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>{t('status')}</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {finalFilteredRequests.map((req) => {
                  const details = contactDetails(req);
                  const actingDetails = actingContactDetails(req);
                  const finalAttachUrl = getAttachmentUrl(req.attachment_url);
                  
                  const deptDisplay =
                    language === 'si'
                      ? (req.users?.departments?.department_name_si || req.users?.departments?.department_name || '-')
                      : language === 'ta'
                      ? (req.users?.departments?.department_name_ta || req.users?.departments?.department_name || '-')
                      : (req.users?.departments?.department_name || '-');

                  const leaveTypeDisplay =
                    language === 'si'
                      ? (req.leave_types?.name_si || req.leave_types?.name_en || '-')
                      : language === 'ta'
                      ? (req.leave_types?.name_ta || req.leave_types?.name_en || '-')
                      : (req.leave_types?.name_en || '-');

                  const actingOfficerName = req.acting_user? `${req.acting_user.title ? req.acting_user.title + '. ' : ''}${req.acting_user.full_name}`: '-';
                  
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{req.users?.title? `${req.users.title}. ${req.users.full_name}`: req.users?.full_name}</strong><br />
                        <small style={{ color: 'var(--text-secondary)' }}>{req.users?.email}</small>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{deptDisplay}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{leaveTypeDisplay}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{req.start_date} → {req.end_date}</td>
                      
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        <div>{actingOfficerName}</div>
                        {req.acting_user?.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '12px' }}>
                            <span>{req.acting_user.phone}</span>
                            {actingDetails.whatsapp && <a href={actingDetails.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: '#25D366', display: 'inline-flex' }}><MiniIcon type="whatsapp" size={14} /></a>}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>{req.no_of_days}</td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {finalAttachUrl ? (
                          <a href={finalAttachUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textDecoration: 'underline' }}>
                            {tr('open_attachment', 'View')}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span>{details.phone}</span>
                          {details.whatsapp && (
                            <a href={details.whatsapp} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: '#25D366', display: 'inline-flex' }}>
                              <MiniIcon type="whatsapp" size={16} />
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: req.status?.toLowerCase().includes('approved') ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                          color: req.status?.toLowerCase().includes('approved') ? '#16a34a' : req.status === 'Rejected' ? '#dc2626' : '#d97706'
                        }}>
                          {getStatusLabel(req.status)}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button 
                          style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          className="btn btn-soft" 
                          onClick={() => setSelected(req)} 
                          type="button"
                        >
                          <AppIcon name="search" size={14} /> {t('review')}
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
        <LeaveReviewModal
          selected={selected}
          setSelected={setSelected}
          remark={remark}
          setRemark={setRemark}
          updateLeave={updateLeave}
          role={role}
          t={t} tr={tr} lang={language}
        />
      )}
    </Layout>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '75vh',
    width: '100%'
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: 'var(--muted)',
    fontSize: 14,
    fontWeight: 600
  }
};

export default LeaveRequests;