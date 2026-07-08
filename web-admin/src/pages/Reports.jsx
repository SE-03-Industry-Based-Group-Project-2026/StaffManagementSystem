import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Reports() {
  const { t } = useLanguage();

  const [departments, setDepartments] = useState([]);
  const [reportType, setReportType] = useState('leave');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('supabase_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const loadDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');

    let rows = data || [];

    if (role === 'Praja Officer') {
      rows = rows.filter((d) => ['Library', 'Preschool'].includes(d.department_type));
    }

    setDepartments(rows);
  };

  const getEndpoint = () => {
    if (reportType === 'leave') return 'leave-summary';
    if (reportType === 'attendance') return 'attendance';
    if (reportType === 'complaints') return 'complaints';
    if (reportType === 'tasks') return 'tasks';
    return 'staff';
  };

  const getReportTitle = () => {
    if (reportType === 'leave') return tr('leave_report', 'Leave Report');
    if (reportType === 'attendance') return tr('attendance_report', 'Attendance Report');
    if (reportType === 'complaints') return tr('complaint_report', 'Complaint Report');
    if (reportType === 'tasks') return tr('task_report', 'Task Report');
    return tr('staff_report', 'Staff Report');
  };

  const getDepartmentName = (r) => {
    const name =
      r.users?.departments?.department_name ||
      r.assigned_to_user?.departments?.department_name ||
      r.departments?.department_name ||
      '-';

    return name !== '-' ? tr(getTranslationKey(name), name) : '-';
  };

  const getPersonName = (r) => {
    return r.users?.full_name || r.assigned_to_user?.full_name || r.full_name || '-';
  };

  const getRowDate = (r) => {
    if (reportType === 'attendance') return r.date || '-';
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

      const res = await fetch(`${API_BASE}/reports/${getEndpoint()}?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || tr('failed_generate_report', 'Failed to generate report'));
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
      console.error(err);
      toast.error(tr('failed_connect_backend', 'Failed to connect backend'));
      setReportGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (reportType === 'leave') {
      return [
        { key: 'name', label: tr('employee', 'Employee') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'leave_type', label: tr('leave_type', 'Leave Type') },
        { key: 'days', label: tr('days', 'Days') },
        { key: 'status', label: tr('status', 'Status') },
        { key: 'date', label: tr('date', 'Date') }
      ];
    }

    if (reportType === 'attendance') {
      return [
        { key: 'name', label: tr('employee', 'Employee') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'date', label: tr('date', 'Date') },
        { key: 'check_in', label: tr('check_in', 'Check In') },
        { key: 'check_out', label: tr('check_out', 'Check Out') },
        { key: 'status', label: tr('status', 'Status') }
      ];
    }

    if (reportType === 'complaints') {
      return [
        { key: 'title', label: tr('title', 'Title') },
        { key: 'name', label: tr('submitted_by', 'Submitted By') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'status', label: tr('status', 'Status') },
        { key: 'date', label: tr('created_date', 'Created Date') }
      ];
    }

    if (reportType === 'tasks') {
      return [
        { key: 'title', label: tr('task_title', 'Task Title') },
        { key: 'name', label: tr('assigned_to', 'Assigned To') },
        { key: 'department', label: tr('department', 'Department') },
        { key: 'frequency', label: tr('frequency', 'Frequency') },
        { key: 'due_date', label: tr('due_date', 'Due Date') },
        { key: 'status', label: tr('status', 'Status') }
      ];
    }

    return [
      { key: 'name', label: tr('name', 'Name') },
      { key: 'email', label: tr('email', 'Email') },
      { key: 'role', label: tr('role', 'Role') },
      { key: 'department', label: tr('department', 'Department') },
      { key: 'status', label: tr('status', 'Status') }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, t]);

  const getCellValue = (row, key) => {
    if (key === 'name') return getPersonName(row);
    if (key === 'department') return getDepartmentName(row);
    if (key === 'leave_type') return row.leave_types?.leave_type_name || '-';
    if (key === 'days') return row.no_of_days || '-';
    if (key === 'status') return row.status || (row.is_active ? 'Active' : 'Inactive');
    if (key === 'date') return getRowDate(row);
    if (key === 'check_in') return row.check_in || row.sign_in || '-';
    if (key === 'check_out') return row.check_out || row.sign_out || '-';
    if (key === 'title') return row.title || '-';
    if (key === 'frequency') return row.frequency ? tr(String(row.frequency).toLowerCase(), row.frequency) : '-';
    if (key === 'due_date') return row.due_date || '-';
    if (key === 'email') return row.email || '-';
    if (key === 'role') return row.roles?.role_name ? tr(getTranslationKey(row.roles.role_name), row.roles.role_name) : '-';

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

    if (reportType === 'attendance') {
      return [
        [tr('total_records', 'Total Records'), summary.total_records || 0],
        [tr('present', 'Present'), summary.Present || 0],
        [tr('absent', 'Absent'), summary.Absent || 0],
        [tr('on_leave', 'On Leave'), summary['On Leave'] || 0]
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
  }, [reportGenerated, reportType, summary, departments.length, t]);

  const chartData = useMemo(() => {
    if (reportType === 'leave') {
      return [
        { name: tr('approved', 'Approved'), value: summary.Approved || 0 },
        { name: tr('pending', 'Pending'), value: summary.Pending || 0 },
        { name: tr('admin_approved', 'Admin Approved'), value: summary['Admin Approved'] || 0 },
        { name: tr('praja_reviewed', 'Praja Reviewed'), value: summary['Praja Reviewed'] || 0 },
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

    if (reportType === 'attendance') {
      return [
        { name: tr('present', 'Present'), value: summary.Present || 0 },
        { name: tr('absent', 'Absent'), value: summary.Absent || 0 },
        { name: tr('late', 'Late'), value: summary.Late || 0 },
        { name: tr('on_leave', 'On Leave'), value: summary['On Leave'] || 0 }
      ];
    }

    return [
      { name: tr('active', 'Active'), value: summary.active || 0 },
      { name: tr('inactive', 'Inactive'), value: summary.inactive || 0 }
    ];
  }, [reportType, summary, t]);

  const COLORS = ['#16a34a', '#f97316', '#2563eb', '#7c3aed', '#dc2626', '#64748b'];

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const selectedDept = departments.find((d) => String(d.id) === String(department));

    doc.addImage(pradeshiyaLogo, 'PNG', 15, 10, 20, 20);

    doc.setFontSize(18);
    doc.setTextColor(155, 17, 30);
    doc.text(
      tr('staff_management_system', 'Pradeshiya Sabha Staff Management System'),
      pageWidth / 2,
      17,
      { align: 'center' }
    );

    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text(
      tr('official_administrative_report', 'Official Administrative Report'),
      pageWidth / 2,
      25,
      { align: 'center' }
    );

    doc.setDrawColor(155, 17, 30);
    doc.setLineWidth(0.6);
    doc.line(15, 35, pageWidth - 15, 35);

    doc.setFontSize(9);
    doc.setTextColor(60);

    doc.text(`${tr('report_type', 'Report Type')}: ${getReportTitle()}`, 15, 45);
    doc.text(`${tr('generated_by', 'Generated By')}: ${user.full_name || user.email || 'System User'}`, 15, 51);
    doc.text(`${tr('generated_date', 'Generated Date')}: ${new Date().toLocaleString()}`, 15, 57);

    doc.text(`${tr('period', 'Period')}: ${startDate || '-'} ${tr('to', 'to')} ${endDate || '-'}`, pageWidth / 2, 45);

    doc.text(
      `${tr('department', 'Department')}: ${selectedDept ? selectedDept.department_name : tr('all_departments', 'All Departments')}`,
      pageWidth / 2,
      51
    );

    autoTable(doc, {
      startY: 70,
      head: [[tr('metric', 'Metric'), tr('value', 'Value')]],
      body: summaryCards.map(([label, value]) => [label, value]),
      theme: 'grid',
      headStyles: { fillColor: [155, 17, 30] },
      styles: { fontSize: 9 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [columns.map((c) => c.label)],
      body: data.length > 0
        ? data.map((row) =>
            columns.map((c) => {
              const value = getCellValue(row, c.key);
              return c.key === 'status' ? translateStatus(value) : String(value);
            })
          )
        : [[tr('no_detail_records', 'No detail records found')]],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [155, 17, 30] },
      margin: { left: 15, right: 15 }
    });

    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);

      doc.text(
        tr('generated_by_system', 'Generated by Pradeshiya Sabha Staff Management System'),
        15,
        pageHeight - 10
      );

      doc.text(
        `${tr('page', 'Page')} ${i} ${tr('of', 'of')} ${pageCount}`,
        pageWidth - 35,
        pageHeight - 10
      );
    }

    doc.save(`${reportType}_report.pdf`);
  };

  const exportCSV = () => {
    let csv = `${getReportTitle()}\n`;
    csv += `${tr('generated_by', 'Generated By')},"${user.full_name || user.email || 'System User'}"\n`;
    csv += `${tr('generated_date', 'Generated Date')},"${new Date().toLocaleString()}"\n`;
    csv += `${tr('period', 'Period')},"${startDate || '-'} ${tr('to', 'to')} ${endDate || '-'}"\n\n`;

    csv += `${tr('summary', 'Summary')}\n`;

    summaryCards.forEach(([label, value]) => {
      csv += `"${label}","${value}"\n`;
    });

    csv += `\n${tr('details', 'Details')}\n`;

    if (data.length > 0) {
      csv += columns.map((c) => `"${c.label}"`).join(',') + '\n';

      data.forEach((row) => {
        csv += columns
          .map((c) => {
            const value = getCellValue(row, c.key);
            const finalValue = c.key === 'status' ? translateStatus(value) : value;
            return `"${String(finalValue).replace(/"/g, '""')}"`;
          })
          .join(',') + '\n';
      });
    } else {
      csv += `"${tr('no_detail_records', 'No detail records found')}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${reportType}_report.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

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
          <div className="field">
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
            >
              <option value="leave">{tr('leave_report', 'Leave Report')}</option>
              <option value="attendance">{tr('attendance_report', 'Attendance Report')}</option>
              <option value="complaints">{tr('complaint_report', 'Complaint Report')}</option>
              <option value="tasks">{tr('task_report', 'Task Report')}</option>
              <option value="staff">{tr('staff_report', 'Staff Report')}</option>
            </select>
          </div>

          <div className="field">
            <label>{tr('department', 'Department')}</label>
            <select
              className="select"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setReportGenerated(false);
                setData([]);
                setSummary({});
              }}
            >
              {role !== 'Praja Officer' && <option value="">{tr('all_departments', 'All Departments')}</option>}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {tr(getTranslationKey(d.department_name), d.department_name)}
                </option>
              ))}
            </select>
          </div>

          {reportType !== 'staff' && (
            <>
              <div className="field">
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
                />
              </div>

              <div className="field">
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
                />
              </div>
            </>
          )}

          <button className="btn btn-primary" onClick={generate} disabled={loading}>
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

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
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
            text={tr('choose_report_type', 'Choose report type and department to generate report.')}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon="report"
            title={tr('no_detail_records', 'No detail records found')}
            text={tr('report_summary_available', 'The report summary is available. You can download the PDF or CSV.')}
          />
        ) : (
          <div className="table-wrap">
            <table className="pro-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row, index) => (
                  <tr key={row.id || index}>
                    {columns.map((c) => {
                      const value = getCellValue(row, c.key);

                      return (
                        <td key={c.key}>
                          {c.key === 'status' ? statusBadge(translateStatus(value)) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Reports;