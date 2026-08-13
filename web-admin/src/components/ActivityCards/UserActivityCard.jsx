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

const formatNameWithPrefix = (title = '', name = '') => {
  let cleanTitle = String(title || '').trim();
  let cleanName = String(name || '').trim();

  if (!cleanName) return 'System User';

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

export default function UserActivityCard({ log, details, t }) {
  const actionStr = log?.action ? String(log.action).toLowerCase() : "";
  const actionKey = `audit_${actionStr}`;
  const translatedAction = t(actionKey) !== actionKey ? t(actionKey) : log?.action || "User Action";

  const rawName = details?.full_name || log?.user?.full_name || log?.users?.full_name || '';
  const rawTitle = details?.title || log?.user?.title || log?.users?.title || '';
  let formattedName = formatNameWithPrefix(rawTitle, rawName);

  if (formattedName.includes("Chairman")) formattedName = t('chairman') || formattedName;
  if (formattedName.includes("Secretary")) formattedName = t('secretary') || formattedName;
  if (formattedName.includes("Subject Officer")) formattedName = t('subject_officer') || formattedName;
  if (formattedName.includes("CC Officer")) formattedName = t('cc_officer') || formattedName;
  if (formattedName.includes("Admin") || formattedName.includes("System User")) formattedName = t('admin') || formattedName;

  return (
    <div className="pro-card" style={{ margin: 0, padding: 18, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AppIcon name="users" size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15 }}>{translatedAction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{formatTimeAgo(log?.created_at, t)}</div>
          </div>
        </div>
        <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, backgroundColor: '#dcfce7', color: '#16a34a' }}>
          {t("staff") || "Staff"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--text)" }}>
        <AppIcon name="users" size={15} style={{ color: "var(--primary)" }} />
        <strong>{formattedName}</strong>
      </div>

      {(details?.email || log?.user?.email || log?.users?.email) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 14 }}>
          <AppIcon name="note" size={15} />
          {details?.email || log?.user?.email || log?.users?.email}
        </div>
      )}
    </div>
  );
}