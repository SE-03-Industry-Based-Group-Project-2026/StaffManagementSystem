import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Reports() {
  const { t, language } = useLanguage();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState('');
  const [reportType, setReportType] = useState('leave');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.roles?.role_name || user?.role || user?.role_name || 'Admin';

  const activeLanguage = String(
    language ||
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('supabase_token') || '';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    loadDepartments();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const getLocalizedDepartmentName = (dept) => {
    if (!dept) return '-';
    if (isSinhala) {
      return dept.department_name_si || dept.department_name || '-';
    }
    if (isTamil) {
      return dept.department_name_ta || dept.department_name || '-';
    }
    return dept.department_name || '-';
  };

  const loadDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');

    if (error) {
      setDepartments([]);
      return;
    }

    let rows = data || [];

    if (role === 'Praja Officer') {
      rows = rows.filter((d) => ['library', 'preschool'].includes(String(d.department_type || '').trim().toLowerCase()));
    }

    setDepartments(rows);

    if (role === 'Praja Officer' && rows.length > 0) {
      setDepartment((prev) => prev || String(rows[0].id));
    }
  };

  const loadEmployees = async (departmentId = '') => {
    try {
      const params = new URLSearchParams();

      if (departmentId) {
        params.append('department_id', departmentId);
      }

      const headers = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE}/reports/employees?${params.toString()}`,
        {
          headers
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || tr('access_denied', 'Access denied. You do not have permission.'));
        setEmployees([]);
        return;
      }

      let rawEmployees = result || [];

      const adminRolesToExclude = [
        'system administrator',
        'admin',
        'chairman',
        'secretary',
        'cc officer',
        'subject officer'
      ];

      rawEmployees = rawEmployees.filter((emp) => {
        const empRole = String(
          emp.roles?.role_name || emp.role || emp.role_name || ''
        ).toLowerCase().trim();
        return !adminRolesToExclude.includes(empRole);
      });

      setEmployees(rawEmployees);
    } catch (error) {
      setEmployees([]);
    }
  };

  const getEndpoint = () => {
    if (reportType === 'leave') return 'leave-summary';
    if (reportType === 'complaints') return 'complaints';
    if (reportType === 'tasks') return 'tasks';
    return 'staff';
  };

  const getReportTitle = () => {
    if (reportType === 'leave') return tr('leave_report', 'Leave Report');
    if (reportType === 'complaints') return tr('complaints', 'Complaint Report');
    if (reportType === 'tasks') return tr('tasks', 'Task Report');
    return tr('staff', 'Staff Report');
  };

  const getDepartmentName = (r) => {
    const deptObj = r.users?.departments || r.assigned_to_user?.departments || r.departments;
    if (deptObj) {
      return getLocalizedDepartmentName(deptObj);
    }
    return r.users?.department || r.department_name || '-';
  };

  const getPersonName = (r) => {
    return r.users?.full_name || r.assigned_to_user?.full_name || r.full_name || '-';
  };

  const getRowDate = (r) => {
    if (reportType === 'tasks') return r.due_date || '-';
    return r.created_at ? new Date(r.created_at).toLocaleDateString() : '-';
  };

  const translateStatus = (status) => {
    if (!status) return '-';

    const key = String(status)
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '_');

    return tr(key, status);
  };

  const generate = async () => {
    try {
      setLoading(true);
      setReportGenerated(false);

      const params = new URLSearchParams();

      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (department) params.append('department_id', department);
      if (employee) params.append('user_id', employee);

      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/reports/${getEndpoint()}?${params.toString()}`, {
        headers
      });

      const result = await res.json();

      if (!res.ok) {
        // 🌟 මෙතැනින් Backend එකෙන් එන 403 Access Denied දෝෂය පැහැදිලි Toast එකක් ලෙස පෙන්වයි
        toast.error(result.error || tr('access_denied', 'Access denied. You do not have permission.'));
        setData([]);
        setSummary({});
        setReportGenerated(false);
        return;
      }

      setData(result.details || []);
      setSummary(result.summary || {});
      setReportGenerated(true);
      toast.success(tr('report_generated_successfully', 'Report generated successfully'));
    } catch (err) {
      toast.error(tr('failed_connect_backend', 'Failed to connect backend'));
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (reportType === 'leave') {
      return [
        { key: 'leave_type', label: tr('leave_type', 'Leave Type') },
        { key: 'days', label: tr('days', 'Days') },
        { key: 'status', label: tr('status', 'Status') },
        { key: 'date', label: tr('date', 'Date') },
        { key: 'attachment', label: tr('attachment', 'Attachment') }
      ];
    }

    if (reportType === 'complaints') {
      return [
        { key: 'title', label: tr('title', 'Title') },
        { key: 'name', label: tr('user', 'Submitted By') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'status', label: tr('status', 'Status') },
        { key: 'date', label: tr('date', 'Created Date') },
        { key: 'attachment', label: tr('attachment', 'Attachment') }
      ];
    }

    if (reportType === 'tasks') {
      return [
        { key: 'title', label: tr('title', 'Task Title') },
        { key: 'name', label: tr('assigned_to', 'Assigned To') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'frequency', label: tr('frequency', 'Frequency') },
        { key: 'due_date', label: tr('due_date', 'Due Date') },
        { key: 'status', label: tr('status', 'Status') }
      ];
    }

    return [
      { key: 'avatar', label: tr('photo', 'Photo') },
      { key: 'name', label: tr('name_title', 'Name') },
      { key: 'nic', label: tr('nic_no', 'NIC') },
      { key: 'email', label: tr('email', 'Email') },
      { key: 'phone', label: tr('phone', 'Phone') },
      { key: 'designation', label: tr('designation', 'Designation') },
      { key: 'department', label: tr('department', 'Department') },
      { key: 'joined_date', label: tr('joined_date', 'Joined Date') },
      { key: 'staff_category', label: tr('staff_category', 'Category') },
      { key: 'gender', label: tr('gender', 'Gender') },
      { key: 'birthday', label: tr('birthday', 'Birthday') },
      { key: 'status', label: tr('status', 'Status') }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, t, activeLanguage]);

  const getCellValue = (row, key) => {
    if (key === 'avatar') return row.avatar_url; 
    if (key === 'name') return getPersonName(row);
    if (key === 'nic') return row.nic || '-';
    if (key === 'phone') return row.phone || '-';
    if (key === 'attachment') return row.attachment_url || '-';
    if (key === 'joined_date') return row.joined_date || '-';

    if (key === 'staff_category') {
      let category = row.staff_category || '-';

      if (isSinhala) {
        if (category === 'Staff') category = 'කාර්ය මණ්ඩලය';
        else if (category === 'Field Officer') category = 'ක්ෂේත්‍ර නිලධාරී';
        else if (category === 'Labour') category = 'කම්කරු';
      } else if (isTamil) {
        if (category === 'Staff') category = 'ஊழியர்';
        else if (category === 'Field Officer') category = 'கள அலுவலர்';
        else if (category === 'Labour') category = 'தொழிலாளர்';
      }

      return category;
    }

    if (key === 'gender') {
      let gender = row.gender || '-';

      if (isSinhala) {
        if (gender === 'Male') gender = 'පුරුෂ';
        else if (gender === 'Female') gender = 'කාන්තා';
        else if (gender === 'Other') gender = 'වෙනත්';
      } else if (isTamil) {
        if (gender === 'Male') gender = 'ஆண்';
        else if (gender === 'Female') gender = 'பெண்';
        else if (gender === 'Other') gender = 'மற்றவை';
      }

      return gender;
    }
    if (key === 'birthday') return row.birthday || '-';
    if (key === 'designation') {
      if (isSinhala) return row.designations?.designation_si || row.designations?.designation_en || '-';
      if (isTamil) return row.designations?.designation_ta || row.designations?.designation_en || '-';
      return row.designations?.designation_en || '-';
    }
    if (key === 'department') return getDepartmentName(row);
    if (key === 'leave_type') {
      if (isSinhala) {
        return row.leave_types?.name_si || row.leave_types?.name_en || '-';
      }
      if (isTamil) {
        return row.leave_types?.name_ta || row.leave_types?.name_en || '-';
      }
      return row.leave_types?.name_en || row.leave_types?.leave_type_name || '-';
    }
    if (key === 'days') return row.no_of_days || '-';
    if (key === 'status') return row.status || (row.is_active ? 'Active' : 'Inactive');
    if (key === 'date') return getRowDate(row);
    if (key === 'title') return row.title || '-';
    if (key === 'frequency') return row.frequency ? tr(String(row.frequency).toLowerCase(), row.frequency) : '-';
    if (key === 'due_date') return row.due_date || '-';
    if (key === 'email') return row.email || '-';
    if (key === 'role') {
      const roleName = row.roles?.role_name || row.role || '';
      return roleName ? tr(roleName.toLowerCase().trim().replace(/\s+/g, '_'), roleName) : '-';
    }

    return '-';
  };

  const summaryCards = useMemo(() => {
    if (!reportGenerated) return [];

    if (reportType === 'leave') {
      return [
        [tr('total_requests', 'Total Requests'), summary.total_records || 0],
        [tr('approved', 'Approved'), summary.Approved || 0],
        [tr('rejected', 'Rejected'), summary.Rejected || 0],
        [tr('total_leave_days', 'Total Leave Days'), summary.total_days || 0]
      ];
    }

    if (reportType === 'complaints') {
      return [
        [tr('total_complaints', 'Total Complaints'), summary.total_records || 0],
        [tr('open', 'Open'), summary.Open || 0],
        [tr('in_progress', 'In Progress'), summary['In Progress'] || 0],
        [tr('closed', 'Closed'), summary.Closed || 0]
      ];
    }

    if (reportType === 'tasks') {
      return [
        [tr('total_tasks', 'Total Tasks'), summary.total_records || 0],
        [tr('pending', 'Pending'), summary.Pending || 0],
        [tr('in_progress', 'In Progress'), summary['In Progress'] || 0],
        [tr('overdue', 'Overdue'), summary.overdue || 0]
      ];
    }

    return [
      [tr('total_staff', 'Total Staff'), summary.total_records || 0],
      [tr('active', 'Active'), summary.active || 0],
      [tr('inactive', 'Inactive'), summary.inactive || 0],
      [tr('departments', 'Departments'), departments.length]
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportGenerated, reportType, summary, departments.length, t, activeLanguage]);

  const chartData = useMemo(() => {
    if (reportType === 'leave') {
      return [
        { name: tr('pending', 'Pending'), value: summary.Pending || 0 },
        { name: tr('subject_officer_approved', 'Subject Officer Approved'), value: summary['Subject Officer Approved'] || 0 },
        { name: tr('cc_officer_approved', 'CC Officer Approved'), value: summary['CC Officer Approved'] || 0 },
        { name: tr('approved', 'Approved'), value: summary.Approved || 0 },
        { name: tr('rejected', 'Rejected'), value: summary.Rejected || 0 }
      ];
    }

    if (reportType === 'complaints') {
      return [
        { name: tr('open', 'Open'), value: summary.Open || 0 },
        { name: tr('in_progress', 'In Progress'), value: summary['In Progress'] || 0 },
        { name: tr('resolved', 'Resolved'), value: summary.Resolved || 0 },
        { name: tr('closed', 'Closed'), value: summary.Closed || 0 }
      ];
    }

    if (reportType === 'tasks') {
      return [
        { name: tr('pending', 'Pending'), value: summary.Pending || 0 },
        { name: tr('in_progress', 'In Progress'), value: summary['In Progress'] || 0 },
        { name: tr('completed', 'Done'), value: summary.Done || 0 },
        { name: tr('overdue', 'Overdue'), value: summary.overdue || 0 }
      ];
    }

    return [
      { name: tr('active', 'Active'), value: summary.active || 0 },
      { name: tr('inactive', 'Inactive'), value: summary.inactive || 0 }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, summary, t, activeLanguage]);

  const getItemDepartmentName = (item) => {
    const rawName = reportType === 'leave'
      ? item.user?.department
      : item.users?.departments?.department_name ||
        item.assigned_to_user?.departments?.department_name ||
        item.departments?.department_name;

    return rawName || tr('unknown_department', 'Unknown Department');
  };

  const groupedByDepartment = useMemo(() => {
    const groups = new Map();

    (data || []).forEach((item) => {
      const departmentName = getItemDepartmentName(item);
      if (!groups.has(departmentName)) groups.set(departmentName, []);
      groups.get(departmentName).push(item);
    });

    return Array.from(groups.entries())
      .map(([departmentName, records]) => ({ departmentName, records }))
      .sort((a, b) => a.departmentName.localeCompare(b.departmentName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reportType, activeLanguage, t]);

  const shouldGroupByDepartment = department === '';
  const COLORS = ['#16a34a', '#f97316', '#2563eb', '#7c3aed', '#dc2626', '#64748b'];

  const exportPDF = async () => {
    if (!reportGenerated) return;

    const selectedDept = departments.find(
      (d) => String(d.id) === String(department)
    );

    const CONTAINER_WIDTH = reportType === 'staff' ? 1600 : 1120;

    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'fixed';
    reportContainer.style.left = '-10000px';
    reportContainer.style.top = '0';
    reportContainer.style.width = `${CONTAINER_WIDTH}px`;
    reportContainer.style.padding = '42px';
    reportContainer.style.background = '#ffffff';
    reportContainer.style.color = '#1f2937';
    reportContainer.style.fontFamily =
      '"Noto Sans Sinhala", "Noto Sans Tamil", "Noto Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    reportContainer.style.lineHeight = '1.5';
    reportContainer.style.WebkitFontSmoothing = 'antialiased';

    const COLOR_PRIMARY = '#a50f1f';
    const COLOR_PRIMARY_DARK = '#7f1d1d';
    const COLOR_BORDER = '#e5e7eb';
    const COLOR_BORDER_STRONG = '#cbd5e1';
    const COLOR_TEXT = '#1f2937';
    const COLOR_MUTED = '#6b7280';
    const ROW_ALT_BG = '#f9fafb';
    const CARD_BG = '#f8fafc';

    const STAFF_COLUMN_WIDTH_PERCENT = {
      avatar: 4,
      name: 11,
      nic: 8,
      email: 14,
      phone: 7,
      designation: 9,
      department: 9,
      joined_date: 9,
      staff_category: 8,
      gender: 6,
      birthday: 8,
      status: 7
    };

    const thCellStyle = `border:1px solid ${COLOR_BORDER_STRONG};padding:0;`;
    const thInnerStyle = `background:${COLOR_PRIMARY};color:#ffffff;padding:11px 10px;font-size:11.5px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;`;
    const tdStyle = `border:1px solid ${COLOR_BORDER};padding:9px 10px;font-size:12.5px;color:${COLOR_TEXT};vertical-align:top;word-break:break-word;`;

    const th = (label, extraInner = '', widthPercent = null) =>
      `<th style="${thCellStyle}${widthPercent ? `width:${widthPercent}%;` : ''}"><div style="${thInnerStyle}${extraInner}">${escapeHtml(label)}</div></th>`;

    const summaryRows = summaryCards
      .map(
        ([label, value], idx) => `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : ROW_ALT_BG};">
            <td style="border:1px solid ${COLOR_BORDER};padding:11px 14px;font-size:13px;color:${COLOR_TEXT};">${escapeHtml(label)}</td>
            <td style="border:1px solid ${COLOR_BORDER};padding:11px 14px;text-align:center;font-weight:700;font-size:14px;color:${COLOR_PRIMARY};">${escapeHtml(value)}</td>
          </tr>`
      )
      .join('');

    let detailHeader = '';
    let detailRows = '';
    let detailTableExtraStyle = '';

    if (reportType === 'leave') {
      detailHeader = `
        ${th(tr('leave_type', 'Leave Type'))}
        ${th(tr('days', 'Days'))}
        ${th(tr('status', 'Status'))}
        ${th(tr('date', 'Date'))}
        ${th(tr('attachment', 'Attachment'))}`;

      const leavePdfGroups = shouldGroupByDepartment
        ? groupedByDepartment
        : [{ departmentName: selectedDept?.department_name || '', records: data }];

      detailRows = data.length
        ? leavePdfGroups.map((departmentGroup) => {
            const departmentHeading = shouldGroupByDepartment
              ? `<tr data-pdf-atomic="1"><td colspan="5" style="border:1px solid ${COLOR_PRIMARY_DARK};padding:0;"><div style="background:${COLOR_PRIMARY_DARK};color:#ffffff;padding:12px 14px;font-size:14px;font-weight:700;letter-spacing:0.2px;">${escapeHtml(departmentGroup.departmentName)} — ${departmentGroup.records.length} ${escapeHtml(tr('employees_count', 'Employees'))}</div></td></tr>`
              : '';

            const employeeRows = departmentGroup.records.map((employeeGroup) => {
              const employeeUser = employeeGroup.user || {};
              const employeeRecords = employeeGroup.records || [];

              const recordRowsInner = employeeRecords.length
                ? employeeRecords.map((leave, idx) => {
                    let leaveTypeName =
                      leave.leave_types?.name_en ||
                      leave.leave_types?.leave_type_name ||
                      '-';

                    if (isSinhala) {
                      leaveTypeName =
                        leave.leave_types?.name_si ||
                        leave.leave_types?.name_en ||
                        '-';
                    }

                    if (isTamil) {
                      leaveTypeName =
                        leave.leave_types?.name_ta ||
                        leave.leave_types?.name_en ||
                        '-';
                    }

                    const leaveDate = leave.created_at
                      ? new Date(leave.created_at).toLocaleDateString(activeLanguage || 'en')
                      : '-';

                    const attachmentCell = leave.attachment_url
                      ? `<a href="${leave.attachment_url}" target="_blank" rel="noopener noreferrer" style="color:${COLOR_PRIMARY};text-decoration:underline;font-weight:600;">${escapeHtml(tr('open_attachment', 'Open'))}</a>`
                      : '-';

                    return `
                      <tr style="background:${idx % 2 === 0 ? '#ffffff' : ROW_ALT_BG};">
                        <td style="${tdStyle}">${escapeHtml(leaveTypeName)}</td>
                        <td style="${tdStyle}text-align:center;">${escapeHtml(leave.no_of_days ?? '-')}</td>
                        <td style="${tdStyle}">${escapeHtml(translateStatus(leave.status || '-'))}</td>
                        <td style="${tdStyle}">${escapeHtml(leaveDate)}</td>
                        <td style="${tdStyle}">${attachmentCell}</td>
                      </tr>`;
                  }).join('')
                : `
                    <tr>
                      <td colspan="5" style="border:1px solid ${COLOR_BORDER};padding:14px;text-align:center;color:${COLOR_MUTED};font-size:12.5px;">
                        ${escapeHtml(tr('no_detail_records', 'No detail records found'))}
                      </td>
                    </tr>`;

              return `
                <tr data-pdf-atomic="1">
                  <td colspan="5" style="border:1px solid ${COLOR_BORDER};padding:0;">
                    <div style="padding:14px 16px;background:${CARD_BG};border-bottom:1px solid ${COLOR_BORDER};display:flex;justify-content:space-between;gap:20px;align-items:flex-start;">
                      <div style="flex:1;">
                        <div style="font-size:15.5px;font-weight:700;color:#111827;margin-bottom:6px;">
                          ${escapeHtml(employeeUser.full_name || '-')}
                        </div>
                        <div style="font-size:12px;line-height:1.9;color:#374151;">
                          <div><strong style="color:${COLOR_TEXT};">${escapeHtml(tr('department', 'Department'))}:</strong> ${escapeHtml(employeeUser.department || '-')}</div>
                          <div><strong style="color:${COLOR_TEXT};">${escapeHtml(tr('designation', 'Designation'))}:</strong> ${escapeHtml(employeeUser.designation || '-')}</div>
                          <div><strong style="color:${COLOR_TEXT};">${escapeHtml(tr('email', 'Email'))}:</strong> ${escapeHtml(employeeUser.email || '-')}</div>
                        </div>
                      </div>
                      <div style="display:flex;gap:10px;">
                        <div style="min-width:110px;padding:10px;text-align:center;background:#fff;border:1px solid ${COLOR_BORDER};border-radius:6px;">
                          <div style="font-size:19px;font-weight:700;color:${COLOR_PRIMARY};">${escapeHtml(employeeGroup.total_days ?? 0)}</div>
                          <div style="margin-top:3px;font-size:10.5px;color:${COLOR_MUTED};letter-spacing:0.2px;">${escapeHtml(tr('total_leave_days', 'Total Leave Days'))}</div>
                        </div>
                        <div style="min-width:110px;padding:10px;text-align:center;background:#fff;border:1px solid ${COLOR_BORDER};border-radius:6px;">
                          <div style="font-size:19px;font-weight:700;color:${COLOR_PRIMARY};">${escapeHtml(employeeGroup.leave_count ?? 0)}</div>
                          <div style="margin-top:3px;font-size:10.5px;color:${COLOR_MUTED};letter-spacing:0.2px;">${escapeHtml(tr('total_requests', 'Total Requests'))}</div>
                        </div>
                      </div>
                    </div>
                    <table style="width:100%;border-collapse:collapse;">
                      <tbody>${recordRowsInner}</tbody>
                    </table>
                  </td>
                </tr>`;
            }).join('');

            return departmentHeading + employeeRows;
          }).join('')
        : `
            <tr>
              <td colspan="5" style="border:1px solid ${COLOR_BORDER};padding:18px;text-align:center;color:${COLOR_MUTED};">
                ${escapeHtml(tr('no_detail_records', 'No detail records found'))}
              </td>
            </tr>`;
    } else {
      if (reportType === 'staff') {
        detailTableExtraStyle = 'table-layout:fixed;';
      }

      detailHeader = columns
        .map((column) => th(column.label, '', reportType === 'staff' ? STAFF_COLUMN_WIDTH_PERCENT[column.key] : null))
        .join('');

      const normalPdfGroups = shouldGroupByDepartment
        ? groupedByDepartment
        : [{ departmentName: selectedDept?.department_name || '', records: data }];

      detailRows = data.length
        ? normalPdfGroups.map((departmentGroup) => {
            const departmentHeading = shouldGroupByDepartment
              ? `<tr data-pdf-atomic="1"><td colspan="${columns.length}" style="border:1px solid ${COLOR_PRIMARY_DARK};padding:0;"><div style="background:${COLOR_PRIMARY_DARK};color:#ffffff;padding:12px 14px;font-size:14px;font-weight:700;letter-spacing:0.2px;">${escapeHtml(departmentGroup.departmentName)} — ${departmentGroup.records.length} ${escapeHtml(tr('records', 'Records'))}</div></td></tr>`
              : '';

            const rowsHtml = departmentGroup.records.map((row, idx) => `
              <tr data-pdf-atomic="1" style="background:${idx % 2 === 0 ? '#ffffff' : ROW_ALT_BG};">
                ${columns.map((column) => {
                  if (column.key === 'avatar') {
                    const photoUrl = row.avatar_url;
                    const initial = escapeHtml((row.full_name || 'U').charAt(0).toUpperCase());
                    const imgCell = photoUrl
                      ? `<img src="${photoUrl}" crossorigin="anonymous" style="width:32px;height:32px;border-radius:50%;object-fit:cover;display:block;margin:0 auto;" />`
                      : `<div style="width:32px;height:32px;border-radius:50%;background:#cbd5e1;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto;">${initial}</div>`;
                    return `<td style="${tdStyle}text-align:center;">${imgCell}</td>`;
                  }

                  const rawValue = getCellValue(row, column.key);
                  const value = column.key === 'status'
                    ? translateStatus(rawValue)
                    : rawValue;

                  return `<td style="${tdStyle}">${escapeHtml(value)}</td>`;
                }).join('')}
              </tr>`).join('');

            return departmentHeading + rowsHtml;
          }).join('')
        : `
            <tr>
              <td colspan="${columns.length}" style="border:1px solid ${COLOR_BORDER};padding:18px;text-align:center;color:${COLOR_MUTED};">
                ${escapeHtml(tr('no_detail_records', 'No detail records found'))}
              </td>
            </tr>`;
    }

    reportContainer.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;border-bottom:3px solid ${COLOR_PRIMARY};padding-bottom:20px;">
        <img src="${pradeshiyaLogo}" alt="Logo" style="width:78px;height:78px;object-fit:contain;" />
        <div style="flex:1;text-align:center;">
          <div style="font-size:26px;font-weight:700;color:${COLOR_PRIMARY};letter-spacing:0.2px;">
            ${escapeHtml(tr('staff_management_system', 'Pradeshiya Sabha Staff Management System'))}
          </div>
          <div style="font-size:14.5px;margin-top:5px;color:${COLOR_MUTED};font-weight:500;letter-spacing:0.3px;">
            ${escapeHtml(tr('official_administrative_report', 'Official Administrative Report'))}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px 40px;margin:22px 0 26px;font-size:13px;color:${COLOR_TEXT};">
        <div><strong style="color:#111827;">${escapeHtml(tr('report_type', 'Report Type'))}:</strong> ${escapeHtml(getReportTitle())}</div>
        <div><strong style="color:#111827;">${escapeHtml(tr('period', 'Period'))}:</strong> ${escapeHtml(startDate || '-')} ${escapeHtml(tr('to', 'to'))} ${escapeHtml(endDate || '-')}</div>
        <div><strong style="color:#111827;">${escapeHtml(tr('generated_by', 'Generated By'))}:</strong> ${escapeHtml(user.full_name || user.email || 'System User')}</div>
        <div><strong style="color:#111827;">${escapeHtml(tr('department', 'Department'))}:</strong> ${escapeHtml(selectedDept ? getLocalizedDepartmentName(selectedDept) : tr('all_departments', 'All Departments'))}</div>
        <div><strong style="color:#111827;">${escapeHtml(tr('employee', 'Employee'))}:</strong> ${escapeHtml(employees.find((emp) => String(emp.id) === String(employee))?.full_name || tr('all_employees', 'All Employees'))}</div>
        <div><strong style="color:#111827;">${escapeHtml(tr('generated_date', 'Generated Date'))}:</strong> ${escapeHtml(new Date().toLocaleString(activeLanguage || 'en'))}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px;">
        <thead>
          <tr data-pdf-atomic="1">
            ${th(tr('metric', 'Metric'))}
            ${th(tr('value', 'Value'), 'width:150px;text-align:center;display:block;')}
          </tr>
        </thead>
        <tbody>${summaryRows}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:12.5px;${detailTableExtraStyle}">
        <thead><tr data-pdf-atomic="1">${detailHeader}</tr></thead>
        <tbody>${detailRows}</tbody>
      </table>

      <div style="margin-top:28px;padding-top:12px;border-top:1px solid ${COLOR_BORDER};font-size:10.5px;color:${COLOR_MUTED};display:flex;justify-content:space-between;">
        <span>${escapeHtml(tr('generated_by_system', 'Generated by Pradeshiya Sabha Staff Management System'))}</span>
        <span>${escapeHtml(new Date().toLocaleDateString())}</span>
      </div>
    `;

    document.body.appendChild(reportContainer);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const allImages = Array.from(reportContainer.querySelectorAll('img'));
      await Promise.all(
        allImages.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const containerRectBefore = reportContainer.getBoundingClientRect();
      const atomicRects = Array.from(
        reportContainer.querySelectorAll('[data-pdf-atomic]')
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top - containerRectBefore.top,
          bottom: r.bottom - containerRectBefore.top
        };
      });
      const containerWidthPx = containerRectBefore.width;
      const containerHeightPx = containerRectBefore.height;

      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: CONTAINER_WIDTH
      });

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const mmPerPx = printableWidth / containerWidthPx;
      const pageHeightPx = printableHeight / mmPerPx;
      const scaleFactor = canvas.width / containerWidthPx;

      const pageBreaksPx = [0];
      let cursor = 0;
      while (cursor < containerHeightPx - 0.5) {
        let nextBreak = Math.min(cursor + pageHeightPx, containerHeightPx);
        for (const rect of atomicRects) {
          if (rect.top > cursor && rect.top < nextBreak && rect.bottom > nextBreak) {
            nextBreak = rect.top;
          }
        }
        if (nextBreak <= cursor + 0.5) {
          nextBreak = Math.min(cursor + pageHeightPx, containerHeightPx);
        }
        pageBreaksPx.push(nextBreak);
        cursor = nextBreak;
      }

      let firstPage = true;
      for (let i = 0; i < pageBreaksPx.length - 1; i++) {
        const sliceTopPx = pageBreaksPx[i];
        const sliceHeightPx = pageBreaksPx[i + 1] - sliceTopPx;
        if (sliceHeightPx <= 0.5) continue;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceHeightPx * scaleFactor);
        const ctx = sliceCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0, sliceTopPx * scaleFactor, canvas.width, sliceHeightPx * scaleFactor,
          0, 0, canvas.width, sliceHeightPx * scaleFactor
        );

        if (!firstPage) pdf.addPage();
        firstPage = false;

        const sliceImageData = sliceCanvas.toDataURL('image/png', 1.0);
        const sliceHeightMM = sliceHeightPx * mmPerPx;
        pdf.addImage(
          sliceImageData,
          'PNG',
          margin,
          margin,
          printableWidth,
          sliceHeightMM,
          undefined,
          'FAST'
        );
      }

      pdf.save(`${reportType}_report.pdf`);
    } catch (error) {
      toast.error(tr('failed_export_pdf', 'Failed to export PDF'));
    } finally {
      if (document.body.contains(reportContainer)) {
        document.body.removeChild(reportContainer);
      }
    }
  };
  
  const exportCSV = () => {
    if (!reportGenerated) return;

    const selectedDept = departments.find(
      (d) => String(d.id) === String(department)
    );

    const escapeCsv = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = [];

    rows.push([getReportTitle()]);
    rows.push([
      tr('generated_by', 'Generated By'),
      `${user.title ? user.title + '. ' : ''}${user.full_name}` || user.email || 'System User'
    ]);
    rows.push([
      tr('generated_date', 'Generated Date'),
      new Date().toLocaleString(activeLanguage || 'en')
    ]);
    rows.push([
      tr('period', 'Period'),
      `${startDate || '-'} ${tr('to', 'to')} ${endDate || '-'}`
    ]);
    rows.push([
      tr('department', 'Department'),
      selectedDept
        ? getLocalizedDepartmentName(selectedDept)
        : tr('all_departments', 'All Departments')
    ]);

    rows.push([]);
    rows.push([tr('summary', 'Summary')]);
    rows.push([
      tr('metric', 'Metric'),
      tr('value', 'Value')
    ]);

    summaryCards.forEach(([label, value]) => {
      rows.push([label, value]);
    });

    rows.push([]);
    rows.push([tr('details', 'Details')]);

    if (data.length > 0) {
      const csvGroups = shouldGroupByDepartment
        ? groupedByDepartment
        : [{ departmentName: selectedDept?.department_name || '', records: data }];

      csvGroups.forEach((departmentGroup, groupIndex) => {
        if (groupIndex > 0) rows.push([]);

        if (shouldGroupByDepartment) {
          rows.push([
            tr('department', 'Department'),
            departmentGroup.departmentName
          ]);
        }

        if (reportType === 'leave') {
          departmentGroup.records.forEach((employeeGroup) => {
            rows.push([]);
            rows.push([
              tr('employee', 'Employee'),
              employeeGroup.user?.full_name || '-'
            ]);
            rows.push([
              tr('designation', 'Designation'),
              employeeGroup.user?.designation || '-'
            ]);
            rows.push([
              tr('email', 'Email'),
              employeeGroup.user?.email || '-'
            ]);
            rows.push([
              tr('total_leave_days', 'Total Leave Days'),
              employeeGroup.total_days || 0
            ]);
            rows.push([
              tr('total_requests', 'Total Requests'),
              employeeGroup.leave_count || 0
            ]);
            rows.push([
              tr('leave_type', 'Leave Type'),
              tr('days', 'Days'),
              tr('status', 'Status'),
              tr('date', 'Date'),
              tr('attachment', 'Attachment')
            ]);

            (employeeGroup.records || []).forEach((leave) => {
              let leaveTypeName = leave.leave_types?.name_en || '-';
              if (isSinhala) leaveTypeName = leave.leave_types?.name_si || leaveTypeName;
              if (isTamil) leaveTypeName = leave.leave_types?.name_ta || leaveTypeName;

              rows.push([
                leaveTypeName,
                leave.no_of_days ?? '-',
                translateStatus(leave.status),
                leave.created_at
                  ? new Date(leave.created_at).toLocaleDateString(activeLanguage || 'en')
                  : '-',
                leave.attachment_url || '-' 
              ]);
            });
          });
        } else {
          rows.push(columns.map((column) => column.label));
          departmentGroup.records.forEach((row) => {
            rows.push(columns.map((column) => {
              const value = getCellValue(row, column.key);
              return column.key === 'status' ? translateStatus(value) : value;
            }));
          });
        }
      });
    } else {
      rows.push([tr('no_detail_records', 'No detail records found')]);
    }

    const csvContent = rows
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    const utf8Bom = '\uFEFF';
    const blob = new Blob(
      [utf8Bom + csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${reportType}_report_${activeLanguage || 'en'}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const renderLeaveEmployeeCard = (employeeGroup, index, showDepartment = true) => (
    <div
      key={employeeGroup.user?.id || index}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
          padding: 20,
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>
            {employeeGroup.user?.full_name || '-'}
          </h3>
          <div style={{ color: '#475569', lineHeight: 1.8 }}>
            {showDepartment && (
              <div>
                <strong>{tr('department', 'Department')}:</strong>{' '}
                {isSinhala
                  ? (employeeGroup.user?.department_si || employeeGroup.user?.department)
                  : isTamil
                  ? (employeeGroup.user?.department_ta || employeeGroup.user?.department)
                  : (employeeGroup.user?.department)}
              </div>
            )}
            <div>
              <strong>{tr('designation', 'Designation')}:</strong>{' '}
              {isSinhala
                ? (employeeGroup.user?.designation_si || employeeGroup.user?.designation)
                : isTamil
                ? (employeeGroup.user?.designation_ta || employeeGroup.user?.designation)
                : (employeeGroup.user?.designation)}
            </div>
            <div>
              <strong>{tr('email', 'Email')}:</strong>{' '}
              {employeeGroup.user?.email || '-'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ minWidth: 145, padding: 15, textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <div style={{ fontSize: 25, fontWeight: 800 }}>{employeeGroup.total_days || 0}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{tr('total_leave_days', 'Total Leave Days')}</div>
          </div>
          <div style={{ minWidth: 145, padding: 15, textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <div style={{ fontSize: 25, fontWeight: 800 }}>{employeeGroup.leave_count || 0}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{tr('total_requests', 'Total Requests')}</div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="pro-table">
          <thead>
            <tr>
              <th>{tr('leave_type', 'Leave Type')}</th>
              <th>{tr('days', 'Days')}</th>
              <th>{tr('status', 'Status')}</th>
              <th>{tr('date', 'Date')}</th>
              <th>{tr('attachment', 'Attachment')}</th>
            </tr>
          </thead>
          <tbody>
            {(employeeGroup.records || []).map((leave) => {
              let leaveTypeName = leave.leave_types?.name_en || '-';
              if (isSinhala) leaveTypeName = leave.leave_types?.name_si || leaveTypeName;
              if (isTamil) leaveTypeName = leave.leave_types?.name_ta || leaveTypeName;

              return (
                <tr key={leave.id}>
                  <td>{leaveTypeName}</td>
                  <td>{leave.no_of_days ?? '-'}</td>
                  <td>{statusBadge(translateStatus(leave.status))}</td>
                  <td>{leave.created_at ? new Date(leave.created_at).toLocaleDateString(activeLanguage || 'en') : '-'}</td>
                  <td>
                    {leave.attachment_url ? (
                      <a href={leave.attachment_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>
                        {tr('open_attachment', 'Open')}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNormalTable = (records) => (
    <div className="table-wrap">
      <table className="pro-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {records.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => {
                const value = getCellValue(row, column.key);
                
                if (column.key === 'avatar') {
                  return (
                    <td key={column.key}>
                      {value ? (
                        <img src={value} alt="Profile" style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
                          {row.full_name ? row.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </td>
                  );
                }

                if (column.key === 'attachment') {
                  return (
                    <td key={column.key}>
                      {value !== '-' ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>
                          {tr('open_attachment', 'Open')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                }

                return (
                  <td key={column.key}>
                    {column.key === 'status' ? statusBadge(translateStatus(value)) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDepartmentGroupedReport = () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {groupedByDepartment.map((departmentGroup) => (
        <section
          key={departmentGroup.departmentName}
          style={{ border: '1px solid #dbe2ea', borderRadius: 16, overflow: 'hidden', background: '#fff' }}
        >
          <div
            style={{
              padding: '16px 20px',
              background: '#f1f5f9',
              borderBottom: '1px solid #dbe2ea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {departmentGroup.departmentName}
              </h3>
              <div style={{ marginTop: 5, fontSize: 13, color: '#64748b' }}>
                {departmentGroup.records.length}{' '}
                {reportType === 'leave' ? tr('employees', 'Employees') : tr('records', 'Records')}
              </div>
            </div>
            <span className="badge badge-neutral">{departmentGroup.records.length}</span>
          </div>

          {reportType === 'leave' ? (
            <div style={{ display: 'grid', gap: 18, padding: 18 }}>
              {departmentGroup.records.map((employeeGroup, index) => renderLeaveEmployeeCard(employeeGroup, index, false))}
            </div>
          ) : renderNormalTable(departmentGroup.records)}
        </section>
      ))}
    </div>
  );

  const hasChartData = chartData.some((item) => item.value > 0);

  return (
    <Layout>
      <PageHero
        icon="report"
        title={tr('reports', 'Reports')}
        subtitle={tr('reports_subtitle', 'Generate official analytical reports with PDF and CSV export.')}
      />

      <div className="pro-card">
        <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label>{tr('report_type', 'Report Type')}</label>
            <select
              className="select"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData([]);
                setSummary({});
                setReportGenerated(false);
              }}
              style={{ width: '100%' }}
            >
              <option value="leave">{tr('leave_report', 'Leave Report')}</option>
              <option value="complaints">{tr('complaint_report', 'Complaint Report')}</option>
              <option value="tasks">{tr('task_report', 'Task Report')}</option>
              <option value="staff">{tr('staff_report', 'Staff Report')}</option>
            </select>
          </div>

          <div className="field" style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label>{tr('department', 'Department')}</label>
            <select
              className="select"
              value={department}
              onChange={(e) => {
                const selectedDepartment = e.target.value;
                setDepartment(selectedDepartment);
                setEmployee('');
                loadEmployees(selectedDepartment);
                setReportGenerated(false);
                setData([]);
                setSummary({});
              }}
              style={{ width: '100%' }}
            >
              {role !== 'Praja Officer' && <option value="">{tr('all_departments', 'All Departments')}</option>}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {getLocalizedDepartmentName(d)}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label>{tr('employee', 'Employee')}</label>
            <select
              className="select"
              value={employee}
              onChange={(e) => {
                setEmployee(e.target.value);
                setReportGenerated(false);
                setData([]);
                setSummary({});
              }}
              style={{ width: '100%' }}
            >
              <option value="">{tr('all_employees', 'All Employees')}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.title ? `${emp.title}. ` : ''}
                  {emp.full_name}
                  {emp.designation ? ` - ${emp.designation}` : ''}
                </option>
              ))}
            </select>
          </div>

          {reportType !== 'staff' && (
            <>
              <div className="field" style={{ flex: '1 1 150px', minWidth: '140px' }}>
                <label>{tr('start_date', 'Start Date')}</label>
                <input
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setReportGenerated(false);
                    setData([]);
                    setSummary({});
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="field" style={{ flex: '1 1 150px', minWidth: '140px' }}>
                <label>{tr('end_date', 'End Date')}</label>
                <input
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setReportGenerated(false);
                    setData([]);
                    setSummary({});
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ height: '42px' }}>
           {loading ? tr('generating', 'Generating...') : tr('generate_report', 'Generate Report')}
          </button>
        </div>
      </div>

      {reportGenerated && (
        <div className="pro-grid stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {summaryCards.map(([label, value]) => (
            <StatCard key={label} icon="report" label={label} value={value} />
          ))}
        </div>
      )}

      {reportGenerated && hasChartData && (
        <div className="pro-card" style={{ marginTop: 20 }}>
          <div className="card-head">
            <h3>{getReportTitle()} {tr('analytics', 'Analytics')}</h3>
          </div>

          <div className="pro-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={90}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      <div className="pro-card">
        <div className="card-head">
          <h3>
            {getReportTitle()} {tr('details', 'Details')}
          </h3>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {reportGenerated && (
              <>
                <button className="btn btn-soft" onClick={exportPDF}>
                  {tr('download_pdf', 'Download PDF')}
                </button>

                <button className="btn btn-primary" onClick={exportCSV}>
                  {tr('download_csv', 'Download CSV')}
                </button>
              </>
            )}

            <span className="badge badge-neutral">
              {data.length} {tr('records', 'records')}
            </span>
          </div>
        </div>

        {!reportGenerated ? (
          <EmptyState
            icon="report"
            title={tr('no_report_generated', 'No Report Generated')}
            text={tr(
              'choose_report_type',
              'Choose report type and department to generate report.'
            )}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon="report"
            title={tr('no_detail_records', 'No detail records found')}
            text={tr(
              'report_summary_available',
              'The report summary is available. You can download the PDF or CSV.'
            )}
          />
        ) : shouldGroupByDepartment ? (
          renderDepartmentGroupedReport()
        ) : reportType === 'leave' ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {data.map((employeeGroup, index) => renderLeaveEmployeeCard(employeeGroup, index, true))}
          </div>
        ) : (
          renderNormalTable(data)
        )}
      </div>
    </Layout>
  );
}

export default Reports;