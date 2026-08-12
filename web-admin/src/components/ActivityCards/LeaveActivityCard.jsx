import React from "react";
import AppIcon from "../AppIcon";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day ago`;
}

export default function LeaveActivityCard({ log, details, t }) {
  const userNameRaw = log?.user?.full_name || log?.users?.full_name || details?.full_name || "-";
  
  let userName = userNameRaw;
  if (userNameRaw.includes("Chairman")) userName = t('chairman') || userNameRaw;
  if (userNameRaw.includes("Secretary")) userName = t('secretary') || userNameRaw;
  if (userNameRaw.includes("Subject Officer")) userName = t('subject_officer') || userNameRaw;
  if (userNameRaw.includes("CC Officer")) userName = t('cc_officer') || userNameRaw;

  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "Leave Action";


  const rawStatus = details?.status || 'Pending';
  const statusKey = rawStatus.toLowerCase().replace(/\s+/g, '_');
  const statusKeyWithPrefix = `leave_status_${statusKey}`;
  const translatedStatus = t(statusKeyWithPrefix) !== statusKeyWithPrefix 
    ? t(statusKeyWithPrefix) 
    : (t(rawStatus.toLowerCase()) !== rawStatus.toLowerCase() ? t(rawStatus.toLowerCase()) : rawStatus);

  const statusLower = rawStatus.toLowerCase();
  const statusStyle = statusLower.includes('approved') || statusLower === 'resolved'
    ? { backgroundColor: '#dcfce7', color: '#16a34a' }
    : statusLower === 'rejected' || statusLower === 'cancelled'
    ? { backgroundColor: '#fee2e2', color: '#dc2626' }
    : { backgroundColor: '#dbeafe', color: '#2563eb' };


  const rawLeaveType = details?.leave_type || '';
  const leaveTypeKey = `leave_type_${rawLeaveType.toLowerCase().replace(/\s+/g, '_')}`;
  const translatedLeaveType = t(leaveTypeKey) !== leaveTypeKey ? t(leaveTypeKey) : rawLeaveType;

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="calendar" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at)}</div>
          </div>
        </div>

        <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...statusStyle }}>
          {translatedStatus}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--text)" }}>
        <AppIcon name="users" size={15} />
        <strong>{userName}</strong>
      </div>

      {translatedLeaveType && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--muted)", fontSize: 14 }}>
          <AppIcon name="calendar" size={15} />
          {translatedLeaveType}
        </div>
      )}

      {(details?.start_date || details?.end_date) && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 14 }}>
          <AppIcon name="calendar" size={15} />
          {details.start_date || ""}
          {details.end_date ? `  →  ${details.end_date}` : ""}
        </div>
      )}
    </div>
  );
}