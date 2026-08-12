import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { formatSriLankaDateTime } from '../utils/dateTime';
import jsPDF from 'jspdf';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';
import html2canvas from "html2canvas";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AuditLogs() {
  const { t, language } = useLanguage();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadRoles();
    loadLogs();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*').order('role_name');
    setRoles(data || []);
  };

  const loadLogs = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      let url = `${API_BASE}/audit?limit=500`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (filter) url += `&action=${encodeURIComponent(filter)}`;
      if (roleFilter !== 'all') url += `&role_id=${encodeURIComponent(roleFilter)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilter('');
    setStartDate('');
    setEndDate('');
    setRoleFilter('all');
    
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch(`${API_BASE}/audit?limit=500`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatNameWithPrefix = (title = '', name = '') => {
    let cleanTitle = String(title || '').trim();
    let cleanName = String(name || '').trim();

    if (!cleanName) return t('system')  ;

    if (cleanTitle) {
      const lower = cleanTitle.toLowerCase().replace('.', '');
      if (['mr', 'mrs', 'ms', 'dr'].includes(lower)) {
        cleanTitle = lower.charAt(0).toUpperCase() + lower.slice(1) + '.';
      }
      return `${cleanTitle} ${cleanName}`;
    }

    const matched = cleanName.match(/^(mr|mrs|ms|dr)\.?\s+/i);
    if (matched) {
      const lower = matched[1].toLowerCase();
      const formattedTitle = lower.charAt(0).toUpperCase() + lower.slice(1) + '.';
      cleanName = cleanName.replace(/^(mr|mrs|ms|dr)\.?\s+/i, '');
      return `${formattedTitle} ${cleanName}`;
    }

    return cleanName;
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const stats = useMemo(() => {
    return {
      total: logs.length,
      adminActions: logs.filter((l) => l.users?.roles?.role_name === 'Admin').length,
      userActions: logs.filter((l) => l.users?.roles?.role_name && l.users?.roles?.role_name !== 'Admin').length
    };
  }, [logs]);

  const getActionStyle = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('SUCCESS') || act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) {
      return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    }
    if (act.includes('REJECT') || act.includes('DELETE') || act.includes('FAIL')) {
      return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MODIFY')) {
      return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    }
    if (act.includes('LOGIN') || act.includes('LOGOUT')) {
      return { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' };
    }
    return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  const formatAction = (action = '', translationKeyFromBackend = '') => {
    const cleanAction = String(action || '').trim();
    if (!cleanAction) return tr('unknown_action', 'Unknown Action');

    const translationKey = translationKeyFromBackend || `audit_${cleanAction.toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(translationKey);

    if (translated && translated !== translationKey) {
      return translated;
    }

    return cleanAction
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatEntityType = (entityType = '') => {
    const cleanEntity = String(entityType || '').trim();
    if (!cleanEntity) return '-';

    const translationKey = `entity_${cleanEntity.toLowerCase().replace(/\s+/g, '_')}`;
    const translated = t(translationKey);

    if (translated && translated !== translationKey) {
      return translated;
    }

    return cleanEntity
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const downloadAuditPDF = async () => {
    if (logs.length === 0) return;

    const reportContainer = document.createElement("div");

    reportContainer.style.position = "fixed";
    reportContainer.style.left = "-10000px";
    reportContainer.style.top = "0";
    reportContainer.style.width = "1120px";
    reportContainer.style.background = "#ffffff";
    reportContainer.style.padding = "42px";
    reportContainer.style.fontFamily =
      '"Noto Sans Sinhala","Noto Sans Tamil","Segoe UI",Arial,sans-serif';
    reportContainer.style.color = "#1f2937";
    reportContainer.style.lineHeight = "1.55";

    const COLOR_PRIMARY = "#8B0000";
    const COLOR_BORDER = "#e5e7eb";
    const COLOR_BORDER_STRONG = "#d1d5db";
    const COLOR_MUTED = "#6b7280";
    const ROW_ALT_BG = "#f9fafb";

    const generatedDate = formatSriLankaDateTime(new Date());

    const reportPeriod =
      startDate && endDate
        ? `${startDate} - ${endDate}`
        : t("all_records");

    const summaryCards = [
      [t("total_logs"), stats.total],
      [t("admin_actions", "Admin Actions"), stats.adminActions],
      [t("staff_actions", "Staff Actions"), stats.userActions]
    ];

    const summaryRows = summaryCards
      .map(
        ([label, value], index) => `
<tr style="background:${index % 2 === 0 ? "#ffffff" : ROW_ALT_BG};">
<td style="border:1px solid ${COLOR_BORDER};padding:11px 14px;">${escapeHtml(label)}</td>
<td style="border:1px solid ${COLOR_BORDER};padding:11px 14px;font-weight:700;text-align:center;color:${COLOR_PRIMARY};">${value}</td>
</tr>`
      )
      .join("");

    const th = (label) => `
<th style="padding:0;border:1px solid ${COLOR_BORDER_STRONG};background:${COLOR_PRIMARY};">
<div style="background:${COLOR_PRIMARY};color:#ffffff !important;padding:12px 10px;font-size:12px;font-weight:700;text-transform:uppercase;text-align:center;font-family:Arial, Helvetica, sans-serif;-webkit-text-fill-color:#ffffff;">
${escapeHtml(label)}
</div>
</th>`;

    const td = (value, alt = false) => `
<td style="padding:9px;border:1px solid ${COLOR_BORDER};background:${alt ? ROW_ALT_BG : "#fff"};font-size:12px;">
${escapeHtml(String(value ?? "-"))}
</td>`;

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    reportContainer.innerHTML = `
<div style="display:flex;align-items:center;gap:20px;border-bottom:3px solid ${COLOR_PRIMARY};padding-bottom:20px;">
<img src="${pradeshiyaLogo}" style="width:78px;height:78px;object-fit:contain;"/>
<div style="flex:1;text-align:center;">
<div style="font-size:26px;font-weight:700;color:${COLOR_PRIMARY};">${escapeHtml(t("staff_management_system"))}</div>
<div style="font-size:15px;margin-top:5px;color:${COLOR_MUTED};">${escapeHtml(t("audit_log_report"))}</div>
</div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 40px;margin:25px 0;font-size:13px;">
<div><b>${escapeHtml(t("generated_date"))}</b><br/>${generatedDate}</div>
<div><b>${escapeHtml(t("report_period"))}</b><br/>${reportPeriod}</div>
<div><b>${escapeHtml(t("generated_by"))}</b><br/>${escapeHtml(currentUser.full_name || currentUser.email || "System")}</div>
<div><b>${escapeHtml(t("total_records"))}</b><br/>${logs.length}</div>
</div>

<table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
<thead><tr>${th(t("metric"))}${th(t("value"))}</tr></thead>
<tbody>${summaryRows}</tbody>
</table>`;

    const detailHeader = `
<tr>
${th(t("timestamp"))}
${th(t("user"))}
${th(t("role"))}
${th(t("action"))}
${th(t("module"))}
${th(t("details"))}
</tr>`;

    const detailRows = logs
      .map((log, index) => {
        let details = {};
        try {
          details = typeof log.new_value === "string" ? JSON.parse(log.new_value) : (log.new_value || {});
        } catch {
          details = {};
        }

        let detailText = "-";
        switch (log.entity_type) {
          case "users":
            detailText = details.full_name || details.email || "-";
            break;
          case "tasks":
            detailText = details.title || "-";
            break;
          case "leave_requests":
            detailText = details.leave_type ? `${details.leave_type} (${details.start_date || "-"} → ${details.end_date || "-"})` : (details.start_date ? `${details.start_date} → ${details.end_date}` : "-");
            break;
          case "announcements":
            detailText = typeof details === "string" ? details : (details.title || details.subject || details.message || "-");
            break;
          case "complaints":
            detailText = details.subject || details.title || "-";
            break;
          case "departments":
            detailText = details.department_name || "-";
            break;
          default:
            detailText = typeof details === "object" ? (details.title || details.subject || details.full_name || details.department_name || "-") : String(details || "-");
        }

        const alt = index % 2 !== 0;

        return `
          <tr>
          ${td(formatSriLankaDateTime(log.created_at), alt)}
          ${td(log.users?.full_name ? formatNameWithPrefix(log.users?.title, log.users?.full_name) : t("system", "System"), alt)}
          ${td(log.users?.roles?.role_name || t("system", "System"), alt)}
          ${td(formatAction(log.action, log.action_translation_key), alt)}
          ${td(formatEntityType(log.entity_type), alt)}
          ${td(detailText, alt)}
          </tr>`;
      })
      .join("");

    reportContainer.innerHTML += `
      <h2 style="margin:30px 0 12px;font-size:18px;color:${COLOR_PRIMARY};">${escapeHtml(t("audit_log_report"))}</h2>
      <table style="width:100%;border-collapse:collapse;">
      <thead>${detailHeader}</thead>
      <tbody>${detailRows}</tbody>
      </table>`;

    document.body.appendChild(reportContainer);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const images = Array.from(reportContainer.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => new Promise((resolve) => {
          if (img.complete) resolve();
          else { img.onload = resolve; img.onerror = resolve; }
        }))
      );

      const canvas = await html2canvas(reportContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const mmPerPx = printableWidth / imgWidth;
      const pageHeightPx = printableHeight / mmPerPx;
      let renderedHeight = 0;

      while (renderedHeight < imgHeight) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = Math.min(pageHeightPx, imgHeight - renderedHeight);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, renderedHeight, imgWidth, pageCanvas.height, 0, 0, imgWidth, pageCanvas.height);

        const imageData = pageCanvas.toDataURL("image/png", 1);
        const sliceHeightMM = pageCanvas.height * mmPerPx;

        pdf.addImage(imageData, "PNG", margin, margin, printableWidth, sliceHeightMM, undefined, "FAST");
        renderedHeight += pageCanvas.height;

        if (renderedHeight < imgHeight) pdf.addPage();
      }

      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);
        pdf.setDrawColor(220);
        pdf.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(110);
        pdf.text(t("generated_by_system"), margin, pageHeight - 3);
        pdf.text(`${t("page")} ${page} ${t("of")} ${totalPages}`, pageWidth - margin, pageHeight - 3, { align: "right" });
      }

      const fileName = `Audit_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } finally {
      document.body.removeChild(reportContainer);
    }
  };

  const renderDetails = (log, details) => {
    if (typeof details === 'string') {
      return (
        <div style={styles.detailRow}>
          <AppIcon name="note" size={14} />
          <span>{details}</span>
        </div>
      );
    }

    switch (log.entity_type) {
      case 'users':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="users" size={15} />
              <strong>{formatNameWithPrefix(details.title, details.full_name || details.name)}</strong>
            </div>
            {details.email && (
              <div style={styles.detailRow}>
                <AppIcon name="mail" size={13} />
                <span style={{ fontSize: '12px' }}>{details.email}</span>
              </div>
            )}
            {details.nic && (
              <div style={styles.detailRow}>
                <AppIcon name="shield" size={13} />
                <span style={{ fontSize: '12px' }}>NIC: {details.nic}</span>
              </div>
            )}
          </div>
        );

      case 'tasks':
        const taskStatus = details.status || '';
        const taskStatusKey = taskStatus.toLowerCase().trim().replace(/\s+/g, '_');
        const translatedTaskStatus = taskStatus ? (t(`task_status_${taskStatusKey}`) !== `task_status_${taskStatusKey}` ? t(`task_status_${taskStatusKey}`) : tr(taskStatusKey, taskStatus)) : '';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="clipboard" size={15} />
              <strong>{details.title || details.task_name || '-'}</strong>
            </div>
            {details.assigned_to && (
              <div style={styles.detailRow}>
                <AppIcon name="users" size={13} />
                <span style={{ fontSize: '12px' }}>{tr('assigned_to', 'Assigned')}: {details.assigned_to}</span>
              </div>
            )}
            {translatedTaskStatus && (
              <div style={styles.detailRow}>
                <span style={{ fontSize: '12px' }}>
                  {tr('status', 'Status')}: <strong>{translatedTaskStatus}</strong>
                </span>
              </div>
            )}
            {details.due_date && (
              <div style={styles.detailRow}>
                <AppIcon name="calendar" size={13} />
                <span style={{ fontSize: '12px' }}>
                  {tr('due_date', 'Due')}: {formatSriLankaDateTime(details.due_date)}
                </span>
              </div>
            )}
          </div>
        );

      case 'leave_requests':
        let leaveTypeName = details.leave_type;
        if (!leaveTypeName) {
          if (language === 'si') leaveTypeName = details.name_si || details.name_en || 'නිවාඩු ඉල්ලීම';
          else if (language === 'ta') leaveTypeName = details.name_ta || details.name_en || 'விடுப்பு கோரிக்கை';
          else leaveTypeName = details.name_en || tr('leave_request', 'Leave Request');
        } else {
          const lTypeKey = `leave_type_${leaveTypeName.toLowerCase().trim().replace(/\s+/g, '_')}`;
          leaveTypeName = t(lTypeKey) !== lTypeKey ? t(lTypeKey) : leaveTypeName;
        }
      
        const leaveStatus = details.status || '';
        const leaveStatusKey = leaveStatus.toLowerCase().trim().replace(/\s+/g, '_');
        const translatedLeaveStatus = leaveStatus ? (t(`leave_status_${leaveStatusKey}`) !== `leave_status_${leaveStatusKey}` ? t(`leave_status_${leaveStatusKey}`) : tr(leaveStatusKey, leaveStatus)) : '';

        const leavePeriod = details.start_date && details.end_date ? `${details.start_date} → ${details.end_date}` : '';
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="calendar" size={15} />
              <strong>{leaveTypeName}</strong>
            </div>
            {translatedLeaveStatus && (
              <div style={styles.detailRow}>
                <span style={{ fontSize: '12px' }}>
                  {tr('status', 'Status')}: <strong>{translatedLeaveStatus}</strong>
                </span>
              </div>
            )}
            {leavePeriod && (
              <div style={styles.detailRow}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>
                  📅 {leavePeriod}
                </span>
              </div>
            )}
          </div>
        );

      case 'announcements':
        const annTitle = details.title || details.subject || details.message || '-';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="megaphone" size={15} />
              <strong>{annTitle}</strong>
            </div>
            {details.department && (
              <div style={styles.detailRow}>
                <span style={{ fontSize: '12px' }}>Dept: {details.department}</span>
              </div>
            )}
          </div>
        );

      case 'complaints':
        const rawStatus = details.status || '';
        const statusKey = rawStatus.toLowerCase().trim().replace(/\s+/g, '_');
        const translatedStatus = rawStatus 
          ? (t(`complaint_status_${statusKey}`) !== `complaint_status_${statusKey}` ? t(`complaint_status_${statusKey}`): tr(statusKey, rawStatus)) 
          : '';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="alert" size={15} />
              <strong>{details.subject || details.title || '-'}</strong>
            </div>
            {translatedStatus && (
              <div style={styles.detailRow}>
                <span style={{ fontSize: '12px' }}>
                  {tr('status', 'Status')}: <strong>{translatedStatus}</strong>
                </span>
              </div>
            )}
          </div>
        );

      case 'departments':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={styles.detailTitle}>
              <AppIcon name="building" size={15} />
              <strong>{details.department_name || '-'}</strong>
            </div>
          </div>
        );

      default:
        const fallbackTitle = details.title || details.subject || details.full_name || details.name || null;
        if (fallbackTitle) {
          return (
            <div style={styles.detailRow}>
              <span>{fallbackTitle}</span>
            </div>
          );
        }
        return <span style={{ color: 'var(--muted)', fontSize: '12px' }}>-</span>;
    }
  };

  if (loading) {
    return (
      <Layout>

        <div style={styles.loading}>
           <div className="spinner-icon" />
           {t('loading')}</div>
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
                <AppIcon name="audit" size={24} />
              </span>
              {t('audit_logs')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('audit_logs')}</p>
          </div>

          <button onClick={downloadAuditPDF} style={styles.downloadBtn} type="button">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AppIcon name="download" size={16} />
              {tr('download_report', 'Download Report')}
            </span>
          </button>
        </div>

        <div style={styles.statsRow}>
          <InfoCard icon="audit" label={tr('total_logs', 'Total Logs')} value={stats.total} />
          <InfoCard icon="shield" label={tr('admin_actions', 'Admin Actions')} value={stats.adminActions} tone="success" />
          <InfoCard icon="users" label={tr('staff_actions', 'Staff Actions')} value={stats.userActions} tone="warning" />
        </div>

        <div style={styles.filtersCard}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="search" size={16} />
                {t('search_action')}
              </label>
              <input
                type="text"
                placeholder={t('search_action')}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="users" size={16} />
                {t('role') || 'Role'}
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">{t('all_roles') || 'All Roles'}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {tr(getTranslationKey(r.role_name), r.role_name)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="calendar" size={16} />
                {t('start_date')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <AppIcon name="calendar" size={16} />
                {t('end_date')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>&nbsp;</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={loadLogs} style={styles.primaryBtn} type="button">
                  {t('apply_filters')}
                </button>
                <button onClick={resetFilters} style={styles.secondaryBtn} type="button">
                  {t('reset')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{t('system_activity_logs')}</h2>
            <span className="badge badge-neutral" style={styles.countBadge}>
              {logs.length} {t('records')}
            </span>
          </div>

          {logs.length === 0 ? (
            <div style={styles.emptyState}>
              <AppIcon name="audit" size={38} />
              <h3>{tr('no_audit_logs_found', 'No audit logs found')}</h3>
              <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>{t('timestamp')}</th>
                    <th style={styles.th}>{t('user')}</th>
                    <th style={styles.th}>{t('action')}</th>
                    <th style={styles.th}>{t('details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const actionStyle = getActionStyle(log.action);
                    let details = {};

                    try {
                      details =
                        typeof log.new_value === 'string'
                          ? JSON.parse(log.new_value)
                          : (log.new_value || {});
                    } catch (e) {
                      details = {};
                    }

                    return (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.timestampText}>
                            {formatSriLankaDateTime(log.created_at)}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <strong style={{ color: 'var(--text)' }}>
                            {formatNameWithPrefix(log.users?.title, log.users?.full_name)}
                          </strong>
                          <br />
                          <span style={styles.roleSubtext}>
                            {log.users?.roles?.role_name
                              ? tr(getTranslationKey(log.users.roles.role_name), log.users.roles.role_name)
                              : t('system', 'System')}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.modernBadge,
                              backgroundColor: actionStyle.bg,
                              color: actionStyle.color,
                              border: `1px solid ${actionStyle.border}`
                            }}
                            title={formatAction(log.action, log.action_translation_key)}
                          >
                            {formatAction(log.action, log.action_translation_key)}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.detailsCell}>
                            {renderDetails(log, details)}
                          </div>
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

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    warning: { bg: '#ffedd5', color: '#f97316' },
    info: { bg: '#dbeafe', color: '#2563eb' }
  };

  const selected = toneMap[tone] || toneMap.default;

  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, backgroundColor: selected.bg, color: selected.color }}>
        <AppIcon name={icon} size={22} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    marginBottom: 24,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 16,
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    flexWrap: 'wrap',
    gap: 16
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  titleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'var(--primary-soft)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  breadcrumb: { fontSize: 13, color: 'var(--muted)', margin: 0, fontWeight: 500 },
  downloadBtn: {
    padding: '12px 20px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: 16,
    marginBottom: 24,
    padding: '0 24px'
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 20,
    borderRadius: 14,
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statValue: { fontSize: 24, fontWeight: 800, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 2, fontWeight: 500 },
  filtersCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: 24,
    borderRadius: 14,
    margin: '0 24px 24px',
    border: '1px solid var(--border)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 16,
    alignItems: 'end'
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  filterInput: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14
  },
  filterSelect: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontSize: 14
  },
  dateInput: {
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: 10,
    backgroundColor: 'var(--gray-50)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14
  },
  primaryBtn: {
    padding: '11px 20px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 14
  },
  secondaryBtn: {
    padding: '11px 20px',
    backgroundColor: 'var(--gray-100)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: 14
  },
  contentCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 14,
    margin: '0 24px 32px',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 },
  countBadge: { padding: '4px 10px', fontSize: 12, fontWeight: 600 },
  emptyState: {
    padding: 60,
    textAlign: 'center',
    color: 'var(--muted)'
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { backgroundColor: 'var(--gray-50)' },
  th: {
    padding: '14px 20px',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' },
  td: { padding: '16px 20px', fontSize: 14, color: 'var(--text)', verticalAlign: 'middle' },
  timestampText: { fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 },
  roleSubtext: { fontSize: 12, color: 'var(--muted)', fontWeight: 500 },
  modernBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: '0.02em',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  detailsCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 240
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 16,
    color: 'var(--muted)'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--muted)'
  },
  detailTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    color: 'var(--text)'
  }
};

export default AuditLogs;