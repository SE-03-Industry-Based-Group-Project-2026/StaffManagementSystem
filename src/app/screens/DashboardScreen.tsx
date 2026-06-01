// app/screens/DashboardScreen.tsx — Premium Visual Hierarchy Edition
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  selectedLang: 'si' | 'en' | 'ta';
  onNavigate: (screen: any) => void;
  onLogout: () => void;
}

export default function DashboardScreen({ selectedLang, onNavigate, onLogout }: Props) {
  
  // ── 100% LOCALIZED TRANSLATION MATRIX ─────────────────────────
  const localization = {
    si: {
      welcome: 'ආයුබෝවන්',
      dept: 'පාලන හා කාර්ය මණ්ඩල අංශය',
      logout: 'ඉවත් වන්න',
      menu1: 'නිවාඩු වාර්තා සහ අයදුම්පත්',
      menu2: 'පැමිණිලි සහ යෝජනා ඉදිරිපත් කිරීම',
      menu3: 'මගේ ගිණුමේ තොරතුරු',
      servicesTitle: 'ප්‍රධාන සේවා කාර්යාංශය / MAIN SERVICES',
      updatesTitle: 'නවතම නිල දැනුම්දීම් / RECENT UPDATES',
      notices: [
        { id: '1', title: 'විශේෂ නිවේදනයයි', body: 'ලබන සතියේ පැවැත්වෙන ප්‍රජා සත්කාරක සේවයට සියලුම කාර්ය මණ්ඩලය සහභාගී විය යුතුය.', time: 'මීට ව්නාඩි 10කට පෙර', type: 'urgent' },
        { id: '2', title: 'නිවාඩු අනුමැතිය', body: 'ඔබ ඉදිරිපත් කළ වෛද්‍ය නිවාඩු අයදුම්පත ප්‍රාදේශීය ලේකම් විසින් අනුමත කර ඇත.', time: 'පැය 2කට පෙර', type: 'success' },
        { id: '3', title: 'පද්ධති නඩත්තු කටයුත්තක්', body: 'අද රාත්‍රී 11:00 සිට පැය 2ක් පද්ධතිය යාවත්කාලීන කිරීමක් සිදුවේ.', time: 'ඊයේ', type: 'info' }
      ]
    },
    en: {
      welcome: 'Welcome',
      dept: 'Administration & Staff Section',
      logout: 'Log Out',
      menu1: 'Leave Records & Applications',
      menu2: 'Complaints & Suggestions Registry',
      menu3: 'My Profile & Account Settings',
      servicesTitle: 'MAIN SERVICES',
      updatesTitle: 'RECENT OFFICIAL UPDATES',
      notices: [
        { id: '1', title: 'Special Notice', body: 'All staff members must participate in the community outreach program next week.', time: '10 mins ago', type: 'urgent' },
        { id: '2', title: 'Leave Approved', body: 'Your medical leave application has been officially approved by the Secretary.', time: '2 hours ago', type: 'success' },
        { id: '3', title: 'System Maintenance', body: 'The system will be offline for 2 hours starting tonight at 11:00 PM for enhancements.', time: 'Yesterday', type: 'info' }
      ]
    },
    ta: {
      welcome: 'வரவேற்பு',
      dept: 'நிர்வாகம் மற்றும் ஊழியர் பிரிவு',
      logout: 'வெளியேறவும்',
      menu1: 'விடுமுறை பதிவுகள் மற்றும் விண்ணப்பங்கள்',
      menu2: 'புகார்கள் மற்றும் ஆலோசனைகள் சமர்ப்பிப்பு',
      menu3: 'எனது கணக்கு விபரங்கள்',
      servicesTitle: 'முக்கிய சேவைகள்',
      updatesTitle: 'அண்மைக்கால அறிவித்தல்கள்',
      notices: [
        { id: '1', title: 'அவசர அறிவிப்பு', body: 'அடுத்த வாரம் நடைபெறும் சமூக சேவை திட்டத்தில் அனைத்து ஊழியர்களும் கலந்து கொள்ள வேண்டும்.', time: '10 நிமிடங்களுக்கு முன்', type: 'urgent' },
        { id: '2', title: 'விடுமுறை அனுமதி', body: 'நீங்கள் சமர்ப்பித்த மருத்துவ விடுமுறை விண்ணப்பத்திற்கு பிரதேச செயலாளர் ஒப்புதல் அளித்துள்ளார்.', time: '2 மணி நேரத்திற்கு முன்', type: 'success' },
        { id: '3', title: 'கணினி பராமரிப்பு', body: 'இன்று இரவு 11:00 மணி முதல் 2 மணி நேரம் கணினி மேம்படுத்தல் பணிகள் நடைபெறும்.', time: 'நேற்று', type: 'info' }
      ]
    }
  };

  const text = localization[selectedLang] || localization.si;

  return (
    <View style={styles.safeContainerLight}>
      
      {/* ── HIGH VISIBILITY ACCENT HEADER ────────────────────────── */}
      <View style={styles.hubHeaderView}>
        <View style={styles.headerLeftColumn}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' }} 
            style={styles.userProfileAvatar} 
          />
          <View style={styles.headerTextGroup}>
            <Text style={styles.welcomeGreetingText}>{text.welcome}</Text>
            <Text style={styles.userDisplayName} numberOfLines={1}>W.A. Perera</Text>
            <Text style={styles.userDeptText} numberOfLines={1}>{text.dept}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButtonTextFrame} onPress={onLogout} activeOpacity={0.85}>
          <Ionicons name="log-out" size={13} color="#FFD54F" />
          <Text style={styles.logoutFrameText}>{text.logout}</Text>
        </TouchableOpacity>
      </View>

      {/* ── CORE SCROLL CANVAS ───────────────────────────────────── */}
      <ScrollView 
        contentContainerStyle={styles.scrollCanvas} 
        showsVerticalScrollIndicator={false}
      >
        {/* Section Heading: Main Services */}
        <Text style={styles.sectionHeading}>{text.servicesTitle}</Text>

        {/* 🚀 NEW: ENHANCED & ENLARGED 3-CARD VERTICAL SYSTEM */}
        <View style={styles.verticalCardsStack}>
          
          {/* Card 1: Leave records */}
          <TouchableOpacity style={styles.stackBoxItem} onPress={() => onNavigate('LeaveBalance')} activeOpacity={0.9}>
            <View style={styles.iconCircleBg}>
              <Ionicons name="calendar" size={28} color="#7A1020" />
            </View>
            <Text style={styles.stackItemLabel}>{text.menu1}</Text>
            <View style={styles.arrowCircleAlign}>
              <Ionicons name="arrow-forward" size={18} color="#7A1020" />
            </View>
          </TouchableOpacity>

          {/* Card 2: Complaint submit */}
          <TouchableOpacity style={styles.stackBoxItem} onPress={() => onNavigate('ComplaintSubmit')} activeOpacity={0.9}>
            <View style={styles.iconCircleBg}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#7A1020" />
            </View>
            <Text style={styles.stackItemLabel}>{text.menu2}</Text>
            <View style={styles.arrowCircleAlign}>
              <Ionicons name="arrow-forward" size={18} color="#7A1020" />
            </View>
          </TouchableOpacity>

          {/* Card 3: User Profile */}
          <TouchableOpacity style={styles.stackBoxItem} onPress={() => onNavigate('Profile')} activeOpacity={0.9}>
            <View style={styles.iconCircleBg}>
              <Ionicons name="person" size={28} color="#7A1020" />
            </View>
            <Text style={styles.stackItemLabel}>{text.menu3}</Text>
            <View style={styles.arrowCircleAlign}>
              <Ionicons name="arrow-forward" size={18} color="#7A1020" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Heading: Live Notifications Displayed Cleanly Below */}
        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>{text.updatesTitle}</Text>

        {/* 🎯 NEW: RE-DESIGNED NOTIFICATION LIVE FEED (DIFFERENT FROM SERVICE CARDS) */}
        <View style={styles.notificationListWrapper}>
          {text.notices.map((item) => (
            <View key={item.id} style={styles.noticeCardItem}>
              <View style={styles.noticeCardHeader}>
                <View style={styles.noticeTitleRow}>
                  <View style={[
                    styles.typeIndicatorMarker, 
                    { backgroundColor: item.type === 'urgent' ? '#D32F2F' : item.type === 'success' ? '#388E3C' : '#1976D2' }
                  ]} />
                  <Text style={styles.noticeCardTitle} numberOfLines={1}>{item.title}</Text>
                </View>
                <Text style={styles.noticeCardTime}>{item.time}</Text>
              </View>
              <Text style={styles.noticeCardBody}>{item.body}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── COMPREHENSIVE STYLE SHEETS MATRIX ─────────────────────────────
const styles = StyleSheet.create({
  safeContainerLight: { 
    flex: 1, 
    backgroundColor: '#F7F9FB' // Slightly toned down background for card popped contrast
  },
  hubHeaderView: { 
    backgroundColor: '#7A1020', 
    paddingHorizontal: 20, 
    paddingBottom: 24, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 54,
    shadowColor: '#7A1020',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLeftColumn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  userProfileAvatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    borderWidth: 2, 
    borderColor: '#FFD54F' 
  },
  headerTextGroup: { 
    marginLeft: 12, 
    flex: 1 
  },
  welcomeGreetingText: { 
    color: '#FFD54F', 
    fontSize: 11, 
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userDisplayName: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '800',
    marginTop: 1
  },
  userDeptText: { 
    color: 'rgba(255,255,255,0.75)', 
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500'
  },
  logoutButtonTextFrame: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  logoutFrameText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  scrollCanvas: { 
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7F8C8D',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // BIG & BOLD CARDS FOR CORE SERVICES
  verticalCardsStack: {
    width: '100%',
    marginBottom: 26,
    gap: 14
  },
  stackBoxItem: {
    backgroundColor: '#FFF5F7', // Soft tinted pinkish-maroon theme background
    width: '100%',
    paddingVertical: 20, // Increased height significantly for pop impact
    paddingHorizontal: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1B4BC', // Bold bordered frame accentuating it over notifications
    shadowColor: '#7A1020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircleBg: {
    width: 52, // Enlarged background badge matrix
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FAD6DC',
    elevation: 1,
  },
  stackItemLabel: {
    fontSize: 15, // Bigger fonts for absolute visibility hierarchy
    fontWeight: '800',
    color: '#4A000E', // Strong deep maroon text color
    marginLeft: 16,
    flex: 1
  },
  arrowCircleAlign: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(122,16,32,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // RE-DESIGNED CLEAN NOTIFICATIONS FEED (NO WHITE BOX GRID LOOK)
  notificationListWrapper: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Grouped all notices cleanly inside one master card frame
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6EAEF',
  },
  noticeCardItem: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6', // Split lines instead of repetitive cards
  },
  noticeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8
  },
  typeIndicatorMarker: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  noticeCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1
  },
  noticeCardTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#95A5A6'
  },
  noticeCardBody: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 18,
    paddingLeft: 16
  }
});