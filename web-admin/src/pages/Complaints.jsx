import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import SignatureCard from '../components/SignatureCard';
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
  const [replies, setReplies] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.roles?.role_name || user?.role || user?.role_name || 'Admin';
  const roleLower = String(role).toLowerCase().trim();
  const isDepartmentHead = roleLower === 'department head';
  const isCcOfficer = roleLower === 'cc officer';
  const isSecretary = roleLower === 'secretary';
  const isChairman = roleLower === 'chairman';
  const isPrajaOfficer = roleLower === 'praja officer';
  const userDeptId = user?.department_id;

  const getAuthHeaders = async () => {
    const token = localStorage.getItem('supabase_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
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

  const getLocalizedStatus = (status) => {
    if (!status) return '-';
    const s = String(status).trim().toLowerCase();
    
    if (s === 'open') return isSinhala ? 'විවෘත' : 'Open';
    if (s === 'in progress') return isSinhala ? 'ක්‍රියාත්මක වෙමින් පවතී' : 'In Progress';
    if (s === 'resolved') return isSinhala ? 'විසඳන ලදී' : 'Resolved';
    if (s === 'closed') return isSinhala ? 'වසා ඇත' : 'Closed';
    
    return status;
  };

  const loadComplaints = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/complaints/all`, { headers });
      const data = await res.json();

      if (!res.ok) {
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

  const loadReplies = async (complaintId) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/complaints/replies/${complaintId}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setReplies(data || []);
      }
    } catch (err) {
      console.error('Error loading replies/signatures:', err);
    }
  };

  useEffect(() => {
    if (selected?.id) {
      loadReplies(selected.id);
    } else {
      setReplies([]);
    }
  }, [selected]);

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
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('department_name');

      if (error) {
        toast.error(error.message);
        setAllDepartments([]);
        return;
      }

      let visibleDepartments = data || [];
      if (isDepartmentHead && userDeptId) {
        visibleDepartments = visibleDepartments.filter(d => Number(d.id) === Number(userDeptId));
      } else if (isPrajaOfficer) {
        visibleDepartments = visibleDepartments.filter(isPrajaDepartment);
      }

      setAllDepartments(visibleDepartments);
    } catch (err) {
      console.error(err);
      setAllDepartments([]);
    }
  };

  const filtered = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return complaints.filter((c) => {
      if (isDepartmentHead && userDeptId) {
        if (Number(c.department_id) !== Number(userDeptId)) {
          return false;
        }
      }

      const roleMatch = !isPrajaOfficer || isPrajaDepartment(c.departments);
      
      const cStatus = String(c.status || '').toLowerCase().trim();
      let matchStatus = true;
      if (filter !== 'all') {
        matchStatus = cStatus === filter;
      }
      
      const deptName = getLocalizedDepartmentName(c.departments);
      const origDeptName = c.departments?.department_name || '';

      const matchDept =
        isDepartmentHead ||
        deptFilter === 'all' ||
        String(c.department_id) === String(deptFilter) ||
        origDeptName.toLowerCase() === deptFilter.toLowerCase();

      const titleText = getLocalizedText(c, 'title');
      const descText = getLocalizedText(c, 'description');

      const matchSearch =
        !keyword ||
        titleText.toLowerCase().includes(keyword) ||
        descText.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        origDeptName.toLowerCase().includes(keyword) ||
        cStatus.includes(keyword);

      return roleMatch && matchStatus && matchDept && matchSearch;
    });
  }, [complaints, filter, deptFilter, searchTerm, isPrajaOfficer, isDepartmentHead, userDeptId, activeLanguage]);

  const stats = useMemo(() => {
    const list = isDepartmentHead && userDeptId 
      ? complaints.filter(c => Number(c.department_id) === Number(userDeptId))
      : complaints;

    return {
      total: list.length,
      open: list.filter((c) => String(c.status).toLowerCase() === 'open').length,
      inProgress: list.filter((c) => String(c.status).toLowerCase() === 'in progress').length,
      resolved: list.filter((c) => String(c.status).toLowerCase() === 'resolved').length,
      closed: list.filter((c) => String(c.status).toLowerCase() === 'closed').length
    };
  }, [complaints, isDepartmentHead, userDeptId]);

  const canDepartmentHeadAction = isDepartmentHead && selected?.current_stage === 'department_head';
  const canCcOfficerAction = isCcOfficer && selected?.current_stage === 'cc_officer';
  const canSecretaryAction = isSecretary && selected?.current_stage === 'secretary';
  const canChairmanAction = isChairman && selected?.current_stage === 'chairman';

  const updateComplaint = async (status, forward_to = null) => {
    if (!selected) return;

    const complaintId = selected.id;
    if (!complaintId) {
      toast.error('Complaint ID not found!');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/complaints/status/${complaintId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status,
          remark: note,
          forward_to
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

  const getTabLabel = (f) => {
    if (f === 'all') return isSinhala ? 'සියල්ල' : 'All';
    if (f === 'open') return isSinhala ? 'විවෘත' : 'Open';
    if (f === 'in progress') return isSinhala ? 'ක්‍රියාත්මක වෙමින් පවතී' : 'In Progress';
    if (f === 'resolved') return isSinhala ? 'විසඳන ලදී' : 'Resolved';
    if (f === 'closed') return isSinhala ? 'වසා ඇත' : 'Closed';
    return f;
  };

  const getSignatureForRole = (roleName) => {
    const foundReply = replies.find(r => {
      const rRole = String(r.users?.roles?.role_name || '').toLowerCase();
      return rRole.includes(roleName.toLowerCase()) && r.users?.signature_url;
    });
    return foundReply?.users?.signature_url || null;
  };

  return (
    <Layout>
      <PageHero icon="alert" title={t('complaints')} subtitle={t('notifications_subtitle') || 'Manage and review system complaints'} />

      <div className="pro-grid stats-grid">
        <StatCard icon="alert" label={isSinhala ? 'සම්පූර්ණ පැමිණිලි' : 'Total Complaints'} value={stats.total} />
        <StatCard icon="alert" label={isSinhala ? 'විවෘත' : 'Open'} value={stats.open} />
        <StatCard icon="clipboard" label={isSinhala ? 'ක්‍රියාත්මක වෙමින් පවතී' : 'In Progress'} value={stats.inProgress} />
        <StatCard icon="check" label={isSinhala ? 'විසඳන ලදී' : 'Resolved'} value={stats.resolved} />
        <StatCard icon="report" label={isSinhala ? 'වසා ඇත' : 'Closed'} value={stats.closed} />
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

          {!isDepartmentHead && (
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
          )}
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
            {filtered.length} {t('records') || 'records'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="alert"
            title={t('no_complaints') || 'No complaints found'}
            text={t('there_is_nothing_to_display_yet') || 'There is nothing to display yet.'}
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
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelected(c);
                      setNote('');
                    }}
                    type="button"
                    style={{ cursor: 'pointer' }}
                  >
                    <AppIcon name="search" size={16} />
                    <span>{tr('complaint_details', 'Review Details')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#ffffff', color: '#1e293b', maxWidth: '850px', width: '95vw', padding: '32px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ textAlign: 'center', borderBottom: '2px solid #8B0000', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#8B0000', fontWeight: 800, textTransform: 'uppercase' }}>
                {tr('pradeshiya_sabha_official_letter', 'වැලිවිටිය දිවිතුර ප්‍රාදේශීය සභාව - නිල පැමිණිලි වාර්තාව හා ලිපිය')}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {tr('official_governance_document', 'Official Administrative Correspondence & Escalation Sheet')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><b>{tr('complaint_id', 'Complaint ID')}:</b> #{selected.id}</div>
              <div><b>{tr('complaint_date', 'Complaint Date')}:</b> {selected.created_at ? formatSriLankaDateTime(selected.created_at) : '-'}</div>
              <div><b>{tr('user', 'Complainant')}:</b> {selected.users?.full_name || '-'}</div>
              <div><b>{tr('department', 'Department')}:</b> {getLocalizedDepartmentName(selected.departments)}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <b>{tr('status', 'Status')}:</b> <span style={{ color: '#8B0000', fontWeight: 700 }}>{getLocalizedStatus(selected.status)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', textDecoration: 'underline' }}>
                विषය / Subject: {getLocalizedText(selected, 'title')}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '12px', borderLeft: '4px solid #8B0000' }}>
                {getLocalizedText(selected, 'description')}
              </div>
            </div>

            {selected.attachment_url && (
              <div style={{ marginBottom: '20px' }}>
                <a
                  href={selected.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-soft"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '13px' }}
                >
                  <AppIcon name="search" size={15} />
                  <span>{t('open_attachment') || 'View Attachment Document'}</span>
                </a>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a' }}>
                {tr('official_remarks_and_approvals', 'නිල සටහන් හා අනුමත කිරීම් (Audit Trail)')}
              </h4>
              
              {replies.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>{tr('no_remarks_yet', 'No remarks or progression notes recorded yet.')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {replies.map((rep, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                        {rep.users?.full_name || 'Officer'} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>({rep.users?.roles?.role_name || 'Staff'})</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{rep.reply_message}</div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px' }}>{formatSriLankaDateTime(rep.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', color: '#0f172a', marginBottom: '14px' }}>
                {tr('official_signatures', 'නිල අත්සන් (Official Signatures)')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                
                {(selected.current_stage === 'department_head' || replies.some(r => r.users?.roles?.role_name === 'Department Head') || getSignatureForRole('Department Head')) && (
                  <SignatureCard 
                    title={tr('department_head', 'Department Head')} 
                    positionKey="Department Head" 
                    image={getSignatureForRole('Department Head')} 
                    lang={activeLanguage} 
                    t={t} 
                  />
                )}

                {(selected.current_stage === 'cc_officer' || selected.current_stage === 'secretary' || selected.current_stage === 'chairman' || getSignatureForRole('CC Officer')) && (
                  <SignatureCard 
                    title={tr('cc_officer', 'CC Officer')} 
                    positionKey="cc_officer" 
                    image={getSignatureForRole('CC Officer')} 
                    lang={activeLanguage} 
                    t={t} 
                  />
                )}

                {(selected.current_stage === 'secretary' || selected.current_stage === 'chairman' || getSignatureForRole('Secretary')) && (
                  <SignatureCard 
                    title={tr('secretary', 'Secretary')} 
                    positionKey="secretary" 
                    image={getSignatureForRole('Secretary')} 
                    lang={activeLanguage} 
                    t={t} 
                  />
                )}

                {(selected.current_stage === 'chairman' || getSignatureForRole('Chairman')) && (
                  <SignatureCard 
                    title={tr('chairman', 'Chairman')} 
                    positionKey="chairman" 
                    image={getSignatureForRole('Chairman')} 
                    lang={activeLanguage} 
                    t={t} 
                  />
                )}

              </div>
            </div>

            <div className="field" style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text)', fontWeight: 600, fontSize: '13px' }}>{tr('remarks', 'Add Official Remark / Note')}</label>
              <textarea
                className="textarea"
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={tr('enter_remarks', 'Type your official remark here before proceeding...')}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  width: '100%',
                  padding: '10px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              
              <button className="btn btn-soft" onClick={() => setSelected(null)} type="button">
                {tr('close', 'Close')}
              </button>

              {canDepartmentHeadAction && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateComplaint('Resolved')}
                    type="button"
                    style={{ backgroundColor: '#16a34a', border: 'none' }}
                  >
                    {tr('mark_resolved', 'විසඳන ලදී (Resolve Here)')}
                  </button>
                  <button
                    className="btn btn-soft"
                    onClick={() => updateComplaint('In Progress', 'cc_officer')}
                    type="button"
                    style={{ borderColor: '#8B0000', color: '#8B0000' }}
                  >
                    {tr('forward_to_cc', 'සම්බන්ධීකරණ නිලධාරී (CC) වෙත යොමු කරන්න')}
                  </button>
                </>
              )}

              {canCcOfficerAction && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateComplaint('Resolved')}
                    type="button"
                    style={{ backgroundColor: '#16a34a', border: 'none' }}
                  >
                    {tr('mark_resolved', 'විසඳන ලදී')}
                  </button>
                  <button
                    className="btn btn-soft"
                    onClick={() => updateComplaint('In Progress', 'secretary')}
                    type="button"
                    style={{ borderColor: '#8B0000', color: '#8B0000' }}
                  >
                    {tr('forward_to_secretary', 'ලේකම් වෙත යොමු කරන්න')}
                  </button>
                </>
              )}

              {canSecretaryAction && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateComplaint('Resolved')}
                    type="button"
                    style={{ backgroundColor: '#16a34a', border: 'none' }}
                  >
                    {tr('mark_resolved', 'විසඳන ලදී')}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateComplaint('In Progress', 'chairman')}
                    type="button"
                    style={{ backgroundColor: '#dc2626', border: 'none' }}
                  >
                    {tr('forward_to_chairman', 'සභාපති වෙත යොමු කරන්න')}
                  </button>
                </>
              )}

              {canChairmanAction && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateComplaint('Resolved')}
                  type="button"
                  style={{ backgroundColor: '#16a34a', border: 'none' }}
                >
                  {tr('mark_resolved', 'අවසාන විසඳුම ලබා දෙන්න (Resolve)')}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}

export default Complaints;