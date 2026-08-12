// app/mainLayout.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, StatusBar, BackHandler, PanResponder } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import LeaveBalanceScreen from './screens/LeaveBalanceScreen';
import ApplyLeaveScreen from './screens/ApplyLeaveScreen';
import LeaveStatusScreen from './screens/LeaveStatusScreen';
import DigitalFormScreen from './screens/DigitalFormScreen';
import MedicalFormScreen from './screens/MedicalFormScreen'; 
import SignatureScreen from './screens/SignatureScreen';
import ComplaintSubmitScreen from './screens/ComplaintSubmitScreen';
import TestA4Screen from './screens/TestA4Screen';

// 🔥 අලුතින් හදපු පැමිණිලි පිටු දෙක මෙතනින් Import කරලා තියෙන්නේ
import ComplaintListScreen from './screens/ComplaintListScreen';
import ComplaintDetailsScreen from './screens/ComplaintDetailsScreen';

import AnnouncementsScreen from './screens/AnnouncementsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import NotificationNavigationBridge from './NotificationNavigationBridge';
import TaskAllocationScreen from './screens/TaskAllocationScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen'; 

interface MainLayoutProps { selectedLang: 'si' | 'en' | 'ta'; onResetLang: () => void; }

// 🔥 ScreenKey එකට 'ComplaintList' සහ 'ComplaintDetails' එකතු කළා
type ScreenKey = 'Login' | 'Dashboard' | 'Profile' | 'EditProfile' | 'LeaveBalance' | 'ApplyLeave' | 'LeaveStatus' | 'DigitalForm' | 'MedicalForm' | 'Signature' | 'ComplaintSubmit' | 'ComplaintStatus' | 'Announcements' | 'Notifications'| 'TaskAllocation' | 'TestA4'
| 'TaskDetails' | 'ComplaintList' | 'ComplaintDetails';

type Route = {
  screen: ScreenKey | 'forgot' | 'reset';
  params?: any;
};

const translations = {
  si: { loginTitle: "ප්‍රාදේශීය සභා සේවක කළමනාකරණය", govSub: "රාජ්‍ය සේවා ජංගම පද්ධතිය", epfLabel: "සේවක අර්ථසාධක අරමුදල් අංකය", passLabel: "මුරපදය", loginBtn: "පද්ධතියට ඇතුළු වන්න", welcome: "ආයුබෝවන්", dept: "පෙරපාසල් සහ පුස්තකාල අංශය (ප්‍රජා සංවර්ධන)", menu1: "නිවාඩු කළමනාකරණය", menu2: "පැමිණිලි ඉදිරිපත් කිරීම", menu3: "දැනුම්දීම් සහ නිවේදන", menu4: "මගේ පැතිකඩ", profileTitle: "මගේ තොරතුරු", role: "පුස්තකාල සහකාර", editProfile: "පැතිකඩ සංස්කරණය", updateBtn: "තොරතුරු යාවත්කාලීන කරන්න", saveBtn: "වෙනස්කම් සුරකින්න", phoneLabel: "දුරකථන අංකය", casual: "අනියම් නිවාඩු", medical: "වෛද්‍ය නිවාඩු", duty: "රාජකාරිමය නිවාඩු", newLeave: "නව නිවාඩු ඉල්ලීමක් සිදුකරන්න", leaveStatus: "කලින් දැමූ ඉල්ලීම්වල වත්මන් තත්ත්වය", reason: "නිවාඩුව ලබා ගැනීමට හේතුව", submit: "ඉල්ලීම ඉදිරිපත් කරන්න", digitalForm: "නිල ඩිජිටල් නිවාඩු පෝරමය", signBtn: "ඩිජිටල් අත්සන තැබීමට යන්න", signDesc: "කරුණාකර ඔබගේ සම්පූර්ණ නම මෙහි සටහන් කර අත්සන තහවුරු කරන්න.", complaintLabel: "පැමිණිල්ලේ විස්තරය", replied: "පිළිතුරු ලබා දී ඇත", notiTitle: "දැනුම්දීම්", changeLang: "← භාෂාව වෙනස් කරන්න" },
  en: { loginTitle: "Staff Management System", govSub: "Local Government Staff Portal", epfLabel: "EPF / Service Number", passLabel: "Password", loginBtn: "Secure Login", welcome: "Welcome", dept: "Preschool & Library Section (Praja Section)", menu1: "Leave Management", menu2: "Submit Complaints", menu3: "Announcements", menu4: "My Profile", profileTitle: "My Profile Details", role: "Library Assistant", editProfile: "Edit Profile", updateBtn: "Update Contact Info", saveBtn: "Save Changes", phoneLabel: "Contact Number", casual: "Casual Leave", medical: "Medical Leave", duty: "Duty Leave", newLeave: "Apply New Leave", leaveStatus: "Track Leave Status", reason: "Reason for Leave", submit: "Submit Request", digitalForm: "Official Digital Leave Form", signBtn: "Proceed to Sign", signDesc: "Please type your full name to verify your signature.", complaintLabel: "Complaint Details", replied: "Replied", notiTitle: "Notifications", changeLang: "← Change Language" },
  ta: { loginTitle: "ஊழியர் மேலாண்மை அமைப்பு", govSub: "உள்ளூர் அரசு ஊழியர் அமைப்பு", epfLabel: "EPF / ஊழியர் எண்", passLabel: "கடவுச்சொல்", loginBtn: "உள்நுழைக", welcome: "வரவேற்கிறோம்", dept: "முன்பள்ளி மற்றும் நூலகப் பிரிவு (பிரஜா பிரிவு)", menu1: "விடுமுறை மேலாண்மை", menu2: "புகார்களை சமர்ப்பிக்க", menu3: "அறிவிப்புகள்", menu4: "எனது சுயவிவரம்", profileTitle: "சுயவிவர விவரங்கள்", role: "நூலக உதவியாளர்", editProfile: "சுயவிவரத்தை திருத்தவும்", updateBtn: "தகவலைப் புதுப்பிக்கவும்", saveBtn: "மாற்றங்களைச் சேமிக்கவும்", phoneLabel: "தொலைபேசி எண்", casual: "தற்செயல் விடுப்பு", medical: "மருத்துவ விடுப்பு", duty: "கடமை விடுப்பு", newLeave: "புதிய விடுப்புக்கு விண்ணப்பம்", leaveStatus: "விடுப்பு நிலையை கண்காணிக்கவும்", reason: "விடுப்புக்கான காரணம்", submit: "சமர்ப்பிக்கவும்", digitalForm: "டிஜிட்டல் விடுப்பு படிவம்", signBtn: "கையெழுத்திட செல்லுங்கள்", signDesc: "மின்னணு கையொப்பமிட உங்கள் முழு பெயரை உள்ளிடவும்.", complaintLabel: "புகார் விவரங்கள்", replied: "பதில் அளிக்கப்பட்டது", notiTitle: "அறிவிப்புகள்", changeLang: "← மொழியை மாற்றவும்" }
};

export default function MainLayout({ selectedLang, onResetLang }: MainLayoutProps) {
  // Real in-app navigation stack. Back returns to the actual previous route
  // instead of always jumping to Dashboard.
  const navigationStackRef = useRef<Route[]>([{ screen: 'Login' }]);
  const [navigationStack, setNavigationStack] = useState<Route[]>([
    { screen: 'Login' },
  ]);

  const currentRoute = navigationStack[navigationStack.length - 1];
  const currentScreen = currentRoute?.screen ?? 'Login';
  const screenParams = currentRoute?.params ?? {};

  const goBackRef = useRef<() => boolean>(() => false);

  const t = translations[selectedLang];

  const handleGoBack = () => {
    const stack = navigationStackRef.current;

    if (stack.length > 1) {
      const nextStack = stack.slice(0, -1);
      navigationStackRef.current = nextStack;
      setNavigationStack(nextStack);
      return true;
    }

    if (stack[0]?.screen === 'Login') {
      const title =
        selectedLang === 'si'
          ? 'ඉවත්වන්න'
          : selectedLang === 'ta'
            ? 'வெளியேறு'
            : 'Exit App';

      const msg =
        selectedLang === 'si'
          ? 'ඔබට යෙදුමෙන් ඉවත් වීමට අවශ්‍යද?'
          : selectedLang === 'ta'
            ? 'நீங்கள் பயன்பாட்டிலிருந்து வெளியேற விரும்புகிறீர்களா?'
            : 'Do you want to exit the app?';

      const no =
        selectedLang === 'si'
          ? 'නැත'
          : selectedLang === 'ta'
            ? 'இல்லை'
            : 'No';

      const yes =
        selectedLang === 'si'
          ? 'ඔව්'
          : selectedLang === 'ta'
            ? 'ஆம்'
            : 'Yes';

      Alert.alert(title, msg, [
        { text: no, style: 'cancel' },
        { text: yes, onPress: () => BackHandler.exitApp() },
      ]);

      return true;
    }

    return false;
  };

  goBackRef.current = handleGoBack;

  const edgeSwipeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt) =>
        evt.nativeEvent.pageX < 35,

      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        evt.nativeEvent.pageX < 35 && gestureState.dx > 10,

      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > 50) {
          goBackRef.current();
        }
      },
    })
  ).current;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => goBackRef.current()
    );

    return () => backHandler.remove();
  }, []);

  const replaceCurrentRoute = (screen: Route['screen'], params?: any) => {
    const stack = navigationStackRef.current;
    const nextRoute: Route = {
      screen,
      params: params || {},
    };

    const nextStack =
      stack.length > 0
        ? [...stack.slice(0, -1), nextRoute]
        : [nextRoute];

    navigationStackRef.current = nextStack;
    setNavigationStack(nextStack);
  };

  const handleNavigate = (screen: string, params?: any) => {
    const nextRoute: Route = {
      screen: screen as Route['screen'],
      params: params || {},
    };

    const stack = navigationStackRef.current;
    const current = stack[stack.length - 1];

    if (
      current?.screen === nextRoute.screen &&
      JSON.stringify(current?.params || {}) ===
        JSON.stringify(nextRoute.params || {})
    ) {
      return;
    }

    const nextStack = [...stack, nextRoute];
    navigationStackRef.current = nextStack;
    setNavigationStack(nextStack);
  };

  const handleSystemLogout = () => {
    Alert.alert(
      selectedLang === 'si'
        ? 'පද්ධතියෙන් ඉවත් වීම තහවුරු කරන්න'
        : selectedLang === 'ta'
          ? 'வெளியேறுவதை உறுதிப்படுத்தவும்'
          : 'Confirm Logout',
      selectedLang === 'si'
        ? 'ඔබට මෙම පද්ධතියෙන් ආරක්ෂිතව ඉවත් වීමට අවශ්‍යද?'
        : selectedLang === 'ta'
          ? 'இந்த அமைப்பிலிருந்து நீங்கள் பாதுகாப்பாக வெளியேற விரும்புகிறீர்களா?'
          : 'Are you sure you want to log out?',
      [
        {
          text:
            selectedLang === 'si'
              ? 'අවලංගු කරන්න'
              : selectedLang === 'ta'
                ? 'ரத்து செய்'
                : 'Cancel',
          style: 'cancel',
        },
        {
          text:
            selectedLang === 'si'
              ? 'ඉවත් වන්න'
              : selectedLang === 'ta'
                ? 'வெளியேறு'
                : 'Logout',
          style: 'destructive',
          onPress: () => {
            const loginRoute: Route = { screen: 'Login', params: {} };
            navigationStackRef.current = [loginRoute];
            setNavigationStack([loginRoute]);
          },
        },
      ]
    );
  };

  if (currentScreen === 'reset') {
    return (
      <ResetPasswordScreen
        email={screenParams?.email || ''}
        selectedLang={selectedLang}
        onBack={handleGoBack}
        onSuccess={handleGoBack}
      />
    );
  }

  if (currentScreen === 'forgot') {
    return (
      <ForgotPasswordScreen
        selectedLang={selectedLang}
        onBack={handleGoBack}
        onSent={(email) => handleNavigate('reset', { email })}
        autoSendOTP={screenParams?.autoSendOTP}
        initialEmpId={screenParams?.initialEmpId}
      />
    );
  }

  const isDarkScreen =
    currentScreen === 'Login' ||
    currentScreen === 'Dashboard' ||
    currentScreen === 'LeaveBalance';

  const statusBarColor =
    currentScreen === 'Login'
      ? '#800020'
      : currentScreen === 'Dashboard' || currentScreen === 'LeaveBalance'
        ? '#7A1020'
        : 'transparent';

  const appBgColor = currentScreen === 'Login' ? '#800020' : '#F8F9FA';

  return (
    // 🔥 3. PanResponder එක root View එකට සම්බන්ධ කරලා තියෙන්නේ
    <View style={{ flex: 1, backgroundColor: appBgColor }} {...edgeSwipeResponder.panHandlers}>
      <NotificationNavigationBridge onNavigate={handleNavigate} />
      <StatusBar 
        backgroundColor={statusBarColor} 
        barStyle={isDarkScreen ? "light-content" : "dark-content"} 
        translucent={currentScreen !== 'Login' && currentScreen !== 'LeaveBalance' && currentScreen !== 'Dashboard'} 
      />
      {currentScreen === 'TestA4' && <TestA4Screen />}
      {currentScreen === 'Login' && (
        <LoginScreen
          t={t}
          onLogin={() => {
            const dashboardRoute: Route = {
              screen: 'Dashboard',
              params: {},
            };
            navigationStackRef.current = [dashboardRoute];
            setNavigationStack([dashboardRoute]);
          }}
          onBack={onResetLang}
          onForgot={() => handleNavigate('forgot')}
          selectedLang={selectedLang}
        />
      )}
{currentScreen === 'Dashboard' && <DashboardScreen selectedLang={selectedLang} onNavigate={handleNavigate} onLogout={handleSystemLogout} />}
      {currentScreen === 'Profile' && <ProfileScreen t={t} onNavigate={handleNavigate} onLogout={handleSystemLogout} />}
      {currentScreen === 'EditProfile' && <EditProfileScreen t={t} onBack={handleGoBack} />}
      {currentScreen === 'LeaveBalance' && <LeaveBalanceScreen selectedLang={selectedLang} onNavigate={handleNavigate} onBack={handleGoBack} />}
      {currentScreen === 'ApplyLeave' && (
        <ApplyLeaveScreen
          t={t}
          onSubmit={(leaveData?: any) =>
            handleNavigate('LeaveStatus', leaveData || {})
          }
          selectedLang={selectedLang}
        />
      )}
      {currentScreen === 'LeaveStatus' && <LeaveStatusScreen t={t} onNavigate={handleNavigate} selectedLang={selectedLang} />}
      {currentScreen === 'DigitalForm' && <DigitalFormScreen t={t} onNavigate={handleNavigate} onBack={handleGoBack} selectedLang={selectedLang} route={{ params: screenParams }} />}
      {currentScreen === 'MedicalForm' && <MedicalFormScreen t={t} onNavigate={handleNavigate} onBack={handleGoBack} selectedLang={selectedLang} route={{ params: screenParams }} />}
      {currentScreen === 'Signature' && <SignatureScreen t={t} onComplete={() => replaceCurrentRoute('Dashboard')} selectedLang={selectedLang} />}
      {currentScreen === 'ComplaintSubmit' && (
        <ComplaintSubmitScreen
          t={t}
          selectedLang={selectedLang}
          onNavigate={handleNavigate}
          onBack={handleGoBack}
          route={{ params: screenParams }}
        />
      )}    

      {currentScreen === 'ComplaintList' && (
        <ComplaintListScreen
          selectedLang={selectedLang}
          onNavigate={handleNavigate}
          onBack={handleGoBack}
        />
      )}
      
      {(currentScreen === 'ComplaintDetails' || currentScreen === 'ComplaintStatus') && (
        <ComplaintDetailsScreen
          selectedLang={selectedLang}
          onNavigate={handleNavigate}
          onBack={handleGoBack}
          route={{ 
            params: { 
              complaintId: screenParams?.complaintId || screenParams?.id || screenParams?.related_id 
            } 
          }}
        />
      )}

      {currentScreen === 'Announcements' && (
        <AnnouncementsScreen
          selectedLang={selectedLang}
          onBack={handleGoBack}
          route={{ params: screenParams }}
        />
      )}
      {currentScreen === 'Notifications' && (
        <NotificationsScreen
          selectedLang={selectedLang}
          onNavigate={handleNavigate}
          onBack={handleGoBack}
        />
      )}
      {currentScreen === 'TaskAllocation' && (
        <TaskAllocationScreen
          selectedLang={selectedLang}
          onNavigate={handleNavigate}
          onBack={handleGoBack}
          route={{ params: screenParams }}
        />
      )}
      {currentScreen === 'TaskDetails' && (
        <TaskDetailsScreen
          selectedLang={selectedLang}
          onBack={handleGoBack}
          route={{ params: screenParams }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});