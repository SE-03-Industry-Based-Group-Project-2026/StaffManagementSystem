// app/mainLayout.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import standalone individual screens from the folder cleanly
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import LeaveBalanceScreen from './screens/LeaveBalanceScreen';
import ApplyLeaveScreen from './screens/ApplyLeaveScreen';
import LeaveStatusScreen from './screens/LeaveStatusScreen';
import DigitalFormScreen from './screens/DigitalFormScreen';
import SignatureScreen from './screens/SignatureScreen';
import ComplaintSubmitScreen from './screens/ComplaintSubmitScreen';
import ComplaintStatusScreen from './screens/ComplaintStatusScreen';
import AnnouncementsScreen from './screens/AnnouncementsScreen';
import NotificationsScreen from './screens/NotificationsScreen';

interface MainLayoutProps { selectedLang: 'si' | 'en' | 'ta'; onResetLang: () => void; }
type ScreenKey = 'Login' | 'Dashboard' | 'Profile' | 'EditProfile' | 'LeaveBalance' | 'ApplyLeave' | 'LeaveStatus' | 'DigitalForm' | 'Signature' | 'ComplaintSubmit' | 'ComplaintStatus' | 'Announcements' | 'Notifications';

const translations = {
  si: { loginTitle: "ප්‍රාදේශීය සභා සේවක කළමනාකරණය", govSub: "රාජ්‍ය සේවා ජංගම පද්ධතිය", epfLabel: "සේවක අර්ථසාධක අරමුදල් අංකය", passLabel: "මුරපදය", loginBtn: "පද්ධතියට ඇතුළු වන්න", welcome: "ආයුබෝවන්", dept: "පෙරපාසල් සහ පුස්තකාල අංශය (ප්‍රජා සංවර්ධන)", menu1: "නිවාඩු කළමනාකරණය", menu2: "පැමිණිලි ඉදිරිපත් කිරීම", menu3: "දැනුම්දීම් සහ නිවේදන", menu4: "මගේ පැතිකඩ", profileTitle: "මගේ තොරතුරු", role: "පුස්තකාල සහකාර", editProfile: "පැතිකඩ සංස්කරණය", updateBtn: "තොරතුරු යාවත්කාලීන කරන්න", saveBtn: "වෙනස්කම් සුරකින්න", phoneLabel: "දුරකථන අංකය", casual: "අනියම් නිවාඩු", medical: "වෛද්‍ය නිවාඩු", duty: "රාජකාරිමය නිවාඩු", newLeave: "නව නිවාඩු ඉල්ලීමක් සිදුකරන්න", leaveStatus: "කලින් දැමූ ඉල්ලීම්වල වත්මන් තත්ත්වය", reason: "නිවාඩුව ලබා ගැනීමට හේතුව", submit: "ඉල්ලීම ඉදිරිපත් කරන්න", digitalForm: "නිල ඩිජිටල් නිවාඩු පෝරමය", signBtn: "ඩිජිටල් අත්සන තැබීමට යන්න", signDesc: "කරුණාකර ඔබගේ සම්පූර්ණ නම මෙහි සටහන් කර අත්සන තහවුරු කරන්න.", complaintLabel: "පැමිණිල්ලේ විස්තරය", replied: "පිළිතුරු ලබා දී ඇත", notiTitle: "දැනුම්දීම්", changeLang: "← භාෂාව වෙනස් කරන්න" },
  en: { loginTitle: "Staff Management System", govSub: "Local Government Staff Portal", epfLabel: "EPF / Service Number", passLabel: "Password", loginBtn: "Secure Login", welcome: "Welcome", dept: "Preschool & Library Section (Praja Section)", menu1: "Leave Management", menu2: "Submit Complaints", menu3: "Announcements", menu4: "My Profile", profileTitle: "My Profile Details", role: "Library Assistant", editProfile: "Edit Profile", updateBtn: "Update Contact Info", saveBtn: "Save Changes", phoneLabel: "Contact Number", casual: "Casual Leave", medical: "Medical Leave", duty: "Duty Leave", newLeave: "Apply New Leave", leaveStatus: "Track Leave Status", reason: "Reason for Leave", submit: "Submit Request", digitalForm: "Official Digital Leave Form", signBtn: "Proceed to Sign", signDesc: "Please type your full name to verify your signature.", complaintLabel: "Complaint Details", replied: "Replied", notiTitle: "Notifications", changeLang: "← Change Language" },
  ta: { loginTitle: "ஊழியர் மேலாண்மை அமைப்பு", govSub: "உள்ளூர் அரசு ஊழியர் அமைப்பு", epfLabel: "EPF / ஊழியர் எண்", passLabel: "கடவுச்சொல்", loginBtn: "உள்நுழைக", welcome: "வரவேற்கிறோம்", dept: "முன்பள்ளி மற்றும் நூலகப் பிரிவு (பிரஜா பிரிவு)", menu1: "விடுமுறை மேலாண்மை", menu2: "புகார்களை சமர்ப்பிக்க", menu3: "அறிவிப்புகள்", menu4: "எனது சுயவிவரம்", profileTitle: "சுயவிவர விவரங்கள்", role: "நூலக உதவியாளர்", editProfile: "சுயவிவரத்தை திருத்தவும்", updateBtn: "தகவலைப் புதுப்பிக்கவும்", saveBtn: "மாற்றங்களைச் சேமிக்கவும்", phoneLabel: "தொலைபேசி எண்", casual: "தற்செயல் விடுப்பு", medical: "மருத்துவ விடுப்பு", duty: "கடமை விடுப்பு", newLeave: "புதிய விடுப்புக்கு விண்ணப்பம்", leaveStatus: "விடுப்பு நிலையை கண்காணிக்கவும்", reason: "விடுப்புக்கான காரணம்", submit: "சமர்ப்பிக்கவும்", digitalForm: "டிஜிட்டல் விடுப்பு படிவம்", signBtn: "கையெழுத்திட செல்லுங்கள்", signDesc: "மின்னணு கையொப்பமிட உங்கள் முழு பெயரை உள்ளிடவும்.", complaintLabel: "புகார் விவரங்கள்", replied: "பதில் அளிக்கப்பட்டது", notiTitle: "அறிவிப்புகள்", changeLang: "← மொழியை மாற்றவும்" }
};

export default function MainLayout({ selectedLang, onResetLang }: MainLayoutProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('Login');
  const t = translations[selectedLang];

  const handleSystemLogout = () => {
    Alert.alert(
      selectedLang === 'si' ? "පද්ධතියෙන් ඉවත් වීම තහවුරු කරන්න" : "Confirm Logout",
      selectedLang === 'si' ? "ඔබට මෙම පද්ධතියෙන් ආරක්ෂිතව ඉවත් වීමට අවශ්‍යද?" : "Are you sure you want to log out?",
      [
        { text: selectedLang === 'si' ? "අවලංගු කරන්න" : "Cancel", style: "cancel" },
        { text: selectedLang === 'si' ? "ඉවත් වන්න" : "Logout", style: "destructive", onPress: () => setCurrentScreen('Login') }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentScreen === 'Login' ? '#800020' : '#F8F9FA' }}>
      {currentScreen !== 'Login' && currentScreen !== 'Dashboard' && (
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('Dashboard')} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Pradeshiya Sabha Portal</Text>
          <View style={{ width: 24 }} />
        </View>
      )}

      {/* Screen Router View Switch */}
      {currentScreen === 'Login' && <LoginScreen t={t} onLogin={() => setCurrentScreen('Dashboard')} onBack={onResetLang} selectedLang={selectedLang} />}       
      {currentScreen === 'Dashboard' && <DashboardScreen selectedLang={selectedLang} onNavigate={setCurrentScreen} onLogout={handleSystemLogout} />}
      {currentScreen === 'Profile' && <ProfileScreen t={t} onNavigate={setCurrentScreen} onLogout={handleSystemLogout} />}
      {currentScreen === 'EditProfile' && <EditProfileScreen t={t} onBack={() => setCurrentScreen('Profile')} />}
      {currentScreen === 'LeaveBalance' && <LeaveBalanceScreen t={t} onNavigate={setCurrentScreen} />}
      {currentScreen === 'ApplyLeave' && <ApplyLeaveScreen t={t} onSubmit={() => setCurrentScreen('LeaveStatus')} selectedLang={selectedLang} />}
      {currentScreen === 'LeaveStatus' && <LeaveStatusScreen t={t} onNavigate={setCurrentScreen} selectedLang={selectedLang} />}
      {currentScreen === 'DigitalForm' && <DigitalFormScreen t={t} onNavigate={setCurrentScreen} selectedLang={selectedLang} />}
      {currentScreen === 'Signature' && <SignatureScreen t={t} onComplete={() => setCurrentScreen('Dashboard')} selectedLang={selectedLang} />}
      {currentScreen === 'ComplaintSubmit' && <ComplaintSubmitScreen t={t} onSubmit={() => setCurrentScreen('ComplaintStatus')} selectedLang={selectedLang} />}
      {currentScreen === 'ComplaintStatus' && <ComplaintStatusScreen t={t} selectedLang={selectedLang} />}
      {currentScreen === 'Announcements' && <AnnouncementsScreen t={t} selectedLang={selectedLang} />}
      {currentScreen === 'Notifications' && <NotificationsScreen selectedLang={selectedLang} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EFEFEF', paddingTop: 40 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#333' }
});