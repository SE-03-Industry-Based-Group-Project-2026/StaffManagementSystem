import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';

// ─── Icon Components ──────────────────────────────────────────────────────────
const SvgIcon = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const CalendarIcon   = ({ size = 22, color = '#334155' }) => <SvgIcon size={size} color={color}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></SvgIcon>;
const BriefcaseIcon  = ({ size = 22, color = '#334155' }) => <SvgIcon size={size} color={color}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></SvgIcon>;
const BarChartIcon   = ({ size = 22, color = '#334155' }) => <SvgIcon size={size} color={color}><path d="M3 21h18" /><path d="M7 17V10" /><path d="M12 17V6" /><path d="M17 17v-4" /></SvgIcon>;
const PencilIcon     = ({ size = 16, color }) => <SvgIcon size={size} color={color}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></SvgIcon>;
const TrashIcon      = ({ size = 16, color }) => <SvgIcon size={size} color={color}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></SvgIcon>;
const PlusIcon       = ({ size = 18, color = '#ffffff' }) => <SvgIcon size={size} color={color}><path d="M12 5v14M5 12h14" /></SvgIcon>;

// Leave-type-specific icons
const SunIcon        = ({ size, color }) => <SvgIcon size={size} color={color}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></SvgIcon>;
const HeartIcon      = ({ size, color }) => <SvgIcon size={size} color={color}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></SvgIcon>;
const BabyIcon       = ({ size, color }) => <SvgIcon size={size} color={color}><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/><path d="M9 11v2M15 11v2"/></SvgIcon>;
const BookIcon       = ({ size, color }) => <SvgIcon size={size} color={color}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></SvgIcon>;
const HomeIcon       = ({ size, color }) => <SvgIcon size={size} color={color}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></SvgIcon>;
const StarIcon       = ({ size, color }) => <SvgIcon size={size} color={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>;

// Map leave type name keywords → icon component
function getLeaveIcon(name = '', size = 28, color = '#fff') {
  const n = name.toLowerCase();
  if (n.includes('annual') || n.includes('vacation'))   return <SunIcon size={size} color={color} />;
  if (n.includes('sick') || n.includes('medical'))      return <HeartIcon size={size} color={color} />;
  if (n.includes('casual'))                              return <HomeIcon size={size} color={color} />;
  if (n.includes('maternity') || n.includes('paternity') || n.includes('baby')) return <BabyIcon size={size} color={color} />;
  if (n.includes('study') || n.includes('exam') || n.includes('education')) return <BookIcon size={size} color={color} />;
  return <StarIcon size={size} color={color} />;
}

// ─── Arc Color Palette ────────────────────────────────────────────────────────
const ARC_COLORS = ['#185FA5', '#0F6E56', '#A32D2D', '#534AB7', '#993356', '#854F0B'];

// ─── SVG Arc Params ───────────────────────────────────────────────────────────
const R = 66;
const CX = 90;
const CY = 90;
const CIRCUMFERENCE = 2 * Math.PI * R;
const STROKE_WIDTH = 11;
const MAX_REF = 90; // days for 100% arc

// ─── Single Circle Card ───────────────────────────────────────────────────────
function LeaveTypeCircle({ lt, index, onEdit, onDelete, animDelay }) {
  const arcColor = ARC_COLORS[index % ARC_COLORS.length];
  const pct = Math.min((parseInt(lt.max_days, 10) || 0) / MAX_REF, 1);

  // Animate arc draw on mount
  const [drawn, setDrawn] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let start = null;
    const duration = 900;
    const delay = animDelay || 0;

    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDrawn(eased * pct);
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pct, animDelay]);

  const dash = drawn * CIRCUMFERENCE;
  const gap = CIRCUMFERENCE - dash;

  return (
    <div
      className="lt-circle-card"
      style={{ '--arc-color': arcColor, animationDelay: `${animDelay}ms` }}
    >
      {/* Icon badge top-center */}
      <div style={{ ...styles.iconBadge, backgroundColor: arcColor }}>
        {getLeaveIcon(lt.leave_type_name, 22, '#fff')}
      </div>

      {/* SVG Arc */}
      <div style={styles.arcSvgWrap}>
        <svg width="180" height="180" viewBox="0 0 180 180"
          style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke="#e5e7eb" strokeWidth={STROKE_WIDTH} />
          {/* Progress */}
          <circle cx={CX} cy={CY} r={R} fill="none"
            stroke={arcColor} strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`} />
        </svg>

        {/* Center text */}
        <div style={styles.arcCenterContent}>
          <span style={{ ...styles.arcDays, color: arcColor }}>{lt.max_days}</span>
          <span style={styles.arcSubLabel}>days / year</span>
          <span style={{ ...styles.arcPct, color: arcColor }}>
            {Math.round((parseInt(lt.max_days, 10) / MAX_REF) * 100)}%
          </span>
        </div>
      </div>

      {/* Leave type name */}
      <p style={styles.arcLabel}>{lt.leave_type_name}</p>

      {/* Edit / Delete — fade in on hover */}
      <div className="lt-actions">
        <button onClick={() => onEdit(lt)}
          style={{ ...styles.arcIconBtn, borderColor: arcColor }}
          title="Edit">
          <PencilIcon color={arcColor} size={14} />
        </button>
        <button onClick={() => onDelete(lt.id)}
          style={{ ...styles.arcIconBtn, borderColor: '#e24b4a' }}
          title="Delete">
          <TrashIcon color="#e24b4a" size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function LeaveTypes() {
  const { t } = useLanguage();
  const [leaveTypes, setLeaveTypes]   = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [formData, setFormData]       = useState({ leave_type_name: '', max_days: '' });
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadLeaveTypes(); }, []);

  const loadLeaveTypes = async () => {
    const { data } = await supabase.from('leave_types').select('*').order('leave_type_name');
    setLeaveTypes(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('leave_types').update(formData).eq('id', editing);
    } else {
      await supabase.from('leave_types').insert([formData]);
    }
    setShowModal(false);
    setEditing(null);
    setFormData({ leave_type_name: '', max_days: '' });
    loadLeaveTypes();
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_staff'))) {
      await supabase.from('leave_types').delete().eq('id', id);
      loadLeaveTypes();
    }
  };

  const handleEdit = (lt) => {
    setEditing(lt.id);
    setFormData(lt);
    setShowModal(true);
  };

  if (loading) return <Layout><div style={styles.loading}>{t('loading')}</div></Layout>;

  const totalDays = leaveTypes.reduce((s, lt) => s + (parseInt(lt.max_days, 10) || 0), 0);

  return (
    <Layout>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lt-circle-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 28px 20px 20px;
          border-radius: 24px;
          background: var(--card, #ffffff);
          border: 1px solid var(--border, #e5e7eb);
          width: 220px;
          transition: transform 0.28s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.28s ease;
          cursor: default;
          opacity: 0;
          animation: cardIn 0.45s cubic-bezier(0.34,1.2,0.64,1) forwards;
        }
        .lt-circle-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .lt-actions {
          display: flex;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
          margin-top: 4px;
        }
        .lt-circle-card:hover .lt-actions { opacity: 1; }

        .lt-icon-btn-hover:hover {
          transform: scale(1.15);
          background: rgba(0,0,0,0.04);
        }

        @keyframes statIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stat-animate {
          opacity: 0;
          animation: statIn 0.4s ease forwards;
        }
      `}</style>

      <div style={styles.container}>

        {/* ── Page Header ───────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={styles.headerIconBox}>
              <CalendarIcon size={26} color={colors.primary} />
            </div>
            <div>
              <h1 style={styles.pageTitle}>{t('leave_types_management')}</h1>
              <p style={styles.breadcrumb}>{t('dashboard')} / {t('leave_types')}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditing(null); setFormData({ leave_type_name: '', max_days: '' }); }}
            style={styles.primaryBtn}
          >
            <PlusIcon /> {t('add_leave_type')}
          </button>
        </div>

        {/* ── Stats Row ─────────────────────────────────── */}
        <div style={styles.statsRow}>
          {[
            { icon: <CalendarIcon size={22} color={colors.primary} />, value: leaveTypes.length, label: t('total_leave_types'),    bg: '#fff0f0', delay: '0.05s' },
            { icon: <BarChartIcon  size={22} color="#0F6E56"         />, value: totalDays,         label: t('total_days_available'), bg: '#f0faf5', delay: '0.12s' },
            { icon: <BriefcaseIcon size={22} color="#534AB7"         />, value: leaveTypes.length > 0 ? Math.round(totalDays / leaveTypes.length) : 0, label: t('average_days_per_type'), bg: '#f3f0ff', delay: '0.19s' },
          ].map((s, i) => (
            <div key={i} className="stat-animate" style={{ ...styles.statCard, animationDelay: s.delay }}>
              <div style={{ ...styles.statIconBox, backgroundColor: s.bg }}>{s.icon}</div>
              <div>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Circle Cards ──────────────────────────────── */}
        <div style={styles.circlesContainer}>
          {leaveTypes.map((lt, index) => (
            <LeaveTypeCircle
              key={lt.id}
              lt={lt}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              animDelay={index * 80}
            />
          ))}
        </div>

        {/* ── Modal ─────────────────────────────────────── */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ ...styles.headerIconBox, width: 36, height: 36 }}>
                    <CalendarIcon size={18} color={colors.primary} />
                  </div>
                  <h2 style={styles.modalTitle}>
                    {editing ? t('edit_leave_type') : t('new_leave_type')}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t('leave_type_name_label') || 'Leave Type Name'} *</label>
                  <input
                    type="text"
                    placeholder="e.g., Annual Leave"
                    required
                    value={formData.leave_type_name}
                    onChange={(e) => setFormData({ ...formData, leave_type_name: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>{t('max_days_label') || 'Max Days Per Year'} *</label>
                  <input
                    type="number"
                    placeholder="e.g., 21"
                    required
                    min="1"
                    value={formData.max_days}
                    onChange={(e) => setFormData({ ...formData, max_days: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.secondaryBtn}>
                    {t('cancel')}
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    {editing ? t('update') : t('create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: { padding: 0, backgroundColor: colors.bgPrimary, minHeight: '100vh' },

  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 28px', backgroundColor: 'var(--card, #fff)',
    borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 28, border: '1px solid var(--border, #eee)'
  },
  headerIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#fff0f0', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  pageTitle: {
    fontSize: 26, fontWeight: 700, color: colors.primary,
    margin: '0 0 3px 0'
  },
  breadcrumb: { fontSize: 13, color: '#888', margin: 0 },

  primaryBtn: {
    padding: '11px 22px', backgroundColor: colors.primary, color: '#fff',
    border: 'none', borderRadius: 9, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 14, fontWeight: 600,
    transition: 'opacity 0.2s, transform 0.15s',
  },
  secondaryBtn: {
    padding: '11px 22px', backgroundColor: '#fff',
    border: '1px solid #ccc', borderRadius: 9, cursor: 'pointer',
    fontSize: 14, fontWeight: 600
  },

  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20, marginBottom: 36, padding: '0 0'
  },
  statCard: {
    backgroundColor: 'var(--card, #fff)', padding: '18px 22px', borderRadius: 14,
    display: 'flex', alignItems: 'center', gap: 16,
    border: '1px solid var(--border, #eee)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  statIconBox: {
    width: 50, height: 50, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 12, flexShrink: 0
  },
  statValue: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary, #1e293b)', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 3 },

  circlesContainer: {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
    gap: 24, padding: '8px 0 56px'
  },

  // Icon badge above arc
  iconBadge: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0
  },

  arcSvgWrap: { position: 'relative', width: 180, height: 180 },
  arcCenterContent: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 1
  },
  arcDays: { fontSize: 34, fontWeight: 800, lineHeight: 1 },
  arcSubLabel: { fontSize: 11, color: '#999', letterSpacing: 0.4, marginTop: 2 },
  arcPct: { fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.7 },

  arcLabel: {
    fontSize: 14, fontWeight: 700, textAlign: 'center',
    color: 'var(--text-primary, #1e293b)', maxWidth: 180,
    lineHeight: 1.3, margin: 0
  },

  arcIconBtn: {
    width: 32, height: 32, borderRadius: '50%',
    border: '1.5px solid', backgroundColor: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'transform 0.15s, background 0.15s',
  },

  // Modal
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)'
  },
  modalBox: {
    backgroundColor: 'var(--card, #fff)', borderRadius: 16,
    width: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid var(--border, #eee)'
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: colors.primary, margin: 0 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 8, border: 'none',
    backgroundColor: '#f1f5f9', color: '#64748b',
    cursor: 'pointer', fontSize: 14, display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  formGroup: { marginBottom: 18 },
  formLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #1e293b)', marginBottom: 7 },
  input: {
    width: '100%', padding: '11px 14px', marginBottom: 0,
    borderRadius: 8, border: '1px solid var(--border, #ddd)',
    boxSizing: 'border-box', fontSize: 14,
    color: 'var(--text-primary, #1e293b)',
    backgroundColor: 'var(--bg-primary, #fff)',
    outline: 'none', transition: 'border-color 0.2s'
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 },

  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }
};

export default LeaveTypes;