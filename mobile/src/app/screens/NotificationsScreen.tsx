// app/screens/NotificationsScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang: Language;
  onBack?: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

// 🔥 භාෂාවන්ට අදාළ Columns ටික Interface එකට එකතු කළා
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  title_en?: string;
  title_si?: string;
  title_ta?: string;
  message_en?: string;
  message_si?: string;
  message_ta?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  notification_type?: string | null;
  related_entity?: string | null;
  related_id?: number | null;
}

const L = {
  si: {
    title: 'සියලු දැනුම්දීම්',
    subtitle: 'පසුගිය පැය 24 තුළ ලැබුණු දැනුම්දීම්',
    back: 'ආපසු',
    noData: 'පසුගිය පැය 24 තුළ දැනුම්දීම් නොමැත',
    loading: 'දැනුම්දීම් ලබාගනිමින්...',
    error: 'දැනුම්දීම් ලබාගැනීමට නොහැකි විය',
    retry: 'නැවත උත්සාහ කරන්න',
    read: 'කියවා ඇත',
    new: 'නව',
  },

  en: {
    title: 'All Notifications',
    subtitle: 'Notifications received during the last 24 hours',
    back: 'Back',
    noData: 'No notifications during the last 24 hours',
    loading: 'Loading notifications...',
    error: 'Unable to load notifications',
    retry: 'Try Again',
    read: 'READ',
    new: 'NEW',
  },

  ta: {
    title: 'அனைத்து அறிவிப்புகள்',
    subtitle: 'கடந்த 24 மணித்தியாலங்களில் பெறப்பட்ட அறிவிப்புகள்',
    back: 'பின்னே',
    noData: 'கடந்த 24 மணித்தியாலங்களில் அறிவிப்புகள் இல்லை',
    loading: 'அறிவிப்புகள் ஏற்றப்படுகின்றன...',
    error: 'அறிவிப்புகளை ஏற்ற முடியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    read: 'படிக்கப்பட்டது',
    new: 'புதிய',
  },
};

const normalize = (value?: string | null) =>
  String(value || '').trim().toLowerCase();

const getAppearance = (item: NotificationItem) => {
  const type = normalize(item.notification_type);
  const entity = normalize(item.related_entity);

  if (
    type === 'announcement' ||
    entity === 'announcements'
  ) {
    return {
      icon: 'megaphone-outline' as const,
      color: '#C62828',
      background: '#FDECEC',
      dot: '#D32F2F',
    };
  }

  if (type === 'task' || entity === 'tasks') {
    return {
      icon: 'clipboard-outline' as const,
      color: '#6A1B9A',
      background: '#F3E8FF',
      dot: '#7B1FA2',
    };
  }

  if (
    type === 'leave' ||
    entity === 'leave_requests'
  ) {
    return {
      icon: 'calendar-outline' as const,
      color: '#15803D',
      background: '#DCFCE7',
      dot: '#16A34A',
    };
  }

  if (
    type === 'complaint' ||
    entity === 'complaints'
  ) {
    return {
      icon: 'chatbubble-ellipses-outline' as const,
      color: '#1A3A5C',
      background: '#E9F1F8',
      dot: '#1A3A5C',
    };
  }

  return {
    icon: 'notifications-outline' as const,
    color: '#7A1020',
    background: '#F7EFF1',
    dot: '#7A1020',
  };
};

export default function NotificationsScreen({
  selectedLang,
  onBack,
  onNavigate,
}: Props) {
  const t = L[selectedLang] ?? L.en;
  const { font } = useFont();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [dbUserId, setDbUserId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [errorState, setErrorState] =
    useState(false);

  const twentyFourHoursAgo = useMemo(() => {
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }, []);

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);

      setErrorState(false);

      try {
        let userId = dbUserId;

        if (!userId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setErrorState(true);
            return;
          }

          const { data: profile } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

          if (!profile) {
            setErrorState(true);
            return;
          }

          userId = profile.id;
          setDbUserId(profile.id);
        }

        // Remove this user's notifications older than 24 hours.
        // The database cleanup job (SQL below) also removes old records globally.
        const { error: cleanupError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId)
          .lt('created_at', twentyFourHoursAgo);

        if (cleanupError) {
          console.warn('Notification 24-hour cleanup warning:', cleanupError);
        }

        // 🔥 Database එකෙන් title_si, message_si වගේ භාෂා 3ම අදින්න හැදුවා
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            id,
            title,
            message,
            title_en,
            title_si,
            title_ta,
            message_en,
            message_si,
            message_ta,
            is_read,
            created_at,
            read_at,
            notification_type,
            related_entity,
            related_id
          `)
          .eq('user_id', userId)
          .gte('created_at', twentyFourHoursAgo)
          .order('created_at', {
            ascending: false,
          });

        if (error) {
          console.error(
            'All notification load error:',
            error
          );

          setErrorState(true);
          return;
        }

        setNotifications(
          (data || []) as NotificationItem[]
        );
      } catch (error) {
        console.error(
          'Notifications exception:',
          error
        );

        setErrorState(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dbUserId, twentyFourHoursAgo]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const openNotification = async (
    notification: NotificationItem
  ) => {
    if (!notification.is_read) {
      const readAt = new Date().toISOString();

      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: readAt,
        })
        .eq('id', notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at: readAt,
              }
            : item
        )
      );
    }

    const type = normalize(
      notification.notification_type
    );

    const entity = normalize(
      notification.related_entity
    );

    if (
      type === 'announcement' ||
      entity === 'announcements'
    ) {
      onNavigate('Announcements', {
        announcementId: notification.related_id,
        notificationId: notification.id,
      });

      return;
    }

    if (type === 'task' || entity === 'tasks') {
      onNavigate('TaskDetails', {
        taskId: notification.related_id,
        notificationId: notification.id,
      });

      return;
    }

    if (
      type === 'leave' ||
      entity === 'leave_requests'
    ) {
      onNavigate('LeaveBalance', {
        requestId: notification.related_id,
        notificationId: notification.id,
        openHistory: true,
      });

      return;
    }

    if (
      type === 'complaint' ||
      entity === 'complaints'
    ) {
      onNavigate('ComplaintStatus', {
        complaintId: notification.related_id,
      });
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(
      selectedLang === 'si'
        ? 'si-LK'
        : selectedLang === 'ta'
        ? 'ta-LK'
        : 'en-LK',
      {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }
    );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#7A1020"
        translucent={false}
      />

      <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="chevron-back"
            size={font(18)}
            color="#FFFFFF"
          />

          <Text
            style={[
              styles.backText,
              { fontSize: font(12) },
            ]}
          >
            {t.back}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={font(27)}
              color="#7A1020"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.headerTitle,
                { fontSize: font(23) },
              ]}
            >
              {t.title}
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  fontSize: font(12),
                  lineHeight: font(17),
                },
              ]}
            >
              {t.subtitle}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={['#7A1020']}
            onRefresh={() => {
              setRefreshing(true);
              loadNotifications(false);
            }}
          />
        }
      >
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator
              size="large"
              color="#7A1020"
            />

            <Text style={styles.stateText}>
              {t.loading}
            </Text>
          </View>
        ) : errorState ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="cloud-offline-outline"
              size={35}
              color="#B91C1C"
            />

            <Text style={styles.stateText}>
              {t.error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadNotifications()}
            >
              <Text style={styles.retryText}>
                {t.retry}
              </Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.stateCard}>
            <Ionicons
              name="notifications-off-outline"
              size={38}
              color="#7A1020"
            />

            <Text style={styles.stateText}>
              {t.noData}
            </Text>
          </View>
        ) : (
          notifications.map((item) => {
            const appearance = getAppearance(item);
            const unread = !item.is_read;

            // 🔥 මෙතන තමයි දැනට තියෙන Language එක බලලා අදාල Title එකයි Message එකයි තෝරගන්නේ
            const displayTitle = selectedLang === 'si' ? (item.title_si || item.title) : selectedLang === 'ta' ? (item.title_ta || item.title) : (item.title_en || item.title);
            const displayMessage = selectedLang === 'si' ? (item.message_si || item.message) : selectedLang === 'ta' ? (item.message_ta || item.message) : (item.message_en || item.message);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  unread
                    ? styles.unreadCard
                    : styles.readCard,
                ]}
                onPress={() => openNotification(item)}
              >
                <View style={styles.iconArea}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: unread
                          ? appearance.background
                          : '#F4F6F8',
                      },
                    ]}
                  >
                    <Ionicons
                      name={appearance.icon}
                      size={font(20)}
                      color={
                        unread
                          ? appearance.color
                          : '#718096'
                      }
                    />
                  </View>

                  {unread && (
                    <View
                      style={[
                        styles.redDot,
                        {
                          backgroundColor:
                            appearance.dot,
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardTop}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { fontSize: font(14) },
                      ]}
                    >
                      {displayTitle} {/* 🔥 නිවැරදි භාෂාවෙන් පෙන්වයි */}
                    </Text>

                    <Text
                      style={[
                        styles.cardTime,
                        { fontSize: font(9) },
                      ]}
                    >
                      {formatDate(item.created_at)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.cardMessage,
                      {
                        fontSize: font(12),
                        lineHeight: font(18),
                      },
                    ]}
                    numberOfLines={4}
                  >
                    {displayMessage} {/* 🔥 නිවැරදි භාෂාවෙන් පෙන්වයි */}
                  </Text>

                  <View style={styles.cardBottom}>
                    <View
                      style={
                        unread
                          ? styles.newBadge
                          : styles.readBadge
                      }
                    >
                      <Text
                        style={[
                          unread
                            ? styles.newText
                            : styles.readText,
                          { fontSize: font(9) },
                        ]}
                      >
                        {unread ? t.new : t.read}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={font(16)}
                      color="#7A1020"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4E8EA',
  },

  header: {
    backgroundColor: '#7A1020',
    paddingTop: 53,
    paddingHorizontal: 20,
    paddingBottom: 23,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    elevation: 10,
  },

  headerCircle1: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -45,
    top: -65,
  },

  headerCircle2: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: 'rgba(255,255,255,0.04)',
    left: -15,
    bottom: -35,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#9E1A2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 15,
  },

  backText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginTop: 4,
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  notificationCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.2,
    elevation: 2,
  },

  unreadCard: {
    backgroundColor: '#E9F8EF',
    borderColor: '#A7D9B8',
  },

  readCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },

  iconArea: {
    width: 46,
    marginRight: 11,
    position: 'relative',
  },

  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  redDot: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#E9F8EF',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  cardTitle: {
    flex: 1,
    color: '#1A2940',
    fontWeight: '900',
  },

  cardTime: {
    color: '#8492A6',
    fontWeight: '700',
  },

  cardMessage: {
    color: '#56677C',
    fontWeight: '600',
    marginTop: 6,
  },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  newBadge: {
    backgroundColor: '#CDEFD8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  newText: {
    color: '#166534',
    fontWeight: '900',
  },

  readBadge: {
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  readText: {
    color: '#718096',
    fontWeight: '900',
  },

  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 25,
  },

  stateText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },

  retryButton: {
    backgroundColor: '#7A1020',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 14,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});