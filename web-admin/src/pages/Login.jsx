import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import { showError, showSuccess } from '../services/toastService';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const { t, language, setLanguage } = useLanguage();

  const languagesList = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'si', label: 'සිංහල', short: 'සිං' },
    { code: 'ta', label: 'தமிழ்', short: 'த' }
  ];

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  const getLocalizedName = (roleName, currentLang) => {
    const names = {
      'Admin': { en: 'System Administrator', si: 'පද්ධති පරිපාලක', ta: 'கட்டமைப்பு நிர்வாகி' },
      'CC Officer': { en: 'CC Officer', si: 'CC නිලධාරී', ta: 'CC அதிகாரி' },
      'Chairman': { en: 'Chairman', si: 'සභාපතිතුමා', ta: 'தலைவர்' },
      'Secretary': { en: 'Secretary', si: 'ලේකම්තුමා', ta: 'செயலாளர்' },
      'Subject Officer': { en: 'Subject Officer', si: 'විෂය භාර නිලධාරී', ta: 'விடய அதிகாரி' },
      'Department Head': { en: 'Department Head', si: 'දෙපාර්තමේන්තු ප්‍රධානී', ta: 'திணைக்கள தலைவர்' }
    };
    return names[roleName]?.[currentLang] || names[roleName]?.['en'] || roleName;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showError(t('email_required') || 'Email address is required');
      return;
    }

    if (!password) {
      showError(t('password_required') || 'Password is required');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        showError(error.message);
        setLoading(false);
        return;
      }

      const token = data?.session?.access_token;

      if (!token) {
        showError(t('login_failed_token') || 'Login token could not be created');
        setLoading(false);
        return;
      }

      localStorage.setItem('supabase_token', token);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          role_id,
          is_active,
          roles(
            role_name
          )
        `)
        .eq('auth_id', data.user.id)
        .single();

      if (userError || !userData) {
        showError(t('user_profile_not_found') || 'User profile could not be found');
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        setLoading(false);
        return;
      }

      if (userData.is_active === false) {
        showError(t('account_inactive') || 'Your account is currently inactive');
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        setLoading(false);
        return;
      }

      const allowedRoles = [
        'Admin',
        'Secretary',
        'Chairman',
        'CC Officer',
        'Subject Officer',
        'Praja Officer',
        'Department Head'
      ];

      const userRole = userData.roles?.role_name;

      if (!allowedRoles.includes(userRole)) {
        showError(
          t('access_denied_authorized') ||
            'You are not authorized to access this system'
        );
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        setLoading(false);
        return;
      }

      const displayName = getLocalizedName(userRole, language);

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userData.id,
          full_name: displayName,
          role_id: userData.role_id,
          role: userRole,
          role_name: userRole
        })
      );

      showSuccess(
        `${t('welcome_back') || 'Welcome back'}, ${displayName}!`
      );

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);

    } catch (error) {
      console.error('Login error:', error);
      showError(
        t('something_went_wrong') ||
          'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgDecorationTopRight} />
      <div style={styles.bgDecorationBottomLeft} />
      <div style={styles.bgDecorationMidLeft} />
      <div style={styles.bgDecorationMidRight} />

      <div style={styles.pageLanguageSelector}>
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          style={styles.langPickerBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{currentLang.short}</span>
          <span style={{ fontSize: '9px', opacity: 0.5, marginLeft: '2px' }}>▼</span>
        </button>

        {showLangMenu && (
          <div style={styles.langDropdownMenu}>
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setShowLangMenu(false);
                }}
                style={{
                  ...styles.langOptionBtn,
                  backgroundColor: language === lang.code ? '#FDF2F2' : 'transparent',
                  color: language === lang.code ? '#8B0000' : '#334155',
                  fontWeight: language === lang.code ? '700' : '500'
                }}
              >
                <span>{lang.label}</span>
                {language === lang.code && <span style={{ color: '#8B0000', fontWeight: 'bold' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.container}>
        <div style={styles.leftSide}>
          <div style={styles.logoGlow} />

          <div style={styles.heroCenterSection}>
            <h2 style={styles.brandMainTitle}>
              {t('app_name_upper') || 'WELIWITIYA DIVITHURA'}
            </h2>
            <p style={styles.brandSubTitle}>
              {t('pradeshiya_sabha') || 'PRADESHIYA SABHA'}
            </p>

            <div style={styles.largeLogoCircle}>
              <img
                src={pradeshiyaLogo}
                alt="Weliwitiya Divithura Pradeshiya Sabha Logo"
                style={styles.largeLogo}
              />
            </div>

            <h1 style={styles.heroTitle}>
              {t('staff_management_system') || 'Staff Management System'}
            </h1>
            
            <p style={styles.heroSubtitle}>
              {t('hero_description') || 'Smartly manage your staff, leaves, complaints and reports in one secure platform.'}
            </p>

            <div style={styles.securityBadge}>
              <ShieldIcon />
              <span>{t('secure_authorized_system') || 'Secure Authorized System'}</span>
            </div>
          </div>

          <div style={styles.leftFooter}>
            {t('authorized_access_only') || 'Government Official Portal - Authorized Access Only'}
          </div>
        </div>

        <div style={styles.rightSide}>
          <div style={styles.loginCard}>
            <div style={styles.avatarCircle}>
              <UserIcon />
            </div>

            <h2 style={styles.welcomeTitle}>{t('welcome') || 'Welcome'}</h2>
            <p style={styles.welcomeSubtitle}>
              {t('login_instructions') || 'Enter your credentials to access the official portal'}
            </p>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('email') || 'Email'}</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    placeholder="admin@pradeshiya.gov.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{t('password') || 'Password'}</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ ...styles.input, paddingRight: 40 }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  ...(loading ? styles.submitBtnDisabled : {})
                }}
              >
                {loading ? (
                  <span>{t('logging_in') || 'Logging in...'}</span>
                ) : (
                  <span style={styles.btnContent}>
                    <SignIcon />
                   {t('login') || 'Sign In'}
                  </span>
                )}
              </button>
            </form>

            <div style={styles.copyrightText}>
              {t('copyright_text') || '© 2026 Weliwitiya Divithura Pradeshiya Sabha. All rights reserved.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A92A6" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A92A6" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A92A6" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A92A6" strokeWidth="2">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c6.5 0 10 8 10 8a16.4 16.4 0 0 1-2.1 3.3" />
      <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9" />
    </svg>
  );
}

function SignIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  bgDecorationTopRight: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: '50%',
    backgroundColor: '#ffe4e6',
    opacity: 0.6
  },
  bgDecorationBottomLeft: {
    position: 'absolute',
    bottom: -150,
    left: -120,
    width: 450,
    height: 450,
    borderRadius: '50%',
    backgroundColor: '#ffe4e6',
    opacity: 0.5
  },
  bgDecorationMidLeft: {
    position: 'absolute',
    top: '32%',
    left: '7%',
    width: 140,
    height: 140,
    borderRadius: '50%',
    backgroundColor: '#ffe4e6',
    opacity: 0.5
  },
  bgDecorationMidRight: {
    position: 'absolute',
    top: '48%',
    right: '6%',
    width: 130,
    height: 130,
    borderRadius: '50%',
    backgroundColor: '#ffe4e6',
    opacity: 0.45
  },
  pageLanguageSelector: {
    position: 'absolute',
    top: '25px',
    right: '35px',
    zIndex: 10
  },
  langPickerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '38px',
    padding: '0 12px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#8B0000',
    boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
  },
  langDropdownMenu: {
    position: 'absolute',
    right: 0,
    top: '46px',
    width: '135px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
    border: '1px solid #f1f5f9',
    padding: '5px',
    zIndex: 999
  },
  langOptionBtn: {
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '1050px',
    minHeight: '620px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.07)',
    position: 'relative',
    zIndex: 2
  },
  leftSide: {
    flex: '1',
    backgroundColor: '#8B0000',
    padding: '40px 35px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    borderTopLeftRadius: '24px',
    borderBottomLeftRadius: '24px',
    position: 'relative',
    overflow: 'hidden'
  },
  logoGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    top: -100,
    right: -80
  },
  heroCenterSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    margin: 'auto 0',
    position: 'relative',
    zIndex: 2,
    width: '100%'
  },
  brandMainTitle: {
    margin: '0 0 2px',
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  brandSubTitle: {
    margin: '0 0 22px',
    fontSize: '15px',
    fontWeight: '700',
    opacity: '0.92',
    color: '#ffffff',
    letterSpacing: '0.8px',
    textTransform: 'uppercase'
  },
  largeLogoCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px',
    boxSizing: 'border-box',
    boxShadow: '0 14px 35px rgba(0,0,0,0.25)',
    marginBottom: '22px'
  },
  largeLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  heroTitle: {
    fontSize: '26px',
    fontWeight: '800',
    lineHeight: '1.25',
    margin: '0 0 10px'
  },
  heroSubtitle: {
    fontSize: '13px',
    lineHeight: '1.6',
    opacity: '0.88',
    margin: '0 0 20px',
    maxWidth: '340px'
  },
  securityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.22)',
    fontSize: '12px',
    fontWeight: '600'
  },
  leftFooter: {
    fontSize: '11px',
    opacity: '0.75',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },
  rightSide: {
    flex: '1.1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc'
  },
  loginCard: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #f1f5f9'
  },
  avatarCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#FDF2F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1E293B',
    margin: '0 0 6px'
  },
  welcomeSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '0 0 28px'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'left'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    height: '44px',
    padding: '0 12px 0 38px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0F172A',
    backgroundColor: '#FAFAFA'
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex'
  },
  submitBtn: {
    width: '100%',
    height: '46px',
    backgroundColor: '#8B0000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 12px rgba(139, 0, 0, 0.25)'
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  copyrightText: {
    marginTop: '28px',
    fontSize: '11px',
    color: '#94A3B8',
    lineHeight: '1.4'
  }
};

export default Login;