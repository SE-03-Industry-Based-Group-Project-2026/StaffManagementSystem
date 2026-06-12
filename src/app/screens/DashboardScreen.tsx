// app/screens/DashboardScreen.tsx — Professional Premium Edition v3
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  selectedLang: 'si' | 'en' | 'ta';
  onNavigate: (screen: any) => void;
  onLogout: () => void;
}

// ── Localization Matrix ──────────────────────────────────────────
const L = {
  si: {
    welcome: 'ආයුබෝවන්,', name: 'W.A. පෙරේරා',
    dept: 'පාලන හා කාර්ය මණ්ඩල අංශය', logout: 'ඉවත්වන්න',
    liveTitle: 'වත්මන් වේලාව සහ දිනය',
    servicesTitle: 'ප්‍රධාන සේවාවන්', updatesTitle: 'නවතම දැනුම්දීම්', viewAll: 'සියල්ල',
    days: ['ඉරිදා','සඳුදා','අඟහරුවාදා','බදාදා','බ්‍රහස්පතින්දා','සිකුරාදා','සෙනසුරාදා'],
    months: ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'],
    menu: [
      { icon: 'calendar-outline',          label: 'නිවාඩු අයදුම්',   sub: 'ශේෂය, ඉතිහාසය සහ ඉල්ලීම්',    screen: 'LeaveBalance',    color: '#7A1020' },
      { icon: 'chatbubble-ellipses-outline',  label: 'පැමිණිලි',        sub: 'ඉදිරිපත් කිරීම සහ ලුහුබැඳීම',  screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline',               label: 'මගේ ගිණුම',       sub: 'පැතිකඩ සහ සැකසීම්',            screen: 'Profile',         color: '#1A5C3A' },
    ],
    notices: [
      { id: '1', title: 'විශේෂ නිවේදනය',    body: 'ලබන සතියේ ප්‍රජා සත්කාරක සේවාවට සියලු කාර්ය මණ්ඩලය සහභාගී විය යුතුය.',              time: 'මිනිත්තු 10 කට පෙර', type: 'urgent'  },
      { id: '2', title: 'නිවාඩු අනුමැතිය', body: 'ඔබ ඉදිරිපත් කළ වෛද්‍ය නිවාඩු අයදුම්පත ප්‍රාදේශීය ලේකම් විසින් අනුමත කරන ලදී.',   time: 'පැය 2 කට පෙර',       type: 'success' },
      { id: '3', title: 'පද්ධති නඩත්තුව',  body: 'අද රාත්‍රී 11:00 සිට පැය 2ක් පද්ධතිය යාවත්කාලීන කිරීමක් සිදුවේ.',                  time: 'ඊයේ',                type: 'info'    },
    ],
  },
  en: {
    welcome: 'Welcome,', name: 'W.A. Perera',
    dept: 'Administration & Staff Section', logout: 'Log Out',
    liveTitle: 'LIVE DATE & TIME',
    servicesTitle: 'MAIN SERVICES', updatesTitle: 'RECENT UPDATES', viewAll: 'View All',
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    menu: [
      { icon: 'calendar-outline',            label: 'Leave Management', sub: 'Balance, history & requests',                screen: 'LeaveBalance',    color: '#7A1020' },
      { icon: 'chatbubble-ellipses-outline',  label: 'Complaints',       sub: 'Submit & track complaints',                 screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline',               label: 'My Account',       sub: 'Profile & settings',                        screen: 'Profile',         color: '#1A5C3A' },
    ],
    notices: [
      { id: '1', title: 'Special Notice',     body: 'All staff must participate in the community outreach program next week.',                    time: '10 mins ago', type: 'urgent'  },
      { id: '2', title: 'Leave Approved',     body: 'Your medical leave application has been officially approved by the Secretary.',                  time: '2 hours ago', type: 'success' },
      { id: '3', title: 'System Maintenance', body: 'System will be offline for 2 hours starting tonight at 11:00 PM for updates.',                  time: 'Yesterday',   type: 'info'    },
    ],
  },
  ta: {
    welcome: 'Welcome,', name: 'W.A. பெரேரா',
    dept: 'நிர்வாகம் மற்றும் ஊழியர் பிரிவு', logout: 'வெளியேறவும்',
    liveTitle: 'நேரடி தேதி மற்றும் நேரம்',
    servicesTitle: 'முக்கிய சேவைகள்', updatesTitle: 'அண்மைய அறிவிப்புகள்', viewAll: 'அனைத்தும்',
    days: ['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'],
    months: ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'],
    menu: [
      { icon: 'calendar-outline',            label: 'விடுமுறை மேலாண்மை', sub: 'இருப்பு, வரலாறு, விண்ணப்பம்',               screen: 'LeaveBalance',    color: '#7A1020' },
      { icon: 'chatbubble-ellipses-outline',  label: 'புகார்கள்',          sub: 'சமர்ப்பிக்கவும் மற்றும் கண்காணிக்கவும்',   screen: 'ComplaintSubmit', color: '#1A3A5C' },
      { icon: 'person-outline',               label: 'என் கணக்கு',         sub: 'சுயவிவரம் மற்றும் அமைப்புகள்',             screen: 'Profile',         color: '#1A5C3A' },
    ],
    notices: [
      { id: '1', title: 'அவசர அறிவிப்பு',   body: 'அடுத்த வாரம் சமூக சேவை நிகழ்ச்சியில் அனைத்து ஊழியர்களும் கலந்துகொள்ள வேண்டும்.',  time: '10 நிமிடம் முன்',  type: 'urgent'  },
      { id: '2', title: 'விடுமுறை அனுமதி', body: 'நீங்கள் சமர்ப்பித்த மருத்துவ விடுமுறைக்கு பிரதேச செயலாளர் ஒப்புதல் அளித்தார்.',     time: '2 மணி நேரம் முன்', type: 'success' },
      { id: '3', title: 'கணினி பராமரிப்பு', body: 'இன்று இரவு 11:00 மணி முதல் 2 மணி நேரம் கணினி பராமரிப்பு நடைபெறும்.',               time: 'நேற்று',           type: 'info'    },
    ],
  },
};

const TYPE_CFG = {
  urgent:   { bg: '#FFF0F0', border: '#FFCDD2', dot: '#D32F2F' },
  success: { bg: '#F0FFF4', border: '#C8E6C9', dot: '#2E7D32' },
  info:    { bg: '#F0F6FF', border: '#BBDEFB', dot: '#1565C0' },
};

export default function DashboardScreen({ selectedLang, onNavigate, onLogout }: Props) {
  const t = L[selectedLang] ?? L.en;

  // ── Live clock ───────────────────────────────────────────────
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [dayStr,  setDayStr]  = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let h = now.getHours();
      const m   = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTimeStr(`${h}:${m < 10 ? '0' + m : m} ${ampm}`);
      setDayStr(t.days[now.getDay()]);
      const mo = t.months[now.getMonth()];
      const d  = now.getDate();
      const y  = now.getFullYear();
      setDateStr(selectedLang === 'en' ? `${mo} ${d}, ${y}` : `${y} ${mo} ${d}`);
    };
    updateClock();
    const id = setInterval(updateClock, 60000);
    return () => clearInterval(id);
  }, [selectedLang]);

  // ── Entrance animations ──────────────────────────────────────
  const headerAnim = useRef(new Animated.Value(0)).current;
  const clockAnim  = useRef(new Animated.Value(0)).current;
  const cardsAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(clockAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(cardsAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const fade = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  });

  return (
    <View style={styles.root}>

      {/* ── HEADER (Structured exactly like LeaveBalance) ──────── */}
      <Animated.View style={[styles.header, fade(headerAnim)]}>
        <View style={styles.headerCircle1} pointerEvents="none" />
        <View style={styles.headerCircle2} pointerEvents="none" />

        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.greetText}>{t.welcome}</Text>
              <Text style={styles.nameText} numberOfLines={1}>{t.name}</Text>
              <View style={styles.deptRow}>
                <Ionicons name="business-outline" size={11} color="rgba(255,255,255,0.6)" />
                <Text style={styles.deptText} numberOfLines={1}> {t.dept}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={14} color="#FFD54F" />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── SCROLL BODY ────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >

        {/* ── LIVE CLOCK CARD ─────────────────────────────────── */}
        <Animated.View style={[styles.clockCard, fade(clockAnim)]}>
          <View style={styles.clockLabelRow}>
            <Ionicons name="time" size={13} color="#7A1020" />
            <Text style={styles.clockLabelText}> {t.liveTitle}</Text>
          </View>
          <View style={styles.clockGridRow}>
            <View style={styles.clockGridItem}>
              <Text style={styles.clockDayText}>{dayStr}</Text>
              <Text style={styles.clockTimeText}>{timeStr}</Text>
            </View>
            <View style={styles.clockDivider} />
            <View style={[styles.clockGridItem, { alignItems: 'flex-start', paddingLeft: 20 }]}>
              <Text style={styles.clockDateText}>{dateStr}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── SERVICE CARDS ──────────────────────────────────── */}
        <Animated.View style={fade(cardsAnim)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>{t.servicesTitle}</Text>
            </View>
          </View>

          <View style={styles.menuList}>
            {t.menu.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuCard}
                onPress={() => onNavigate(item.screen)}
                activeOpacity={0.88}
              >
                <View style={[styles.menuIconCol, { backgroundColor: item.color + '12' }]}>
                  <View style={[styles.menuIconBox, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={22} color="#fff" />
                  </View>
                </View>
                <View style={styles.menuTextCol}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub} numberOfLines={1}>{item.sub}</Text>
                </View>
                <View style={[styles.menuArrow, { backgroundColor: item.color + '10' }]}>
                  <Ionicons name="chevron-forward" size={16} color={item.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── NOTICES ────────────────────────────────────────── */}
        <Animated.View style={fade(cardsAnim)}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>{t.updatesTitle}</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAll}>{t.viewAll} →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noticeGroup}>
            {t.notices.map((n, i) => {
              const cfg = TYPE_CFG[n.type as keyof typeof TYPE_CFG];
              return (
                <View
                  key={n.id}
                  style={[
                    styles.noticeCard,
                    { backgroundColor: cfg.bg, borderColor: cfg.border },
                    i < t.notices.length - 1 && { marginBottom: 10 },
                  ]}
                >
                  <View style={styles.noticeTop}>
                    <View style={styles.noticeTitleRow}>
                      <View style={[styles.noticeDot, { backgroundColor: cfg.dot }]} />
                      <Text style={styles.noticeTitle}>{n.title}</Text>
                    </View>
                    <Text style={styles.noticeTime}>{n.time}</Text>
                  </View>
                  <Text style={styles.noticeBody}>{n.body}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6F9' },

  // Preserved exactly like LeaveBalance structure
  header: {
    backgroundColor: '#7A1020',
    paddingTop: 54, 
    paddingHorizontal: 20, 
    paddingBottom: 24,
    borderBottomLeftRadius: 28, 
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#5A0010',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, 
    shadowRadius: 18, 
    elevation: 12,
  },
  headerCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50,
  },
  headerCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20,
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2.5, borderColor: '#FFD54F',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2, borderColor: '#7A1020',
  },
  headerTexts: { flex: 1 },
  greetText: { color: '#FFD54F', fontSize: 14, fontWeight: '800', letterSpacing: 0.6 },
  nameText:  { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 2 },
  deptRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  deptText:  { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  scrollBody: { paddingHorizontal: 16, paddingTop: 20 },

  clockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E6EAEF',
    shadowColor: '#7A1020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  clockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clockLabelText: {
    fontSize: 10, fontWeight: '800',
    color: '#7F8C8D', letterSpacing: 1,
    textTransform: 'uppercase',
  },
  clockGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockGridItem: { flex: 1, justifyContent: 'center' },
  clockDayText: {
    fontSize: 22, fontWeight: '900',
    color: '#7A1020', letterSpacing: 0.3,
  },
  clockTimeText: {
    fontSize: 12, fontWeight: '700',
    color: '#5A6A7E', marginTop: 3,
  },
  clockDateText: {
    fontSize: 16, fontWeight: '900',
    color: '#1A2940', lineHeight: 22,
  },
  clockDivider: {
    width: 1, height: 34,
    backgroundColor: '#E6EAEF',
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: {
    width: 4, height: 16, borderRadius: 2,
    backgroundColor: '#7A1020',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '800',
    color: '#2C3E50', letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  viewAll: { fontSize: 11, fontWeight: '700', color: '#7A1020' },

  menuList: { gap: 10, marginBottom: 26 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#EEF0F4',
  },
  menuIconCol: {
    width: 72, alignSelf: 'stretch',
    justifyContent: 'center', alignItems: 'center',
  },
  menuIconBox: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  menuTextCol: { flex: 1, paddingVertical: 16, paddingHorizontal: 4 },
  menuLabel:  { fontSize: 14, fontWeight: '800', color: '#1A2940' },
  menuSub:    { fontSize: 11, color: '#8A96A8', marginTop: 2, fontWeight: '500' },
  menuArrow: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },

  noticeGroup: { marginBottom: 8 },
  noticeCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
  noticeTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  noticeTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 7 },
  noticeDot:   { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  noticeTitle: { fontSize: 13, fontWeight: '800', color: '#1A2940', flex: 1 },
  noticeTime:  { fontSize: 10, fontWeight: '600', color: '#95A5A6', marginLeft: 8 },
  noticeBody:  { fontSize: 12, color: '#5A6A7E', lineHeight: 18, paddingLeft: 15 },
});