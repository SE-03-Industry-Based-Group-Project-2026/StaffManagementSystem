import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

const SvgIcon = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const CalendarIcon = ({ size = 22, color = '#334155' }) => (
  <SvgIcon size={size} color={color}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4M3 9h18" />
  </SvgIcon>
);

const BarChartIcon = ({ size = 22, color = '#334155' }) => (
  <SvgIcon size={size} color={color}>
    <path d="M3 21h18" />
    <path d="M7 17V10" />
    <path d="M12 17V6" />
    <path d="M17 17v-4" />
  </SvgIcon>
);

const HeartIcon = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </SvgIcon>
);

const HomeIcon = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </SvgIcon>
);

const ClockIcon = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </SvgIcon>
);

const StarIcon = ({ size, color }) => (
  <SvgIcon size={size} color={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </SvgIcon>
);

const ARC_COLORS = ['#185FA5', '#0F6E56', '#A32D2D', '#534AB7', '#993356', '#854F0B'];
const R = 66;
const CX = 90;
const CY = 90;
const CIRCUMFERENCE = 2 * Math.PI * R;
const STROKE_WIDTH = 11;
const MAX_REF = 90;

function getLeaveName(lt, lang = 'en') {
  if (lang === 'si') return lt.name_si || lt.name_en || '';
  if (lang === 'ta') return lt.name_ta || lt.name_en || '';
  return lt.name_en || '';
}

function getLeaveIcon(name = '', size = 28, color = '#fff') {
  const n = name.toLowerCase();

  if (n.includes('medical') || n.includes('sick')) return <HeartIcon size={size} color={color} />;
  if (n.includes('casual')) return <HomeIcon size={size} color={color} />;
  if (n.includes('short')) return <ClockIcon size={size} color={color} />;

  return <StarIcon size={size} color={color} />;
}

function LeaveTypeCircle({ lt, index, onEdit, onDelete, animDelay, t, lang }) {
  const arcColor = ARC_COLORS[index % ARC_COLORS.length];
  const name = getLeaveName(lt, lang);
  const englishName = lt.name_en || '';
  const isShortLeave = englishName.toLowerCase().includes('short');

  const maxValue = parseInt(lt.max_days, 10) || 0;
  const pct = Math.min(maxValue / MAX_REF, 1);

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
    <div className="lt-circle-card" style={{ '--arc-color': arcColor, animationDelay: `${animDelay}ms` }}>
      <div style={{ ...styles.iconBadge, backgroundColor: arcColor }}>
        {getLeaveIcon(englishName, 22, '#fff')}
      </div>

      <div style={styles.arcSvgWrap}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={STROKE_WIDTH} />
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={arcColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
          />
        </svg>

        <div style={styles.arcCenterContent}>
          <span style={{ ...styles.arcDays, color: arcColor }}>{maxValue}</span>
          <span style={styles.arcSubLabel}>
            {isShortLeave ? (t('per_month') || 'Per Month') : (t('days_per_year') || 'Days Per Year')}
          </span>
          <span style={{ ...styles.arcPct, color: arcColor }}>
            {isShortLeave ? (t('monthly_limit') || 'Monthly Limit') : (t('annual_limit') || 'Annual Limit')}
          </span>
        </div>
      </div>

      <p style={styles.arcLabel}>{name}</p>

      <div className="lt-actions">
        <button onClick={() => onEdit(lt)} style={{ ...styles.arcIconBtn, borderColor: arcColor }} title={t('edit')} type="button">
          <AppIcon name="edit" size={15} />
        </button>
        <button onClick={() => onDelete(lt.id)} style={{ ...styles.arcIconBtn, borderColor: '#e24b4a', color: '#e24b4a' }} title={t('delete')} type="button">
          <AppIcon name="trash" size={15} />
        </button>
      </div>
    </div>
  );
}

function PolicyCard({ t }) {
  return (
    <div style={styles.policyCard}>
      <div style={styles.policyHead}>
        <div style={styles.policyIcon}>
          <AppIcon name="shield" size={22} />
        </div>
        <div>
          <h3 style={styles.policyTitle}>{t('leave_policy') || 'Leave Policy'}</h3>
          <p style={styles.policyText}>
            {t('annual_leave_not_type') || 'Annual Leave is calculated using Casual Leave and Medical Leave.'}
          </p>
          <p style={{ ...styles.policyText, marginTop: 6 }}>
            {t('short_leave_monthly_rule') || 'Short Leave is limited to 2 times per month.'}
          </p>
          <p style={{ ...styles.policyText, marginTop: 6 }}>
  {t('half_day_leave_rule') || 'Two half-day leaves are counted as one full leave day.'}
</p>
        </div>
      </div>
    </div>
  );
}

function LeaveTypes() {
  const { t, language } = useLanguage();

  const lang = language || localStorage.getItem('language') || 'en';

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_si: '',
    name_ta: '',
    max_days: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaveTypes();
  }, []);

const loadLeaveTypes = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .order('name_en');

  if (error) {
    showError(error.message);
    setLeaveTypes([]);
  } else {
    const cleaned = (data || []).filter((lt) => {
  const name = lt.name_en?.toLowerCase() || '';
  return !name.includes('annual');
});

setLeaveTypes(cleaned);
  }

  setLoading(false);
};

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_si: '',
      name_ta: '',
      max_days: ''
    });
  };

  const getLeaveTypeValue = (keyword) => {
    const item = leaveTypes.find((lt) => lt.name_en?.toLowerCase().includes(keyword));
    return parseInt(item?.max_days || 0, 10);
  };

  const casualDays = getLeaveTypeValue('casual');
  const medicalDays = getLeaveTypeValue('medical');
  const annualEntitlement = 45;

  const shortLeave = leaveTypes.find((lt) => lt.name_en?.toLowerCase().includes('short'));
  const shortLeaveLimit = parseInt(shortLeave?.max_days || 2, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameEn = formData.name_en.trim();
    const lowerName = nameEn.toLowerCase();

    if (lowerName.includes('annual')) {
      showError(t('annual_leave_not_type') || 'Annual Leave is calculated from Casual Leave + Medical Leave.');
      return;
    }

    const payload = {
      name_en: nameEn,
      name_si: formData.name_si.trim(),
      name_ta: formData.name_ta.trim(),
      max_days: parseInt(formData.max_days, 10)
    };

    if (editing) {
      const { error } = await supabase
        .from('leave_types')
        .update(payload)
        .eq('id', editing);

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess(t('update_success') || 'Updated successfully');
    } else {
      const { error } = await supabase
        .from('leave_types')
        .insert([payload]);

      if (error) {
        showError(error.message);
        return;
      }

      showSuccess(t('create_success') || 'Created successfully');
    }

    setShowModal(false);
    setEditing(null);
    resetForm();
    loadLeaveTypes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete_leave_type') || 'Are you sure you want to delete this leave type?')) return;

    const { error } = await supabase
      .from('leave_types')
      .delete()
      .eq('id', id);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess(t('delete_success') || 'Deleted successfully');
    loadLeaveTypes();
  };

  const handleEdit = (lt) => {
    setEditing(lt.id);
    setFormData({
      name_en: lt.name_en || '',
      name_si: lt.name_si || '',
      name_ta: lt.name_ta || '',
      max_days: lt.max_days || ''
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>{t('loading')}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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

        .lt-circle-card:hover .lt-actions {
          opacity: 1;
        }

        @keyframes statIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-animate {
          opacity: 0;
          animation: statIn 0.4s ease forwards;
        }
      `}</style>

      <div style={styles.container}>
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

          <button onClick={openCreateModal} style={styles.primaryBtn} type="button">
            <AppIcon name="plus" size={18} /> {t('add_leave_type')}
          </button>
        </div>

        <div style={styles.statsRow}>
          <div className="stat-animate" style={{ ...styles.statCard, animationDelay: '0.05s' }}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#fff0f0' }}>
              <CalendarIcon size={22} color={colors.primary} />
            </div>
            <div>
              <div style={styles.statValue}>{leaveTypes.length}</div>
              <div style={styles.statLabel}>{t('total_leave_types')}</div>
            </div>
          </div>

          <div className="stat-animate" style={{ ...styles.statCard, animationDelay: '0.12s' }}>
            <div style={{ ...styles.statIconBox, backgroundColor: '#f0faf5' }}>
              <BarChartIcon size={22} color="#0F6E56" />
            </div>
            <div>
              <div style={styles.statValue}>{annualEntitlement}</div>
              <div style={styles.statLabel}>{t('annual_entitlement') || 'Annual Leave Entitlement'}</div>
            </div>
          </div>
        </div>

        <PolicyCard t={t} />

        <div style={styles.circlesContainer}>
          {leaveTypes
  .filter((lt) => !lt.name_en?.toLowerCase().includes('half'))
  .map((lt, index) => (
    <LeaveTypeCircle
      key={lt.id}
      lt={lt}
      index={index}
      onEdit={handleEdit}
      onDelete={handleDelete}
      animDelay={index * 80}
      t={t}
      lang={lang}
    />
  ))}
        </div>

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
                <button onClick={() => setShowModal(false)} style={styles.closeBtn} type="button">✕</button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Leave Type Name - English *</label>
                  <input
                    type="text"
                    placeholder="e.g., Casual Leave"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Leave Type Name - Sinhala</label>
                  <input
                    type="text"
                    placeholder="e.g., අනිසි නිවාඩු"
                    value={formData.name_si}
                    onChange={(e) => setFormData({ ...formData, name_si: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Leave Type Name - Tamil</label>
                  <input
                    type="text"
                    placeholder="e.g., சாதாரண விடுப்பு"
                    value={formData.name_ta}
                    onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    {formData.name_en?.toLowerCase().includes('short')
                      ? (t('monthly_limit') || 'Monthly Limit')
                      : (t('max_days_label') || 'Max Days Per Year')} *
                  </label>
                  <input
                    type="number"
                    placeholder={formData.name_en?.toLowerCase().includes('short') ? 'e.g., 2' : 'e.g., 21'}
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

const styles = {
  container: { padding: 0, backgroundColor: colors.bgPrimary, minHeight: '100vh' },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 28px',
    backgroundColor: 'var(--card, #fff)',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 28,
    border: '1px solid var(--border, #eee)'
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#fff0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: colors.primary,
    margin: '0 0 3px 0'
  },
  breadcrumb: { fontSize: 13, color: '#888', margin: 0 },
  primaryBtn: {
    padding: '11px 22px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600
  },
  secondaryBtn: {
    padding: '11px 22px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: 9,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 20,
    marginBottom: 24
  },
  statCard: {
    backgroundColor: 'var(--card, #fff)',
    padding: '18px 22px',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid var(--border, #eee)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  statIconBox: {
    width: 50,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    flexShrink: 0
  },
  statValue: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary, #1e293b)', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 3 },
  policyCard: {
    backgroundColor: 'var(--card, #fff)',
    border: '1px solid var(--border, #eee)',
    borderRadius: 16,
    padding: 22,
    marginBottom: 30,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  policyHead: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start'
  },
  policyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0faf5',
    color: '#0F6E56',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  policyTitle: {
    margin: '0 0 5px 0',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary, #1e293b)'
  },
  policyText: {
    margin: 0,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 1.5
  },
  circlesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    padding: '8px 0 56px'
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0
  },
  arcSvgWrap: { position: 'relative', width: 180, height: 180 },
  arcCenterContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1
  },
  arcDays: { fontSize: 34, fontWeight: 800, lineHeight: 1 },
  arcSubLabel: { fontSize: 11, color: '#999', letterSpacing: 0.4, marginTop: 2 },
  arcPct: { fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.7 },
  arcLabel: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    color: 'var(--text-primary, #1e293b)',
    maxWidth: 180,
    lineHeight: 1.3,
    margin: 0
  },
  arcIconBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1.5px solid',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },
  modalBox: {
    backgroundColor: 'var(--card, #fff)',
    borderRadius: 16,
    width: 460,
    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border, #eee)'
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: colors.primary, margin: 0 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formGroup: { marginBottom: 18 },
  formLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary, #1e293b)',
    marginBottom: 7
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid var(--border, #ddd)',
    boxSizing: 'border-box',
    fontSize: 14,
    color: 'var(--text-primary, #1e293b)',
    backgroundColor: 'var(--bg-primary, #fff)',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }
};

export default LeaveTypes;