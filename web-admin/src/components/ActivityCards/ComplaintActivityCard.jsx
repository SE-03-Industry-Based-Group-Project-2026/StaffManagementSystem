import React from "react";
import AppIcon from "../AppIcon";

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

export default function ComplaintActivityCard({ log, details, t }) {
  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "Complaint Action";

  let rawName = details?.reported_by || log?.user?.full_name || log?.users?.full_name || "-";
  if (rawName.includes("Chairman")) rawName = t('chairman') || rawName;
  if (rawName.includes("Secretary")) rawName = t('secretary') || rawName;
  if (rawName.includes("Subject Officer")) rawName = t('subject_officer') || rawName;
  if (rawName.includes("CC Officer")) rawName = t('cc_officer') || rawName;

  let rawStatus = details?.status || "complaint";
  let statusKey = rawStatus.toLowerCase().replace(/\s+/g, '_');
  let statusKeyWithPrefix = `complaint_status_${statusKey}`;
  let translatedStatus = t(statusKeyWithPrefix) !== statusKeyWithPrefix ? t(statusKeyWithPrefix) : t(rawStatus) || rawStatus;

  const statusLower = rawStatus.toLowerCase();
  const statusStyle = statusLower === 'resolved' || statusLower === 'closed'
    ? { backgroundColor: '#dcfce7', color: '#16a34a' }
    : statusLower === 'in progress' 
    ? { backgroundColor: '#dbeafe', color: '#2563eb' }
    : { backgroundColor: '#fee2e2', color: '#dc2626' };

  const complaintDate = details?.date || details?.created_at || log?.created_at;

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="alert" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at, t)}</div>
          </div>
        </div>
        <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...statusStyle }}>
          {translatedStatus}
        </span>
      </div>

      {details?.title && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--text)" }}>
          <AppIcon name="alert" size={15} />
          <strong>{details.title}</strong>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--muted)", fontSize: 14 }}>
        <AppIcon name="users" size={15} />
        {rawName}
      </div>

      {complaintDate && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--muted)", fontSize: 14 }}>
          <AppIcon name="calendar" size={15} />
          {typeof complaintDate === 'string' ? complaintDate.slice(0, 10) : complaintDate}
        </div>
      )}

      {details?.description && (
        <div style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>
          {details.description}
        </div>
      )}
    </div>
  );
}