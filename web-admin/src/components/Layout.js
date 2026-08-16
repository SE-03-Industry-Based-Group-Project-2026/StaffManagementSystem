import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import AppIcon from './AppIcon';
import pradeshiyaLogo from '../assets/pradeshiya-logo.png';
import govEmblem from '../assets/gov-emblem.png';
import '../styles/pro-admin.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const activeLanguage = String(
    language ||
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [staffMenuOpen, setStaffMenuOpen] = useState(() =>
    ['/staff', '/profile-requests'].includes(location.pathname)
  );
  const [leaveMenuOpen, setLeaveMenuOpen] = useState(() =>
    ['/leave-requests', '/leave-types', '/my-leave'].includes(location.pathname)
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchLatestUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*, roles(role_name, role_name_si, role_name_ta)')
        .eq('auth_id', session.user.id)
        .single();

      if (!error && data) {
        const mergedUser = { ...user, ...data, roles: data.roles };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }
    } catch (err) {
      console.error('Error fetching latest user data in layout:', err);
    }
  };

  useEffect(() => {
    fetchLatestUserData();

    const handleUserUpdate = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(updatedUser);
        fetchLatestUserData();
      } catch (err) {
        console.error('Error updating user state:', err);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user, language]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const markRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        setUnreadCount(updated.filter((n) => !n.is_read).length);
        return updated;
      });
    }
  };

  const getNotificationContent = (notification) => {
    let finalTitle = language === 'si' 
      ? (notification.title_si || notification.title_en || notification.title)
      : language === 'ta' 
      ? (notification.title_ta || notification.title_en || notification.title)
      : (notification.title_en || notification.title);

    let finalMessage = language === 'si' 
      ? (notification.message_si || notification.message_en || notification.message)
      : language === 'ta' 
      ? (notification.message_ta || notification.message_en || notification.message)
      : (notification.message_en || notification.message);

    if (notification.payload && typeof notification.payload === 'object') {
      const payload = { ...notification.payload };
      Object.entries(payload).forEach(([key, value]) => {
        finalMessage = String(finalMessage).replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? '');
        finalTitle = String(finalTitle).replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? '');
      });
    }

    return {
      title: finalTitle || 'Notification',
      message: finalMessage || 'No details available.'
    };
  };

  const openNotificationItem = async (n) => {
    if (!n.is_read) {
      await markRead(n.id);
    }
    setNotifDropdownOpen(false);

    const titleText = String(n.title || n.title_en || '').toLowerCase();
    const entityText = String(n.related_entity || '').toLowerCase();
    const typeText = String(n.notification_type || '').toLowerCase();

    if (titleText.includes('profile') || titleText.includes('පැතිකඩ') || entityText.includes('profile') || entityText.includes('change') || typeText.includes('profile')) {
      navigate('/profile-requests', { state: { openId: n.related_id } });
      return;
    }
    if (entityText.includes('leave_requests') || titleText.includes('leave') || titleText.includes('නිවාඩු')) {
      navigate('/leave-requests', { state: { openId: n.related_id } });
      return;
    }
    if (entityText.includes('complaint') || titleText.includes('complaint') || titleText.includes('පැමිණිල්ල')) {
      navigate('/complaints', { state: { openId: n.related_id } });
      return;
    }
    if (entityText.includes('task') || titleText.includes('task') || titleText.includes('කාර්යය')) {
      navigate('/tasks', { state: { openId: n.related_id } });
      return;
    }
    if (entityText.includes('announcement') || titleText.includes('announcement') || titleText.includes('නිවේදනය')) {
      navigate('/announcements', { state: { openId: n.related_id } });
      return;
    }
    navigate('/notifications');
  };

  const getRoleDisplayName = (userObj) => {
    const rolesObj = userObj?.roles;
    if (rolesObj) {
      if (isSinhala && rolesObj.role_name_si) return rolesObj.role_name_si;
      if (isTamil && rolesObj.role_name_ta) return rolesObj.role_name_ta;
    }

    const rawRole = String(
      userObj?.roles?.role_name ||
      userObj?.role ||
      userObj?.role_name ||
      'Admin'
    ).toLowerCase().trim();

    if (isSinhala) {
      if (rawRole.includes('admin')) return 'පරිපාලක';
      if (rawRole.includes('cc')) return 'සම්බන්ධීකරණ නිලධාරී';
      if (rawRole.includes('chairman')) return 'සභාපති';
      if (rawRole.includes('secretary')) return 'ලේකම්';
      if (rawRole.includes('subject')) return 'විෂය භාර නිලධාරී';
      if (rawRole.includes('department head')) return 'දෙපාර්තමේන්තු ප්‍රධානී';
      if (rawRole.includes('staff')) return 'කාර්ය මණ්ඩලය';
    } else if (isTamil) {
      if (rawRole.includes('admin')) return 'நிர்வாகி';
      if (rawRole.includes('cc')) return 'ஒருங்கிணைப்பாளர்';
      if (rawRole.includes('chairman')) return 'தலைவர்';
      if (rawRole.includes('secretary')) return 'செயலாளர்';
      if (rawRole.includes('subject')) return 'விடய அதிகாரி';
      if (rawRole.includes('department head')) return 'திணைக்கள தலைவர்';
      if (rawRole.includes('staff')) return 'ஊழியர்';
    }

    return userObj?.roles?.role_name || userObj?.role || userObj?.role_name || 'Admin';
  };

  const getSafeRole = (userObj) => {
    if (!userObj) return 'Admin';
    if (typeof userObj.roles === 'string') return userObj.roles;
    if (userObj.roles?.role_name) return userObj.roles.role_name;
    if (userObj.role) return userObj.role;
    if (userObj.role_name) return userObj.role_name;
    return 'Admin';
  };

  const role = String(getSafeRole(user)).trim();
  const isAdmin = role.toLowerCase() === 'admin';
  const roleLower = role.toLowerCase();
  
  const isManagementRole = ['chairman', 'secretary', 'subject officer', 'cc officer', 'department head'].includes(roleLower);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('supabase_token');
    navigate('/login');
  };

  const getDisplayLangCode = () => {
    if (activeLanguage.startsWith('si')) return 'සිංහල';
    if (activeLanguage.startsWith('ta')) return 'தமிழ்';
    return 'EN';
  };

  const userAvatar = user?.avatar_url || user?.profile_photo || user?.profile_image;

  return (
    <div className="pro-layout" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <img src={pradeshiyaLogo} alt="Watermark" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', opacity: 0.06, zIndex: 0, pointerEvents: 'none' }} />

      <aside className="pro-sidebar">
        <div className="pro-brand">
          <div className="pro-logo-img-wrap"><img src={pradeshiyaLogo} alt="Logo" className="pro-logo-img" /></div>
          <div><h2>{tr('app_name', 'Pradeshiya Sabha')}</h2><p>{tr('administrative_console', 'Administrative Console')}</p></div>
        </div>

        <nav className="pro-nav" style={{ padding: '10px' }}>
          <button className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')} type="button">
            <AppIcon name="dashboard" size={19} /> <span>{tr('dashboard', 'Dashboard')}</span>
          </button>

          {(isAdmin || isManagementRole) && (
            <div className="menu-group">
              <button
                type="button"
                className={['/staff', '/profile-requests'].includes(location.pathname) ? 'group-title active-group' : 'group-title'}
                onClick={() => setStaffMenuOpen(!staffMenuOpen)}
              >
                <AppIcon name="users" size={19} /> <span>{tr('staff_management', 'Staff Management')}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px' }}>{staffMenuOpen ? '▼' : '►'}</span>
              </button>
              {staffMenuOpen && (
                <div className="sub-menu" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                  <button className={location.pathname === '/staff' ? 'active' : ''} onClick={() => navigate('/staff')} type="button">
                    {tr('staff_list', 'Staff List')}
                  </button>
                  {isAdmin && (
                    <button className={location.pathname === '/profile-requests' ? 'active' : ''} onClick={() => navigate('/profile-requests')} type="button">
                      {tr('profile_requests', 'Profile Requests')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {(isAdmin || isManagementRole) && (
            <button className={location.pathname === '/departments' ? 'active' : ''} onClick={() => navigate('/departments')} type="button">
              <AppIcon name="building" size={19} /><span>{tr('departments', 'Departments')}</span>
            </button>
          )}

          {!isAdmin && roleLower !== 'department head' && (
            <div className="menu-group">
              <button
                type="button"
                className={['/leave-requests', '/leave-types', '/my-leave'].includes(location.pathname) ? 'group-title active-group' : 'group-title'}
                onClick={() => setLeaveMenuOpen(!leaveMenuOpen)}
              >
                <AppIcon name="clipboard" size={19} />
                <span>{tr('leave_management', 'Leave Management')}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px' }}>{leaveMenuOpen ? '▼' : '►'}</span>
              </button>
              {leaveMenuOpen && (
                <div className="sub-menu" style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                  <button className={location.pathname.includes('leave') ? 'active' : ''} onClick={() => navigate(role === 'Staff' ? '/my-leave' : '/leave-requests')} type="button">
                    {tr('leave_requests', 'Leave Requests')}
                  </button>
                  <button className={location.pathname === '/leave-types' ? 'active' : ''} onClick={() => navigate('/leave-types')} type="button">
                    {tr('leave_types', 'Leave Types')}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isAdmin && (
            <button className={location.pathname === '/announcements' ? 'active' : ''} onClick={() => navigate('/announcements')} type="button">
              <AppIcon name="megaphone" size={19} /> <span>{tr('announcements', 'Announcements')}</span>
            </button>
          )}

          {roleLower !== 'admin' && roleLower !== 'subject officer' && (
            <button className={location.pathname === '/complaints' ? 'active' : ''} onClick={() => navigate('/complaints')} type="button">
              <AppIcon name="alert" size={19} /><span>{tr('complaints', 'Complaints')}</span>
            </button>
          )}

          {(roleLower === 'chairman' || roleLower === 'secretary' || roleLower === 'department head') && (
            <button className={location.pathname === '/tasks' ? 'active' : ''} onClick={() => navigate('/tasks')} type="button">
              <AppIcon name="clipboard" size={19} /><span>{tr('task_allocation', 'Task Allocation')}</span>
            </button>
          )}
          {isManagementRole && (
            <button className={location.pathname === '/reports' ? 'active' : ''} onClick={() => navigate('/reports')} type="button">
              <AppIcon name="report" size={19} /> <span>{tr('reports', 'Reports')}</span>
            </button>
          )}

          {isAdmin && (
            <>
              <button className={location.pathname === '/audit-logs' ? 'active' : ''} onClick={() => navigate('/audit-logs')} type="button">
                <AppIcon name="audit" size={19} /> <span>{tr('audit_logs', 'Audit Logs')}</span>
              </button>
              <button className={location.pathname === '/system-privileges' ? 'active' : ''} onClick={() => navigate('/system-privileges')} type="button">
                <AppIcon name="shield" size={19} /> <span>{tr('system_privileges', 'System Privileges')}</span>
              </button>
            </>
          )}
        </nav>

        <div className="pro-sidebar-footer">
          <button className="pro-logout" onClick={handleLogout} type="button">
            <AppIcon name="logout" size={19} /> <span style={{ marginLeft: 8 }}>{tr('logout', 'Logout')}</span>
          </button>
        </div>
      </aside>

      <main className="pro-main" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <header className="pro-topbar" style={{ backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
          <div className="pro-topbar-title">
            <img src={govEmblem} alt="Emblem" className="pro-emblem" />
            <div>
              <div className="pro-kicker">{tr('civic_governance_system', 'Civic Governance System')}</div>
              <h1>{getRoleDisplayName(user)} {tr('workspace', 'Workspace')}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            <div ref={langDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  outline: 'none'
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#8B0000' }}>{getDisplayLangCode()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    width: '130px',
                    zIndex: 1000,
                    padding: '4px 0'
                  }}
                >
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'si', label: 'සිංහල' },
                    { code: 'ta', label: 'தமிழ்' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setLangDropdownOpen(false);
                      }}
                      type="button"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        backgroundColor: activeLanguage === item.code ? '#fef2f2' : 'transparent',
                        color: activeLanguage === item.code ? '#8B0000' : '#1e293b',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: activeLanguage === item.code ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{item.label}</span>
                      {activeLanguage === item.code && <span style={{ color: '#8B0000' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={notifDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                type="button"
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#1e293b',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
                title={tr('notifications', 'Notifications')}
              >
                <AppIcon name="bell" size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      minWidth: '18px',
                      textAlign: 'center',
                      lineHeight: '14px'
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                    width: '380px',
                    maxHeight: '480px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    padding: '16px'
                  }}
                >
                  {unreadCount > 0 && (
                    <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                      <button
                        onClick={markAllAsRead}
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8B0000',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline'
                        }}
                      >
                        {t('mark_all_read') || 'Mark all as read'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {t('notifications') || 'Notifications'}
                    </h3>
                    
                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                        flexShrink: 0
                      }}
                      title="Close"
                    >
                      <AppIcon name="x" size={18} />
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      {t('no_notifications') || 'No notifications found'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notifications.map((n) => {
                        const { title, message } = getNotificationContent(n);
                        return (
                          <div
                            key={n.id}
                            onClick={() => openNotificationItem(n)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '10px',
                              backgroundColor: n.is_read ? '#f8fafc' : '#fef2f2',
                              border: '1px solid #e2e8f0',
                              borderLeft: `4px solid ${n.is_read ? '#cbd5e1' : '#8B0000'}`,
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              position: 'relative'
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => deleteNotification(n.id, e)}
                              title="Delete"
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px',
                                borderRadius: '50%'
                              }}
                            >
                              <AppIcon name="x" size={14} />
                            </button>

                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '4px', paddingRight: '16px' }}>
                              {title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', marginBottom: '6px' }}>
                              {message}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        navigate('/notifications');
                      }}
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8B0000',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {t('view_all') || 'View All Notifications'} →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/my-profile')}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              title={tr('my_profile', 'My Profile')}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  color: '#8B0000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
            </button>

          </div>
        </header>

        <motion.section className="pro-content" key={location.pathname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
          {children}
        </motion.section>
      </main>
    </div>
  );
}

export default Layout;