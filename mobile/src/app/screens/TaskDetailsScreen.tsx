// app/screens/TaskDetailsScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextProps,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';
import { showLeaveNotification } from '../../lib/notificationService';
import * as Notifications from 'expo-notifications';

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang: Language;
  onBack?: () => void;
  onNavigate?: (screen: string, params?: any) => void;

  route?: {
    params?: {
      taskId?: number;
      openedFromNotification?: boolean;
      notificationId?: number;
    };
  };
}

interface TaskDetails {
  id: number;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  assigned_by?: string | null;
  department_id?: number | null;
  frequency?: string | null;
  due_date: string;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  title_en?: string | null;
  title_si?: string | null;
  title_ta?: string | null;
  description_en?: string | null;
  description_si?: string | null;
  description_ta?: string | null;
}

const Text = ({ style, ...props }: TextProps) => {
  const { font } = useFont();
  const flattened = StyleSheet.flatten(style) || {};
  const dynamicStyle: any = { ...flattened };

  if (typeof flattened.fontSize === 'number') {
    dynamicStyle.fontSize = font(flattened.fontSize);
  }

  if (typeof flattened.lineHeight === 'number') {
    dynamicStyle.lineHeight = font(flattened.lineHeight);
  }

  return (
    <RNText
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...props}
      style={dynamicStyle}
    />
  );
};

const L = {
  si: {
    title: 'කාර්ය විස්තර',
    subtitle: 'පවරා ඇති කාර්යයේ සම්පූර්ණ තොරතුරු',
    back: 'ආපසු',
    description: 'කාර්ය විස්තරය',
    dueDate: 'අවසන් දිනය',
    frequency: 'වාරිකත්වය',
    assignmentType: 'පැවරීමේ ආකාරය',
    personal: 'ඔබට පෞද්ගලිකව පවරා ඇත',
    department: 'ඔබගේ අංශයට පවරා ඇත',
    assignedBy: 'පැවරූ නිලධාරියා',
    createdAt: 'නිර්මාණය කළ දිනය',
    updatedAt: 'අවසන් යාවත්කාලීනය',
    currentStatus: 'වත්මන් තත්ත්වය',
    pending: 'ආරම්භ කර නැත',
    inProgress: 'ක්‍රියාත්මකයි',
    completed: 'සම්පූර්ණයි',
    startTask: 'කාර්යය ආරම්භ කරන්න',
    completeTask: 'සම්පූර්ණ ලෙස සලකුණු කරන්න',
    completedMessage: 'මෙම කාර්යය සම්පූර්ණ කර ඇත',
    confirmStartTitle: 'කාර්යය ආරම්භ කරන්නද?',
    confirmStartMessage: 'මෙම කාර්යයේ තත්ත්වය ක්‍රියාත්මකයි ලෙස වෙනස් වේ.',
    confirmCompleteTitle: 'කාර්යය සම්පූර්ණද?',
    confirmCompleteMessage: 'මෙම කාර්යය සම්පූර්ණ ලෙස සලකුණු කිරීමට අවශ්‍යද?',
    cancel: 'අවලංගු කරන්න',
    confirm: 'තහවුරු කරන්න',
    updateSuccess: 'කාර්ය තත්ත්වය සාර්ථකව යාවත්කාලීන විය.',
    updateError: 'කාර්ය තත්ත්වය යාවත්කාලීන කළ නොහැකි විය.',
    loadError: 'කාර්ය විස්තර ලබාගැනීමට නොහැකි විය',
    noTask: 'කාර්යය සොයාගත නොහැකි විය',
    retry: 'නැවත උත්සාහ කරන්න',
    loading: 'කාර්ය විස්තර ලබාගනිමින්...',
    overdue: 'මෙම කාර්යය කල් ඉකුත් වී ඇත',
    dueToday: 'මෙම කාර්යය අද අවසන් වේ',
    daysRemaining: 'දින ඉතිරිව ඇත',
    taskId: 'කාර්ය අංකය',
  },
  en: {
    title: 'Task Details',
    subtitle: 'Complete information about the assigned task',
    back: 'Back',
    description: 'Task Description',
    dueDate: 'Due Date',
    frequency: 'Frequency',
    assignmentType: 'Assignment Type',
    personal: 'Assigned directly to you',
    department: 'Assigned to your department',
    assignedBy: 'Assigned By',
    createdAt: 'Created Date',
    updatedAt: 'Last Updated',
    currentStatus: 'Current Status',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    startTask: 'Start Task',
    completeTask: 'Mark as Completed',
    completedMessage: 'This task has been completed',
    confirmStartTitle: 'Start this task?',
    confirmStartMessage: 'The task status will be changed to In Progress.',
    confirmCompleteTitle: 'Complete this task?',
    confirmCompleteMessage: 'Are you sure you want to mark this task as completed?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    updateSuccess: 'Task status updated successfully.',
    updateError: 'Unable to update the task status.',
    loadError: 'Unable to load task details',
    noTask: 'Task could not be found',
    retry: 'Try Again',
    loading: 'Loading task details...',
    overdue: 'This task is overdue',
    dueToday: 'This task is due today',
    daysRemaining: 'days remaining',
    taskId: 'Task ID',
  },
  ta: {
    title: 'பணி விவரங்கள்',
    subtitle: 'ஒதுக்கப்பட்ட பணியின் முழுமையான தகவல்கள்',
    back: 'பின்னே',
    description: 'பணி விளக்கம்',
    dueDate: 'கடைசி தேதி',
    frequency: 'அடிக்கடி',
    assignmentType: 'ஒதுக்கீட்டு வகை',
    personal: 'உங்களுக்கு நேரடியாக ஒதுக்கப்பட்டது',
    department: 'உங்கள் துறைக்கு ஒதுக்கப்பட்டது',
    assignedBy: 'ஒதுக்கியவர்',
    createdAt: 'உருவாக்கப்பட்ட தேதி',
    updatedAt: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    currentStatus: 'தற்போதைய நிலை',
    pending: 'நிலுவையில்',
    inProgress: 'செயலில்',
    completed: 'முடிந்தது',
    startTask: 'பணியைத் தொடங்கவும்',
    completeTask: 'முடிந்ததாக குறிக்கவும்',
    completedMessage: 'இந்த பணி முடிக்கப்பட்டது',
    confirmStartTitle: 'பணியைத் தொடங்கவா?',
    confirmStartMessage: 'பணி நிலை செயலில் என மாற்றப்படும்.',
    confirmCompleteTitle: 'பணி முடிந்ததா?',
    confirmCompleteMessage: 'இந்த பணியை முடிந்ததாக குறிக்க விரும்புகிறீர்களா?',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிப்படுத்து',
    updateSuccess: 'பணி நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது.',
    updateError: 'பணி நிலையை புதுப்பிக்க முடியவில்லை.',
    loadError: 'பணி விவரங்களை ஏற்ற முடியவில்லை',
    noTask: 'பணியை கண்டுபிடிக்க முடியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    loading: 'பணி விவரங்கள் ஏற்றப்படுகின்றன...',
    overdue: 'இந்த பணி காலாவதியானது',
    dueToday: 'இந்த பணி இன்று முடிகிறது',
    daysRemaining: 'நாட்கள் மீதம்',
    taskId: 'பணி எண்',
  },
};

const normalizeStatus = (value?: string | null) => {
  const status = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (status === 'completed' || status === 'complete' || status === 'done') return 'completed';
  if (status === 'in_progress' || status === 'progress' || status === 'started') return 'in_progress';
  return 'pending';
};

const getLocalizedTitle = (task: TaskDetails, lang: Language) => {
  if (lang === 'si' && task.title_si) return task.title_si;
  if (lang === 'ta' && task.title_ta) return task.title_ta;
  if (lang === 'en' && task.title_en) return task.title_en;
  return task.title || task.title_en || task.title_si || task.title_ta || '';
};

const getLocalizedDescription = (task: TaskDetails, lang: Language) => {
  if (lang === 'si' && task.description_si) return task.description_si;
  if (lang === 'ta' && task.description_ta) return task.description_ta;
  if (lang === 'en' && task.description_en) return task.description_en;
  return task.description || task.description_en || task.description_si || task.description_ta || '';
};

export default function TaskDetailsScreen({ selectedLang, onBack, route }: Props) {
  const t = L[selectedLang] ?? L.en;
  const taskId = route?.params?.taskId;

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  
  // 🔥 Assigner ගේ නම ගබඩා කිරීමට
  const [assignerName, setAssignerName] = useState<string>('-');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

// 🔥 1 දිනකට පෙර Local Notification Schedule කිරීම (Fixed Expo TS Error)
  const scheduleTaskReminder = async (taskData: TaskDetails) => {
    if (!taskData.due_date || normalizeStatus(taskData.status) === 'completed') return;
    
    const dueDate = new Date(taskData.due_date);
    const reminderDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    
    if (reminderDate > new Date()) {
      const taskTitle = getLocalizedTitle(taskData, selectedLang);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: selectedLang === 'si' ? 'කාර්යය මතක් කිරීම' : 'Task Reminder',
          body: selectedLang === 'si' ? `"${taskTitle}" කාර්යය හෙට අවසන් වීමට නියමිතයි.` : `Task "${taskTitle}" is due tomorrow.`,
          data: { taskId: taskData.id }
        },
        // 👇 මෙතන තමයි වෙනස: type: 'date' දීලා as any දැම්මම TS error එක 100% ක් නැතිවෙලා යනවා
        trigger: { 
          type: 'date',
          date: reminderDate 
        } as any 
      });
    }
  };

  // 🔥 කල් ඉකුත් වූ විට Assigner ට Notification එකක් යැවීමේ Logic එක
  const checkAndAlertOverdue = async (taskData: TaskDetails, currentUserId: string) => {
    if (!taskData.due_date || normalizeStatus(taskData.status) === 'completed' || !taskData.assigned_by) return;

    const dueDate = new Date(taskData.due_date);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // දින ගාන පැනලා නම්
    if (today.getTime() > dueDate.getTime()) {
       // මේක කලින් යවලා තියෙනවද කියලා බලනවා (Duplicate නොවෙන්න)
       const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_id', taskData.id)
        .eq('notification_type', 'Task_Overdue')
        .single();

       if (!existing) {
         const taskTitle = getLocalizedTitle(taskData, selectedLang);
         await supabase.from('notifications').insert({
            user_id: taskData.assigned_by,
            title: 'Task Overdue',
            message: `The task "${taskTitle}" is overdue.`,
            title_si: 'කාර්යය කල් ඉකුත් වී ඇත',
            message_si: `ඔබ විසින් පැවරූ "${taskTitle}" කාර්යය කල් ඉකුත් වී ඇත.`,
            title_en: 'Task Overdue',
            message_en: `The task "${taskTitle}" is overdue.`,
            title_ta: 'பணி காலாவதியானது',
            message_ta: `நீங்கள் ஒதுக்கிய "${taskTitle}" பணி காலாவதியானது.`,
            is_read: false,
            is_auto_generated: true,
            notification_type: 'Task_Overdue',
            related_entity: 'tasks',
            related_id: taskData.id,
            created_by: currentUserId,
            is_for_mobile: true,
            created_at: new Date().toISOString()
         });
       }
    }
  };

  const loadTaskDetails = useCallback(async (showLoader = true) => {
    if (!taskId) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    if (showLoader) setLoading(true);
    setLoadError(false);

    try {
      let currentUserId = dbUserId;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('id, department_id').eq('auth_id', user.id).single();
        if (profile) {
          setDbUserId(profile.id);
          currentUserId = profile.id;
          setDepartmentId(profile.department_id || null);
        }
      }

      const { data, error } = await supabase.from('tasks').select('*').eq('id', Number(taskId)).single();

      if (error || !data) {
        setLoadError(true);
        setTask(null);
        return;
      }

      const taskData = data as TaskDetails;
      setTask(taskData);

      // 🔥 Assigner ගේ නම ලබා ගැනීම
      if (taskData.assigned_by) {
        const { data: assigner } = await supabase.from('users').select('title, full_name, full_name_si, full_name_ta').eq('id', taskData.assigned_by).single();
        if (assigner) {
           let formattedTitle = assigner.title ? (assigner.title.trim().endsWith('.') ? `${assigner.title.trim()} ` : `${assigner.title.trim()}. `) : '';
           let finalName = assigner.full_name;
           if (selectedLang === 'si' && assigner.full_name_si) finalName = assigner.full_name_si;
           if (selectedLang === 'ta' && assigner.full_name_ta) finalName = assigner.full_name_ta;
           setAssignerName(`${formattedTitle}${finalName}`);
        }
      }

      // Schedule Reminder and Check Overdue
      if (currentUserId) {
        scheduleTaskReminder(taskData);
        checkAndAlertOverdue(taskData, currentUserId);
      }

    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTaskDetails();
  }, [loadTaskDetails]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!taskId) return;
    const channel = supabase.channel(`mobile-task-details-${taskId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `id=eq.${taskId}` },
        (payload) => setTask(payload.new as TaskDetails)
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  const currentStatus = useMemo(() => normalizeStatus(task?.status), [task?.status]);

  const canUpdateTask = useMemo(() => {
    if (!task || !dbUserId) return false;
    const personallyAssigned = task.assigned_to === dbUserId;
    const departmentAssigned = task.department_id !== null && task.department_id !== undefined && task.department_id === departmentId;
    return personallyAssigned || departmentAssigned;
  }, [task, dbUserId, departmentId]);

  const getStatusDetails = () => {
    if (currentStatus === 'completed') return { label: t.completed, color: '#166534', background: '#DCFCE7', icon: 'checkmark-circle' as const };
    if (currentStatus === 'in_progress') return { label: t.inProgress, color: '#1D4ED8', background: '#DBEAFE', icon: 'sync-circle' as const };
    return { label: t.pending, color: '#92400E', background: '#FEF3C7', icon: 'time' as const };
  };

  const formatDate = (value?: string | null, includeTime = false) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    if (selectedLang === 'si') {
      const monthsSi = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
      const month = monthsSi[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      if (includeTime) {
        let h = date.getHours();
        const min = date.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'ප.ව.' : 'පෙ.ව.';
        h = h % 12 || 12;
        return `${year} ${month} ${day}, ${ampm} ${h}:${min}`;
      }
      return `${year} ${month} ${day}`;
    }

    return date.toLocaleString(selectedLang === 'ta' ? 'ta-LK' : 'en-LK',
      includeTime ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getDueInformation = () => {
    if (!task?.due_date) return null;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const difference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (difference < 0) return { text: t.overdue, color: '#B91C1C', background: '#FEE2E2', icon: 'warning-outline' as const };
    if (difference === 0) return { text: t.dueToday, color: '#B45309', background: '#FFEDD5', icon: 'time-outline' as const };
    return { text: `${difference} ${t.daysRemaining}`, color: '#166534', background: '#DCFCE7', icon: 'calendar-outline' as const };
  };

  const updateTaskStatus = async (nextStatus: 'in_progress' | 'completed') => {
    if (!task || updating) return;
    setUpdating(true);

    const dbFormattedStatus = nextStatus === 'in_progress' ? 'In Progress' : 'Completed';

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: dbFormattedStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id)
        .select()
        .single();

      if (error) {
        Alert.alert(t.updateError, error.message || t.updateError);
        return;
      }

      if (data) {
        setTask(data as TaskDetails);

        // 🔥 Phone එකට Local Push Notification එක යැවීම (Current User ට)
        await showLeaveNotification({
          title: selectedLang === 'si' ? 'සාර්ථකයි!' : 'Success!',
          body: selectedLang === 'si' ? 'කාර්ය තත්ත්වය යාවත්කාලීන කරන ලදී.' : 'Task status updated successfully.',
          requestId: data.id,
        });

        // 🔥 Assigner ට Database සහ Push Notification එක යැවීම
        if (data.assigned_by && data.assigned_by !== dbUserId) {
          const titleEn = data.title_en || data.title || '';
          const titleSi = data.title_si || data.title || '';
          const titleTa = data.title_ta || data.title || '';

          let notifTitleEn = '', notifTitleSi = '', notifTitleTa = '';
          let notifMsgEn = '', notifMsgSi = '', notifMsgTa = '';

          if (nextStatus === 'in_progress') {
            notifTitleEn = 'Task Started';
            notifTitleSi = 'කාර්යයක් ආරම්භ කරන ලදී';
            notifTitleTa = 'பணி தொடங்கப்பட்டது';

            notifMsgEn = `The task "${titleEn}" has been started.`;
            notifMsgSi = `ඔබ පැවරූ "${titleSi}" කාර්යය ආරම්භ කර ඇත.`;
            notifMsgTa = `"${titleTa}" பணி தொடங்கப்பட்டுள்ளது.`;
          } else {
            notifTitleEn = 'Task Completed';
            notifTitleSi = 'කාර්යයක් සම්පූර්ණ කරන ලදී';
            notifTitleTa = 'பணி முடிக்கப்பட்டது';

            notifMsgEn = `The task "${titleEn}" has been successfully completed.`;
            notifMsgSi = `ඔබ පැවරූ "${titleSi}" කාර්යය සාර්ථකව සම්පූර්ණ කර ඇත.`;
            notifMsgTa = `"${titleTa}" பணி வெற்றிகரமாக முடிக்கப்பட்டது.`;
          }

          const { data: createdNotif } = await supabase.from('notifications').insert({
            user_id: data.assigned_by,
            title: selectedLang === 'si' ? notifTitleSi : selectedLang === 'ta' ? notifTitleTa : notifTitleEn,
            message: selectedLang === 'si' ? notifMsgSi : selectedLang === 'ta' ? notifMsgTa : notifMsgEn,
            title_en: notifTitleEn, 
            title_si: notifTitleSi, 
            title_ta: notifTitleTa, 
            message_en: notifMsgEn,
            message_si: notifMsgSi,
            message_ta: notifMsgTa,
            is_read: false,
            is_auto_generated: true,
            notification_type: 'Task',
            related_entity: 'tasks',
            related_id: data.id,
            created_by: dbUserId,
            created_at: new Date().toISOString()
          }).select('id').single();

          const { data: recipientUser } = await supabase.from('users').select('push_token').eq('id', data.assigned_by).single();
          
          if (recipientUser && recipientUser.push_token) {
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { Accept: 'application/json', 'Accept-encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: recipientUser.push_token,
                sound: 'default',
                title: `${notifTitleSi} | ${notifTitleEn}`,
                body: `${notifMsgSi}\n${notifMsgEn}`, 
                data: { taskId: data.id, notificationId: createdNotif?.id },
              }),
            });
          }
        }
      }
    } catch (error) {
      Alert.alert(t.updateError);
    } finally {
      setUpdating(false);
    }
  };
  
  const confirmStatusUpdate = (nextStatus: 'in_progress' | 'completed') => {
    const completing = nextStatus === 'completed';
    Alert.alert(
      completing ? t.confirmCompleteTitle : t.confirmStartTitle,
      completing ? t.confirmCompleteMessage : t.confirmStartMessage,
      [{ text: t.cancel, style: 'cancel' }, { text: t.confirm, onPress: () => updateTaskStatus(nextStatus) }]
    );
  };

  const status = getStatusDetails();
  const dueInformation = getDueInformation();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#7A1020"
        translucent={false}
      />

      <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle1} pointerEvents="none" />
        <View style={styles.headerCircle2} pointerEvents="none" />
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.78}>
              <Ionicons name="chevron-back" size={17} color="#FFD54F" />
              <Text style={styles.backText}>{t.back}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}><Ionicons name="document-text-outline" size={28} color="#7A1020" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} tintColor="#7A1020" colors={['#7A1020']} onRefresh={() => { setRefreshing(true); loadTaskDetails(false); }} />}>
          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color="#7A1020" />
              <Text style={styles.stateText}>{t.loading}</Text>
            </View>
          ) : loadError || !task ? (
            <View style={styles.stateCard}>
              <View style={styles.stateIconCircle}><Ionicons name="alert-circle-outline" size={31} color="#B91C1C" /></View>
              <Text style={styles.stateTitle}>{taskId ? t.loadError : t.noTask}</Text>
              {!!taskId && (
                <TouchableOpacity style={styles.retryButton} onPress={() => loadTaskDetails()}>
                  <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>{t.retry}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.mainTaskCard}>
                <View style={styles.mainCardAccent} />
                <View style={styles.taskCodeRow}>
                  <View style={styles.taskCodeBox}>
                    <Ionicons name="barcode-outline" size={15} color="#6A1B9A" />
                    <Text style={styles.taskCodeText}>{t.taskId}: #{task.id}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                    <Ionicons name={status.icon} size={15} color={status.color} />
                    <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <Text style={styles.taskTitle}>{getLocalizedTitle(task, selectedLang)}</Text>
                {dueInformation && currentStatus !== 'completed' && (
                  <View style={[styles.dueAlert, { backgroundColor: dueInformation.background }]}>
                    <Ionicons name={dueInformation.icon} size={17} color={dueInformation.color} />
                    <Text style={[styles.dueAlertText, { color: dueInformation.color }]}>{dueInformation.text}</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>{t.description}</Text>
                </View>
                <View style={styles.descriptionCard}>
                  <View style={styles.descriptionIcon}><Ionicons name="reader-outline" size={21} color="#7A1020" /></View>
                  <Text style={styles.descriptionText}>{getLocalizedDescription(task, selectedLang) || '-'}</Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>{selectedLang === 'si' ? 'කාර්ය තොරතුරු' : selectedLang === 'ta' ? 'பணி தகவல்கள்' : 'Task Information'}</Text>
                </View>
                <View style={styles.infoCard}>
                  {/* 🔥 පවරපු නිලධාරියාගේ නම මෙතනින් බලාගත හැක */}
                  <InformationRow icon="person-circle-outline" label={t.assignedBy} value={assignerName} />
                  <View style={styles.rowDivider} />

                  <InformationRow icon="calendar-outline" label={t.dueDate} value={formatDate(task.due_date)} />
                                    <View style={styles.rowDivider} />
                  <InformationRow icon={task.assigned_to === dbUserId ? 'person-outline' : 'business-outline'} label={t.assignmentType} value={task.assigned_to === dbUserId ? t.personal : t.department} />
                  <View style={styles.rowDivider} />
                  <InformationRow icon="time-outline" label={t.createdAt} value={formatDate(task.created_at)} />
                  <View style={styles.rowDivider} />
                  <InformationRow icon="refresh-outline" label={t.updatedAt} value={formatDate(task.updated_at)} />
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.sectionTitle}>{t.currentStatus}</Text>
                </View>
                <View style={styles.progressCard}>
                  <View style={styles.progressRow}>
                    {[{ key: 'pending', label: t.pending, icon: 'clipboard-outline' as const }, { key: 'in_progress', label: t.inProgress, icon: 'construct-outline' as const }, { key: 'completed', label: t.completed, icon: 'checkmark-done-outline' as const }].map((step, index) => {
                      const progressValue = currentStatus === 'completed' ? 3 : currentStatus === 'in_progress' ? 2 : 1;
                      const stepNumber = index + 1;
                      const active = stepNumber <= progressValue;
                      return (
                        <React.Fragment key={step.key}>
                          <View style={styles.progressStep}>
                            <View style={[styles.progressCircle, active && styles.activeProgressCircle]}>
                              <Ionicons name={stepNumber < progressValue ? 'checkmark' : step.icon} size={15} color={active ? '#FFFFFF' : '#94A3B8'} />
                            </View>
                            <Text style={[styles.progressLabel, active && styles.activeProgressLabel]} numberOfLines={2}>{step.label}</Text>
                          </View>
                          {index < 2 && <View style={[styles.progressLine, stepNumber < progressValue && styles.activeProgressLine]} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>
              </View>

              {currentStatus === 'completed' ? (
                <View style={styles.completedCard}>
                  <View style={styles.completedIcon}><Ionicons name="checkmark-done" size={27} color="#FFFFFF" /></View>
                  <Text style={styles.completedText}>{t.completedMessage}</Text>
                </View>
              ) : canUpdateTask ? (
                <View style={styles.actionSection}>
                  {currentStatus === 'pending' && (
                    <TouchableOpacity disabled={updating} activeOpacity={0.86} style={[styles.startButton, updating && styles.disabledButton]} onPress={() => confirmStatusUpdate('in_progress')}>
                      {updating ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="play-outline" size={20} color="#FFFFFF" />}
                      <Text style={styles.actionButtonText}>{t.startTask}</Text>
                    </TouchableOpacity>
                  )}
                  {currentStatus === 'in_progress' && (
                    <TouchableOpacity disabled={updating} activeOpacity={0.86} style={[styles.completeButton, updating && styles.disabledButton]} onPress={() => confirmStatusUpdate('completed')}>
                      {updating ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" />}
                      <Text style={styles.actionButtonText}>{t.completeTask}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </>
          )}
          <View style={{ height: 35 }} />
        </ScrollView>
      </Animated.View>
    </View>
    </>
  );
}

interface InformationRowProps { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; }
function InformationRow({ icon, label, value }: InformationRowProps) {
  return (
    <View style={styles.informationRow}>
      <View style={styles.informationIconBox}><Ionicons name={icon} size={18} color="#7A1020" /></View>
      <View style={styles.informationContent}>
        <Text style={styles.informationLabel}>{label}</Text>
        <Text style={styles.informationValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  header: { backgroundColor: '#7A1020', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 23, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden', elevation: 10, shadowColor: '#5A0010', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14 },
  headerCircle1: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.05)', right: -55, top: -75 },
  headerCircle2: { position: 'absolute', width: 115, height: 115, borderRadius: 58, backgroundColor: 'rgba(255,255,255,0.04)', left: -20, bottom: -40 },
  headerTopRow: { flexDirection: 'row', minHeight: 34, marginBottom: 14 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  backText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIconBox: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#FFD54F', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '900' },
  headerSubtitle: { marginTop: 4, color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  body: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  mainTaskCard: { backgroundColor: '#FFFFFF', borderRadius: 21, padding: 17, borderWidth: 1, borderColor: '#E5EAF0', overflow: 'hidden', elevation: 4, shadowColor: '#1A2940', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12 },
  mainCardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#6A1B9A' },
  taskCodeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  taskCodeBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F3E8FF', borderRadius: 11, paddingHorizontal: 9, paddingVertical: 6 },
  taskCodeText: { color: '#6A1B9A', fontSize: 10, fontWeight: '900' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  taskTitle: { color: '#172033', fontSize: 21, lineHeight: 28, fontWeight: '900', marginTop: 16 },
  dueAlert: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: 12, marginTop: 14, paddingHorizontal: 10, paddingVertical: 7 },
  dueAlertText: { fontSize: 10, fontWeight: '900' },
  detailsSection: { marginTop: 19 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#7A1020' },
  sectionTitle: { color: '#1E293B', fontSize: 14, fontWeight: '900' },
  descriptionCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E5EAF0', padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 2 },
  descriptionIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  descriptionText: { flex: 1, color: '#53657A', fontSize: 13, lineHeight: 21, fontWeight: '600' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E5EAF0', paddingHorizontal: 15, paddingVertical: 5, elevation: 2 },
  informationRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 11 },
  informationIconBox: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  informationContent: { flex: 1 },
  informationLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  informationValue: { color: '#334155', fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 3 },
  rowDivider: { height: 1, backgroundColor: '#EEF2F6', marginLeft: 50 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E5EAF0', padding: 16, elevation: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 5 },
  progressStep: { width: 70, alignItems: 'center' },
  progressCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
  activeProgressCircle: { backgroundColor: '#7A1020', borderColor: '#E6B8C0' },
  progressLabel: { color: '#94A3B8', fontSize: 10, lineHeight: 14, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  activeProgressLabel: { color: '#7A1020' },
  progressLine: { position: 'absolute', top: 17, left: 35, right: 35, height: 3, backgroundColor: '#E2E8F0', zIndex: -1 },
  activeProgressLine: { backgroundColor: '#7A1020' },
  completedCard: { backgroundColor: '#E8F8EE', borderRadius: 18, borderWidth: 1, borderColor: '#A7D9B8', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  completedIcon: { width: 47, height: 47, borderRadius: 24, backgroundColor: '#16803D', alignItems: 'center', justifyContent: 'center' },
  completedText: { flex: 1, color: '#166534', fontSize: 13, lineHeight: 19, fontWeight: '900' },
  actionSection: { marginTop: 20 },
  startButton: { minHeight: 56, borderRadius: 17, backgroundColor: '#1D4ED8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4 },
  completeButton: { minHeight: 56, borderRadius: 17, backgroundColor: '#16803D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4 },
  disabledButton: { opacity: 0.55 },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  stateCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5EAF0', minHeight: 250, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25, elevation: 2 },
  stateIconCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: '#64748B', fontSize: 13, lineHeight: 19, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  stateText: { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 12 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7A1020', borderRadius: 13, marginTop: 15, paddingHorizontal: 14, paddingVertical: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' }
});