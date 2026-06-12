import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, EmptyState } from '../components/PageParts';
import AppIcon from '../components/AppIcon';

function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(80);

    setNotifications(data || []);
  };

  const markRead = async (id) => {
    await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id);

    loadNotifications();
  };

  const openNotification = async (n) => {
    if (!n.is_read) {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', n.id);
    }

    if (n.related_entity === 'leave_requests') {
      navigate('/leave-requests', { state: { openId: n.related_id } });
      return;
    }
    if (n.related_entity === 'complaints') {
      navigate('/complaints', { state: { openId: n.related_id } });
      return;
    }
    if (n.related_entity === 'announcements') {
      navigate('/announcements', { state: { openId: n.related_id } });
      return;
    }
    if (n.related_entity === 'profile_request') {
      navigate('/profile-requests', { state: { openId: n.related_id } });
      return;
    }

    loadNotifications();
  };

  return (
    <Layout>
      <PageHero
        icon="bell"
        title={t('notifications')}
        subtitle={t('notifications_subtitle')}
      />

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head">
          <h3 style={{ color: 'var(--text)' }}>{t('my_notifications')}</h3>
          <span className="badge badge-neutral">
            {notifications.length} {t('records')}
          </span>
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon="bell" title={t('no_notifications')} />
        ) : (
          <div className="pro-grid">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="pro-card notification-click-card"
                onClick={() => openNotification(n)}
                style={{
                  margin: 0,
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${n.is_read ? 'var(--gray-300)' : '#8B0000'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>{n.title}</h3>
                    <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>
                      {n.message}
                    </p>
                    <span className="badge badge-neutral">
                      {n.is_auto_generated ? t('automatic') : t('manual')}
                    </span>
                    <span style={{ marginLeft: 8 }} className="badge badge-neutral">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {!n.is_read && (
                    <button
                      className="btn btn-soft"
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(n.id);
                      }}
                      type="button"
                    >
                      <AppIcon name="check" />
                      {t('mark_read')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Notifications;