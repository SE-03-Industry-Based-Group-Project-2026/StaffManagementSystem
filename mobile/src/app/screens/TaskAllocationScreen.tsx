// app/screens/TaskAllocationScreen.tsx

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
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextProps,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';

import * as Notifications from 'expo-notifications'; // 🔥 Notifications සඳහා
import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';
type TaskFilter = 'all' | 'pending' | 'in_progress' | 'completed';

interface Props {
  selectedLang: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;

  route?: {
    params?: {
      taskId?: number;
      notificationId?: number;
      openedFromNotification?: boolean;
      openTaskDetails?: boolean;
      currentUserId?: string;
      departmentId?: number;
    };
  };
}

interface TaskItem {
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
    title: 'කාර්ය පැවරීම්',
    subtitle: 'ඔබට සහ ඔබගේ අංශයට පැවරූ කාර්යයන්',
    back: 'ආපසු',
    search: 'කාර්යයක් සොයන්න...',
    all: 'සියල්ල',
    pending: 'ආරම්භ කර නැත',
    inProgress: 'ක්‍රියාත්මකයි',
    completed: 'සම්පූර්ණයි',
    dueDate: 'අවසන් දිනය',
    frequency: 'වාරිකත්වය',
    personal: 'ඔබට පැවරූ කාර්යය',
    department: 'අංශයට පැවරූ කාර්යය',
    noTasks: 'මෙම කොටසට අදාළ කාර්යයන් නොමැත',
    loadError: 'කාර්යයන් ලබාගැනීමට නොහැකි විය',
    retry: 'නැවත උත්සාහ කරන්න',
    overdue: 'කල් ඉකුත් වී ඇත',
    today: 'අද අවසන් වේ',
    daysLeft: 'දින ඉතිරි',
    details: 'විස්තර බලන්න',
    taskCount: 'කාර්යයන්',
    loading: 'කාර්යයන් ලබාගනිමින්...',
  },

  en: {
    title: 'Task Allocation',
    subtitle: 'Tasks assigned to you and your department',
    back: 'Back',
    search: 'Search tasks...',
    all: 'All',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    dueDate: 'Due Date',
    frequency: 'Frequency',
    personal: 'Assigned to you',
    department: 'Department task',
    noTasks: 'No tasks are available in this section',
    loadError: 'Unable to load tasks',
    retry: 'Try Again',
    overdue: 'Overdue',
    today: 'Due today',
    daysLeft: 'days left',
    details: 'View Details',
    taskCount: 'tasks',
    loading: 'Loading tasks...',
  },

  ta: {
    title: 'பணி ஒதுக்கீடு',
    subtitle: 'உங்களுக்கும் உங்கள் துறைக்கும் ஒதுக்கப்பட்ட பணிகள்',
    back: 'பின்னே',
    search: 'பணிகளைத் தேடுங்கள்...',
    all: 'அனைத்தும்',
    pending: 'நிலுவையில்',
    inProgress: 'செயலில்',
    completed: 'முடிந்தது',
    dueDate: 'கடைசி தேதி',
    frequency: 'அடிக்கடி',
    personal: 'உங்களுக்கு ஒதுக்கப்பட்டது',
    department: 'துறை பணி',
    noTasks: 'இந்த பிரிவில் பணிகள் இல்லை',
    loadError: 'பணிகளை ஏற்ற முடியவில்லை',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    overdue: 'காலாவதியானது',
    today: 'இன்று முடியும்',
    daysLeft: 'நாட்கள் மீதம்',
    details: 'விவரங்களைப் பார்க்கவும்',
    taskCount: 'பணிகள்',
    loading: 'பணிகள் ஏற்றப்படுகின்றன...',
  },
};

const normalizeStatus = (value?: string | null) => {
  const status = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (status === 'completed' || status === 'complete' || status === 'done') return 'completed';
  if (status === 'in_progress' || status === 'progress' || status === 'started') return 'in_progress';
  return 'pending';
};

const getLocalizedTitle = (task: TaskItem, lang: Language) => {
  if (lang === 'si' && task.title_si) return task.title_si;
  if (lang === 'ta' && task.title_ta) return task.title_ta;
  if (lang === 'en' && task.title_en) return task.title_en;
  return task.title || task.title_en || task.title_si || task.title_ta || '';
};

const getLocalizedDescription = (task: TaskItem, lang: Language) => {
  if (lang === 'si' && task.description_si) return task.description_si;
  if (lang === 'ta' && task.description_ta) return task.description_ta;
  if (lang === 'en' && task.description_en) return task.description_en;
  return task.description || task.description_en || task.description_si || task.description_ta || '';
};

export default function TaskAllocationScreen({
  selectedLang,
  onNavigate,
  onBack,
  route,
}: Props) {
  const t = L[selectedLang] ?? L.en;

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [dbUserId, setDbUserId] = useState<string | null>(route?.params?.currentUserId || null);
  const [departmentId, setDepartmentId] = useState<number | null>(route?.params?.departmentId || null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const notificationOpenedRef = useRef(false);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('id, department_id')
        .eq('auth_id', user.id)
        .single();

      if (error || !data) return null;

      setDbUserId(data.id);
      setDepartmentId(data.department_id || null);

      return { userId: data.id as string, departmentId: data.department_id as number | null };
    } catch (error) {
      return null;
    }
  }, []);

  // 🔥 දවසක් ඉතිරිව ඇති කාර්යයන් සඳහා Device එකෙන්ම Notification එකක් යැවීම
  const scheduleTaskReminders = async (tasksList: TaskItem[]) => {
    try {
      // පරණ හදපු ඒවා අයින් කරලා අලුතින් update කරනවා (Duplicate වීම වළක්වන්න)
      await Notifications.cancelAllScheduledNotificationsAsync(); 

      tasksList.forEach(async (task) => {
        if (normalizeStatus(task.status) !== 'completed' && task.due_date) {
          const dueDate = new Date(task.due_date);
          const reminderDate = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000)); // දවසකට කලින්
          
          if (reminderDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: selectedLang === 'si' ? "කාර්යය කල් ඉකුත් වේ!" : "Task Due Soon!",
                body: selectedLang === 'si' 
                  ? `ඔබේ '${getLocalizedTitle(task, selectedLang)}' කාර්යය හෙටින් අවසන් වේ.`
                  : `Your task '${getLocalizedTitle(task, selectedLang)}' is due tomorrow.`,
              },
              trigger: { date: reminderDate } as any,
            });
          }
        }
      });
    } catch (err) {
      console.log('Notification schedule error:', err);
    }
  };

  const fetchTasks = useCallback(
    async (showMainLoader = true) => {
      if (showMainLoader) setLoading(true);
      setLoadError(false);

      try {
        let userId = dbUserId;
        let deptId = departmentId;

        if (!userId) {
          const currentUser = await loadCurrentUser();
          if (!currentUser) { setLoadError(true); return; }
          userId = currentUser.userId;
          deptId = currentUser.departmentId;
        }

        let visibilityFilter = `assigned_to.eq.${userId}`;
        if (deptId !== null && deptId !== undefined) {
          visibilityFilter += `,department_id.eq.${deptId}`;
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .or(visibilityFilter)
          .order('due_date', { ascending: true });

        if (error) {
          setLoadError(true);
          return;
        }

        // 🔥 අවුරුද්දකට පෙර Completed වූ Tasks App එකෙන් අයින් කිරීම (Hide කිරීම)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const filteredFromOldCompleted = ((data || []) as TaskItem[]).filter(task => {
          const isCompleted = normalizeStatus(task.status) === 'completed';
          const updateDate = task.updated_at ? new Date(task.updated_at) : new Date();
          if (isCompleted && updateDate < oneYearAgo) return false; // පරණ ඒවා පෙන්වන්නේ නෑ
          return true; // අනිත් ඔක්කොම පෙන්වනවා
        });

        const uniqueTasks = Array.from(
          new Map(filteredFromOldCompleted.map((item) => [item.id, item])).values()
        );

        setTasks(uniqueTasks);
        
        // Notifications Schedule කිරීම
        scheduleTaskReminders(uniqueTasks);

      } catch (error) {
        setLoadError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dbUserId, departmentId, loadCurrentUser]
  );

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!dbUserId) return;
    const channel = supabase.channel(`mobile-task-allocation-${dbUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { fetchTasks(false); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dbUserId, fetchTasks]);

  useEffect(() => {
    const taskId = route?.params?.taskId;
    if (!taskId || notificationOpenedRef.current || loading) return;

    const taskExists = tasks.some((item) => Number(item.id) === Number(taskId));
    if (taskExists || route?.params?.openTaskDetails) {
      notificationOpenedRef.current = true;
      onNavigate('TaskDetails', {
        taskId: Number(taskId),
        openedFromNotification: route?.params?.openedFromNotification,
        notificationId: route?.params?.notificationId,
      });
    }
  }, [route?.params?.taskId, route?.params?.openTaskDetails, route?.params?.openedFromNotification, route?.params?.notificationId, tasks, loading, onNavigate]);

  const filteredTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return tasks.filter((task) => {
      const status = normalizeStatus(task.status);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const title = getLocalizedTitle(task, selectedLang).toLowerCase();
      const description = getLocalizedDescription(task, selectedLang).toLowerCase();
      const matchesSearch = query.length === 0 || title.includes(query) || description.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchText, selectedLang]);

  const taskStatistics = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((item) => normalizeStatus(item.status) === 'pending').length,
      in_progress: tasks.filter((item) => normalizeStatus(item.status) === 'in_progress').length,
      completed: tasks.filter((item) => normalizeStatus(item.status) === 'completed').length,
    };
  }, [tasks]);

  const getStatusDetails = (statusValue?: string | null) => {
    const status = normalizeStatus(statusValue);
    if (status === 'completed') return { label: t.completed, background: '#DCFCE7', color: '#166534', icon: 'checkmark-circle' as const };
    if (status === 'in_progress') return { label: t.inProgress, background: '#DBEAFE', color: '#1D4ED8', icon: 'sync-circle' as const };
    return { label: t.pending, background: '#FEF3C7', color: '#92400E', icon: 'time' as const };
  };

  const getDueDateDetails = (dueDateValue: string) => {
    const dueDate = new Date(dueDateValue);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const difference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (difference < 0) return { label: t.overdue, color: '#B91C1C', background: '#FEE2E2' };
    if (difference === 0) return { label: t.today, color: '#B45309', background: '#FFEDD5' };
    return { label: `${difference} ${t.daysLeft}`, color: '#166534', background: '#DCFCE7' };
  };

  // 🔥 මාස සිංහලෙන් නිවැරදිව පෙන්වීම
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    if (selectedLang === 'si') {
      const monthsSi = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
      const month = monthsSi[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${year} ${month} ${day}`;
    }

    return date.toLocaleDateString(selectedLang === 'ta' ? 'ta-LK' : 'en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filters: Array<{ key: TaskFilter; label: string; count: number }> = [
    { key: 'all', label: t.all, count: taskStatistics.all },
    { key: 'pending', label: t.pending, count: taskStatistics.pending },
    { key: 'in_progress', label: t.inProgress, count: taskStatistics.in_progress },
    { key: 'completed', label: t.completed, count: taskStatistics.completed },
  ];

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
          <View style={styles.headerIconBox}><Ionicons name="clipboard-outline" size={27} color="#7A1020" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} tintColor="#7A1020" colors={['#7A1020']} onRefresh={() => { setRefreshing(true); fetchTasks(false); }} />}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#7A1020" />
            <TextInput value={searchText} onChangeText={setSearchText} placeholder={t.search} placeholderTextColor="#94A3B8" style={styles.searchInput} allowFontScaling={false} />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchButton}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <TouchableOpacity key={filter.key} activeOpacity={0.8} onPress={() => setActiveFilter(filter.key)} style={[styles.filterButton, active && styles.activeFilterButton]}>
                  <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>{filter.label}</Text>
                  <View style={[styles.filterCount, active && styles.activeFilterCount]}>
                    <Text style={[styles.filterCountText, active && styles.activeFilterCountText]}>{filter.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionTitleLeft}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>{activeFilter === 'all' ? t.all : activeFilter === 'pending' ? t.pending : activeFilter === 'in_progress' ? t.inProgress : t.completed}</Text>
            </View>
            <Text style={styles.resultCount}>{filteredTasks.length} {t.taskCount}</Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="large" color="#7A1020" />
              <Text style={styles.stateText}>{t.loading}</Text>
            </View>
          ) : loadError ? (
            <View style={styles.stateCard}>
              <View style={styles.stateIconCircle}><Ionicons name="cloud-offline-outline" size={29} color="#B91C1C" /></View>
              <Text style={styles.stateTitle}>{t.loadError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchTasks()}>
                <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>{t.retry}</Text>
              </TouchableOpacity>
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={styles.stateCard}>
              <View style={styles.stateIconCircle}><Ionicons name="clipboard-outline" size={30} color="#7A1020" /></View>
              <Text style={styles.stateTitle}>{t.noTasks}</Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {filteredTasks.map((task) => {
                const status = getStatusDetails(task.status);
                const dueDate = getDueDateDetails(task.due_date);
                const isPersonalTask = task.assigned_to && task.assigned_to === dbUserId;

                return (
                  <TouchableOpacity key={task.id} activeOpacity={0.88} style={styles.taskCard} onPress={() => onNavigate('TaskDetails', { taskId: task.id })}>
                    <View style={styles.taskCardAccent} />
                    <View style={styles.taskCardTop}>
                      <View style={styles.taskNumberBox}><Text style={styles.taskNumberText}>#{task.id}</Text></View>
                      <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                        <Ionicons name={status.icon} size={14} color={status.color} />
                        <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.taskTitle} numberOfLines={2}>{getLocalizedTitle(task, selectedLang)}</Text>
                    {!!getLocalizedDescription(task, selectedLang) && (
                      <Text style={styles.taskDescription} numberOfLines={3}>{getLocalizedDescription(task, selectedLang)}</Text>
                    )}

                    <View style={styles.assignmentBadgeRow}>
                      <View style={[styles.assignmentBadge, isPersonalTask ? styles.personalAssignmentBadge : styles.departmentAssignmentBadge]}>
                        <Ionicons name={isPersonalTask ? 'person-outline' : 'business-outline'} size={13} color={isPersonalTask ? '#6A1B9A' : '#1A5C3A'} />
                        <Text style={[styles.assignmentBadgeText, { color: isPersonalTask ? '#6A1B9A' : '#1A5C3A' }]}>{isPersonalTask ? t.personal : t.department}</Text>
                      </View>
                    </View>

                    <View style={styles.taskInformationBox}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoLabelRow}><Ionicons name="calendar-outline" size={15} color="#64748B" /><Text style={styles.infoLabel}>{t.dueDate}</Text></View>
                        <Text style={styles.infoValue}>{formatDate(task.due_date)}</Text>
                      </View>
                      {!!task.frequency && (
                        <View style={styles.infoRow}>
                          <View style={styles.infoLabelRow}><Ionicons name="repeat-outline" size={15} color="#64748B" /><Text style={styles.infoLabel}>{t.frequency}</Text></View>
                          <Text style={styles.infoValue}>{task.frequency}</Text>
                        </View>
                      )}
                    </View>

                    {normalizeStatus(task.status) !== 'completed' && (
                      <View style={[styles.dueStatusBox, { backgroundColor: dueDate.background }]}>
                        <Ionicons name={dueDate.label === t.overdue ? 'warning-outline' : 'time-outline'} size={14} color={dueDate.color} />
                        <Text style={[styles.dueStatusText, { color: dueDate.color }]}>{dueDate.label}</Text>
                      </View>
                    )}

                    <View style={styles.cardFooter}>
                      <Text style={styles.detailsText}>{t.details}</Text>
                      <View style={styles.detailsArrow}><Ionicons name="chevron-forward" size={17} color="#7A1020" /></View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </Animated.View>
    </View>
    </>
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
  searchBox: { minHeight: 52, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, elevation: 2, shadowColor: '#1A2940', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 7 },
  searchInput: { flex: 1, marginLeft: 9, color: '#1E293B', fontSize: 14, fontWeight: '600', paddingVertical: 10 },
  clearSearchButton: { padding: 5 },
  filterRow: { gap: 9, paddingVertical: 17, paddingRight: 10 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingLeft: 13, paddingRight: 8, paddingVertical: 8 },
  activeFilterButton: { backgroundColor: '#7A1020', borderColor: '#7A1020' },
  filterButtonText: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  activeFilterButtonText: { color: '#FFFFFF' },
  filterCount: { minWidth: 23, height: 23, borderRadius: 12, paddingHorizontal: 6, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  activeFilterCount: { backgroundColor: '#FFD54F' },
  filterCountText: { color: '#475569', fontSize: 10, fontWeight: '900' },
  activeFilterCountText: { color: '#7A1020' },
  sectionHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  sectionTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: '#7A1020' },
  sectionTitle: { color: '#1E293B', fontSize: 14, fontWeight: '900' },
  resultCount: { color: '#7A1020', fontSize: 11, fontWeight: '800' },
  taskList: { gap: 14 },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#E8ECF1', overflow: 'hidden', elevation: 3, shadowColor: '#1A2940', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 10 },
  taskCardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, backgroundColor: '#6A1B9A' },
  taskCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskNumberBox: { backgroundColor: '#F3E8FF', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  taskNumberText: { color: '#6A1B9A', fontSize: 10, fontWeight: '900' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  taskTitle: { color: '#172033', fontSize: 17, lineHeight: 23, fontWeight: '900', marginTop: 13 },
  taskDescription: { color: '#64748B', fontSize: 12, lineHeight: 18, fontWeight: '600', marginTop: 6 },
  assignmentBadgeRow: { flexDirection: 'row', marginTop: 11 },
  assignmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 5 },
  personalAssignmentBadge: { backgroundColor: '#F3E8FF' },
  departmentAssignmentBadge: { backgroundColor: '#DCFCE7' },
  assignmentBadgeText: { fontSize: 9, fontWeight: '900' },
  taskInformationBox: { backgroundColor: '#F8FAFC', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, marginTop: 12, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoLabel: { color: '#64748B', fontSize: 10, fontWeight: '700' },
  infoValue: { color: '#334155', fontSize: 10, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  dueStatusBox: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 5, marginTop: 10 },
  dueStatusText: { fontSize: 9, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 7, marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#EEF2F6' },
  detailsText: { color: '#7A1020', fontSize: 11, fontWeight: '900' },
  detailsArrow: { width: 27, height: 27, borderRadius: 9, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  stateCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E5EAF0', minHeight: 210, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25, elevation: 2 },
  stateIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: '#64748B', fontSize: 13, lineHeight: 19, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  stateText: { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 12 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7A1020', borderRadius: 13, marginTop: 15, paddingHorizontal: 14, paddingVertical: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
});