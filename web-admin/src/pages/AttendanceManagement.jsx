import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

function AttendanceManagement() {
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadDepartments();
    loadStaff();
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, departmentFilter]);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadDepartments = async () => {
    let query = supabase.from('departments').select('*').order('department_name');

    if (role === 'Praja Officer') {
      query = query.in('department_type', ['Library', 'Preschool']);
    }

    const { data, error } = await query;

    if (error) {
      showError(error.message);
      return;
    }

    setDepartments(data || []);
  };

  const loadStaff = async () => {
    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        department_id,
        departments(
          department_name,
          department_type
        )
      `)
      .eq('is_active', true)
      .order('full_name');

    if (departmentFilter !== 'all') {
      query = query.eq('department_id', departmentFilter);
    }

    const { data, error } = await query;

    if (error) {
      showError(error.message);
      setStaff([]);
      return;
    }

    let filteredStaff = data || [];

    if (role === 'Praja Officer') {
      filteredStaff = filteredStaff.filter((item) =>
        ['Library', 'Preschool'].includes(item.departments?.department_type)
      );
    }

    setStaff(filteredStaff);
  };

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate);

    if (error) {
      showError(error.message);
      setAttendance({});
      setLoading(false);
      return;
    }

    const attendanceMap = {};
    (data || []).forEach((record) => {
      attendanceMap[record.user_id] = record;
    });

    setAttendance(attendanceMap);
    setLoading(false);
  };

  const updateAttendance = (userId, field, value) => {
    setAttendance((prev) => {
      const updatedRecord = {
        ...prev[userId],
        user_id: userId,
        date: selectedDate,
        [field]: value
      };

      if (field === 'check_in') {
        if (!value) {
          updatedRecord.status = 'Absent';
        } else {
          const [hours, minutes] = value.split(':').map(Number);
          updatedRecord.status = hours > 8 || (hours === 8 && minutes > 0) ? 'Late' : 'Present';
        }
      }

      return {
        ...prev,
        [userId]: updatedRecord
      };
    });
  };

  const saveAttendance = async () => {
    setSaving(true);

    try {
      for (const [userId, record] of Object.entries(attendance)) {
        if (record.status || record.check_in || record.check_out || record.remarks) {
          const { error } = await supabase.from('attendance').upsert([
            {
              user_id: Number(userId),
              date: selectedDate,
              check_in: record.check_in || null,
              check_out: record.check_out || null,
              status: record.status || 'Absent',
              remarks: record.remarks || '',
              is_auto_marked: false
            }
          ]);

          if (error) {
            showError(error.message);
            setSaving(false);
            return;
          }
        }
      }

      showSuccess(t('attendance_saved_successfully') || 'Attendance saved successfully');
      loadAttendance();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return staff.filter((member) => {
      const deptName = member.departments?.department_name || '';

      return (
        !keyword ||
        member.full_name?.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword)
      );
    });
  }, [staff, searchTerm]);

  const attendanceSummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let onLeave = 0;

    staff.forEach((member) => {
      const status = attendance[member.id]?.status;

      if (status === 'Present') present += 1;
      else if (status === 'Absent') absent += 1;
      else if (status === 'Late') late += 1;
      else if (status === 'On Leave') onLeave += 1;
    });

    const total = staff.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, absent, late, onLeave, total, rate };
  }, [staff, attendance]);

  const getStatusBadgeStyle = (status) => {
    if (status === 'Present') return { bg: '#dcfce7', color: '#16a34a' };
    if (status === 'Absent') return { bg: '#fee2e2', color: '#dc2626' };
    if (status === 'Late') return { bg: '#ffedd5', color: '#f97316' };
    if (status === 'On Leave') return { bg: '#dbeafe', color: '#2563eb' };
    return { bg: '#f1f5f9', color: '#64748b' };
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>{t('loading') || 'Loading...'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconBox}>
                <AppIcon name="check" size={24} />
              </span>
              {t('staff_attendance') || 'Staff Attendance'}
            </h1>
            <p style={styles.breadcrumb}>
              {t('dashboard')} / {t('attendance')}
            </p>
          </div>
        </div>

        <div style={styles.summarySection}>
          <SummaryCard icon="check" label={t('present') || 'Present'} value={attendanceSummary.present} bg="#dcfce7" color="#16a34a" />
          <SummaryCard icon="alert" label={t('absent') || 'Absent'} value={attendanceSummary.absent} bg="#fee2e2" color="#dc2626" />
          <SummaryCard icon="calendar" label={t('late') || 'Late'} value={attendanceSummary.late} bg="#ffedd5" color="#f97316" />
          <SummaryCard icon="clipboard" label={t('on_leave') || 'On Leave'} value={attendanceSummary.onLeave} bg="#dbeafe" color="#2563eb" />
          <SummaryCard icon="report" label={tr('attendance_rate', 'Attendance Rate')} value={`${attendanceSummary.rate}%`} bg="#f3e8ff" color="#9333ea" />
        </div>

        <div style={styles.controlsCard}>
          <div style={styles.controlsGrid}>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>
                <AppIcon name="calendar" size={16} />
                {t('select_date') || 'Select Date'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>
                <AppIcon name="building" size={16} />
                {t('department_filter') || 'Department Filter'}
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={styles.select}
              >
                {role !== 'Praja Officer' && (
                  <option value="all">{t('all_departments') || 'All Departments'}</option>
                )}

                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {tr(getTranslationKey(dept.department_name), dept.department_name)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>
                <AppIcon name="search" size={16} />
                {tr('search_staff', 'Search Staff')}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tr('search_staff', 'Search Staff')}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>&nbsp;</label>
              <button
                onClick={saveAttendance}
                disabled={saving}
                style={{
                  ...styles.primaryBtn,
                  opacity: saving ? 0.75 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? (
                  t('loading') || 'Loading...'
                ) : (
                  <>
                    <AppIcon name="check" size={17} />
                    {t('save_all_attendance') || 'Save All Attendance'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                {t('staff_attendance') || 'Staff Attendance'} - {new Date(selectedDate).toLocaleDateString('en-GB')}
              </h2>
              <p style={styles.cardSubtitle}>
                {filteredStaff.length} {t('staff_members') || 'Staff Members'}
              </p>
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div style={styles.emptyState}>
              <AppIcon name="check" size={38} />
              <h3>{tr('no_attendance_records', 'No attendance records found')}</h3>
              <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>{t('full_name') || 'Full Name'}</th>
                    <th style={styles.th}>{t('department') || 'Department'}</th>
                    <th style={styles.th}>{t('sign_in') !== 'sign_in' ? t('sign_in') : 'Sign In'}</th>
                    <th style={styles.th}>{t('sign_out') !== 'sign_out' ? t('sign_out') : 'Sign Out'}</th>
                    <th style={styles.th}>{t('status') || 'Status'}</th>
                    <th style={styles.th}>{tr('status_preview', 'Status Preview')}</th>
                    <th style={styles.th}>{t('remarks') || 'Remarks'}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStaff.map((member) => {
                    const record = attendance[member.id] || {};
                    const statusStyle = getStatusBadgeStyle(record.status);

                    return (
                      <tr key={member.id} style={styles.tr}>
                        <td style={styles.td}>
                          <strong style={styles.staffName}>{member.full_name}</strong>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.deptBadge}>
                            {tr(getTranslationKey(member.departments?.department_name), member.departments?.department_name || '-')}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <input
                            type="time"
                            value={record.check_in || ''}
                            onChange={(e) => updateAttendance(member.id, 'check_in', e.target.value)}
                            style={styles.timeInput}
                          />
                        </td>

                        <td style={styles.td}>
                          <input
                            type="time"
                            value={record.check_out || ''}
                            onChange={(e) => updateAttendance(member.id, 'check_out', e.target.value)}
                            style={styles.timeInput}
                          />
                        </td>

                        <td style={styles.td}>
                          <select
                            value={record.status || ''}
                            onChange={(e) => updateAttendance(member.id, 'status', e.target.value)}
                            style={styles.statusSelect}
                          >
                            <option value="">{t('select') || 'Select'}</option>
                            <option value="Present">{t('present') || 'Present'}</option>
                            <option value="Absent">{t('absent') || 'Absent'}</option>
                            <option value="Late">{t('late') || 'Late'}</option>
                            <option value="On Leave">{t('on_leave') || 'On Leave'}</option>
                          </select>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color
                            }}
                          >
                            {record.status ? tr(getTranslationKey(record.status), record.status) : tr('not_marked', 'Not Marked')}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <input
                            type="text"
                            placeholder={t('remarks') || 'Remarks...'}
                            value={record.remarks || ''}
                            onChange={(e) => updateAttendance(member.id, 'remarks', e.target.value)}
                            style={styles.remarksInput}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({ icon, label, value, bg, color }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, backgroundColor: bg, color }}>
        <AppIcon name={icon} size={22} />
      </div>
      <div>
        <div style={styles.summaryValue}>{value}</div>
        <div style={styles.summaryLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
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
  breadcrumb: { fontSize: 14, color: 'var(--muted)', margin: 0 },
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 16,
    marginBottom: 24,
    padding: '0 24px'
  },
  summaryCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 18,
    borderRadius: 12,
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  summaryValue: { fontSize: 24, fontWeight: 800, color: 'var(--text)' },
  summaryLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 3 },
  controlsCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    marginLeft: 24,
    marginRight: 24,
    border: '1px solid var(--border)'
  },
  controlsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 },
  controlGroup: { display: 'flex', flexDirection: 'column' },
  controlLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  dateInput: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    backgroundColor: 'var(--bg-primary)'
  },
  searchInput: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    backgroundColor: 'var(--bg-primary)'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    color: 'var(--text)',
    backgroundColor: 'var(--bg-primary)',
    cursor: 'pointer'
  },
  statusSelect: {
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    width: 140,
    fontSize: 13,
    cursor: 'pointer',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text)'
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  contentCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 12,
    margin: '0 24px',
    border: '1px solid var(--border)'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  cardSubtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' },
  emptyState: {
    padding: 54,
    textAlign: 'center',
    color: 'var(--muted)'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    borderBottom: '2px solid var(--border)'
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '16px', fontSize: 14, color: 'var(--muted)' },
  staffName: { color: 'var(--text)', fontSize: 14 },
  deptBadge: {
    padding: '4px 10px',
    backgroundColor: 'var(--gray-100)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--text)'
  },
  timeInput: {
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    width: 110,
    fontSize: 13,
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text)'
  },
  remarksInput: {
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    width: 180,
    fontSize: 13,
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text)'
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-block',
    whiteSpace: 'nowrap'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--muted)'
  }
};

export default AttendanceManagement;