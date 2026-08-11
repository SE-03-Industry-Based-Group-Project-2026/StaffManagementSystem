import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { showSuccess, showError } from '../services/toastService';
import '../styles/pro-admin.css';
import { formatSriLankaDateTime } from '../utils/dateTime';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function ProfileRequests() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const activeLanguage = String(language || 'en').toLowerCase();
  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [modalDesignationsList, setModalDesignationsList] = useState([]);

  const admin = JSON.parse(localStorage.getItem('user') || '{}');

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('supabase_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadRequests(), loadDepartments(), loadDesignations()]);
    setLoading(false);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('profile_change_requests')
      .select(`
        *,
        requester:users!profile_change_requests_user_id_fkey(
          id,
          full_name,
          email,
          department_id,
          designation_id,
          departments(department_name, department_name_si, department_name_ta),
          designations(designation_en, designation_si, designation_ta)
        ),
        approver:users!profile_change_requests_approved_by_fkey(full_name, email)
      `)
      .order('requested_at', { ascending: false });

    if (error) showError(error.message);
    setRequests(data || []);
  };

  useEffect(() => {
    const openId = location.state?.openId;

    if (!openId) {
      return;
    }

    const openRequestFromNotification = async () => {
      const { data, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          requester:users!profile_change_requests_user_id_fkey(
            id,
            full_name,
            email,
            department_id,
            designation_id,
            departments(department_name, department_name_si, department_name_ta),
            designations(designation_en, designation_si, designation_ta)
          ),
          approver:users!profile_change_requests_approved_by_fkey(full_name, email)
        `)
        .eq('id', openId)
        .single();

      if (error || !data) {
        return;
      }

      setStatusFilter('all');
      setDeptFilter('all');
      setSearchTerm('');
      openApproveModal(data);

      navigate('/profile-requests', {
        replace: true,
        state: {}
      });
    };

    openRequestFromNotification();
  }, [location.state?.openId, navigate]);

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    setDepartments(data || []);
  };

  const loadDesignations = async () => {
    const { data } = await supabase.from('designations').select('*').order('designation_en');
    setDesignations(data || []);
  };

  const loadModalDesignations = async (deptId) => {
    if (!deptId) {
      setModalDesignationsList([]);
      return;
    }
    const { data } = await supabase
      .from('designations')
      .select('*')
      .eq('department_id', deptId)
      .order('designation_en');
    setModalDesignationsList(data || []);
  };

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return requests.filter((req) => {
      const matchSearch =
        !keyword ||
        req.requester?.full_name?.toLowerCase().includes(keyword) ||
        req.requester?.email?.toLowerCase().includes(keyword) ||
        String(req.new_value)?.toLowerCase().includes(keyword) ||
        req.status?.toLowerCase().includes(keyword);

      const matchStatus = statusFilter === 'all' || String(req.status || '').toLowerCase() === String(statusFilter).toLowerCase();
      
      let reqDeptId = req.requester?.department_id;
      if (!reqDeptId && req.new_value) {
        try {
          const parsed = typeof req.new_value === 'string' ? JSON.parse(req.new_value) : req.new_value;
          if (parsed?.department_id) reqDeptId = parsed.department_id;
        } catch (e) {}
      }

      const matchDept = deptFilter === 'all' || String(reqDeptId) === String(deptFilter);

      return matchSearch && matchStatus && matchDept;
    });
  }, [requests, searchTerm, statusFilter, deptFilter]);

  const openApproveModal = (req) => {
    setSelectedRequest(req);
    let initialVals = {};

    let parsedNewValue = req.new_value;
    if (typeof parsedNewValue === 'string' && (parsedNewValue.startsWith('{') || parsedNewValue.startsWith('['))) {
      try {
        parsedNewValue = JSON.parse(parsedNewValue);
      } catch (e) {}
    }

    if (typeof parsedNewValue === 'object' && parsedNewValue !== null) {
      initialVals = { ...parsedNewValue };
    } else {
      initialVals = { [req.field_name]: req.new_value };
    }

    setEditValues(initialVals);

    if (initialVals.department_id) {
      loadModalDesignations(initialVals.department_id);
    } else {
      setModalDesignationsList(designations);
    }

    setShowApproveModal(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest) return;

    if (!editValues.department_id) {
      showError(
        isSinhala
          ? 'කරුණාකර දෙපාර්තමේන්තුව තෝරන්න.'
          : isTamil
            ? 'தயவுசெய்து திணைக்களத்தைத் தேர்ந்தெடுக்கவும்.'
            : 'Please select a department.'
      );
      return;
    }

    if (!editValues.designation_id) {
      showError(
        isSinhala
          ? 'කරුණාකර තනතුර තෝරන්න.'
          : isTamil
            ? 'தயவுசெய்து பதவியைத் தேர்ந்தெடுக்கவும்.'
            : 'Please select a designation.'
      );
      return;
    }

    const selectedDesignation = designations.find(
      (d) => String(d.id) === String(editValues.designation_id)
    );

    if (
      selectedDesignation?.department_id &&
      String(selectedDesignation.department_id) !== String(editValues.department_id)
    ) {
      showError(
        isSinhala
          ? 'තෝරාගත් තනතුර තෝරාගත් දෙපාර්තමේන්තුවට අදාළ නොවේ.'
          : isTamil
            ? 'தேர்ந்தெடுக்கப்பட்ட பதவி, தேர்ந்தெடுக்கப்பட்ட திணைக்களத்துடன் பொருந்தவில்லை.'
            : 'The selected designation does not belong to the selected department.'
      );
      return;
    }

    try {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(editValues)
        .eq('id', selectedRequest.user_id);

      if (userUpdateError) {
        showError(userUpdateError.message);
        return;
      }

      const { error } = await supabase
        .from('profile_change_requests')
        .update({
          status: 'Approved',
          new_value: JSON.stringify(editValues),
          approved_by: admin.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) {
        showError(error.message);
        return;
      }

      const headers = await getAuthHeaders();
      const fieldName = selectedRequest.field_name || 'Profile details';
      const approvedBy = admin.full_name || 'Admin';

      await fetch(`${API_BASE}/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: selectedRequest.user_id,
          notification_key: 'profile_request_approved',
          title: 'Profile Request Approved',
          message: `Your profile update request for "${fieldName}" has been approved by ${approvedBy}.`,
          payload: {
            field_name: fieldName,
            approved_by: approvedBy
          },
          notification_type: 'Profile',
          related_entity: 'profile_request',
          related_id: selectedRequest.id
        })
      });

      await supabase.from('audit_logs').insert({
        user_id: admin.id,
        action: 'APPROVE_PROFILE_REQUEST',
        entity_type: 'profile_change_requests',
        entity_id: selectedRequest.id
      });

      showSuccess(t('profile_request_approved_toast') || 'Profile request approved successfully');
      setShowApproveModal(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err) {
      showError(err.message || 'Approval failed');
    }
  };

  const rejectRequest = async (req) => {
    try {
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

      const headers = await getAuthHeaders();
      const fieldName = req.field_name || 'Profile details';
      const rejectedBy = admin.full_name || 'Admin';

      await fetch(`${API_BASE}/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: req.user_id,
          notification_key: 'profile_request_rejected',
          title: 'Profile Request Rejected',
          message: `Your profile update request for "${fieldName}" has been rejected by ${rejectedBy}.`,
          payload: {
            field_name: fieldName,
            rejected_by: rejectedBy
          },
          notification_type: 'Profile',
          related_entity: 'profile_request',
          related_id: req.id
        })
      });

      await supabase.from('audit_logs').insert({
        user_id: admin.id,
        action: 'REJECT_PROFILE_REQUEST',
        entity_type: 'profile_change_requests',
        entity_id: req.id
      });

      showSuccess(t('profile_request_rejected_toast') || 'Profile request rejected');
      loadRequests();
    } catch (err) {
      showError(err.message || 'Rejection failed');
    }
  };

  const badgeClass = (status) => {
    const cleanStatus = String(status || '').toLowerCase();
    if (cleanStatus === 'approved') return 'badge badge-success';
    if (cleanStatus === 'rejected') return 'badge badge-danger';
    return 'badge badge-warning';
  };

  const getStatusText = (status) => {
    const cleanStatus = String(status || '').toLowerCase();
    if (cleanStatus === 'approved') return t('approved');
    if (cleanStatus === 'rejected') return t('rejected');
    return t('pending');
  };

  const formatFieldValue = (val) => {
    if (!val) return '-';
    let parsedVal = val;
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        parsedVal = JSON.parse(val);
      } catch (e) {}
    }

    if (typeof parsedVal === 'object' && parsedVal !== null) {
      return Object.entries(parsedVal).map(([k, v]) => {
        let label = k;
        let formattedV = v;
        if (k === 'department_id') {
          label = isSinhala ? 'දෙපාර්තමේන්තුව' : isTamil ? 'திணைக்களம்' : 'Department';
          const dept = departments.find(d => String(d.id) === String(v));
          if (dept) formattedV = isSinhala ? (dept.department_name_si || dept.department_name) : dept.department_name;
        } else if (k === 'designation_id') {
          label = isSinhala ? 'තනතුර' : isTamil ? 'पदவி' : 'Designation';
          const des = designations.find(d => String(d.id) === String(v));
          if (des) formattedV = isSinhala ? (des.designation_si || des.designation_en) : des.designation_en;
        }
        return <div key={k}><strong>{label}:</strong> {String(formattedV)}</div>;
      });
    }

    return String(parsedVal);
  };

if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>
          <div style={styles.loadingBox}>
            <div className="spinner-icon" />
            <div>{t('loading') || 'Loading...'}</div>
          </div>
        </div>
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
        <div className="stat-card" style={styles.statCard} onClick={() => setStatusFilter('Pending')} role="button">
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>{t('pending')}</div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => String(r.status || '').toLowerCase() === 'pending').length}
            </div>
          </div>
          <AppIcon name="bell" size={34} />
        </div>

        <div className="stat-card" style={styles.statCard} onClick={() => setStatusFilter('Approved')} role="button">
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>{t('approved')}</div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => String(r.status || '').toLowerCase() === 'approved').length}
            </div>
          </div>
          <AppIcon name="check" size={34} />
        </div>

        <div className="stat-card" style={styles.statCard} onClick={() => setStatusFilter('Rejected')} role="button">
          <div>
            <div className="stat-label" style={{ color: 'var(--muted)' }}>{t('rejected')}</div>
            <div className="stat-value" style={{ color: 'var(--text)' }}>
              {requests.filter((r) => String(r.status || '').toLowerCase() === 'rejected').length}
            </div>
          </div>
          <AppIcon name="x" size={34} />
        </div>
      </div>

      <div className="pro-card" style={styles.card}>
        <div className="card-head" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ color: 'var(--text)', margin: 0 }}>{t('profile_change_requests')}</h3>
            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 13 }}>
              {tr('review_profile_requests', 'Review department, designation and profile update requests')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">{isSinhala ? 'සියලුම දෙපාර්තමේන්තු' : isTamil ? 'அனைத்து திணைக்களங்களும்' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {isSinhala ? (d.department_name_si || d.department_name) : isTamil ? (d.department_name_ta || d.department_name) : d.department_name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">{isSinhala ? 'සියලුම තත්ත්වයන්' : isTamil ? 'அனைத்து நிலைகளும்' : 'All Statuses'}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Approved">{t('approved')}</option>
              <option value="Rejected">{t('rejected')}</option>
            </select>

            <span className="badge badge-neutral">
              {filteredRequests.length} {t('records')}
            </span>
          </div>
        </div>

        <div style={styles.searchWrap}>
          <AppIcon name="search" size={16} />
          <input
            className="input"
            placeholder={tr('search_profile_requests', 'Search profile requests by name or field')}
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
                  <td colSpan="6" style={styles.emptyCell}>
                    {tr('no_profile_requests', 'No profile requests found')}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = String(req.status || '').toLowerCase() === 'pending';
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td>
                        <strong>{req.requester?.full_name || '-'}</strong>
                        <br />
                        <small style={{ color: 'var(--muted)' }}>
                          {req.requester?.email || '-'}
                        </small>
                      </td>

                      <td>{formatFieldValue(req.old_value)}</td>
                      <td>{formatFieldValue(req.new_value)}</td>

                      <td>
                        <span className={badgeClass(req.status)}>
                          {getStatusText(req.status)}
                        </span>
                      </td>

                      <td>
                        {req.requested_at
                          ? formatSriLankaDateTime(req.requested_at)
                          : '-'}
                      </td>

                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => openApproveModal(req)}
                              type="button"
                              style={{ padding: '6px 14px', fontSize: '13px' }}
                            >
                              <AppIcon name="check" size={15} />
                              {t('approve')}
                            </button>

                            <button
                              className="btn btn-danger"
                              onClick={() => rejectRequest(req)}
                              type="button"
                              style={{ padding: '6px 14px', fontSize: '13px' }}
                            >
                              <AppIcon name="x" size={15} />
                              {t('reject')}
                            </button>
                          </div>
                        ) : (
                          <span className={badgeClass(req.status)}>
                            {getStatusText(req.status)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVE & EDIT MODAL */}
      {showApproveModal && (
        <div className="modal-backdrop" onClick={() => setShowApproveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '500px', maxWidth: '95vw', borderRadius: '16px', padding: '24px', backgroundColor: 'var(--card)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{isSinhala ? 'තොරතුරු පරීක්ෂා කර අනුමත කරන්න' : 'Review & Approve Request'}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
              {isSinhala ? 'අවශ්‍ය නම් මෙහිදී දෙපාර්තමේන්තුව හෝ තනතුර වෙනස් කර අනුමත කළ හැක.' : 'You can modify the department or designation before approving if necessary.'}
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Department Dropdown */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  {isSinhala ? 'දෙපාර්තමේන්තුව' : isTamil ? 'திணைக்களம்' : 'Department'}
                </label>
                <select
                  className="select"
                  value={editValues.department_id || ''}
                  onChange={(e) => {
                    const newDeptId = e.target.value;
                    setEditValues({ ...editValues, department_id: newDeptId, designation_id: '' });
                    loadModalDesignations(newDeptId);
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text)' }}
                >
                  <option value="">{isSinhala ? '-- දෙපාර්තමේන්තුවක් තෝරන්න --' : 'Select Department'}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isSinhala ? (d.department_name_si || d.department_name) : d.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation Dropdown */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  {isSinhala ? 'තනතුර' : isTamil ? 'पदவி' : 'Designation'}
                </label>
                <select
                  className="select"
                  value={editValues.designation_id || ''}
                  onChange={(e) => setEditValues({ ...editValues, designation_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text)' }}
                >
                  <option value="">{isSinhala ? '-- තනතුරක් තෝරන්න --' : 'Select Designation'}</option>
                  {(modalDesignationsList.length > 0 ? modalDesignationsList : designations).map((des) => (
                    <option key={des.id} value={des.id}>
                      {isSinhala ? (des.designation_si || des.designation_en) : des.designation_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setShowApproveModal(false)}
                style={{ padding: '8px 16px' }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApproveSubmit}
                style={{ padding: '8px 20px' }}
              >
                {t('approve')}
              </button>
            </div>
          </div>
        </div>
      )}
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
    borderRadius: '12px',
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
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
  },
  emptyCell: {
    textAlign: 'center',
    padding: 32,
    color: 'var(--muted)'
  }
  ,
  loading: {
    display: 'flex',
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    height: '75vh', 
    width: '100%',
    backgroundColor: 'transparent'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center',
    gap: 12,
    color: 'var(--muted)',
    fontSize: 14,
    fontWeight: 600
  }
};

export default ProfileRequests;