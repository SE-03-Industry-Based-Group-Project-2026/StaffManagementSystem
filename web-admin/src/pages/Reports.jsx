import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState, statusBadge } from '../components/PageParts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Reports() {
  const { t } = useLanguage();

  const [departments, setDepartments] = useState([]);
  const [reportType, setReportType] = useState('leave');
  const [department, setDepartment] = useState('');
  
  // 🔴 Monthly / Annual රිපෝට් ගැනීම සඳහා Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [data, setData] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || user.role_name || 'Admin';

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    let rows = data || [];
    if (role === 'Praja Officer') {
      rows = rows.filter((d) => ['Library', 'Preschool'].includes(d.department_type));
    }
    setDepartments(rows);
  };

  const getDepartmentName = (r) => {
    const name = r.users?.departments?.department_name || r.departments?.department_name || '';
    return name ? t(getTranslationKey(name)) : '-';
  };

  const getRowDate = (r) => {
    return r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString() : '-');
  };

  // 🔴 Analysis දත්ත සකස් කිරීම (PDF සහ Excel සඳහා පොදුයි)
  const getAnalysisData = () => {
    const totalRecords = data.length;
    const approvedCount = data.filter((r) => ['Approved', 'Resolved', 'Present'].includes(r.status)).length;
    const pendingCount = data.filter((r) => ['Pending', 'Open', 'In Progress'].includes(r.status)).length;

    let maxDept = '-';
    let maxCount = 0;
    let analysisLabel = t('analysis') || 'Analysis';

    if (totalRecords > 0) {
      const deptCounts = {};
      data.forEach(r => {
        if (reportType === 'attendance' && r.status !== 'Present') return;
        const deptName = getDepartmentName(r);
        if (deptName && deptName !== '-') {
          deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
        }
      });

      for (const [dept, count] of Object.entries(deptCounts)) {
        if (count > maxCount) {
          maxDept = dept;
          maxCount = count;
        }
      }

      if (reportType === 'attendance') {
        analysisLabel = t('highest_attendance_dept') !== 'highest_attendance_dept' ? t('highest_attendance_dept') : 'Highest Attendance (Dept)';
      } else if (reportType === 'leave') {
        analysisLabel = t('highest_leaves_dept') !== 'highest_leaves_dept' ? t('highest_leaves_dept') : 'Highest Leaves (Dept)';
      } else if (reportType === 'complaints') {
        analysisLabel = t('most_complaints_dept') !== 'most_complaints_dept' ? t('most_complaints_dept') : 'Most Complaints (Dept)';
      }
    }

    return { totalRecords, approvedCount, pendingCount, maxDept, maxCount, analysisLabel };
  };

  // 🔴 PDF එක ඇතුළේ Analysis එක මුද්‍රණය කිරීම
  const exportPDF = () => {
    const doc = new jsPDF();
    const analysis = getAnalysisData();

    doc.setFontSize(18);
    doc.text(`${reportType.toUpperCase()} ANALYSIS REPORT`, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 22);
    if(startDate && endDate) doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 28);

    // Summary Section in PDF
    doc.setFontSize(12);
    doc.text(`--- Summary Analysis ---`, 14, 38);
    doc.setFontSize(11);
    doc.text(`Total Records: ${analysis.totalRecords}`, 14, 45);
    doc.text(`Approved / Present / Resolved: ${analysis.approvedCount}`, 14, 52);
    doc.text(`Pending / Open / Late: ${analysis.pendingCount}`, 14, 59);
    
    if (analysis.maxCount > 0) {
      doc.text(`${analysis.analysisLabel}: ${analysis.maxDept} (${analysis.maxCount} Records)`, 14, 66);
    }

    autoTable(doc, {
      startY: 75,
      head: [[t('name_title'), t('department'), t('status'), t('date')]],
      body: data.map((r) => [
        r.users?.full_name || r.title || t('record'),
        getDepartmentName(r),
        r.status || '-',
        getRowDate(r)
      ])
    });

    doc.save(`${reportType}_analysis_report.pdf`);
  };

  // 🔴 Excel (CSV) එක ඇතුළේ Analysis එක මුද්‍රණය කිරීම
  const exportCSV = () => {
    const analysis = getAnalysisData();

    // Summary Section in CSV
    let csvContent = `ANALYSIS REPORT SUMMARY\n`;
    csvContent += `Generated Date,${new Date().toLocaleDateString()}\n`;
    if(startDate && endDate) csvContent += `Period,${startDate} to ${endDate}\n`;
    csvContent += `Total Records,${analysis.totalRecords}\n`;
    csvContent += `Approved/Present/Resolved,${analysis.approvedCount}\n`;
    csvContent += `Pending/Open,${analysis.pendingCount}\n`;
    if (analysis.maxCount > 0) {
      csvContent += `${analysis.analysisLabel},"${analysis.maxDept} (${analysis.maxCount})"\n`;
    }
    csvContent += `\n\n`; // Add space before table

    const headers = [t('name_title'), t('department'), t('status'), t('date')];
    const rows = data.map((r) => [
      r.users?.full_name || r.title || t('record'),
      getDepartmentName(r),
      r.status || '-',
      getRowDate(r)
    ]);

    csvContent += headers.join(',') + '\n';
    csvContent += rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${reportType}_analysis_report.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const generate = async () => {
    let query;
    let dateColumn = 'created_at';

    if (reportType === 'leave') {
      query = supabase.from('leave_requests').select(`*, users(full_name, departments(department_name, department_type)), leave_types(leave_type_name)`);
    } else if (reportType === 'complaints') {
      query = supabase.from('complaints').select(`*, users(full_name), departments(department_name, department_type)`);
    } else {
      query = supabase.from('attendance').select(`*, users(full_name, departments(department_name, department_type))`);
      dateColumn = 'date';
    }

    // 🔴 Date Filters Application (For Monthly/Annual Reports)
    if (startDate) query = query.gte(dateColumn, startDate);
    if (endDate) query = query.lte(dateColumn, endDate);
    
    query = query.order(dateColumn, { ascending: false });

    const { data: fetchedData } = await query;
    let rows = fetchedData || [];

    if (role === 'Praja Officer') {
      rows = rows.filter((r) => ['Library', 'Preschool'].includes(r.users?.departments?.department_type || r.departments?.department_type));
    }

    if (department) {
      const selectedDept = departments.find((d) => String(d.id) === String(department));
      rows = rows.filter((r) => 
        (r.users?.departments?.department_name === selectedDept?.department_name) || 
        (String(r.department_id) === String(department))
      );
    }

    setData(rows);
  };

  const analysis = getAnalysisData();

  return (
    <Layout>
      <PageHero icon="report" title={t('reports')} subtitle={t('reports_subtitle') || 'Generate and download analytical reports'} />

      <div className="pro-card">
        <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div className="field">
            <label>{t('report_type')}</label>
            <select className="select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="leave">{t('leave_report')}</option>
              <option value="attendance">{t('attendance_report')}</option>
              <option value="complaints">{t('complaint_report')}</option>
            </select>
          </div>

          <div className="field">
            <label>{t('department')}</label>
            <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              {role !== 'Praja Officer' && <option value="">{t('all_departments')}</option>}
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{t(getTranslationKey(d.department_name)) || d.department_name}</option>
              ))}
            </select>
          </div>

    
          <div className="field">
            <label>{t('start_date') || 'Start Date'}</label>
            <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>

          <div className="field">
            <label>{t('end_date') || 'End Date'}</label>
            <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }} />
          </div>

          <button className="btn btn-primary" onClick={generate}>{t('generate_report')}</button>
        </div>
      </div>

      {/* Screen Overview Cards */}
      <div className="pro-grid stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard icon="report" label={t('total_records')} value={analysis.totalRecords} />
        <StatCard icon="check" label={t('approved_resolved_present')} value={analysis.approvedCount} />
        <StatCard icon="alert" label={t('pending_open')} value={analysis.pendingCount} />
        <StatCard icon={reportType === 'attendance' ? 'check' : (reportType === 'leave' ? 'clipboard' : 'alert')} label={analysis.analysisLabel} value={analysis.maxCount > 0 ? `${analysis.maxDept} (${analysis.maxCount})` : '-'} />
      </div>

      <div className="pro-card">
        <div className="card-head">
          <h3>{t('report_details')}</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {data.length > 0 && (
              <>
                <button className="btn btn-soft" onClick={exportPDF}>{t('download_pdf')}</button>
                <button className="btn btn-primary" onClick={exportCSV}>{t('download_excel')}</button>
              </>
            )}
            <span className="badge badge-neutral">{data.length} {t('records')}</span>
          </div>
        </div>

        {data.length === 0 ? (
          <EmptyState icon="report" title={t('no_report_generated')} text={t('choose_report_type')} />
        ) : (
          <div className="table-wrap">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>{t('name_title')}</th>
                  <th>{t('department')}</th>
                  <th>{t('status')}</th>
                  <th>{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.id || i}>
                    <td>{r.users?.full_name || r.title || t('record')}</td>
                    <td>{getDepartmentName(r)}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{getRowDate(r)}</td>
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