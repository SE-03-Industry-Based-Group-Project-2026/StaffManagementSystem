import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, EmptyState } from '../components/PageParts';
import AppIcon from '../components/AppIcon';
import { formatSriLankaDateTime } from '../utils/dateTime';
import { showSuccess, showError } from '../services/toastService';

function Notifications() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); 

  const loadNotifications = async () => {
    if (!user?.id) {
      console.log('NO LOGGED USER ID:', user);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ERROR FETCHING NOTIFICATIONS:', error);
      showError(error.message);
      return;
    }

    setNotifications(data || []);
  };

  const markRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );
    } else {
      showError(error.message);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);

    if (unread.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      showSuccess(t('all_notifications_marked_read'));
    } else {
      showError(error.message);
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

      if (payload.status) {
        const statusMap = {
          Open: 'complaint_status_open',
          'In Progress': 'complaint_status_in_progress',
          Resolved: 'complaint_status_resolved',
          Closed: 'complaint_status_closed',
          Pending: 'task_status_pending',
          Done: 'task_status_done'
        };
        payload.status = t(statusMap[payload.status]) || payload.status;
      }

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

  const openNotification = async (n) => {
    if (!n.is_read) {
      await markRead(n.id);
    }

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
  };
  return (
    <Layout>
      <PageHero
        icon="bell"
        title={t('notifications')}
        subtitle={t('notifications_subtitle')}
      />

      <div
        className="pro-card"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="card-head">
          <span className="badge badge-neutral">
            {notifications.length} {t('records')}
          </span>

          <button
            className="btn btn-soft"
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => !n.is_read)}
          >
            <AppIcon name="check" />
            {t('mark_all_read')}
          </button>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title={t('no_notifications')}
            description={t('no_notifications_found')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {notifications.map((n) => {
              const { title, message } = getNotificationContent(n);
              
              let translatedType = n.notification_type || n.related_entity || 'General';
              const lowerType = String(translatedType).toLowerCase().trim();

              if (lowerType === 'announcement' || lowerType === 'announcements') {
                translatedType = language === 'si' ? 'නිවේදනය' : language === 'ta' ? 'அறிவிப்பு' : 'Announcement';
              } else if (lowerType === 'leave_requests' || lowerType === 'leave') {
                translatedType = language === 'si' ? 'නිවාඩු' : language === 'ta' ? 'விடுப்பு' : 'Leave';
              } else if (lowerType === 'complaints') {
                translatedType = language === 'si' ? 'පැමිණිල්ල' : language === 'ta' ? 'புகார்' : 'Complaint';
              } else if (lowerType === 'tasks') {
                translatedType = language === 'si' ? 'කාර්යය' : language === 'ta' ? 'பணி' : 'Task';
              } else {
                const typeKey = `type_${lowerType.endsWith('s') ? lowerType.slice(0, -1) : lowerType}`;
                translatedType = tr(typeKey, translatedType);
              }

              return (
                <div
                  key={n.id}
                  className="pro-card notification-click-card"
                  onClick={() => openNotification(n)}
                  style={{
                    margin: 0,
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${
                      n.is_read ? 'var(--gray-300)' : '#8B0000'
                    }`,
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>
                        {title}
                      </h3>

                      <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>
                        {message}
                      </p>

                      <span className="badge badge-neutral">
                        {translatedType}
                      </span>

                      <span className="badge badge-neutral" style={{ marginLeft: 8 }}>
                        {n.is_auto_generated ? t('automatic') : t('manual')}
                      </span>

                      <span
                        style={{ marginLeft: 8 }}
                      >
                        {formatSriLankaDateTime(n.created_at)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {!n.is_read && (
                        <button
                          className="btn btn-soft"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                        >
                          <AppIcon name="check" />
                          {t('mark_read')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Notifications;