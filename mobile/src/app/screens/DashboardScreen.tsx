// app/screens/DashboardScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';
import * as Notifications from 'expo-notifications'; 
import AppText from '../AppText';
import {
  showAnnouncementNotification,
  showComplaintNotification,
  showLeaveNotification,
  
  showTaskNotification,
} from '../../lib/notificationService';
import { showProfileUpdateNotification } from '../../lib/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang: Language;
  onNavigate: (screen: string, params?: any) => void;
  onLogout: () => void;
}

// 🔥 භාෂා 3 ටම අදාළ Columns එකතු කළා
interface DashboardNotification {
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

interface UserData {
  fullName: string;
  designation: string;
  avatarUrl: string;
  departmentId?: number | null;
}

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  screen: string;
  color: string;
};

const L = {
  si: {
    welcome: 'ආයුබෝවන්,',
    logout: 'ඉවත්වන්න',
    servicesTitle: 'ප්‍රධාන සේවාවන්',
    updatesTitle: 'නවතම දැනුම්දීම්',
    viewAll: 'සියල්ල',
    details: 'විස්තර',
    newLabel: 'නව',
    readLabel: 'කියවා ඇත',
    noNotifications: 'නව දැනුම්දීමක් නොමැත',
    notificationError: 'දැනුම්දීම් ලබාගැනීමට නොහැකි විය',
    retry: 'නැවත උත්සාහ කරන්න',
    firstLoginTitle: "ආරක්ෂක දැනුම්දීමක්!",
    firstLoginMsg: "ඔබ පද්ධතියට පිවිසෙන පළමු අවස්ථාව මෙය බැවින්, ඔබගේ ගිණුමේ ආරක්ෂාව තහවුරු කරගැනීමට කරුණාකර මුරපදය වෙනස් කරගන්න.",
    changePassBtn: "මුරපදය වෙනස් කරන්න",
    days: ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'],
    months: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
    menu: [
      { icon: 'calendar-outline', label: 'නිවාඩු කළමනාකරණය', sub: 'නිවාඩු ශේෂය, ඉතිහාසය සහ නව අයදුම්පත් කළමනාකරණය', screen: 'LeaveBalance', color: '#7A1020' },
      { icon: 'clipboard-outline', label: 'කාර්ය පැවරීම්', sub: 'ඔබට සහ ඔබගේ අංශයට පැවරූ කාර්යයන් බලන්න', screen: 'TaskAllocation', color: '#6A1B9A' },
      { icon: 'chatbubble-ellipses-outline', label: 'පැමිණිලි කළමනාකරණය', sub: 'පැමිණිලි ඉදිරිපත් කිරීම සහ තත්ත්වය පරීක්ෂා කිරීම', screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline', label: 'මගේ පරිශීලක ගිණුම', sub: 'පුද්ගලික පැතිකඩ සහ ගිණුම් සැකසීම්', screen: 'Profile', color: '#1A5C3A' },
    ] as MenuItem[],
  },
  en: {
    welcome: 'Welcome,',
    logout: 'Log Out',
    servicesTitle: 'MAIN SERVICES',
    updatesTitle: 'RECENT UPDATES',
    viewAll: 'View All',
    details: 'Details',
    newLabel: 'NEW',
    readLabel: 'READ',
    noNotifications: 'No new notifications',
    notificationError: 'Unable to load notifications',
    retry: 'Try Again',
    firstLoginTitle: "Security Notice!",
    firstLoginMsg: "Since this is your first time logging in with admin credentials, please change your password to secure your account.",
    changePassBtn: "Change Password Now",
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    menu: [
      { icon: 'calendar-outline', label: 'Leave Management', sub: 'Check leave balance, history and submit new requests', screen: 'LeaveBalance', color: '#7A1020' },
      { icon: 'clipboard-outline', label: 'Task Allocation', sub: 'View tasks assigned to you or your department', screen: 'TaskAllocation', color: '#6A1B9A' },
      { icon: 'chatbubble-ellipses-outline', label: 'Complaints Hub', sub: 'Submit and track departmental complaints', screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline', label: 'My Account Settings', sub: 'View profile and update account information', screen: 'Profile', color: '#1A5C3A' },
    ] as MenuItem[],
  },
  ta: {
    welcome: 'வணக்கம்,',
    logout: 'வெளியேறவும்',
    servicesTitle: 'முக்கிய சேவைகள்',
    updatesTitle: 'அண்மைய அறிவிப்புகள்',
    viewAll: 'அனைத்தும்',
    details: 'விவரங்கள்',
    newLabel: 'புதிய',
    readLabel: 'படிக்கப்பட்டது',
    noNotifications: 'புதிய அறிவிப்புகள் இல்லை',
    notificationError: 'அறிவிப்புகளை ஏற்ற முடியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    firstLoginTitle: "பாதுகாப்பு அறிவிப்பு!",
    firstLoginMsg: "நீங்கள் முதல் முறையாக நுழைவதால், உங்கள் கணக்கைப் பாதுகாக்க உங்கள் கடவுச்சொல்லை மாற்றவும்.",
    changePassBtn: "கடவுச்சொல்லை மாற்று",
    days: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
    months: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    menu: [
      { icon: 'calendar-outline', label: 'விடுமுறை மேலாண்மை', sub: 'விடுமுறை இருப்பு, வரலாறு மற்றும் விண்ணப்பங்கள்', screen: 'LeaveBalance', color: '#7A1020' },
      { icon: 'clipboard-outline', label: 'பணி ஒதுக்கீடு', sub: 'உங்களுக்கும் உங்கள் துறைக்கும் ஒதுக்கப்பட்ட பணிகள்', screen: 'TaskAllocation', color: '#6A1B9A' },
      { icon: 'chatbubble-ellipses-outline', label: 'புகார்கள் மையம்', sub: 'புகார்களை சமர்ப்பித்து நிலையை கண்காணிக்கவும்', screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline', label: 'என் கணக்கு அமைப்புகள்', sub: 'சுயவிவரத்தையும் கணக்கு தகவல்களையும் மாற்றவும்', screen: 'Profile', color: '#1A5C3A' },
    ] as MenuItem[],
  },
};

const normalizeValue = (value?: string | null) => String(value || '').trim().toLowerCase();

const formatRelativeTime = (value: string, lang: Language) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return lang === 'si' ? 'දැන්' : lang === 'ta' ? 'இப்போது' : 'Now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'si' ? `මිනිත්තු ${minutes} කට පෙර` : lang === 'ta' ? `${minutes} நிமிடங்களுக்கு முன்` : `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'si' ? `පැය ${hours} කට පෙර` : lang === 'ta' ? `${hours} மணி நேரத்திற்கு முன்` : `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return lang === 'si' ? `දින ${days} කට පෙර` : lang === 'ta' ? `${days} நாட்களுக்கு முன்` : `${days} days ago`;
  return new Date(value).toLocaleDateString(lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-LK');
};

const getNotificationAppearance = (notification: DashboardNotification) => {
  const type = normalizeValue(notification.notification_type);
  const entity = normalizeValue(notification.related_entity);

  if (type === 'announcement' || entity === 'announcements') {
    return { icon: 'megaphone-outline' as const, color: '#C62828', background: '#FDECEC', border: '#F5B7B1', dot: '#D32F2F' };
  }
  if (type === 'task' || entity === 'tasks') {
    return { icon: 'clipboard-outline' as const, color: '#6A1B9A', background: '#F3E8FF', border: '#D8B4FE', dot: '#7B1FA2' };
  }
  if (type === 'leave' || entity === 'leave_requests') {
    return { icon: 'calendar-outline' as const, color: '#15803D', background: '#DCFCE7', border: '#A7D9B8', dot: '#16A34A' };
  }
  if (type === 'complaint' || entity === 'complaints') {
    return { icon: 'chatbubble-ellipses-outline' as const, color: '#1A3A5C', background: '#E9F1F8', border: '#BED2E4', dot: '#1A3A5C' };
  }
  return { icon: 'notifications-outline' as const, color: '#7A1020', background: '#F7EFF1', border: '#E4C9CE', dot: '#7A1020' };
};


const saveBirthdayNotificationToHistory = async (
  userId: string,
  birthdayString: string,
  selectedLang: Language
) => {
  try {
    const today = new Date();
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const birthdayMonthDay = birthdayString.substring(5, 10);

    // Only create the history record on the actual birthday.
    if (todayMonthDay !== birthdayMonthDay) return;

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Prevent duplicate birthday records for the same day.
    const { data: existing, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('notification_type', 'birthday')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .limit(1);

    if (checkError) {
      console.error('Birthday notification history check error:', checkError);
      return;
    }

    if (existing && existing.length > 0) return;

    const titleEn = 'Happy Birthday! ';
    const titleSi = 'සුබ උපන්දිනයක්! ';
    const titleTa = 'இனிய பிறந்தநாள் வாழ்த்துக்கள்! ';

    const messageEn =
      'Wishing you a wonderful day filled with happiness and success. ';
    const messageSi =
      'සතුට සහ සාර්ථකත්වයෙන් පිරි සුන්දර දිනයක් වේවා. ';
    const messageTa =
      'மகிழ்ச்சியும் வெற்றியும் நிறைந்த இனிய நாளாக அமையட்டும். ';

    const title =
      selectedLang === 'si'
        ? titleSi
        : selectedLang === 'ta'
          ? titleTa
          : titleEn;

    const message =
      selectedLang === 'si'
        ? messageSi
        : selectedLang === 'ta'
          ? messageTa
          : messageEn;

    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        title_en: titleEn,
        title_si: titleSi,
        title_ta: titleTa,
        message_en: messageEn,
        message_si: messageSi,
        message_ta: messageTa,
        is_read: false,
        notification_type: 'birthday',
        related_entity: 'birthdays',
        related_id: null,
      });

    if (insertError) {
      console.error(
        'Birthday notification history insert error:',
        insertError
      );
    }
  } catch (error) {
    console.error('Birthday notification history error:', error);
  }
};

export default function DashboardScreen({ selectedLang, onNavigate, onLogout }: Props) {
  const t = L[selectedLang] ?? L.en;
  const { font } = useFont();

  const [userData, setUserData] = useState<UserData>({
    fullName: 'Loading...',
    designation: 'Loading...',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
    departmentId: null,
  });

  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [nic, setNic] = useState<string>('');
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const birthdayRef = useRef<string | null>(null);
  const [notificationError, setNotificationError] = useState(false);
  const [dayStr, setDayStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  const scheduleAnnualBirthdayNotification = async (
    birthdayString: string,
    userId: string
  ) => {
    try {
      const month = parseInt(birthdayString.substring(5, 7), 10) - 1;
      const day = parseInt(birthdayString.substring(8, 10), 10);

      if (
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        month < 0 ||
        month > 11 ||
        day < 1 ||
        day > 31
      ) {
        console.warn('Invalid birthday date:', birthdayString);
        return;
      }

      // Remove only this user's existing birthday notification.
      // Other scheduled app notifications are left untouched.
      const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduled) {
        const data = notification.content.data as
          | { notificationType?: string; userId?: string }
          | undefined;

        if (
          data?.notificationType === 'birthday' &&
          data?.userId === userId
        ) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }

      const title =
        selectedLang === 'si'
          ? 'සුබ උපන්දිනයක්! '
          : selectedLang === 'ta'
            ? 'இனிய பிறந்தநாள் வாழ்த்துக்கள்! '
            : 'Happy Birthday! ';

      const body =
        selectedLang === 'si'
          ? 'සතුට සහ සාර්ථකත්වයෙන් පිරි සුන්දර දිනයක් වේවා. '
          : selectedLang === 'ta'
            ? 'மகிழ்ச்சியும் வெற்றியும் நிறைந்த இனிய நாளாக அமையட்டும். '
            : 'Wishing you a wonderful day filled with happiness and success. ';

      await Notifications.scheduleNotificationAsync({
        identifier: `birthday-notification-${userId}`,
        content: {
          title,
          body,
          sound: true,
          data: {
            notificationType: 'birthday',
            userId,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.YEARLY,
          month,
          day,
          hour: 8,
          minute: 0,
        },
      });
    } catch (error) {
      console.error('Birthday notification scheduling error:', error);
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    
    requestPermissions();

    const fetchUserDetails = async () => {
      try {
        const cached = await AsyncStorage.getItem('user_profile_data');
        if (cached) {
          try { setUserData((current) => ({ ...current, ...JSON.parse(cached) })); } catch {}
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            nic,
            title,
            birthday,
            is_first_login,
            full_name,
            full_name_si,
            full_name_ta,
            avatar_url,
            department_id,
            designations (
              designation_en,
              designation_si,
              designation_ta
            )
          `)
          .eq('auth_id', user.id)
          .single();

        if (error || !data) {
          console.error('Dashboard user error:', error);
          return;
        }

        if (
          data.birthday &&
          data.birthday !== 'YYYY-MM-DD' &&
          data.birthday !== 'N/A'
        ) {
          birthdayRef.current = data.birthday;

          await scheduleAnnualBirthdayNotification(
            data.birthday,
            data.id
          );

          // If the user opens the app on their birthday, make sure the
          // birthday notification also exists in Dashboard > Recent Updates.
          await saveBirthdayNotificationToHistory(
            data.id,
            data.birthday,
            selectedLang
          );
        }

        setDbUserId(data.id);
        setNic(data.nic || '');
        setIsFirstLogin(data.is_first_login === true);

        const baseName = selectedLang === 'si' && data.full_name_si ? data.full_name_si 
                       : selectedLang === 'ta' && data.full_name_ta ? data.full_name_ta 
                       : data.full_name || 'Name not set';

                       let formattedTitle = '';
        if (data.title) {
          const tText = data.title.trim();
          formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
        }

        const fullName = `${formattedTitle}${baseName}`;

        const userDesignation: any = Array.isArray(data.designations) ? data.designations[0] : data.designations;

        const designation = selectedLang === 'si' && userDesignation?.designation_si ? userDesignation.designation_si 
                          : selectedLang === 'ta' && userDesignation?.designation_ta ? userDesignation.designation_ta 
                          : userDesignation?.designation_en || 'Designation not set';

        const freshData = {
          fullName,
          designation,
          avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
          departmentId: data.department_id || null,
        };

        setUserData(freshData);
        await AsyncStorage.setItem('user_profile_data', JSON.stringify(freshData));
      } catch (error) {
        console.error('Dashboard user exception:', error);
      }
    };

    fetchUserDetails();
  }, [selectedLang]);

  useEffect(() => {
    if (!dbUserId) return;

    const subscription =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const data = notification.request.content.data as
          | {
              notificationType?: string;
              userId?: string;
            }
          | undefined;

        if (
          data?.notificationType === 'birthday' &&
          data?.userId === dbUserId &&
          birthdayRef.current
        ) {
          await saveBirthdayNotificationToHistory(
            dbUserId,
            birthdayRef.current,
            selectedLang
          );

          // Refresh the dashboard's Recent Updates immediately.
          const { data: latestNotifications } = await supabase
            .from('notifications')
            .select(
              'id, title, message, title_en, title_si, title_ta, message_en, message_si, message_ta, is_read, created_at, read_at, notification_type, related_entity, related_id'
            )
            .eq('user_id', dbUserId)
            .order('created_at', { ascending: false })
            .limit(3);

          setNotifications(
            (latestNotifications || []) as DashboardNotification[]
          );
        }
      });

    return () => {
      subscription.remove();
    };
  }, [dbUserId, selectedLang]);

  useEffect(() => {
    const now = new Date();
    setDayStr(t.days[now.getDay()]);
    const month = t.months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    setDateStr(selectedLang === 'en' ? `${month} ${day}, ${year}` : `${year} ${month} ${day}`);
  }, [selectedLang, t]);

  const loadNotifications = useCallback(async () => {
    if (!dbUserId) return;
    setNotificationError(false);
   
    // 🔥 භාෂා 3ටම අදාළ Columns එකතු කළා
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, title_en, title_si, title_ta, message_en, message_si, message_ta, is_read, created_at, read_at, notification_type, related_entity, related_id')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Notification load error:', error);
      setNotificationError(true);
      return;
    }
    setNotifications((data || []) as DashboardNotification[]);
  }, [dbUserId]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  useEffect(() => {
    if (!dbUserId) return;

    const channel = supabase
      .channel(`dashboard-notifications-${dbUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${dbUserId}`,
        },
        async (payload) => {
          const row = payload.new as DashboardNotification;
          setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 3));

          const type = normalizeValue(row.notification_type);
          const entity = normalizeValue(row.related_entity);
          const relatedId = row.related_id ?? undefined;

          // 🔥 Phone එකේ උඩින් වැටෙන Push Notification එකෙත් භාෂාව මාරු කළා
          const pushTitle = selectedLang === 'si' ? (row.title_si || row.title) : selectedLang === 'ta' ? (row.title_ta || row.title) : (row.title_en || row.title);
          const pushBody = selectedLang === 'si' ? (row.message_si || row.message) : selectedLang === 'ta' ? (row.message_ta || row.message) : (row.message_en || row.message);

          try {
            if (type === 'leave' || entity === 'leave_requests') {
              await showLeaveNotification({ title: pushTitle, body: pushBody, requestId: relatedId, notificationId: row.id });
              return;
            }
            if (type === 'task' || entity === 'tasks') {
              await showTaskNotification({ title: pushTitle, body: pushBody, taskId: relatedId, notificationId: row.id });
              return;
            }
            if (type === 'announcement' || entity === 'announcements') {
              await showAnnouncementNotification({ title: pushTitle, body: pushBody, announcementId: relatedId, notificationId: row.id });
              return;
            }
            if (type === 'complaint' || entity === 'complaints') {
              await showComplaintNotification({ title: pushTitle, body: pushBody, complaintId: relatedId, notificationId: row.id });
            }
            
           if (type === 'profile' || entity === 'profile_request') {
              await showProfileUpdateNotification({ 
                title: pushTitle, 
                body: pushBody, 
                requestId: row.related_id ?? undefined, // 🔥 මෙන්න මෙතන ?? undefined එකතු කළා
                notificationId: row.id 
              });
              return;
            }
          } catch (error) {
            console.error('Phone notification error:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbUserId, selectedLang]);

  const markAsRead = async (notification: DashboardNotification) => {
    if (notification.is_read) return;
    const readAt = new Date().toISOString();
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: readAt }).eq('id', notification.id).eq('user_id', dbUserId);
    if (error) { console.error('Mark notification read error:', error); return; }
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true, read_at: readAt } : item));
  };

  const openNotification = async (notification: DashboardNotification) => {
    await markAsRead(notification);
    const type = normalizeValue(notification.notification_type);
    const entity = normalizeValue(notification.related_entity);

  

    onNavigate('Notifications');
  };

  const openService = (item: MenuItem) => {
    if (item.screen === 'TaskAllocation') {
      onNavigate('TaskAllocation', { currentUserId: dbUserId, departmentId: userData.departmentId });
      return;
    }
    onNavigate(item.screen);
  };

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(cardsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, cardsAnim]);

  const fade = (anim: Animated.Value) => ({
    opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.header, fade(headerAnim)]}>
        <View style={styles.headerCircle1} pointerEvents="none" />
        <View style={styles.headerCircle2} pointerEvents="none" />
        <View style={styles.headerTopActionRow}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={font(14)} color="#FFD54F" />
            <AppText style={[styles.logoutText, { fontSize: font(12) }]}>{t.logout}</AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileTextArea}>
            <AppText style={[styles.welcomeText, { fontSize: font(14) }]}>{t.welcome}</AppText>
            <AppText style={[styles.nameText, { fontSize: font(22), lineHeight: font(29) }]} numberOfLines={2}>{userData.fullName}</AppText>
            <View style={styles.designationRow}>
              <Ionicons name="business-outline" size={font(13)} color="rgba(255,255,255,0.65)" />
              <AppText style={[styles.designationText, { fontSize: font(12), lineHeight: font(17) }]}>{userData.designation}</AppText>
            </View>
          </View>
        </View>
        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={font(13)} color="#FFD54F" />
          <AppText style={[styles.dateText, { fontSize: font(11) }]}>{dayStr} • {dateStr}</AppText>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

       {isFirstLogin && (
          <Animated.View style={[styles.firstLoginCard, fade(cardsAnim)]}>
            <View style={styles.firstLoginHeader}>
              <Ionicons name="shield-checkmark" size={font(22)} color="#15803D" />
              <AppText style={[styles.firstLoginTitle, { fontSize: font(14) }]}>{t.firstLoginTitle}</AppText>
            </View>
            <AppText style={[styles.firstLoginMsg, { fontSize: font(12) }]} numberOfLines={3}>{t.firstLoginMsg}</AppText>
            <TouchableOpacity style={styles.firstLoginBtn} activeOpacity={0.8} onPress={() => onNavigate('forgot', { autoSendOTP: true, initialEmpId: nic })}>
              <AppText style={[styles.firstLoginBtnText, { fontSize: font(13) }]}>{t.changePassBtn}</AppText>
              <Ionicons name="arrow-forward" size={font(15)} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
         <Animated.View style={fade(cardsAnim)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <AppText style={[styles.sectionTitle, { fontSize: font(13) }]}>{t.updatesTitle}</AppText>
            </View>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => onNavigate('Notifications')}>
              <AppText style={[styles.viewAllText, { fontSize: font(12) }]}>{t.viewAll}</AppText>
              <Ionicons name="arrow-forward" size={font(13)} color="#7A1020" />
            </TouchableOpacity>
          </View>
        {notificationError ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cloud-offline-outline" size={font(28)} color="#B91C1C" />
              <AppText style={[styles.emptyText, { fontSize: font(12) }]}>{t.notificationError}</AppText>
              <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
                <AppText style={[styles.retryText, { fontSize: font(11) }]}>{t.retry}</AppText>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={font(28)} color="#7A1020" />
              <AppText style={[styles.emptyText, { fontSize: font(12) }]}>{t.noNotifications}</AppText>
            </View>
          ) : (
            notifications.map((notification, index) => {
              const unread = !notification.is_read;
              const appearance = getNotificationAppearance(notification);
              
              // 🔥 මෙතන තමයි දැනට තියෙන Language එක බලලා අදාල Title එකයි Message එකයි තෝරගන්නේ
              const displayTitle = selectedLang === 'si' ? (notification.title_si || notification.title) : selectedLang === 'ta' ? (notification.title_ta || notification.title) : (notification.title_en || notification.title);
              const displayMessage = selectedLang === 'si' ? (notification.message_si || notification.message) : selectedLang === 'ta' ? (notification.message_ta || notification.message) : (notification.message_en || notification.message);

              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationCard, unread ? styles.unreadNotification : styles.readNotification, index < notifications.length - 1 && { marginBottom: 10 }]}
                  activeOpacity={0.84}
                  onPress={() => openNotification(notification)}
                >
                  <View style={styles.notificationIconArea}>
                    <View style={[styles.notificationIcon, unread ? { backgroundColor: appearance.background, borderColor: appearance.border } : styles.readIcon]}>
                      <Ionicons name={appearance.icon} size={font(19)} color={unread ? appearance.color : '#718096'} />
                    </View>
                    {unread && <View style={[styles.notificationDot, { backgroundColor: appearance.dot }]} />}
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTop}>
                      {/* 🔥 නිවැරදි භාෂාවෙන් පෙන්වයි */}
                      <AppText style={[styles.notificationTitle, { fontSize: font(13) }]} numberOfLines={2}>{displayTitle}</AppText>
                      <AppText style={[styles.notificationTime, { fontSize: font(10) }]}>{formatRelativeTime(notification.created_at, selectedLang)}</AppText>
                    </View>
                    <View style={styles.notificationFooter}>
                      
                     
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        

        <Animated.View style={fade(cardsAnim)}>
          <View style={{ height: 20 }} />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <AppText style={[styles.sectionTitle, { fontSize: font(13) }]}>{t.servicesTitle}</AppText>
            </View>
          </View>
          <View style={styles.menuList}>
            {t.menu.map((item) => (
              <TouchableOpacity key={item.screen} style={styles.menuCard} activeOpacity={0.87} onPress={() => openService(item)}>
                <View style={[styles.menuAccent, { backgroundColor: item.color }]} />
                <View style={[styles.menuIconColumn, { backgroundColor: `${item.color}12` }]}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color }]}><Ionicons name={item.icon} size={font(25)} color="#FFFFFF" /></View>
                </View>
                <View style={styles.menuTextArea}>
                  <AppText style={[styles.menuTitle, { fontSize: font(16) }]}>{item.label}</AppText>
                  <AppText style={[styles.menuSubtitle, { fontSize: font(12), lineHeight: font(17) }]} numberOfLines={3}>{item.sub}</AppText>
                </View>
                <View style={styles.menuArrow}><Ionicons name="chevron-forward" size={font(18)} color={item.color} /></View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>


          
        </Animated.View>
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  header: { backgroundColor: '#7A1020', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 18, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, overflow: 'hidden', elevation: 12 },
  headerCircle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -40 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -10, left: 10 },
  headerTopActionRow: { alignItems: 'flex-end', marginBottom: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#FFFFFF', fontWeight: '800' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: '#FFD54F' },
  onlineDot: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: '#4CAF50', right: 2, bottom: 2, borderWidth: 2, borderColor: '#7A1020' },
  profileTextArea: { flex: 1 },
  welcomeText: { color: '#FFD54F', fontWeight: '800', marginTop: -28 },
  nameText: { color: '#FFFFFF', fontWeight: '900', marginTop: 2 },
  designationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  designationText: { color: 'rgba(255,255,255,0.75)', fontWeight: '600', flex: 1 },
  dateBox: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  dateText: { color: 'rgba(255,255,255,0.82)', fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  firstLoginCard: { backgroundColor: '#F0FDF4', borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1.5, borderColor: '#BBF7D0', elevation: 2, shadowColor: '#166534', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
  firstLoginHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  firstLoginTitle: { color: '#166534', fontWeight: '900', letterSpacing: 0.5 },
  firstLoginMsg: { color: '#15803D', fontWeight: '600', lineHeight: 20, marginBottom: 16 },
  firstLoginBtn: { backgroundColor: '#15803D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  firstLoginBtnText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 4, height: 16, borderRadius: 2, backgroundColor: '#7A1020' },
  sectionTitle: { color: '#2C3E50', fontWeight: '800', letterSpacing: 0.8 },
  menuList: { gap: 14, marginBottom: 26 },
  menuCard: { minHeight: 105, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#EEF0F4', elevation: 2 },
  menuAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  menuIconColumn: { width: 82, minHeight: 82, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuTextArea: { flex: 1, paddingHorizontal: 6 },
  menuTitle: { color: '#1A2940', fontWeight: '900' },
  menuSubtitle: { color: '#718096', fontWeight: '600', marginTop: 4 },
  menuArrow: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: '#F8F9FA' },
  notificationCard: { flexDirection: 'row', borderRadius: 16, padding: 13, borderWidth: 1.2 },
  unreadNotification: { backgroundColor: '#E9F8EF', borderColor: '#A7D9B8', elevation: 2 },
  readNotification: { backgroundColor: '#FFFFFF', borderColor: '#E4E8EE', elevation: 1 },
  notificationIconArea: { width: 43, marginRight: 10, position: 'relative' },
  notificationIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  readIcon: { backgroundColor: '#F4F6F8', borderColor: '#E1E5EA' },
  notificationDot: { position: 'absolute', top: -2, right: -1, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#E9F8EF' },
  notificationContent: { flex: 1 },
  notificationTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  notificationTitle: { flex: 1, color: '#1A2940', fontWeight: '900' },
  notificationTime: { color: '#8492A6', fontWeight: '700' },
  notificationMessage: { color: '#56677C', fontWeight: '600', marginTop: 6 },
  notificationFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  newBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#CDEFD8', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  newBadgeText: { color: '#166534', fontWeight: '900' },
  readBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F1F3F5', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  readBadgeText: { color: '#718096', fontWeight: '900' },
  detailsRow: { flexDirection: 'row', alignItems: 'center' },
  detailsText: { color: '#7A1020', fontWeight: '800' },
  emptyBox: { backgroundColor: '#FFFFFF', borderRadius: 16, minHeight: 145, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E8EE' },
  emptyText: { marginTop: 9, color: '#718096', fontWeight: '700' },
  retryButton: { marginTop: 12, backgroundColor: '#7A1020', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 5 },
  viewAllText: { color: '#7A1020', fontWeight: '800' },
birthdayCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  paddingVertical: 13,
  paddingHorizontal: 14,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 18,

  borderWidth: 1,
  borderColor: '#E9D8A6',

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,

  position: 'relative',
  overflow: 'hidden',
},

bdayAccent: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  backgroundColor: '#C89B3C',
},

bdayIconBox: {
  width: 44,
  height: 44,
  borderRadius: 13,

  backgroundColor: '#FFF9E8',

  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: 4,
  marginRight: 12,

  borderWidth: 1,
  borderColor: '#F1E4BE',
},

bdayTextCol: {
  flex: 1,
  paddingRight: 8,
},

bdayTitle: {
  fontWeight: '800',
  color: '#7A5A16',
  marginBottom: 3,
  letterSpacing: 0.15,
},

bdaySub: {
  color: '#64748B',
  fontWeight: '500',
},

bdaySparkle: {
  width: 30,
  height: 30,
  borderRadius: 15,

  backgroundColor: '#FFF9E8',

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 1,
  borderColor: '#F1E4BE',
},
});