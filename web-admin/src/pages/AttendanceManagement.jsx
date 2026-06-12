import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess } from '../services/toastService';

function AttendanceManagement() {
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadDepartments();
    loadStaff();
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, departmentFilter]);

  const loadDepartments = async () => {
    let query = supabase.from('departments').select('*');

    if (role === 'Praja Officer') {
      query = query.in('department_type', ['Library', 'Preschool']);
    }

    const { data } = await query;
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
      .eq('is_active', true);

    if (departmentFilter !== 'all') {
      query = query.eq('department_id', departmentFilter);
    }

    const { data } = await query;
    let filteredStaff = data || [];

    if (role === 'Praja Officer') {
      filteredStaff = filteredStaff.filter((item) =>
        ['Library', 'Preschool'].includes(item.departments?.department_type)
      );
    }

    setStaff(filteredStaff);
  };

  const loadAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', selectedDate);

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

      // 🔴 Sign In වෙලාව වෙනස් කරන විට ස්වයංක්‍රීයව Status එක වෙනස් කිරීම
      if (field === 'check_in') {
        if (!value) {
          updatedRecord.status = 'Absent';
        } else {
          // 08:00 ට පසුව පැමිණියහොත් Late ලෙසත්, නැතහොත් Present ලෙසත් සලකුණු කරයි
          const [hours, minutes] = value.split(':').map(Number);
          if (hours > 8 || (hours === 8 && minutes > 0)) {
            updatedRecord.status = 'Late';
          } else {
            updatedRecord.status = 'Present';
          }
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

    for (const [userId, record] of Object.entries(attendance)) {
      if (record.status || record.check_in || record.check_out) {
        await supabase.from('attendance').upsert([
          {
            user_id: userId,
            date: selectedDate,
            check_in: record.check_in || null,
            check_out: record.check_out || null,
            status: record.status || 'Absent',
            remarks: record.remarks || '',
            is_auto_marked: false
          }
        ]);
      }
    }

    setSaving(false);
    showSuccess(t('attendance_saved_successfully') || 'Attendance saved successfully');
    loadAttendance();
  };

  const getTranslationKey = (name) => {
   if (!name) return '';
   return name
     .toLowerCase()
     .trim()
     .replace(/&/g, 'and')
     .replace(/\s+/g, '_');
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
                    {t(getTranslationKey(dept.department_name)) || dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>&nbsp;</label>
              <button
                onClick={saveAttendance}
                disabled={saving}
                style={styles.primaryBtn}
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
            <h2 style={styles.cardTitle}>
              {t('staff_attendance') || 'Staff Attendance'} -{' '}
              {new Date(selectedDate).toLocaleDateString('en-GB')}
            </h2>

            <span style={styles.staffCount}>
              {staff.length} {t('staff_members') || 'Staff Members'}
            </span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>{t('full_name') || 'Full Name'}</th>
                  <th style={styles.th}>{t('department') || 'Department'}</th>
                  
                  {/* 🔴 Sign In & Sign Out ලෙස වෙනස් කළා */}
                  <th style={styles.th}>{t('sign_in') !== 'sign_in' ? t('sign_in') : 'Sign In'}</th>
                  <th style={styles.th}>{t('sign_out') !== 'sign_out' ? t('sign_out') : 'Sign Out'}</th>
                  
                  <th style={styles.th}>{t('status') || 'Status'}</th>
                  <th style={styles.th}>{t('remarks') || 'Remarks'}</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => {
                  const record = attendance[member.id] || {};

                  return (
                    <tr key={member.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={styles.staffName}>{member.full_name}</strong>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.deptBadge}>
                          {t(getTranslationKey(member.departments?.department_name)) || member.departments?.department_name}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <input
                          type="time"
                          value={record.check_in || ''}
                          onChange={(e) =>
                            updateAttendance(member.id, 'check_in', e.target.value)
                          }
                          style={styles.timeInput}
                        />
                      </td>

                      <td style={styles.td}>
                        <input
                          type="time"
                          value={record.check_out || ''}
                          onChange={(e) =>
                            updateAttendance(member.id, 'check_out', e.target.value)
                          }
                          style={styles.timeInput}
                        />
                      </td>

                      <td style={styles.td}>
                        <select
                          value={record.status || ''}
                          onChange={(e) =>
                            updateAttendance(member.id, 'status', e.target.value)
                          }
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
                        <input
                          type="text"
                          placeholder={t('remarks') || 'Remarks...'}
                          value={record.remarks || ''}
                          onChange={(e) =>
                            updateAttendance(member.id, 'remarks', e.target.value)
                          }
                          style={styles.remarksInput}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: colors.bgPrimary, minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: colors.white, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: colors.primary, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#fff3f3', color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: colors.textSecondary, margin: 0 },
  controlsCard: { backgroundColor: colors.white, padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginLeft: 24, marginRight: 24 },
  controlsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 },
  controlGroup: { display: 'flex', flexDirection: 'column' },
  controlLabel: { fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  dateInput: { padding: '12px 16px', border: `1px solid ${colors.gray300}`, borderRadius: 8, fontSize: 14, color: colors.textPrimary },
  select: { padding: '12px 16px', border: `1px solid ${colors.gray300}`, borderRadius: 8, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.white, cursor: 'pointer' },
  statusSelect: { padding: '8px 12px', border: `1px solid ${colors.gray300}`, borderRadius: 6, width: 140, fontSize: 13, cursor: 'pointer', backgroundColor: colors.white },
  primaryBtn: { padding: '12px 24px', backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  contentCard: { backgroundColor: colors.white, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '0 24px', border: `1px solid ${colors.gray200}` },
  cardHeader: { padding: '20px 24px', borderBottom: `1px solid ${colors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: colors.textPrimary, margin: 0 },
  staffCount: { fontSize: 14, color: colors.textSecondary, backgroundColor: colors.gray100, padding: '6px 12px', borderRadius: 6 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: colors.gray50 },
  th: { padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: colors.textPrimary, borderBottom: `2px solid ${colors.gray200}` },
  tr: { borderBottom: `1px solid ${colors.gray200}` },
  td: { padding: '16px', fontSize: 14, color: colors.textSecondary },
  staffName: { color: colors.textPrimary, fontSize: 14 },
  deptBadge: { padding: '4px 10px', backgroundColor: colors.gray100, borderRadius: 6, fontSize: 12, color: colors.textPrimary },
  timeInput: { padding: '8px 12px', border: `1px solid ${colors.gray300}`, borderRadius: 6, width: 110, fontSize: 13 },
  remarksInput: { padding: '8px 12px', border: `1px solid ${colors.gray300}`, borderRadius: 6, width: 180, fontSize: 13 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 16, color: colors.textSecondary }
};

export default AttendanceManagement;