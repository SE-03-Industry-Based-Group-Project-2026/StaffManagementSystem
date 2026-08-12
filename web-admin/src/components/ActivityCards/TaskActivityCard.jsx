import React from "react";
import AppIcon from "../AppIcon";
import { useLanguage } from "../../context/LanguageContext";

function formatTimeAgo(dateString, t) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return t('just_now') || "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('min_ago') || 'min ago'}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('hr_ago') || 'hr ago'}`;
  return `${Math.floor(diff / 86400)} ${t('day_ago') || 'day ago'}`;
}

export default function TaskActivityCard({ log, details, t }) {
  const { language } = useLanguage();
  const lang = language || 'en';

  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "Task Action";

  let assignedTo = details?.assigned_to || log?.user?.full_name || log?.users?.full_name || "-";
  if (assignedTo.includes("Chairman")) assignedTo = t('chairman') || assignedTo;
  if (assignedTo.includes("Secretary")) assignedTo = t('secretary') || assignedTo;
  if (assignedTo.includes("Subject Officer")) assignedTo = t('subject_officer') || assignedTo;
  if (assignedTo.includes("CC Officer")) assignedTo = t('cc_officer') || assignedTo;
  if (assignedTo.includes("Admin")) assignedTo = t('admin') || assignedTo;

  let rawStatus = details?.status || "task";
  let statusKey = rawStatus.toLowerCase().replace(/\s+/g, '_');
  let statusKeyWithPrefix = `task_status_${statusKey}`;
  
  let translatedStatus = t(statusKeyWithPrefix) !== statusKeyWithPrefix 
    ? t(statusKeyWithPrefix) 
    : (t(rawStatus.toLowerCase()) !== rawStatus.toLowerCase() ? t(rawStatus.toLowerCase()) : (lang === 'si' ? 'කාර්යය' : lang === 'ta' ? 'பணி' : rawStatus));

  const statusLower = rawStatus.toLowerCase();
  const statusStyle = statusLower === 'done' || statusLower === 'completed' || statusLower === 'resolved'
    ? { backgroundColor: '#dcfce7', color: '#16a34a' }
    : statusLower === 'in progress' || statusLower === 'ongoing'
    ? { backgroundColor: '#dbeafe', color: '#2563eb' }
    : { backgroundColor: '#fef3c7', color: '#d97706' };

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="clipboard" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at, t)}</div>
          </div>
        </div>
        <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...statusStyle }}>
          {translatedStatus}
        </span>
      </div>

      {details?.title && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--text)" }}>
          <AppIcon name="clipboard" size={15} style={{ color: "#d97706" }} />
          <strong>{details.title}</strong>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--muted)", fontSize: 14 }}>
        <AppIcon name="users" size={15} />
        {t("assigned_to", "Assigned To")} : {assignedTo}
      </div>

      {details?.due_date && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 14 }}>
          <AppIcon name="calendar" size={15} />
          {t("due_date", "Due Date")} : {details.due_date}
        </div>
      )}
    </div>
  );
}