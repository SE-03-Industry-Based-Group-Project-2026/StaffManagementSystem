import React, { useState, useEffect } from 'react';
import AppIcon from './AppIcon';
import LeaveTimeline from './LeaveTimeline';
import SignatureCard from './SignatureCard';
import { formatSriLankaDateTime } from '../utils/dateTime';
import { supabase } from '../services/supabase';

function getLeaveTypeName(leaveType, lang = 'en') {
  if (!leaveType) return '-';
  if (lang === 'si') return leaveType.name_si || leaveType.name_en || '-';
  if (lang === 'ta') return leaveType.name_ta || leaveType.name_en || '-';
  return leaveType.name_en || '-';
}

export default function LeaveReviewModal({ selected, setSelected, remark, setRemark, updateLeave, role, t, tr, lang }) {
  const [employeeBalances, setEmployeeBalances] = useState([]);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [reviewYear, setReviewYear] = useState(String(new Date().getFullYear()));
  const [hasSignature, setHasSignature] = useState(true); // 🌟 අත්සන ඇත්දැයි පරීක්ෂා කිරීමට ස්ටේට් එකක්

  const isLabourer = String(selected.users?.staff_category || '').toLowerCase() === 'labour' || 
                     String(selected.users?.designations?.designation_en || '').toLowerCase().includes('labour') ||
                     String(selected.users?.designations?.designation_si || '').includes('කම්කරු') ||
                     String(selected.users?.designations?.designation_ta || '').includes('தொழிலாளி');
 
  const isShortLeave = selected.leave_types?.name_en?.toLowerCase().includes('short');
  const employeeId = selected.user_id || selected.users?.id;

 
  useEffect(() => {
    const checkUserSignature = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
         
          const { data, error } = await supabase
            .from('users')
            .select('signature_url')
            .eq('id', parsedUser.id)
            .single();

          if (!error && data) {
            setHasSignature(!!data.signature_url);
          }
        } catch (e) {
          console.error('Error checking signature:', e);
        }
      }
    };
    checkUserSignature();
  }, []);

  const getModalAttachmentUrl = (rawUrl) => {
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

  const modalAttachUrl = getModalAttachmentUrl(selected.attachment_url);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) return;
      try {
        setLoadingData(true);

        const { data: balanceData, error: balanceError } = await supabase
          .from('user_leave_balances')
          .select('*, leave_types(*)')
          .eq('user_id', employeeId)
          .eq('year', reviewYear);
        
        if (!balanceError) {
          const filtered = (balanceData || []).filter(item => {
            const name = item.leave_types?.name_en?.toLowerCase() || '';
            return !name.includes('half');
          });
          setEmployeeBalances(filtered);
        }

        const { data: historyData, error: historyError } = await supabase
          .from('leave_requests')
          .select('*, leave_types(*)')
          .eq('user_id', employeeId)
          .order('created_at', { ascending: false });

        if (!historyError) {
          setEmployeeHistory(historyData || []);
        }

      } catch (err) {
        console.error('Error fetching employee specific leave data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, reviewYear]);

  const canApprove = () => {
    // 🌟 අත්සනක් නොමැති නම් අනුමත කිරීමට ඉඩ නොදේ
    if (!hasSignature) return false;

    const status = selected.status;
    if (role === 'Subject Officer') return !isLabourer && status === 'Pending';
    if (role === 'CC Officer') return !isLabourer && status === 'Subject Approved';
    if (role === 'Secretary') return !isLabourer && status === 'CC Approved';
    if (role === 'Chairman') return isLabourer && status === 'Pending';
    return false;
  };

  const getApproveButtonText = () => {
    if (role === 'Subject Officer') return tr('subject_officer_approve', 'Subject Officer Approve');
    if (role === 'CC Officer') return tr('cc_officer_approve', 'CC Officer Approve');
    if (role === 'Chairman') return tr('chairman_approve', 'Chairman Approve');
    return tr('final_approve', 'Final Approve');
  };

  const translatedDept =
    lang === 'si'
        ? (selected.users?.departments?.department_name_si ||
           selected.users?.departments?.department_name)
        : lang === 'ta'
        ? (selected.users?.departments?.department_name_ta ||
           selected.users?.departments?.department_name)
        : (selected.users?.departments?.department_name || '-');

  const translatedDesignation =
    lang === 'si'
        ? (selected.users?.designations?.designation_si ||
           selected.users?.designations?.designation_en)
        : lang === 'ta'
        ? (selected.users?.designations?.designation_ta ||
           selected.users?.designations?.designation_en)
        : (selected.users?.designations?.designation_en || '-');

  const maxDaysLimit = 25;
  const chartHeight = 160;

  return (
    <div className="modal-backdrop" onClick={() => setSelected(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-head">
          <h3>{t('review_leave_request')}</h3>
          <button className="btn btn-soft" onClick={() => setSelected(null)} type="button">
            <AppIcon name="x" />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* 🌟 අත්සන නොමැති නම් පෙන්වන අනතුරු ඇඟවීමේ පණිවිඩය */}
          {!hasSignature && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
              ⚠️ {tr('signature_required_warning', 'You must save your digital signature in your profile before you can approve leave requests.')}
            </div>
          )}

          <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('employee')}:</b><br />{selected.users?.full_name}</p>
            <p style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}><b>{t('email')}:</b><br />{selected.users?.email || '-'}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('phone')}:</b><br />{selected.users?.phone || t('not_available')}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('department')}:</b><br />{translatedDept}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('designation')}:</b><br />{translatedDesignation}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <b>{t('leave_type')}:</b><br />{getLeaveTypeName(selected.leave_types, lang)}
              {isShortLeave && <><br /><span className="badge badge-info">{tr('monthly_limit', 'Monthly Limit')}: 2</span></>}
            </p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('leave_period')}:</b><br />{selected.start_date} → {selected.end_date}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{t('days')}:</b><br />{selected.no_of_days}</p>
            <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}><b>{tr('submitted_date', 'Submitted Date')}:</b><br />{selected.created_at ? formatSriLankaDateTime(selected.created_at) : '-'}</p>
          </div>

          {modalAttachUrl && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{tr('attachment', 'Attachment Document')}:</span>
              <a 
                href={modalAttachUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-soft" 
                style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <AppIcon name="download" size={14} /> {tr('open_attachment', 'View / Download')}
              </a>
            </div>
          )}

          <div className="pro-card" style={{ marginTop: 16, padding: 20, background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span></span> {`${selected.users?.full_name} ${tr('leave_balances_title', 'Leave Balances Graph')}`}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{tr('year', 'Year')}:</label>
                <select
                  value={reviewYear}
                  onChange={(e) => setReviewYear(e.target.value)}
                  className="select"
                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {loadingData ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tr('loading_balances', 'Loading balances...')}</p>
            ) : employeeBalances.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tr('no_leave_balances_employee','No leave balances found for this employee for this year.')}</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 15, paddingBottom: 10, overflowX: 'auto' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, paddingRight: 8, borderRight: '2px solid var(--border)', fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'right', minWidth: '25px' }}>
                  {[25, 20, 15, 10, 5, 0].map(n => <span key={n}>{n}</span>)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', flex: 1, height: `${chartHeight}px`, position: 'relative', borderBottom: '2px solid var(--border)', paddingLeft: '15px', paddingRight: '15px', gap: '20px' }}>
                  
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                    {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ borderBottom: '1px dashed var(--text)', width: '100%' }}></div>)}
                  </div>

                  {employeeBalances.map((item, index) => {
                    let lName = lang === 'si' ? (item.leave_types?.name_si || item.leave_types?.name_en) : lang === 'ta' ? (item.leave_types?.name_ta || item.leave_types?.name_en) : (item.leave_types?.name_en || '-');

                    const allocated = Number(item.allocated_days) || 0;
                    const used = Number(item.used_days) || 0;
                    const remaining = Number(item.remaining_days) || 0;
                    
                    const barHeight = Math.min(Math.max((remaining / maxDaysLimit) * chartHeight, remaining > 0 ? 12 : 4), chartHeight);
                    const colors = ['#3b82f6', '#ec4899', '#f97316', '#10b981', '#8b5cf6'];

                    return (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 2, minWidth: '100px' }}>
                        
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>
                          {remaining} {tr('remaining', 'Left')}
                        </span>

                        <div style={{ width: '36px', height: `${barHeight}px`, backgroundColor: colors[index % colors.length], borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />

                        <div style={{ marginTop: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{lName}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                            {tr('total', 'Total')}: <strong>{allocated}</strong> | {tr('used', 'Used')}: <strong style={{ color: '#d97706' }}>{used}</strong>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>
            )}
          </div>

          <div className="pro-card" style={{ marginTop: 16, padding: 16, background: 'var(--bg-primary)', borderRadius: 10 }}>
            <h4 style={{ marginBottom: 10, fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
            {`${selected.users?.full_name} ${tr('leave_history_title','Leave History')}`}
            </h4>
            {loadingData ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tr('loading_history','Loading history...')}</p>
            ) : employeeHistory.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tr('no_leave_history','No previous leave history found.')}</p>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px' }}>{tr('leave_type', 'Leave Type')}</th>
                        <th style={{ padding: '6px' }}>{tr('leave_period', 'Period')}</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>{tr('days', 'Days')}</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>{tr('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeHistory.map((hist) => (
                      <tr key={hist.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px', fontWeight: 500 }}>
                          {lang === 'si' ? (hist.leave_types?.name_si || hist.leave_types?.name_en || '-') : lang === 'ta' ? (hist.leave_types?.name_ta || hist.leave_types?.name_en) : (hist.leave_types?.name_en || '-')}
                        </td>
                        <td style={{ padding: '6px' }}>{hist.start_date} → {hist.end_date}</td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{hist.no_of_days}</td>
                        <td style={{ padding: '6px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                            backgroundColor: hist.status === 'Approved' ? '#dcfce7' : hist.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                            color: hist.status === 'Approved' ? '#16a34a' : hist.status === 'Rejected' ? '#dc2626' : '#d97706'
                          }}>
                            {hist.status === 'Approved' ? tr('approved', 'Approved') : hist.status === 'Rejected' ? tr('rejected', 'Rejected') : hist.status === 'Pending' ? tr('pending', 'Pending') : hist.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <LeaveTimeline key={selected.id + selected.status} request={selected} t={t} tr={tr} lang={lang} />

          <div className="pro-card" style={{ marginTop: 16, padding: 18 }}>
            <h3 style={{ marginBottom: 16 }}>{tr('digital_approval_signatures','Digital Approval Signatures')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
              {isLabourer ? (
                <SignatureCard title={tr('chairman', 'Chairman')} image={selected.chairman_signature} t={t} />
              ) : (
                <>
                  <SignatureCard title={tr('subject_officer', 'Subject Officer')} image={selected.subject_signature} t={t} />
                  <SignatureCard title={tr('cc_officer', 'CC Officer')} image={selected.cc_signature} t={t} />
                  <SignatureCard title={tr('secretary', 'Secretary')} image={selected.secretary_signature} t={t} />
                </>
              )}
            </div>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>
              {t('remarks')}
              <span style={{ marginLeft: 6, color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>
                ({t('optional') || 'Optional'})
              </span>
            </label>
            <textarea
              className="textarea"
              rows="3"
              value={remark}
              placeholder={tr('enter_remarks_optional', 'Enter remarks (optional)')}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-danger" onClick={() => updateLeave('reject')} disabled={!canApprove()} type="button">
              {t('reject')}
            </button>
            <button className="btn btn-primary" onClick={() => updateLeave('approve')} disabled={!canApprove()} type="button">
              {getApproveButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}