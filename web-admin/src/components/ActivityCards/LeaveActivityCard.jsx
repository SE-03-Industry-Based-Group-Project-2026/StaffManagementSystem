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


export default function LeaveActivityCard({ log, details, t, lang }) {
  const userNameRaw = log?.user?.full_name || log?.users?.full_name || details?.full_name || "-";
  
  let userName = userNameRaw;
  if (userNameRaw.includes("Chairman")) userName = t('chairman') || userNameRaw;
  if (userNameRaw.includes("Secretary")) userName = t('secretary') || userNameRaw;
  if (userNameRaw.includes("Subject Officer")) userName = t('subject_officer') || userNameRaw;
  if (userNameRaw.includes("CC Officer")) userName = t('cc_officer') || userNameRaw;

  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "Leave Action";

  let leaveText = t('leave');
  if (!leaveText || leaveText === 'leave') {
    if (lang === 'si') leaveText = 'නිවාඩු';
    else if (lang === 'ta') leaveText = 'விடுப்பு';
    else leaveText = 'Leave';
  }

  const badgeStyle = { backgroundColor: '#dbeafe', color: '#2563eb' };

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
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at, t)}</div>
          </div>
        </div>

        <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, ...badgeStyle }}>
          {leaveText}
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