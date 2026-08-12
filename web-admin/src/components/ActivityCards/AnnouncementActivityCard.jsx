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

export default function AnnouncementActivityCard({ log, details, t }) {
  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "Announcement Action";

  const announcementText = t('type_announcement') !== 'type_announcement' 
    ? t('type_announcement') 
    : (t('announcement') !== 'announcement' ? t('announcement') : 'Announcement');

  const priority = details?.priority || 'Medium';
  const badgeStyle = priority === 'Urgent' 
    ? { backgroundColor: '#fee2e2', color: '#dc2626' } 
    : priority === 'High' 
    ? { backgroundColor: '#ffedd5', color: '#f97316' } 
    : { backgroundColor: '#f3e8ff', color: '#9333ea' };

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="megaphone" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at)}</div>
          </div>
        </div>
        <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...badgeStyle }}>
          {announcementText}
        </span>
      </div>

      {details?.title && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, color: "var(--text)" }}>
          <AppIcon name="megaphone" size={15} />
          <strong>{details.title}</strong>
        </div>
      )}

      {(details?.description || details?.message) && (
        <div style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>
          {details.description || details.message}
        </div>
      )}
    </div>
  );
}