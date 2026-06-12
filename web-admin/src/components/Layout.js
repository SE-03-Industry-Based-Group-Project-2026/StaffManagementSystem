import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import AppIcon from './AppIcon';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';
import govEmblem from '../assets/gov-emblem.png';
import { applyTheme } from '../utils/colors';
import '../styles/pro-admin.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  
  const [staffMenuOpen, setStaffMenuOpen] = useState(() => ['/staff', '/profile-requests'].includes(location.pathname));
  const [leaveMenuOpen, setLeaveMenuOpen] = useState(() => ['/leave-requests', '/leave-types', '/my-leave'].includes(location.pathname));

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } 
    catch { return {}; }
  })();

  const role = user.role || user.role_name || 'Admin';


  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('supabase_token');
    navigate('/login');
  };

  function getRoleText(roleName, t) {
    if (!t || typeof t !== 'function') return roleName;
    const roles = { 'Praja Officer': 'praja_officer', 'Admin': 'admin', 'Secretary': 'secretary', 'Chairman': 'chairman' };
    return roles[roleName] ? t(roles[roleName]) : roleName;
  }


  return (
    <div className="pro-layout" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
<img 
  src={pradeshiyaLogo} 
  alt="Watermark" 
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    opacity: 0.06,
    zIndex: 0,
    pointerEvents: 'none'
  }}
/>
      <aside className="pro-sidebar">
        <div className="pro-brand">
          <div className="pro-logo-img-wrap"><img src={pradeshiyaLogo} alt="Logo" className="pro-logo-img" /></div>
          <div>
            <h2>{t('app_name') || 'Pradeshiya Sabha'}</h2>
            <p>{t('administrative_console')}</p>
          </div>
        </div>

        <nav className="pro-nav" style={{ padding: '10px' }}>
          <button className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')} type="button">
            <AppIcon name="dashboard" size={19} /> <span>{t('dashboard')}</span>
          </button>

          {role === 'Admin' && (
            <div className="menu-group">
              <button type="button" className={['/staff', '/profile-requests'].includes(location.pathname) ? 'group-title active-group' : 'group-title'} onClick={() => setStaffMenuOpen(!staffMenuOpen)}>
                <AppIcon name="users" size={19} /> <span>{t('staff_management')}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px' }}>{staffMenuOpen ? '▼' : '►'}</span>
              </button>
              {staffMenuOpen && (
                <div className="sub-menu" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                  <button className={location.pathname === '/staff' ? 'active' : ''} onClick={() => navigate('/staff')} type="button">{t('staff_list')}</button>
                  <button className={location.pathname === '/profile-requests' ? 'active' : ''} onClick={() => navigate('/profile-requests')} type="button">{t('profile_requests')}</button>
                </div>
              )}
            </div>
          )}

          {role === 'Admin' && (
            <button className={location.pathname === '/departments' ? 'active' : ''} onClick={() => navigate('/departments')} type="button">
              <AppIcon name="building" size={19} /> <span>{t('departments')}</span>
            </button>
          )}

          <div className="menu-group">
            <button type="button" className={['/leave-requests', '/leave-types', '/my-leave'].includes(location.pathname) ? 'group-title active-group' : 'group-title'} onClick={() => setLeaveMenuOpen(!leaveMenuOpen)}>
              <AppIcon name="clipboard" size={19} /> <span>{t('leave_management')}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px' }}>{leaveMenuOpen ? '▼' : '►'}</span>
            </button>
            {leaveMenuOpen && (
              <div className="sub-menu" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                <button className={location.pathname.includes('leave') ? 'active' : ''} onClick={() => navigate(role === 'Staff' ? '/my-leave' : '/leave-requests')} type="button">{t('leave_requests')}</button>
                {role === 'Admin' && <button className={location.pathname === '/leave-types' ? 'active' : ''} onClick={() => navigate('/leave-types')} type="button">{t('leave_types')}</button>}
              </div>
            )}
          </div>

          <button className={location.pathname === '/attendance' ? 'active' : ''} onClick={() => navigate('/attendance')} type="button">
            <AppIcon name="check" size={19} /> <span>{t('attendance')}</span>
          </button>

          
          <button className={location.pathname === '/announcements' ? 'active' : ''} onClick={() => navigate('/announcements')} type="button">
            <AppIcon name="megaphone" size={19} /> <span>{t('announcements')}</span>
          </button>

          <button className={location.pathname === '/complaints' ? 'active' : ''} onClick={() => navigate('/complaints')} type="button">
            <AppIcon name="alert" size={19} /> <span>{t('complaints')}</span>
          </button>

          <button className={location.pathname === '/reports' ? 'active' : ''} onClick={() => navigate('/reports')} type="button">
            <AppIcon name="report" size={19} /> <span>{t('reports')}</span>
          </button>

          {role === 'Admin' && (
            <button className={location.pathname === '/audit-logs' ? 'active' : ''} onClick={() => navigate('/audit-logs')} type="button">
              <AppIcon name="audit" size={19} /> <span>{t('audit_logs')}</span>
            </button>
          )}
        </nav>

        <div className="pro-sidebar-footer">
          <button className="pro-logout" onClick={handleLogout} type="button">
            <AppIcon name="logout" size={19} /> <span style={{ marginLeft: 8 }}>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <main className="pro-main" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <header className="pro-topbar" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="pro-topbar-title">
            <img src={govEmblem} alt="Emblem" className="pro-emblem" />
            <div>
              <div className="pro-kicker">{t('civic_governance_system')}</div>
              <h1>{getRoleText(role, t)} {t('workspace')}</h1>
            </div>
          </div>
          <div className="pro-topbar-actions">
            <select className="pro-lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option>
            </select>
          </div>
        </header>

       <motion.section 
  className="pro-content" 
  key={location.pathname}
  initial={{ opacity: 0, x: 20 }} 
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25, ease: "easeInOut" }}
>
  {children}
</motion.section>
      </main>
    </div>
  );
}
export default Layout;