import React from "react";
import AppIcon from "../AppIcon";


function formatTimeAgo(dateString, t) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  
  const currentLang = String(
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSi = currentLang.startsWith('si');
  const isTa = currentLang.startsWith('ta');

  
  const getTranslated = (key, fallback) => {
    try {
      if (typeof t === 'function') {
        const val = t(key);
        if (val && val !== key) return val;
      }
    } catch (e) {
      // ignore
    }
    return fallback;
  };

  if (diff < 60) {
    return isSi ? 'දැන් සුළු මොහොතකට පෙර' : isTa ? 'இப்போது' : getTranslated('just_now', 'Just now');
  }
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return isSi ? `මිනිත්තු ${mins}කට පෙර` : isTa ? `${mins} நிமிடங்களுக்கு முன்பு` : `${mins} ${getTranslated('min_ago', 'min ago')}`;
  }
  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600);
    return isSi ? `පැය ${hrs}කට පෙර` : isTa ? `${hrs} மணி நேரத்திற்கு முன்பு` : `${hrs} ${getTranslated('hr_ago', 'hr ago')}`;
  }
  const days = Math.floor(diff / 86400);
  return isSi ? `දින ${days}කට පෙර` : isTa ? `${days} நாட்களுக்கு முன்பு` : `${days} ${getTranslated('day_ago', 'day ago')}`;
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