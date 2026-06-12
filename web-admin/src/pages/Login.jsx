import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import { showError, showSuccess } from '../services/toastService';
import { colors } from '../utils/colors';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';
import govEmblem from '../assets/gov-emblem.png';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        showError(error.message);
        setLoading(false);
        return;
      }

      const token = data?.session?.access_token;
      if (!token) {
        showError(t('login_failed_token'));
        setLoading(false);
        return;
      }

      localStorage.setItem('supabase_token', token);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, role_id, roles(role_name)')
        .eq('auth_id', data.user.id)
        .single();

      if (userError || !userData) {
        showError(t('user_profile_not_found'));
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        setLoading(false);
        return;
      }

      const allowedRoles = ['Admin', 'Secretary', 'Chairman', 'Praja Officer'];

      if (!allowedRoles.includes(userData.roles?.role_name)) {
        showError(t('access_denied_authorized'));
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_token');
        setLoading(false);
        return;
      }

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userData.id,
          full_name: userData.full_name,
          role_id: userData.role_id,
          role: userData.roles?.role_name
        })
      );

      showSuccess(`${t('welcome_back')}, ${userData.full_name || t('user')}!`);

      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      showError(t('something_went_wrong'));
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.languageSelector}>
        <button
          onClick={() => setLanguage('en')}
          style={{ ...styles.langBtn, ...(language === 'en' && styles.langBtnActive) }}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('si')}
          style={{ ...styles.langBtn, ...(language === 'si' && styles.langBtnActive) }}
        >
          සිං
        </button>
        <button
          onClick={() => setLanguage('ta')}
          style={{ ...styles.langBtn, ...(language === 'ta' && styles.langBtnActive) }}
        >
          த
        </button>
      </div>

      <div style={styles.loginCard}>
        <div style={styles.logoSection}>

          <div style={styles.logoCircle}>
            <img src={pradeshiyaLogo} alt="Pradeshiya Sabha" style={styles.mainLogo} />
          </div>

          <h1 style={styles.appTitle}>{t('app_name_upper') || 'PRADESHIYA SABHA'}</h1>
          <p style={styles.appSubtitle}>{t('staff_management_system')}</p>
        </div>

        <div style={styles.loginSection}>
          <h2 style={styles.loginTitle}>{t('login')}</h2>
          <p style={styles.loginSubtitle}>
            {t('login_instructions')}
          </p>

          <form onSubmit={handleLogin} style={styles.form} autoComplete="off">
            <div style={styles.formGroup}>
              <label style={styles.label}>{t('email')}</label>
              <input
                type="email"
                name="new-email"
                autoComplete="off"
                placeholder="user@pradeshiya.gov.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t('password')}</label>
              <input
                type="password"
                name="new-password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.loginBtn}>
              {loading ? t('logging_in') : t('login')}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              {t('authorized_access_only')}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes softFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colors.bgPrimary,
    position: 'relative',
    overflow: 'hidden',
    padding: 20
  },
  languageSelector: {
    position: 'absolute',
    top: 24,
    right: 24,
    display: 'flex',
    gap: 8,
    zIndex: 10
  },
  langBtn: {
    padding: '8px 16px',
    border: `1px solid ${colors.gray300}`,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    color: colors.white,
    borderColor: colors.primary
  },
  loginCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    boxShadow: '0 24px 70px rgba(15,23,42,0.14)',
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeInUp .45s ease'
  },
  logoSection: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    padding: 42,
    textAlign: 'center',
    color: colors.white,
    position: 'relative',
    overflow: 'hidden'
  },
  
  logoCircle: {
  width: 130,
  height: 130,
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.96)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 22px',
  padding: 12,
  boxShadow: '0 18px 40px rgba(0,0,0,0.25)'
},
  mainLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  appTitle: {
  fontSize: 32,
  fontWeight: 900,
  margin: '0 0 8px 0',
  letterSpacing: '1px'
},
  appSubtitle: {
    fontSize: 15,
    opacity: 0.92,
    margin: 0
  },
  loginSection: {
    padding: 40
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: colors.textPrimary,
    margin: '0 0 8px 0'
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    margin: '0 0 32px 0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: 8
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: `2px solid ${colors.gray300}`,
    borderRadius: 10,
    fontSize: 15,
    color: colors.textPrimary,
    boxSizing: 'border-box',
    outline: 'none'
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: 8
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: `1px solid ${colors.gray200}`
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    margin: 0
  },
  bgDecoration1: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    opacity: 0.1
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: -140,
    left: -140,
    width: 390,
    height: 390,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    opacity: 0.06
  }
};

export default Login;