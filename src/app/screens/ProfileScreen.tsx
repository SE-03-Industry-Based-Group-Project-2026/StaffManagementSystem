// app/screens/ProfileScreen.tsx — Premium 2026 Production Edition (With Pending Request Lock & User Notifications)
import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showLeaveNotification } from '../../lib/notificationService'; 

interface Props { t: any; onNavigate: (screen: string) => void; onLogout: () => void; }

export default function ProfileScreen({ t, onNavigate, onLogout }: Props) {
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false); 
  
  // States for Editing
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  
  // State for Calendar (Birthday)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date()); // 🔥 iOS birthday calendar selected date
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date()); // 🔥 iOS calendar visible month
  const [calendarSelector, setCalendarSelector] = useState<'calendar' | 'month' | 'year'>('calendar');

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(20)).current; 

  const currentLang = useMemo(() => t?.updateBtn?.includes('යාවත්කාලීන') ? 'si' : t?.updateBtn?.includes('புதுப்பிக்கவும்') ? 'ta' : 'en', [t]);

  const localT = useMemo(() => {
    const dict = {
      si: { title: 'පැතිකඩ', back: 'ආපසු', nicLabel: 'හැඳුනුම්පත් අංකය', deptLabel: 'අංශය', roleLabel: 'තනතුර', joinedDateLabel: 'එක් වූ දිනය', logoutBtn: 'පද්ධතියෙන් ඉවත් වන්න', roleFallback: 'තනතුර සඳහන් කර නැත', deptFallback: 'අංශය සඳහන් කර නැත', phoneLabel: 'දුරකථන අංකය', birthdayLabel: 'උපන් දිනය', genderLabel: 'ස්ත්‍රී/පුරුෂ භාවය', requestChangeBtn: 'තනතුර/අංශය වෙනස් කිරීමට ඉල්ලන්න', requestConfirm: 'ඇඩ්මින් වෙත ඉල්ලීමක් යවන්නද?', requestSuccess: 'ඔබගේ ඉල්ලීම සාර්ථකව යවන ලදී.', saveSuccess: 'සාර්ථකයි!', saveError: 'දෝෂයකි', updateMsg: 'තොරතුරු යාවත්කාලීන විය.', yes: 'ඔව්', no: 'නැත', pendingRequest: 'ඉල්ලීම අනුමැතිය සඳහා යවා ඇත' },
      en: { title: 'My Profile', back: 'Back', nicLabel: 'ID Number', deptLabel: 'Department', roleLabel: 'Role', joinedDateLabel: 'Joined Date', logoutBtn: 'Log Out', roleFallback: 'Role not set', deptFallback: 'Dept not set', phoneLabel: 'Phone Number', birthdayLabel: 'Birthday', genderLabel: 'Gender', requestChangeBtn: 'Request Role/Dept Change', requestConfirm: 'Send request to Admin?', requestSuccess: 'Request sent successfully.', saveSuccess: 'Success!', saveError: 'Error', updateMsg: 'Information updated successfully.', yes: 'Yes', no: 'No', pendingRequest: 'Request Pending Approval' },
      ta: { title: 'சுயவிவரம்', back: 'பின்னே', nicLabel: 'ஐடி எண்', deptLabel: 'துறை', roleLabel: 'பதவி', joinedDateLabel: 'சேர்ந்த தேதி', logoutBtn: 'வெளியேறு', roleFallback: 'பதவி இல்லை', deptFallback: 'துறை இல்லை', phoneLabel: 'தொலைபேசி எண்', birthdayLabel: 'பிறந்த தேதி', genderLabel: 'பாலினம்', requestChangeBtn: 'பதவி/துறை மாற்ற கோரிக்கை', requestConfirm: 'நிர்வாகிக்கு கோரிக்கை அனுப்பவா?', requestSuccess: 'கோரிக்கை அனுப்பப்பட்டது.', saveSuccess: 'வெற்றி!', saveError: 'பிழை', updateMsg: 'தகவல் புதுப்பிக்கப்பட்டது.', yes: 'ஆம்', no: 'இல்லை', pendingRequest: 'கோரிக்கை நிலுவையில் உள்ளது' }
    };
    return dict[currentLang as keyof typeof dict];
  }, [currentLang]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('users').select(`
      id, department_id, designation_id,
      title, joined_date,
      full_name, full_name_si, full_name_ta, 
      avatar_url, nic, phone, birthday, gender, created_at, 
      departments ( department_name, department_name_si, department_name_ta ),
      designations ( designation_en, designation_si, designation_ta )
    `).eq('auth_id', user.id).single();

    if (data) {
      const getName = (en: string, si: string, ta: string) => currentLang === 'si' ? (si || en) : (currentLang === 'ta' ? (ta || en) : en);
      
      const formatJoinedDate = (dateValue: string | null) => {
        if (!dateValue) return 'N/A';
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return dateValue;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };
      
      const getGender = (g: string) => {
        if(!g) return 'N/A';
        if(g.toLowerCase() === 'male') return currentLang==='si'?'පුරුෂ':currentLang==='ta'?'ஆண்':'Male';
        if(g.toLowerCase() === 'female') return currentLang==='si'?'ස්ත්‍රී':currentLang==='ta'?'பெண்':'Female';
        return g;
      };

      const uDesig: any = Array.isArray(data.designations) ? data.designations[0] : data.designations;
      const uDept: any = Array.isArray(data.departments) ? data.departments[0] : data.departments;

      let formattedTitle = '';
      if (data.title) {
        const tText = data.title.trim();
        formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
      }
      const finalName = `${formattedTitle}${getName(data.full_name, data.full_name_si, data.full_name_ta)}`;

      setUserData({
        dbUserId: data.id, 
        deptId: data.department_id, 
        desigId: data.designation_id, 
        name: finalName, 
        role: getName(uDesig?.designation_en, uDesig?.designation_si, uDesig?.designation_ta) || localT.roleFallback,
        dept: getName(uDept?.department_name, uDept?.department_name_si, uDept?.department_name_ta) || localT.deptFallback,
        joinedDate: formatJoinedDate(data.joined_date), 
        nic: data.nic || 'N/A',
        phone: data.phone || 'N/A',
        birthday: data.birthday || 'YYYY-MM-DD',
        gender: getGender(data.gender),
        avatar: data.avatar_url,
      });

      const { data: pendingReq } = await supabase
        .from('profile_change_requests')
        .select('id')
        .eq('user_id', data.id)
        .eq('status', 'pending')
        .single();
      
      if (pendingReq) {
        setHasPendingRequest(true);
      }
    }
  };

  const uploadAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (result.canceled) return;

    setUploading(true);
    try {
      const { uri } = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `avatars/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('auth_id', user?.id);

      fetchProfile(); 
    } catch (error: any) {
      Alert.alert(localT.saveError, error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRequestChange = () => {
    if (hasPendingRequest) return;

    Alert.alert(localT.requestConfirm, '', [
        { text: localT.no, style: 'cancel' },
        { text: localT.yes, onPress: async () => {
            
            if (!userData?.dbUserId) {
              Alert.alert(localT.saveError, "System Error: Database User ID එක ලබාගැනීමට නොහැක!");
              return;
            }
            
            setRequesting(true);
            try {
              const oldValues = JSON.stringify({ 
                department_id: userData.deptId || null, 
                designation_id: userData.desigId || null 
              });
              const newValues = JSON.stringify({});

              const { data: requestData, error: insertError } = await supabase.from('profile_change_requests').insert([{ 
                user_id: userData.dbUserId,
                old_value: oldValues,
                new_value: newValues,
                status: 'pending'
              }]).select('id').single();

              if (insertError) throw insertError;

              setHasPendingRequest(true);
              
              const { data: adminUser } = await supabase
                .from('users')
                .select('id')
                .ilike('full_name', '%System Administrator%')
                .limit(1)
                .single();

              if (adminUser?.id) {
                const titleEn = 'Profile Change Request';
                const titleSi = 'පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්';
                const titleTa = 'சுயவிவர மாற்ற கோரிக்கை';

                const msgEn = `${userData.name} has requested a role/department change.`;
                const msgSi = `${userData.name} විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.`;
                const msgTa = `${userData.name} பதவி/துறை மாற்ற கோரியுள்ளார்.`;

                const finalTitle = currentLang === 'si' ? titleSi : currentLang === 'ta' ? titleTa : titleEn;
                const finalMsg = currentLang === 'si' ? msgSi : currentLang === 'ta' ? msgTa : msgEn;

                await supabase.from('notifications').insert({
                  user_id: adminUser.id, 
                  title: finalTitle,
                  message: finalMsg,
                  title_en: titleEn,
                  title_si: titleSi,
                  title_ta: titleTa,
                  message_en: msgEn,
                  message_si: msgSi,
                  message_ta: msgTa,
                  is_read: false,
                  is_auto_generated: true,
                  created_by: userData.dbUserId,
                  notification_type: 'profile_change', 
                  related_entity: 'profile_change_requests',
                  related_id: requestData.id,
                  is_for_mobile: true,
                  created_at: new Date().toISOString()
                });
              }

              const notifTitle = currentLang === 'si' ? 'ඉල්ලීම යවන ලදී' : currentLang === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது' : 'Request Sent';
              const notifBody = currentLang === 'si' ? 'ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම සාර්ථකව යවන ලදී.' : currentLang === 'ta' ? 'உங்கள் சுயவிவர மாற்ற கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது.' : 'Your profile change request was successfully sent.';

              await showLeaveNotification({
                title: notifTitle,
                body: notifBody,
                requestId: requestData.id 
              });

              Alert.alert(localT.saveSuccess, localT.requestSuccess);
            } catch (err: any) {
              Alert.alert(localT.saveError, err.message || "දත්ත ඇතුලත් කිරීම අසාර්ථකයි!");
            } finally {
              setRequesting(false);
            }
        }}
    ]);
  };

  const handlePhoneSave = async () => {
    Keyboard.dismiss();

    const phoneRegex = /^\+94\d{9}$/;
    if (!phoneRegex.test(phoneValue)) {
      const title = currentLang === 'si' ? 'වැරදි අංකයකි' : currentLang === 'ta' ? 'தவறான எண்' : 'Invalid Number';
      const msg = currentLang === 'si' ? 'දුරකථන අංකය +94 න් ආරම්භ විය යුතු අතර ඉන්පසු ඉලක්කම් 9ක් තිබිය යුතුය. (උදා: +94712345678)' : currentLang === 'ta' ? 'தொலைபேசி எண் +94 உடன் தொடங்கி 9 இலக்கங்களைக் கொண்டிருக்க வேண்டும்.' : 'Phone number must start with +94 followed by 9 digits. (e.g. +94712345678)';
      Alert.alert(title, msg);
      return;
    }

    setSavingPhone(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('users').update({ phone: phoneValue }).eq('auth_id', user?.id);
      setUserData((prev: any) => ({ ...prev, phone: phoneValue }));
      setEditingPhone(false);
      Alert.alert(localT.saveSuccess, localT.updateMsg);
    } catch (err: any) {
      Alert.alert(localT.saveError, err.message);
    } finally {
      setSavingPhone(false);
    }
  };

  // 🔥 Android Date Picker එක සහ iOS Save එක Handle කරන තැන
  const handleDateChange = async (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      if (formattedDate === userData.birthday) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('users').update({ birthday: formattedDate }).eq('auth_id', user?.id);
        setUserData((prev: any) => ({ ...prev, birthday: formattedDate }));
        Alert.alert(localT.saveSuccess, localT.updateMsg);
      } catch (err: any) {
        Alert.alert(localT.saveError, err.message);
      }
    }
  };

  useEffect(() => { 
    fetchProfile(); 
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }), 
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start(); 
  }, []);

  if (!userData) return <View style={styles.root}><ActivityIndicator size="large" color="#7A1020" style={{ marginTop: 100 }} /></View>;

  const getInitialDate = () => {
    if (userData.birthday && userData.birthday !== 'YYYY-MM-DD' && userData.birthday !== 'N/A') {
      return new Date(userData.birthday);
    }
    return new Date();
  };


  // 🔥 Custom iOS birthday calendar
  const monthNames = currentLang === 'si'
    ? ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්']
    : currentLang === 'ta'
      ? ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = currentLang === 'si'
    ? ['සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන', 'ඉරි']
    : currentLang === 'ta'
      ? ['தி', 'செ', 'பு', 'வி', 'வெ', 'ச', 'ஞா']
      : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    // JS starts Sunday=0; convert to Monday=0.
    const firstDay = new Date(year, month, 1).getDay();
    const mondayOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<number | null> = [];
    for (let i = 0; i < mondayOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const selectCalendarDay = (day: number) => {
    const selected = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );

    // Birthday cannot be a future date.
    if (selected.getTime() > new Date().getTime()) return;

    setTempDate(selected);
  };

  const goPreviousMonth = () => {
    setCalendarMonth(
      prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goNextMonth = () => {
    const next = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      1
    );
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Do not allow navigating beyond the current month.
    if (next.getTime() <= currentMonth.getTime()) {
      setCalendarMonth(next);
    }
  };

  const currentYear = new Date().getFullYear();

  const availableYears = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, index) => currentYear - index
  );

  const selectYear = (year: number) => {
    const maxDay = new Date(year, calendarMonth.getMonth() + 1, 0).getDate();
    const safeDay = Math.min(tempDate.getDate(), maxDay);
    const next = new Date(year, calendarMonth.getMonth(), safeDay);

    if (next.getTime() <= new Date().getTime()) {
      setTempDate(next);
      setCalendarMonth(new Date(year, calendarMonth.getMonth(), 1));
      setCalendarSelector('calendar');
    }
  };

  const selectMonth = (month: number) => {
    const maxDay = new Date(calendarMonth.getFullYear(), month + 1, 0).getDate();
    const safeDay = Math.min(tempDate.getDate(), maxDay);
    const next = new Date(calendarMonth.getFullYear(), month, safeDay);

    if (next.getTime() <= new Date().getTime()) {
      setTempDate(next);
      setCalendarMonth(new Date(calendarMonth.getFullYear(), month, 1));
      setCalendarSelector('calendar');
    }
  };

  const doneText = currentLang === 'si' ? 'සුරකින්න' : currentLang === 'ta' ? 'சேமி' : 'Save';
  const cancelText = currentLang === 'si' ? 'අවලංගු කරන්න' : currentLang === 'ta' ? 'ரத்து செய்' : 'Cancel';

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#7A1020"
        translucent={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.root}
        keyboardVerticalOffset={20}
      >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnPill} onPress={() => onNavigate('Dashboard')}><Ionicons name="chevron-back" size={16} color="#FFD54F" /><Text style={styles.backText}>{localT.back}</Text></TouchableOpacity>
        <Text style={styles.hTitle}>{localT.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }} style={styles.largeProfileImg} />
              <TouchableOpacity style={styles.editCameraBadge} onPress={uploadAvatar} disabled={uploading}>
                {uploading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="camera" size={20} color="#FFF" />}
              </TouchableOpacity>
            </View>
            <Text style={styles.profileTextName}>{userData.name}</Text>
          </View>

          <View style={styles.metaDataCard}>
            <View style={styles.dataRow}><View style={styles.rowIconBox}><Ionicons name="id-card-outline" size={18} color="#7A1020" /></View><View style={styles.rowTextCol}><Text style={styles.key}>{localT.nicLabel}</Text><Text style={styles.val}>{userData.nic}</Text></View></View>
            <View style={styles.rowDivider} />
            <View style={styles.dataRow}><View style={[styles.rowIconBox, { backgroundColor: '#F0FDFA' }]}><Ionicons name="business-outline" size={18} color="#0F766E" /></View><View style={styles.rowTextCol}><Text style={styles.key}>{localT.deptLabel}</Text><Text style={styles.val}>{userData.dept}</Text></View></View>
            <View style={styles.rowDivider} />
            <View style={styles.dataRow}><View style={[styles.rowIconBox, { backgroundColor: '#FFF7ED' }]}><Ionicons name="briefcase-outline" size={18} color="#B45309" /></View><View style={styles.rowTextCol}><Text style={styles.key}>{localT.roleLabel}</Text><Text style={styles.val}>{userData.role}</Text></View></View>
            <View style={styles.rowDivider} />
            <View style={styles.dataRow}><View style={[styles.rowIconBox, { backgroundColor: '#F3E8FF' }]}><Ionicons name="male-female-outline" size={18} color="#7E22CE" /></View><View style={styles.rowTextCol}><Text style={styles.key}>{localT.genderLabel}</Text><Text style={styles.val}>{userData.gender}</Text></View></View>
            <View style={styles.rowDivider} />
            <View style={styles.dataRow}><View style={[styles.rowIconBox, { backgroundColor: '#F5F3FF' }]}><Ionicons name="calendar-outline" size={18} color="#7C3AED" /></View><View style={styles.rowTextCol}><Text style={styles.key}>{localT.joinedDateLabel}</Text><Text style={styles.val}>{userData.joinedDate}</Text></View></View>
            <View style={styles.rowDivider} />
            
            <View style={styles.dataRow}>
              <View style={[styles.rowIconBox, { backgroundColor: '#FEF3C7' }]}><Ionicons name="gift-outline" size={18} color="#D97706" /></View>
              <View style={styles.rowTextCol}>
                <Text style={styles.key}>{localT.birthdayLabel}</Text>
                <Text style={styles.val}>{userData.birthday}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                const initialDate = getInitialDate();
                setTempDate(initialDate);
                setCalendarMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
                setCalendarSelector('calendar');
                setShowDatePicker(true);
              }} style={styles.editIconBtn}>
                <Ionicons name="create" size={24} color="#7A1020" />
              </TouchableOpacity>
            </View>
            <View style={styles.rowDivider} />

            <View style={styles.dataRow}>
              <View style={[styles.rowIconBox, { backgroundColor: '#EFF6FF' }]}><Ionicons name="call-outline" size={18} color="#1D4ED8" /></View>
              <View style={styles.rowTextCol}>
                <Text style={styles.key}>{localT.phoneLabel}</Text>
                {editingPhone ? (
                  <TextInput 
                    style={styles.inlineInput} 
                    value={phoneValue} 
                    onChangeText={setPhoneValue} 
                    autoFocus 
                    keyboardType="phone-pad"
                    placeholder="+947X XXX XXXX"
                    maxLength={12} 
                  />
                ) : (
                  <Text style={styles.val}>{userData.phone}</Text>
                )}
              </View>
              {editingPhone ? (
                savingPhone ? <ActivityIndicator size="small" color="#10B981" /> :
                <TouchableOpacity onPress={handlePhoneSave} style={styles.editIconBtn}>
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { 
                  setEditingPhone(true); 
                  let p = userData.phone && userData.phone !== 'N/A' ? userData.phone : '+94';
                  if (!p.startsWith('+94')) {
                    if (p.startsWith('0')) p = '+94' + p.substring(1);
                    else p = '+94' + p;
                  }
                  setPhoneValue(p);
                }} style={styles.editIconBtn}>
                  <Ionicons name="create" size={24} color="#7A1020" />
                </TouchableOpacity>
              )}
            </View>

          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.blockActionBtn, hasPendingRequest && styles.disabledBtn]} 
              onPress={handleRequestChange} 
              disabled={requesting || hasPendingRequest}
            >
              {requesting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.blockActionBtnText}>
                  {hasPendingRequest ? localT.pendingRequest : localT.requestChangeBtn}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileRedLogoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.profileRedLogoutButtonText}>{localT.logoutBtn}</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* 🔥 iOS සඳහා Birthday Calendar popup */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosPickerCancelBtn}>{cancelText}</Text>
                </TouchableOpacity>

                <Text style={styles.iosCalendarTitle}>
                  {currentLang === 'si'
                    ? 'උපන් දිනය'
                    : currentLang === 'ta'
                      ? 'பிறந்த தேதி'
                      : 'Birthday'}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                    handleDateChange({ type: 'set' }, tempDate);
                  }}
                >
                  <Text style={styles.iosPickerDoneBtn}>{doneText}</Text>
                </TouchableOpacity>
              </View>

              {calendarSelector === 'calendar' && (
                <>
                  <View style={styles.calendarMonthHeader}>
                    <TouchableOpacity
                      onPress={goPreviousMonth}
                      style={styles.calendarArrowBtn}
                    >
                      <Ionicons name="chevron-back" size={24} color="#1D4ED8" />
                    </TouchableOpacity>

                    <View style={styles.monthYearButtons}>
                      <TouchableOpacity
                        onPress={() => setCalendarSelector('month')}
                        style={styles.monthYearButton}
                      >
                        <Text style={styles.calendarMonthText}>
                          {monthNames[calendarMonth.getMonth()]}
                        </Text>
                        <Ionicons name="chevron-down" size={15} color="#1D4ED8" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setCalendarSelector('year')}
                        style={styles.monthYearButton}
                      >
                        <Text style={styles.calendarMonthText}>
                          {calendarMonth.getFullYear()}
                        </Text>
                        <Ionicons name="chevron-down" size={15} color="#1D4ED8" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={goNextMonth}
                      style={styles.calendarArrowBtn}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#1D4ED8" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarWeekRow}>
                    {weekDays.map(day => (
                      <Text key={day} style={styles.calendarWeekText}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.calendarGrid}>
                    {getCalendarDays().map((day, index) => {
                      if (day === null) {
                        return (
                          <View
                            key={`empty-${index}`}
                            style={styles.calendarDayCell}
                          />
                        );
                      }

                      const dayDate = new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth(),
                        day
                      );

                      const selected = isSameDate(dayDate, tempDate);
                      const today = isSameDate(dayDate, new Date());
                      const future = dayDate.getTime() > new Date().getTime();

                      return (
                        <TouchableOpacity
                          key={`${calendarMonth.getFullYear()}-${calendarMonth.getMonth()}-${day}`}
                          disabled={future}
                          onPress={() => selectCalendarDay(day)}
                          style={[
                            styles.calendarDayCell,
                            selected && styles.calendarSelectedDay,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              today && styles.calendarTodayText,
                              selected && styles.calendarSelectedDayText,
                              future && styles.calendarFutureText,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {calendarSelector === 'month' && (
                <View style={styles.selectorContainer}>
                  <View style={styles.selectorHeader}>
                    <TouchableOpacity
                      onPress={() => setCalendarSelector('calendar')}
                    >
                      <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
                    </TouchableOpacity>
                    <Text style={styles.selectorTitle}>
                      {calendarMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCalendarSelector('year')}
                    >
                      <Ionicons name="chevron-forward" size={22} color="#1D4ED8" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.monthGrid}>
                    {monthNames.map((month, index) => {
                      const selected = index === calendarMonth.getMonth();

                      return (
                        <TouchableOpacity
                          key={month}
                          onPress={() => selectMonth(index)}
                          style={[
                            styles.monthCell,
                            selected && styles.selectorSelectedCell,
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthCellText,
                              selected && styles.selectorSelectedText,
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {calendarSelector === 'year' && (
                <View style={styles.selectorContainer}>
                  <View style={styles.selectorHeader}>
                    <TouchableOpacity
                      onPress={() => setCalendarSelector('calendar')}
                    >
                      <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
                    </TouchableOpacity>
                    <Text style={styles.selectorTitle}>
                      {currentLang === 'si'
                        ? 'වර්ෂය තෝරන්න'
                        : currentLang === 'ta'
                          ? 'ஆண்டைத் தேர்ந்தெடுக்கவும்'
                          : 'Select Year'}
                    </Text>
                    <View style={{ width: 22 }} />
                  </View>

                  <ScrollView
                    style={styles.yearList}
                    contentContainerStyle={styles.yearGrid}
                    showsVerticalScrollIndicator={false}
                  >
                    {availableYears.map(year => {
                      const selected = year === calendarMonth.getFullYear();

                      return (
                        <TouchableOpacity
                          key={year}
                          onPress={() => selectYear(year)}
                          style={[
                            styles.yearCell,
                            selected && styles.selectorSelectedCell,
                          ]}
                        >
                          <Text
                            style={[
                              styles.yearCellText,
                              selected && styles.selectorSelectedText,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {calendarSelector === 'calendar' && (
                <Text style={styles.calendarSelectedText}>
                  {currentLang === 'si'
                    ? `තෝරාගත් දිනය: ${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`
                    : currentLang === 'ta'
                      ? `தேர்ந்தெடுத்த தேதி: ${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`
                      : `Selected: ${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`}
                </Text>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* 🔥 Android සඳහා සාමාන්‍ය Calendar එක */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={getInitialDate()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()} 
        />
      )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' }, 
  header: {
    backgroundColor: '#7A1020',
    paddingTop: 51, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    elevation: 10,
  },
  backBtnPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start', marginBottom: 10
  },
  backText: { color: '#FFD54F', fontSize: 12, fontWeight: '800' },
  hTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },

  scrollContent: { 
    paddingHorizontal: 14, paddingTop: 16, 
    paddingBottom: 150,
  },

  avatarContainer: { alignItems: 'center', marginBottom: 18 },
  avatarWrapper: {
    position: 'relative', elevation: 8, marginBottom: 12,
  },
  largeProfileImg: { 
    width: 120, height: 120, borderRadius: 60, 
    borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#E5E7EB' 
  },
  editCameraBadge: {
    position: 'absolute', bottom: 2, right: 2, 
    backgroundColor: '#7A1020', width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  profileTextName: { fontSize: 22, fontWeight: '900', color: '#1A2940' },
  
  metaDataCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
  },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  rowIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FDF2F2',
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  rowTextCol: { flex: 1, justifyContent: 'center' },
  key: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  val: { fontSize: 15, color: '#1A2940', fontWeight: '800' },
  rowDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6, marginLeft: 48 },

  inlineInput: {
    fontSize: 15, fontWeight: '800', color: '#7A1020',
    borderBottomWidth: 1.5, borderBottomColor: '#7A1020',
    paddingVertical: 2, paddingHorizontal: 2, height: 30,
  },
  editIconBtn: { padding: 6 }, 

  actionsContainer: { paddingHorizontal: 4 },
  blockActionBtn: { 
    backgroundColor: '#7A1020', flexDirection: 'row', height: 50, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4,
  },
  disabledBtn: {
    opacity: 0.65, 
  },
  blockActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },
  
  profileRedLogoutButton: { 
    backgroundColor: '#FEF2F2', flexDirection: 'row', height: 50, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1.5, borderColor: '#FECACA' 
  },
  profileRedLogoutButtonText: { color: '#DC2626', fontWeight: '800', fontSize: 15 },

  // 🔥 iOS Calendar Modal Styles
  iosPickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  iosPickerContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20, paddingHorizontal: 8 },
  iosPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  iosPickerCancelBtn: { fontSize: 16, color: '#DC2626', fontWeight: '600' },
  iosPickerDoneBtn: { fontSize: 16, color: '#1D4ED8', fontWeight: '700' },

  // 🔥 Custom iOS calendar styles
  iosCalendarTitle: { fontSize: 15, color: '#1A2940', fontWeight: '800' },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  calendarArrowBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  calendarMonthText: {
    fontSize: 18,
    color: '#1A2940',
    fontWeight: '900',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  calendarWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    fontWeight: '800',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  calendarDayCell: {
    width: '14.2857%',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 8,
    fontSize: 15,
    color: '#1A2940',
    fontWeight: '700',
  },
  calendarSelectedDay: {
    backgroundColor: '#7A1020',
    borderRadius: 20,
  },
  calendarSelectedDayText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  calendarTodayText: {
    color: '#1D4ED8',
    fontWeight: '900',
  },
  calendarFutureText: {
    color: '#CBD5E1',
  },
  calendarSelectedText: {
    textAlign: 'center',
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  monthYearButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  selectorContainer: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  selectorTitle: {
    fontSize: 18,
    color: '#1A2940',
    fontWeight: '900',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  monthCell: {
    width: '31%',
    minHeight: 48,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  monthCellText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    textAlign: 'center',
  },
  selectorSelectedCell: {
    backgroundColor: '#7A1020',
  },
  selectorSelectedText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  yearList: {
    height: 320,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  yearCell: {
    width: '23%',
    minHeight: 44,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearCellText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '700',
  }
});