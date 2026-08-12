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

export default function DefaultActivityCard({ log, t }) {
  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "System Action";

  let userName = log?.user?.full_name || log?.users?.full_name || "-";
  if (userName.includes("Chairman")) userName = t('chairman') || userName;
  if (userName.includes("Secretary")) userName = t('secretary') || userName;
  if (userName.includes("Subject Officer")) userName = t('subject_officer') || userName;
  if (userName.includes("CC Officer")) userName = t('cc_officer') || userName;
  if (userName.includes("Admin") || userName.includes("System Administrator")) userName = t('admin') || userName;

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gray-100)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="settings" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at)}</div>
          </div>
        </div>
        <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, backgroundColor: 'var(--gray-100)', color: 'var(--muted)' }}>
          {t("system") || "System"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 14 }}>
        <AppIcon name="users" size={15} />
        {t("performed_by", "Performed By")}: <strong>{userName}</strong>
      </div>
    </div>
  );
}