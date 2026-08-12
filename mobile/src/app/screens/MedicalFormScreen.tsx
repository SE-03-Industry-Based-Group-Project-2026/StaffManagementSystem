// app/screens/MedicalFormScreen.tsx — Premium Government Medical Leave Form
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextProps,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { showLeaveNotification } from '../../lib/notificationService';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';
type IconName = keyof typeof Ionicons.glyphMap;

interface RouteParams {
  dateOption?: string;
  chosenCustomDate?: string | null;
  chosenCustomDateIso?: string | null;
  medicalDays?: string;
  medicalDateRange?: {
    startFormatted: string;
    endFormatted: string;
    startIso: string;
    endIso: string;
  } | null;
}

interface Props {
  selectedLang?: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
  t?: any;
  route?: {
    params?: RouteParams;
  };
}

interface UserProfileData {
  id: string;
  departmentId: string | null;
  name: string;
  designation: string;
  department: string;
  joinedDate: string;
}

interface CoverageOfficer {
  id: string;
  name: string;
  designation: string;
  phone: string | null;
  isAvailable: boolean;
  unavailReason: string;
}

interface LocalAttachment {
  id: string;
  uri: string;
  fileName: string;
  mimeType: string;
  size?: number;
}

interface UploadedAttachment {
  fileName: string;
  storagePath: string;
  mimeType: string;
  size?: number;
}

const Text = ({ style, ...props }: TextProps) => {
  const { font } = useFont();
  const flattened = StyleSheet.flatten(style) || {};
  const dynamic: any = { ...flattened };

  if (typeof flattened.fontSize === 'number') {
    dynamic.fontSize = font(flattened.fontSize);
  }

  if (typeof flattened.lineHeight === 'number') {
    dynamic.lineHeight = font(flattened.lineHeight);
  }

  return (
    <RNText
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...props}
      style={dynamic}
    />
  );
};

const normalizeDate = (value: string | null | undefined): string => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return '';
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const sanitizeFileName = (name: string) => name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');

const formatToYMD = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const value = String(dateString).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) return directDate.toISOString().split('T')[0];
  return '';
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Math.ceil(days)); 
  return d.toISOString().split('T')[0];
};

const MEDICAL_PREDEFINED_REASONS = {
  dengue: {
    si: 'ඩෙංගු හෝ බරපතල වෛරස් උණ තත්ත්වයක් හේතුවෙන් ප්‍රතිකාර සහ විවේකය ලබා ගැනීමට.',
    en: 'To receive treatment and rest due to dengue or severe viral fever.',
    ta: 'டெங்கு அல்லது கடுமையான வைரஸ் காய்ச்சலுக்கான சிகிச்சை மற்றும் ஓய்வு.',
  },
  surgery: {
    si: 'හදිසි අනතුරක් හෝ ශල්‍යකර්මයක් හේතුවෙන් වෛද්‍ය උපදෙස් මත විවේක ගැනීමට.',
    en: 'To rest on medical advice after an accident or surgical procedure.',
    ta: 'விபத்து அல்லது அறுவை சிகிச்சைக்கு பின் மருத்துவ ஆலோசனையின் பேரில் ஓய்வு.',
  },
  chronic: {
    si: 'බරපතල හෝ දිගුකාලීන රෝග තත්ත්වයක් සඳහා වෛද්‍ය උපදෙස් මත විවේක ගැනීමට.',
    en: 'To rest on medical advice due to a serious or long-term illness.',
    ta: 'கடுமையான அல்லது நீண்டகால நோய்க்கு மருத்துவ ஆலோசனையின் பேரில் ஓய்வு.',
  },
  maternity: {
    si: 'මාතෘ හෝ ප්‍රසූත සෞඛ්‍ය අවශ්‍යතාවයක් සහ ඊට අදාළ සායනික ප්‍රතිකාර සඳහා.',
    en: 'For maternity health needs and related clinical treatment.',
    ta: 'மகப்பேறு சுகாதார தேவைகள் மற்றும் மருத்துவ சிகிச்சை.',
  },
  infectious: {
    si: 'බෝවන රෝගයක් හෝ අක්ෂි ආබාධයක් හේතුවෙන් සේවයට වාර්තා කිරීමට නොහැකි වීම.',
    en: 'Unable to report to work due to an infectious disease or eye condition.',
    ta: 'தொற்று நோய் அல்லது கண் பாதிப்பு காரணமாக பணிக்கு வர முடியாமை.',
  }
};

const L = {
  si: {
    headerTitle: 'විවේකී / අසනීප නිවාඩු අයදුම්පත්‍රය',
    reasonPrompt: 'විවේකී / අසනීප නිවාඩුව ලබා ගැනීමට නිශ්චිත හේතුව ඇතුළත් කරන්න:',
    commonReasonsTitle: 'නිතර භාවිතා වන අසනීප හේතු:',
    inputPlaceholder: 'හේතුව මෙතන ටයිප් කරන්න (Singlish වලින් වුවද හැක)...',
    translateBtn: 'AI මඟින් සකස් කර තහවුරු කරන්න',
    translating: 'AI මඟින් සකසමින්...',
    continueDirect: 'ලියූ පරිදි ඉදිරියට යන්න',
    confirmTitle: 'හේතුව තහවුරු කිරීම',
    translatedLabel: 'සකස් කරන ලද හේතුව:',
    editBtn: 'නැවත සංස්කරණය',
    confirmBtn: 'හේතුව ස්ථිරයි',
    docTitle: 'නිල විවේකී / අසනීප නිවාඩු අයදුම්පත්‍රය',
    statusVal: 'අනුමැතිය සඳහා රැඳී පවතී',
    signRouteBtn: 'ඩිජිටල් අත්සන තැබීමට ඉදිරියට යන්න',
    back: 'ආපසු',
    emptyAlert: 'කරුණාකර හේතුවක් ඇතුළත් කරන්න හෝ ලැයිස්තුවෙන් එකක් තෝරන්න.',
    medical: 'විවේකී / අසනීප නිවාඩු',
    days: 'දින',
    fullDay: 'සම්පූර්ණ දිනය',
    selectDate: '• නිවාඩු දින සීමාව:',
    lblDengue: 'ඩෙංගු / වෛරස් උණ',
    lblSurgery: 'අනතුරු / ශල්‍යකර්ම',
    lblChronic: 'බරපතල රෝගාබාධ',
    lblMaternity: 'ප්‍රසූත / මාතෘ අවශ්‍යතා',
    lblInfectious: 'බෝවන රෝග / අක්ෂි ආබාධ',
    uploadTitle: 'වෛද්‍ය වාර්තා ඡායාරූප අමුණන්න',
    uploadDesc: 'වෛද්‍ය සහතික, වෛද්‍ය නිර්දේශ, බෙහෙත් වට්ටෝරු හෝ රෝහල් ලේඛනවල ඡායාරූප තෝරන්න.',
    uploadBtn: 'ඡායාරූප තෝරන්න',
    noFiles: 'කිසිදු ඡායාරූපයක් අමුණා නැත',
    maxFiles: 'උපරිම ඡායාරූප 5ක් පමණක් අමුණන්න.',
    photoPermission: 'ඡායාරූප තෝරා ගැනීමට gallery අවසරය ලබා දෙන්න.',
    continueBtn: 'ඉදිරියට යන්න',
    coverageTitle: 'රාජකාරි ආවරණය',
    coverageDesc: 'ඔබ නිවාඩුවේ සිටින කාලය තුළ රාජකාරි ආවරණය සඳහා ඔබගේ දෙපාර්තමේන්තුවේ නිලධාරියෙකු තෝරන්න.',
    selectOfficer: 'රාජකාරි ආවරණ නිලධාරියෙකු තෝරන්න',
    noOfficers: 'ඔබගේ දෙපාර්තමේන්තුවේ තෝරාගත හැකි වෙනත් නිලධාරීන් නොමැත.',
    callOfficer: 'ඇමතුමක් ගන්න',
    phoneMissing: 'තෝරාගත් නිලධාරියාගේ දුරකථන අංකය පද්ධතියේ සටහන් කර නොමැත.',
    officerRequired: 'කරුණාකර රාජකාරි ආවරණ නිලධාරියෙකු තෝරන්න.',
    signTitle: 'ඩිජිටල් අත්සන තැබීම',
    signDesc: 'පහත කොටුව තුළ ඔබගේ නිල අත්සන ඇඟිල්ලෙන් සටහන් කරන්න:',
    clearBtn: 'පැහැදිලි කරන්න',
    submitBtn: 'අයදුම්පත ඉදිරිපත් කරන්න',
    submitting: 'ඉදිරිපත් කරමින්...',
    signWatermark: 'මෙහි අත්සන් කරන්න',
    signAlertTitle: 'අවධානයයි',
    signAlertMsg: 'කරුණාකර ඉදිරියට යෑමට ප්‍රථම ඔබගේ අත්සන සටහන් කරන්න.',
    profileLoadError: 'පරිශීලක තොරතුරු ලබාගත නොහැකි විය.',
    submitError: 'අයදුම්පත සුරැකීමට නොහැකි විය.',
    successTitle: 'සාර්ථකයි!',
    successMsg: 'ඔබගේ විවේකී / අසනීප නිවාඩු අයදුම්පත සාර්ථකව පද්ධතියට ඇතුළත් කරන ලදී.',
    ok: 'ස්ථිරයි',
    searchPlaceholder: 'නිලධාරියෙකු සොයන්න...',
    noSearchResults: 'ගැලපෙන නිලධාරීන් හමු නොවිණි',
    attachmentRequired: 'කරුණාකර වෛද්‍ය වාර්තාවක හෝ බෙහෙත් වට්ටෝරුවක එක් ඡායාරූපයක් හෝ අනිවාර්යයෙන්ම අමුණන්න.',
    form: {
      title: 'නිල විවේකී / අසනීප නිවාඩු අයදුම්පත්‍රය',
      f1: '01. නිලධාරියාගේ නම',
      f2: '02. දෙපාර්තමේන්තුව',
      f3: '03. තනතුර',
      f4: '04. නිවාඩු වර්ගය',
      f5: '05. නිවාඩු දින ගණන',
      f6: '06. ආරම්භ වන දිනය',
      f7: '07. නැවත පැමිණෙන දිනය',
      f8: '08. නිවාඩුවට හේතුව',
      f9: '09. මෙම වර්ෂයේ ගත් නිවාඩු',
      f10: '10. රාජකාරි ආවරණය',
      f11: '11. පළමු පත්වීමේ දිනය',
      f12: '12. අවසන් නිවාඩුව',
      sign: 'අයදුම්කරුගේ අත්සන',
      date: 'දිනය',
      notApp: 'අදාළ නොවේ',
      days: 'දින',
      none: 'නැත'
    }
  },

  en: {
    headerTitle: 'Rest / Sick Leave Form',
    reasonPrompt: 'Enter the specific reason for rest or sick leave:',
    commonReasonsTitle: 'Common Medical Reasons:',
    inputPlaceholder: 'Type the reason here...',
    translateBtn: 'Improve and verify with AI',
    translating: 'Processing with AI...',
    continueDirect: 'Continue as typed',
    confirmTitle: 'Reason Verification',
    translatedLabel: 'Prepared Reason:',
    editBtn: 'Edit Again',
    confirmBtn: 'Confirm Reason',
    docTitle: 'Official Rest / Sick Leave Application',
    statusVal: 'Pending Approval',
    signRouteBtn: 'Proceed to Digital Signature',
    back: 'Back',
    emptyAlert: 'Please enter a reason or select one from the list.',
    medical: 'Rest / Sick Leave',
    days: 'days',
    fullDay: 'Full Day',
    selectDate: '• Leave Date Range:',
    lblDengue: 'Dengue / Viral Fever',
    lblSurgery: 'Accident / Surgery',
    lblChronic: 'Serious Illness',
    lblMaternity: 'Maternity Needs',
    lblInfectious: 'Infectious / Eye Condition',
    uploadTitle: 'Attach Medical Report Photos',
    uploadDesc: 'Select photos of medical certificates, prescriptions, recommendations, or hospital documents.',
    uploadBtn: 'Select Photos',
    noFiles: 'No photos attached',
    maxFiles: 'You can attach a maximum of 5 photos.',
    photoPermission: 'Please allow gallery access to select photos.',
    continueBtn: 'Continue',
    coverageTitle: 'Duty Coverage',
    coverageDesc: 'Select an officer from your department to cover your duties while you are on leave.',
    selectOfficer: 'Select a Duty Coverage Officer',
    noOfficers: 'No other eligible officers are available in your department.',
    callOfficer: 'Call Officer',
    phoneMissing: 'The selected officer does not have a saved phone number.',
    officerRequired: 'Please select a duty coverage officer.',
    signTitle: 'Digital Signature',
    signDesc: 'Draw your official signature inside the box below:',
    clearBtn: 'Clear',
    submitBtn: 'Submit Application',
    submitting: 'Submitting...',
    signWatermark: 'Sign Here',
    signAlertTitle: 'Attention',
    signAlertMsg: 'Please add your signature before submitting.',
    profileLoadError: 'Unable to load user details.',
    submitError: 'Unable to save the application.',
    successTitle: 'Success!',
    successMsg: 'Your rest / sick leave request was submitted successfully.',
    ok: 'OK',
    searchPlaceholder: 'Search officer...',
    noSearchResults: 'No matching officers found',
    attachmentRequired: 'Please attach at least one medical document or prescription photo.',
    form: {
      title: 'Official Rest / Sick Leave Application',
      f1: '01. Officer Name',
      f2: '02. Department',
      f3: '03. Designation',
      f4: '04. Leave Type',
      f5: '05. Leave Duration',
      f6: '06. Start Date',
      f7: '07. Returning Date',
      f8: '08. Reason for Leave',
      f9: '09. Leaves Taken This Year',
      f10: '10. Duty Coverage',
      f11: '11. Joined Date',
      f12: '12. Last Leave Date',
      sign: 'Applicant\'s Signature',
      date: 'Date',
      notApp: 'N/A',
      days: 'Days',
      none: 'None'
    }
  },

  ta: {
    headerTitle: 'ஓய்வு / நோய் விடுப்பு விண்ணப்பம்',
    reasonPrompt: 'ஓய்வு அல்லது நோய் விடுப்புக்கான காரணத்தை உள்ளிடவும்:',
    commonReasonsTitle: 'பொதுவான மருத்துவ காரணங்கள்:',
    inputPlaceholder: 'காரணத்தை இங்கே உள்ளிடவும்...',
    translateBtn: 'AI மூலம் மேம்படுத்து',
    translating: 'AI செயலாக்குகிறது...',
    continueDirect: 'உள்ளிட்டபடி தொடரவும்',
    confirmTitle: 'காரணம் உறுதிப்படுத்தல்',
    translatedLabel: 'தயாரிக்கப்பட்ட காரணம்:',
    editBtn: 'மீண்டும் திருத்து',
    confirmBtn: 'காரணத்தை உறுதிப்படுத்து',
    docTitle: 'அதிகாரப்பூர்வ ஓய்வு / நோய் விடுப்பு விண்ணப்பம்',
    statusVal: 'அனுமதிக்காக காத்திருக்கிறது',
    signRouteBtn: 'டிஜிட்டல் கையொப்பத்திற்குச் செல்லவும்',
    back: 'பின்னே',
    emptyAlert: 'காரணத்தை உள்ளிடவும் அல்லது பட்டியலில் ஒன்றைத் தேர்ந்தெடுக்கவும்.',
    medical: 'ஓய்வு / நோய் விடுப்பு',
    days: 'நாட்கள்',
    fullDay: 'முழு நாள்',
    selectDate: '• விடுப்பு தேதி வரம்பு:',
    lblDengue: 'டெங்கு / வைரஸ் காய்ச்சல்',
    lblSurgery: 'விபத்து / அறுவை சிகிச்சை',
    lblChronic: 'கடுமையான நோய்',
    lblMaternity: 'மகப்பேறு தேவைகள்',
    lblInfectious: 'தொற்று / கண் பாதிப்பு',
    uploadTitle: 'மருத்துவ ஆவண படங்களை இணைக்கவும்',
    uploadDesc: 'மருத்துவ சான்றிதழ், மருந்துச் சீட்டு அல்லது மருத்துவமனை ஆவணங்களின் படங்களைத் தேர்ந்தெடுக்கவும்.',
    uploadBtn: 'படங்களைத் தேர்ந்தெடுக்கவும்',
    noFiles: 'படங்கள் இணைக்கப்படவில்லை',
    maxFiles: 'அதிகபட்சம் 5 படங்களை மட்டும் இணைக்கலாம்.',
    photoPermission: 'படங்களைத் தேர்ந்தெடுக்க gallery அனுமதி வழங்கவும்.',
    continueBtn: 'தொடரவும்',
    coverageTitle: 'பணி பொறுப்பு',
    coverageDesc: 'நீங்கள் விடுப்பில் இருக்கும் போது உங்கள் பணிகளை கவனிக்க உங்கள் துறையிலிருந்து ஒருவரைத் தேர்ந்தெடுக்கவும்.',
    selectOfficer: 'பணி பொறுப்பு அலுவலரைத் தேர்ந்தெடுக்கவும்',
    noOfficers: 'தேர்வு செய்ய வேறு அலுவலர்கள் இல்லை.',
    callOfficer: 'அழைக்கவும்',
    phoneMissing: 'தேர்ந்தெடுக்கப்பட்ட அலுவலரின் தொலைபேசி எண் இல்லை.',
    officerRequired: 'பணி பொறுப்பு அலுவலரைத் தேர்ந்தெடுக்கவும்.',
    signTitle: 'டிஜிட்டல் கையொப்பம்',
    signDesc: 'கீழே உள்ள பெட்டியில் கையொப்பமிடவும்:',
    clearBtn: 'அழி',
    submitBtn: 'விண்ணப்பத்தை சமர்ப்பிக்கவும்',
    submitting: 'சமர்ப்பிக்கப்படுகிறது...',
    signWatermark: 'இங்கே கையொப்பமிடுங்கள்',
    signAlertTitle: 'கவனம்',
    signAlertMsg: 'சமர்ப்பிக்கும் முன் கையொப்பமிடவும்.',
    profileLoadError: 'பயனர் விவரங்களை ஏற்ற முடியவில்லை.',
    submitError: 'விண்ணப்பத்தை சேமிக்க முடியவில்லை.',
    successTitle: 'வெற்றி!',
    successMsg: 'உங்கள் ஓய்வு / நோய் விடுப்பு விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
    ok: 'சரி',
    searchPlaceholder: 'அலுவலரைத் தேடுக...',
    noSearchResults: 'பொருத்தமான அலுவலர்கள் காணப்படவில்லை',
    attachmentRequired: 'குறைந்தபட்சம் ஒரு மருத்துவ ஆவணப் படத்தையாவது இணைக்கவும்.',
    form: {
      title: 'அதிகாரபூர்வ ஓய்வு / நோய் விடுப்பு விண்ணப்பம்',
      f1: '01. அதிகாரியின் பெயர்',
      f2: '02. திணைக்களம்',
      f3: '03. பதவி',
      f4: '04. விடுப்பு வகை',
      f5: '05. விடுப்பு நாட்கள்',
      f6: '06. ஆரம்ப தேதி',
      f7: '07. திரும்பும் தேதி',
      f8: '08. விடுப்புக்கான காரணம்',
      f9: '09. இவ்வருடம் எடுத்த விடுப்புகள்',
      f10: '10. பணி பொறுப்பு',
      f11: '11. நியமனத் தேதி',
      f12: '12. கடைசி விடுப்பு தேதி',
      sign: 'விண்ணப்பதாரரின் கையொப்பம்',
      date: 'தேதி',
      notApp: 'பொருந்தாது',
      days: 'நாட்கள்',
      none: 'இல்லை'
    }
  },
};

const quickReasonIcons: {
  key: keyof typeof MEDICAL_PREDEFINED_REASONS;
  icon: IconName;
  color: string;
}[] = [
  { key: 'dengue', icon: 'medkit-outline', color: '#7A1020' },
  { key: 'surgery', icon: 'bandage-outline', color: '#B45309' },
  { key: 'chronic', icon: 'fitness-outline', color: '#0284C7' },
  { key: 'maternity', icon: 'woman-outline', color: '#059669' },
  { key: 'infectious', icon: 'eye-outline', color: '#4B5563' },
];

export default function MedicalFormScreen({
  selectedLang = 'si',
  onNavigate,
  onBack,
  t: parentT,
  route,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const compact = isSmallScreen || fontScale > 1.15;

  const safeLang: Language = selectedLang === 'si' || selectedLang === 'en' || selectedLang === 'ta' ? selectedLang : 'si';

  const t = useMemo(() => {
    return { ...(L[safeLang] || L.si), ...parentT };
  }, [safeLang, parentT]);

  const responsive = useMemo(() => ({
    title: compact ? 20 : 24,
    heading: compact ? 14 : 16,
    body: compact ? 12 : 14,
    value: compact ? 13 : 15,
    cardPadding: compact ? 15 : 20,
    buttonPadding: compact ? 13 : 16,
  }), [compact]);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [rawReason, setRawReason] = useState('');
  const [translatedReason, setTranslatedReason] = useState('');
  
  const [reasonSi, setReasonSi] = useState<string | null>(null);
  const [reasonEn, setReasonEn] = useState<string | null>(null);
  const [reasonTa, setReasonTa] = useState<string | null>(null);

  const [isQuickSelected, setIsQuickSelected] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isCoverageLoading, setIsCoverageLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [profile, setProfile] = useState<UserProfileData>({
    id: '', departmentId: null, name: '', designation: '', department: '', joinedDate: '-'
  });

  const [officers, setOfficers] = useState<CoverageOfficer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<CoverageOfficer | null>(null);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [livePath, setLivePath] = useState('');

  const pathsRef = useRef<string[]>([]);
  const liveStringRef = useRef('');
  const submittingRef = useRef(false);

  const [leaveHistoryData, setLeaveHistoryData] = useState({ lastLeaveDate: t.form.none, totalLeavesThisYear: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const fetchCoverageOfficers = async (deptId: number, currentUserId: string, sDate: string, eDate: string) => {
    setIsCoverageLoading(true);
    try {
      const { data: overlappingLeaves } = await supabase.from('leave_requests').select('user_id, coverage_officer_id')
        .in('status', ['Pending', 'Approved', 'Admin Approved']).lte('start_date', eDate).gte('end_date', sDate);

      const onLeaveIds = new Set<string>();
      const coveringIds = new Set<string>();
      if (overlappingLeaves) {
        overlappingLeaves.forEach((req: any) => {
          if (req.user_id) onLeaveIds.add(req.user_id);
          if (req.coverage_officer_id) coveringIds.add(req.coverage_officer_id);
        });
      }

      const { data: deptUsers, error: covError } = await supabase.from('users')
        .select(`id, title, full_name, full_name_si, full_name_ta, phone, designations(designation_en, designation_si, designation_ta)`)
        .eq('department_id', deptId).eq('is_active', true).neq('id', currentUserId).order('full_name', { ascending: true });

      if (covError) return;

      if (deptUsers) {
        const getLocalizedValue = (en?: string | null, si?: string | null, ta?: string | null) => {
          if (safeLang === 'si') return si || en || '';
          if (safeLang === 'ta') return ta || en || '';
          return en || '';
        };

        setOfficers(deptUsers.map((item: any) => {
          const offDesig = Array.isArray(item.designations) ? item.designations[0] : item.designations;
          let offTitle = '';
          if (item.title && String(item.title).trim() !== '' && item.title !== 'null') {
            const tText = String(item.title).trim();
            offTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
          }
          const offBaseName = getLocalizedValue(item.full_name, item.full_name_si, item.full_name_ta);
          const isCurrentlyOnLeave = onLeaveIds.has(item.id);
          const isCovering = coveringIds.has(item.id);
          const isAvailable = !isCurrentlyOnLeave && !isCovering;
          
          let unavailReason = '';
          if (isCurrentlyOnLeave) unavailReason = safeLang === 'si' ? 'මෙම දිනවල නිවාඩු ලබා ඇත' : safeLang === 'ta' ? 'இந்த நாட்களில் விடுப்பில் உள்ளார்' : 'On leave during these dates';
          else if (isCovering) unavailReason = safeLang === 'si' ? 'වෙනත් රාජකාරි ආවරණයක යෙදී සිටී' : safeLang === 'ta' ? 'வேறொரு பணியில் ஈடுபட்டுள்ளார்' : 'Covering another duty';

          return {
            id: item.id, name: `${offTitle}${offBaseName}`, phone: item.phone || null, isAvailable, unavailReason,
            designation: getLocalizedValue(offDesig?.designation_en, offDesig?.designation_si, offDesig?.designation_ta),
          };
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCoverageLoading(false);
    }
  };

  const fetchLeaveHistory = async (userId: string, leaveTypeId: number) => {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const { data, error } = await supabase.from('leave_requests').select('start_date, no_of_days')
      .eq('user_id', userId).eq('leave_type_id', leaveTypeId).in('status', ['Approved', 'Admin Approved'])
      .gte('start_date', startOfYear).lte('start_date', endOfYear).order('start_date', { ascending: false });

    if (error || !data || data.length === 0) {
      setLeaveHistoryData({ lastLeaveDate: t.form.none, totalLeavesThisYear: 0 });
      return;
    }

    const totalDays = data.reduce((sum, item) => sum + (item.no_of_days || 0), 0);
    const lastDate = formatToYMD(data[0].start_date);
    setLeaveHistoryData({ lastLeaveDate: lastDate, totalLeavesThisYear: totalDays });
  };

  useEffect(() => {
    let mounted = true;
    const loadProfileAndOfficers = async () => {
      try {
        setIsProfileLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user found.');

        const { data: userData, error: userError } = await supabase.from('users')
          .select(`id, department_id, title, full_name, full_name_si, full_name_ta, joined_date, created_at, designations ( designation_en, designation_si, designation_ta ), departments ( department_name, department_name_si, department_name_ta )`)
          .eq('auth_id', user.id).single();

        if (userError) throw userError;
        if (!userData) throw new Error('User profile was not found.');

        const getLocalizedValue = (en?: string | null, si?: string | null, ta?: string | null) => {
          if (safeLang === 'si') return si || en || '';
          if (safeLang === 'ta') return ta || en || '';
          return en || '';
        };

        const department = Array.isArray(userData.departments) ? userData.departments[0] : (userData.departments || {});
        const uDesig = Array.isArray(userData.designations) ? userData.designations[0] : (userData.designations || {});

        let formattedTitle = '';
        if (userData.title && String(userData.title).trim() !== '' && userData.title !== 'null') {
          const tText = String(userData.title).trim();
          formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
        }
        const baseName = getLocalizedValue(userData.full_name, userData.full_name_si, userData.full_name_ta);

        if (mounted) {
          setProfile({
            id: userData.id,
            departmentId: userData.department_id || null,
            name: `${formattedTitle}${baseName}`,
            designation: getLocalizedValue(uDesig?.designation_en, uDesig?.designation_si, uDesig?.designation_ta),
            department: getLocalizedValue(department?.department_name, department?.department_name_si, department?.department_name_ta),
            joinedDate: userData.joined_date ? formatToYMD(userData.joined_date) : '-',
          });

          if (userData.department_id) {
             const tempStart = new Date().toISOString().split('T')[0];
             await fetchCoverageOfficers(userData.department_id, userData.id, tempStart, tempStart);
          }
        }
      } catch (error) {
        console.error('Medical form profile load error:', error);
        if (mounted) Alert.alert('', t.profileLoadError);
      } finally {
        if (mounted) setIsProfileLoading(false);
      }
    };
    loadProfileAndOfficers();
    return () => { mounted = false; };
  }, [safeLang]);

  const filteredOfficers = useMemo(() => {
    if (!searchQuery.trim()) return officers;
    const lowerQuery = searchQuery.toLowerCase();
    return officers.filter(o => o.name.toLowerCase().includes(lowerQuery) || o.designation.toLowerCase().includes(lowerQuery));
  }, [searchQuery, officers]);

  // 🔥 PanResponder Fix
  const signatureResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (event) => {
      setScrollEnabled(false);
      const { locationX, locationY } = event.nativeEvent;
      liveStringRef.current = `M ${locationX} ${locationY}`;
      setLivePath(liveStringRef.current);
    },
    onPanResponderMove: (event) => {
      if (!liveStringRef.current) return;
      const { locationX, locationY } = event.nativeEvent;
      if (locationX >= 0 && locationY >= 0) {
        liveStringRef.current += ` L ${locationX} ${locationY}`;
        setLivePath(liveStringRef.current);
      }
    },
    onPanResponderRelease: () => {
      setScrollEnabled(true);
      if (liveStringRef.current.trim().length > 0) {
        pathsRef.current.push(liveStringRef.current);
        setCompletedPaths([...pathsRef.current]);
      }
      liveStringRef.current = '';
      setLivePath('');
    },
    onPanResponderTerminate: () => {
      setScrollEnabled(true);
      if (liveStringRef.current.trim().length > 0) {
        pathsRef.current.push(liveStringRef.current);
        setCompletedPaths([...pathsRef.current]);
      }
      liveStringRef.current = '';
      setLivePath('');
    },
  }), []);

  const clearSignature = () => {
    pathsRef.current = [];
    liveStringRef.current = '';
    setCompletedPaths([]);
    setLivePath('');
  };

  const leaveDetails = useMemo(() => {
    const rawParams = route?.params || {};
    const today = new Date().toISOString().split('T')[0];
    const range = rawParams.medicalDateRange;
    const startDate = normalizeDate(range?.startIso) || normalizeDate(rawParams.chosenCustomDateIso) || normalizeDate(rawParams.chosenCustomDate) || today;
    const medicalDays = Math.max(1, Number(rawParams.medicalDays || 1));
    let endDate = normalizeDate(range?.endIso);

    if (!endDate) {
      const end = new Date(`${startDate}T00:00:00`);
      end.setDate(end.getDate() + medicalDays - 1);
      endDate = end.toISOString().split('T')[0];
    }

    let displayDate = `${startDate} - ${endDate}`;
    if (range) {
      if (safeLang === 'si') displayDate = `${range.startFormatted} සිට ${range.endFormatted} දක්වා`;
      else if (safeLang === 'ta') displayDate = `${range.startFormatted} முதல் ${range.endFormatted} வரை`;
      else displayDate = `${range.startFormatted} to ${range.endFormatted}`;
    }

    const returningDate = addDays(endDate, 1);
    const duration = medicalDays === 1 ? t.fullDay : `${medicalDays} ${t.days}`;
    
    return { 
      applyDate: today, 
      startDate, 
      endDate, 
      returningDate, 
      displayDate, 
      medicalDays, 
      duration, 
      leaveTypeString: t.medical,
      leaveDateInfo: startDate,
      leaveTypeKey: 'medical'
    };
  }, [route, safeLang, t]);

  const quickReasons = useMemo(() => [
    { ...quickReasonIcons[0], label: t.lblDengue, reasonKey: 'dengue' as const },
    { ...quickReasonIcons[1], label: t.lblSurgery, reasonKey: 'surgery' as const },
    { ...quickReasonIcons[2], label: t.lblChronic, reasonKey: 'chronic' as const },
    { ...quickReasonIcons[3], label: t.lblMaternity, reasonKey: 'maternity' as const },
    { ...quickReasonIcons[4], label: t.lblInfectious, reasonKey: 'infectious' as const },
  ], [t]);

  const handleTranslate = async () => {
    const reason = rawReason.trim();
    if (!reason) { Alert.alert('', t.emptyAlert); return; }
    setIsTranslating(true);
    try {
      setTimeout(() => {
          setTranslatedReason(reason); 
          setReasonSi(null); setReasonEn(null); setReasonTa(null); 
          setIsQuickSelected(false);
          setStep(2);
          setIsTranslating(false);
      }, 1000);
    } catch (error) {
      console.warn('Medical reason AI fallback:', error);
      setTranslatedReason(reason);
      setIsQuickSelected(false);
      setIsTranslating(false);
      setStep(2);
    }
  };

  const selectPhotos = async () => {
    if (attachments.length >= 5) { Alert.alert('', t.maxFiles); return; }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('', t.photoPermission); return; }
    const remaining = 5 - attachments.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: remaining, quality: 0.8,
    });
    if (result.canceled) return;
    const newItems: LocalAttachment[] = result.assets.slice(0, remaining).map((asset, index) => {
      const extension = asset.fileName?.split('.').pop() || asset.mimeType?.split('/').pop() || 'jpg';
      return {
        id: `${Date.now()}-${index}-${Math.random()}`,
        uri: asset.uri,
        fileName: asset.fileName || `medical_photo_${Date.now()}_${index}.${extension}`,
        mimeType: asset.mimeType || `image/${extension}`,
        size: asset.fileSize,
      };
    });
    setAttachments((current) => [...current, ...newItems]);
  };

  const removeAttachment = (id: string) => setAttachments((current) => current.filter((item) => item.id !== id));
  
  const callSelectedOfficer = async () => {
    if (!selectedOfficer?.phone) { Alert.alert('', t.phoneMissing); return; }
    await Linking.openURL(`tel:${selectedOfficer.phone}`);
  };

  const handleBack = () => {
    if (step === 2) { if (isQuickSelected) setRawReason(''); setStep(1); return; }
    if (step === 3) { setStep(2); return; }
    if (step === 4) { setStep(3); return; }
    if (step === 5) { setStep(4); return; }
    if (onBack) { onBack(); } else { onNavigate('LeaveBalance'); }
  };

  const handleShowPreview = async () => {
    if (pathsRef.current.length === 0) { Alert.alert(t.signAlertTitle, t.signAlertMsg); return; }
    if (!profile.id) { Alert.alert('', t.profileLoadError); return; }

    setIsSubmitting(true);
    try {
      const { data: leaveTypeRow } = await supabase.from('leave_types').select('id')
        .or('name_en.ilike.%medical%,name_en.ilike.%sick%,name_en.ilike.%rest%').limit(1).single();
      
      if (leaveTypeRow) await fetchLeaveHistory(profile.id, leaveTypeRow.id);

      setShowPreviewModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Bulletproof Image Upload matching Original Setup
  const uploadAttachments = async (leaveRequestId: number): Promise<UploadedAttachment[]> => {
    const uploaded: UploadedAttachment[] = [];
    for (let index = 0; index < attachments.length; index++) {
      const item = attachments[index];
      const response = await fetch(item.uri);
      const arrayBuffer = await response.arrayBuffer(); 
      const cleanName = sanitizeFileName(item.fileName) || `medical_photo_${index}.jpg`;
      const storagePath = `${profile.id}/${leaveRequestId}/${Date.now()}_${index}_${cleanName}`;
      const { error } = await supabase.storage.from('medical-documents').upload(storagePath, arrayBuffer, {
        contentType: item.mimeType || 'image/jpeg',
      });
      if (error) throw error;
      uploaded.push({ fileName: item.fileName, storagePath, mimeType: item.mimeType || 'image/jpeg', size: item.size });
    }
    return uploaded;
  };

 const executeFinalSubmission = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    
    let createdRequestId: number | null = null;
    let uploadedPaths: string[] = [];

   try {
      if (!leaveDetails.startDate || !leaveDetails.endDate) throw new Error('Invalid leave date.');

      // 🔥 Improved Query
      const { data: leaveTypeRow, error: leaveTypeError } = await supabase.from('leave_types').select('id')
        .or('name_en.ilike.%medical%,name_en.ilike.%sick%,name_en.ilike.%rest%').limit(1).single();
      if (leaveTypeError || !leaveTypeRow) throw new Error('Medical leave type was not found.');

      const { data: leaveRequest, error: requestError } = await supabase.from('leave_requests').insert({
          user_id: profile.id,
          leave_type_id: leaveTypeRow.id,
          start_date: leaveDetails.startDate,
          end_date: leaveDetails.endDate,
          no_of_days: leaveDetails.medicalDays,
          reason: translatedReason.trim(),
          reason_si: reasonSi || (safeLang === 'si' ? translatedReason.trim() : null),
          reason_en: reasonEn || (safeLang === 'en' ? translatedReason.trim() : null),
          reason_ta: reasonTa || (safeLang === 'ta' ? translatedReason.trim() : null),
          status: 'Pending',
          approval_stage: 'admin_review',
          coverage_officer_id: selectedOfficer?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      }).select('id').single();

      if (requestError || !leaveRequest) throw new Error('Leave request was not created.');
      createdRequestId = Number(leaveRequest.id);

      const uploaded = await uploadAttachments(createdRequestId);
      uploadedPaths = uploaded.map((item) => item.storagePath);

      if (uploadedPaths.length > 0) {
        await supabase.from('leave_requests').update({
            attachment_url: JSON.stringify(uploadedPaths)
        }).eq('id', createdRequestId);
      }

      const formDetails = {
        officer: { user_id: profile.id, name: profile.name, designation: profile.designation, department: profile.department },
        leave: { type: leaveDetails.leaveTypeString, type_key: 'medical', start_date: leaveDetails.startDate, end_date: leaveDetails.endDate, no_of_days: leaveDetails.medicalDays, duration: leaveDetails.duration, reason: translatedReason.trim(), applied_date: leaveDetails.applyDate },
        duty_coverage: selectedOfficer ? { officer_id: selectedOfficer.id, officer_name: selectedOfficer.name, designation: selectedOfficer.designation } : null,
        attachments: uploaded, 
        status: 'Pending', language: safeLang,
      };

      const digitalSignature = JSON.stringify({ paths: pathsRef.current, strokeColor: '#7A1020', strokeWidth: 4.5 });

      const { error: formError } = await supabase.from('leave_forms').insert({ leave_request_id: leaveRequest.id, form_details: JSON.stringify(formDetails), digital_signature: digitalSignature, submitted_at: new Date().toISOString() });

      if (formError) throw formError;

      const appSentTitleSi = 'නිවාඩු අයදුම්පත යවන ලදී';
      const appSentTitleTa = 'விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது';
      const appSentTitleEn = 'Leave Request Sent';

      const appSentMsgSi = `${leaveDetails.displayDate} සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.`;
      const appSentMsgTa = `${leaveDetails.displayDate} தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.`;
      const appSentMsgEn = `Your leave request for ${leaveDetails.displayDate} was sent successfully.`;

      const appSentTitle = safeLang === 'si' ? appSentTitleSi : safeLang === 'ta' ? appSentTitleTa : appSentTitleEn;
      const appSentMsg = safeLang === 'si' ? appSentMsgSi : safeLang === 'ta' ? appSentMsgTa : appSentMsgEn;

      const { data: userNotif } = await supabase.from('notifications').insert({ 
        user_id: profile.id, 
        title: appSentTitle, 
        message: appSentMsg, 
        title_en: appSentTitleEn, 
        title_si: appSentTitleSi, 
        title_ta: appSentTitleTa,
        message_en: appSentMsgEn, 
        message_si: appSentMsgSi, 
        message_ta: appSentMsgTa,
        is_read: false, 
        is_auto_generated: true, 
        created_by: profile.id,
        notification_type: 'leave', 
        related_entity: 'leave_requests', 
        related_id: createdRequestId, 
        is_for_mobile: true, 
        created_at: new Date().toISOString() 
      }).select('id').single();

      await showLeaveNotification({ 
        title: appSentTitle, 
        body: appSentMsg, 
        requestId: createdRequestId,
        notificationId: userNotif?.id
      });

      setShowPreviewModal(false); 
      Alert.alert(t.successTitle, t.successMsg, [{ text: t.ok, onPress: () => { onNavigate('LeaveBalance', { pendingRequest: { id: leaveRequest.id, date: leaveDetails.leaveDateInfo, type: leaveDetails.leaveTypeKey, status: 'pending' } }); } }]);
    } catch (error: any) {
      console.error('Medical leave submission error:', error);
      for (const path of uploadedPaths) { await supabase.storage.from('medical-documents').remove([path]); }
      if (createdRequestId) {
        await supabase.from('leave_forms').delete().eq('leave_request_id', createdRequestId);
        await supabase.from('leave_requests').delete().eq('id', createdRequestId);
      }
      Alert.alert('', error?.message ? `${t.submitError}\n${error.message}` : t.submitError);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const renderStepHeader = (icon: IconName, title: string, color = '#7A1020') => (
    <View style={styles.alertHeaderBadgeRow}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.alertHeaderTitle, { color }]}>{title}</Text>
    </View>
  );

  if (isProfileLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#7A1020" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A1020" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7A1020" />
      
      <View style={styles.header}>
        <View style={styles.hCircle1} pointerEvents="none" />
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtnPill} onPress={handleBack} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={16} color="#FFD54F" />
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.hTitle, { fontSize: responsive.title }]}>
          {step === 5 ? t.signTitle : t.headerTitle}
        </Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView scrollEnabled={scrollEnabled} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {step === 1 && (
            <View style={{ gap: 16 }}>
              <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
                <Text style={[styles.inputLabelHeader, { fontSize: responsive.heading }]}>{t.reasonPrompt}</Text>
                <TextInput allowFontScaling={false} style={[styles.reasonInputField, { fontSize: responsive.body }]} multiline numberOfLines={4} value={rawReason} onChangeText={setRawReason} placeholder={t.inputPlaceholder} placeholderTextColor="#94A3B8" textAlignVertical="top" />
                <TouchableOpacity style={[styles.primaryActionBtn, { paddingVertical: responsive.buttonPadding }, isTranslating && styles.disabledButton]} onPress={handleTranslate} disabled={isTranslating}>
                  {isTranslating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />}
                  <Text style={[styles.primaryActionBtnText, { fontSize: responsive.body }]}>{isTranslating ? t.translating : t.translateBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.directContinueBtn} onPress={() => { 
                  if (!rawReason.trim()) { Alert.alert('', t.emptyAlert); return; } 
                  setTranslatedReason(rawReason); 
                  setReasonSi(null); setReasonEn(null); setReasonTa(null);
                  setIsQuickSelected(false); setStep(2); 
                }} disabled={isTranslating}>
                  <Ionicons name="document-text-outline" size={18} color="#7A1020" />
                  <Text style={[styles.directContinueBtnText, { fontSize: responsive.body }]}>{t.continueDirect}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.quickSelectContainer, { padding: responsive.cardPadding }]}>
                <Text style={styles.quickSelectHeaderLabel}>{t.commonReasonsTitle}</Text>
                {quickReasons.map((item) => (
                  <TouchableOpacity key={item.key} style={styles.reasonPillItem} onPress={() => { 
                    setRawReason(MEDICAL_PREDEFINED_REASONS[item.reasonKey][safeLang]); 
                    setTranslatedReason(MEDICAL_PREDEFINED_REASONS[item.reasonKey][safeLang]); 
                    setReasonSi(MEDICAL_PREDEFINED_REASONS[item.reasonKey].si); 
                    setReasonEn(MEDICAL_PREDEFINED_REASONS[item.reasonKey].en); 
                    setReasonTa(MEDICAL_PREDEFINED_REASONS[item.reasonKey].ta);
                    setIsQuickSelected(true); setStep(2); 
                  }}>
                    <Ionicons name={item.icon} size={17} color={item.color} />
                    <Text style={styles.reasonPillText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={15} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              {renderStepHeader('checkbox-outline', t.confirmTitle, '#B45309')}
              <Text style={styles.formSectionSubLabel}>{t.translatedLabel}</Text>
              <TextInput allowFontScaling={false} style={[styles.reasonInputField, styles.editableTranslationField, { fontSize: responsive.body }]} multiline value={translatedReason} onChangeText={setTranslatedReason} textAlignVertical="top" />
              <View style={[styles.splitBtnRow, compact && styles.compactBtnColumn]}>
                <TouchableOpacity style={[styles.secondarySplitBtn, compact && styles.fullWidthBtn]} onPress={() => { setRawReason(translatedReason); setStep(1); }}>
                  <Ionicons name="create-outline" size={16} color="#4A5568" />
                  <Text style={styles.secondarySplitBtnText}>{t.editBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryActionBtn, styles.flexPrimaryBtn, compact && styles.fullWidthBtn, { marginTop: 0 }]} onPress={() => setStep(3)}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>{t.confirmBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              {renderStepHeader('images-outline', t.uploadTitle, '#7A1020')}
              <Text style={styles.helperDescription}>{t.uploadDesc}</Text>
              
              <TouchableOpacity style={styles.uploadDashedArea} onPress={selectPhotos} activeOpacity={0.75}>
                <Ionicons name="images-outline" size={38} color="#7A1020" />
                <Text style={styles.uploadBtnLabel}>{t.uploadBtn}</Text>
              </TouchableOpacity>

              {!attachments.length ? (
                <Text style={styles.noFilesText}>{t.noFiles}</Text>
              ) : (
                <View style={styles.photoGrid}>
                  {attachments.map((attachment) => (
                    <View key={attachment.id} style={styles.photoCard}>
                      <Image source={{ uri: attachment.uri }} style={styles.photoPreview} />
                      <View style={styles.photoInfo}>
                        <Text style={styles.photoName} numberOfLines={1}>{attachment.fileName}</Text>
                        {!!attachment.size && <Text style={styles.photoSize}>{formatFileSize(attachment.size)}</Text>}
                      </View>
                      <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeAttachment(attachment.id)}>
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.splitBtnRow, compact && styles.compactBtnColumn]}>
                <TouchableOpacity style={[styles.secondarySplitBtn, compact && styles.fullWidthBtn]} onPress={handleBack}>
                  <Ionicons name="chevron-back" size={16} color="#4A5568" />
                  <Text style={styles.secondarySplitBtnText}>{t.back}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.primaryActionBtn, styles.flexPrimaryBtn, compact && styles.fullWidthBtn, { marginTop: 0 }, !attachments.length && styles.disabledButton]} 
                  onPress={() => {
                    if (!attachments.length) { Alert.alert(t.signAlertTitle, t.attachmentRequired); return; }
                    setStep(4);
                  }}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>{t.continueBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              {renderStepHeader('people-outline', t.coverageTitle)}
              <Text style={styles.helperDescription}>{t.coverageDesc}</Text>
              <TouchableOpacity style={styles.officerSelector} onPress={() => { setSearchQuery(''); setShowOfficerModal(true); }}>
                <View style={styles.officerIcon}><Ionicons name="person-outline" size={21} color="#7A1020" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.officerName}>{selectedOfficer?.name || t.selectOfficer}</Text>
                  {!!selectedOfficer && <Text style={styles.officerDesignation}>{selectedOfficer.designation}</Text>}
                </View>
                <Ionicons name="chevron-down" size={20} color="#7A1020" />
              </TouchableOpacity>
              {!!selectedOfficer && (
                <TouchableOpacity style={styles.callButton} onPress={callSelectedOfficer}>
                  <Ionicons name="call-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>{t.callOfficer}</Text>
                </TouchableOpacity>
              )}
              <View style={[styles.splitBtnRow, compact && styles.compactBtnColumn]}>
                <TouchableOpacity style={[styles.secondarySplitBtn, compact && styles.fullWidthBtn]} onPress={handleBack}>
                  <Ionicons name="chevron-back" size={16} color="#4A5568" />
                  <Text style={styles.secondarySplitBtnText}>{t.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryActionBtn, styles.flexPrimaryBtn, compact && styles.fullWidthBtn, { marginTop: 0 }, !selectedOfficer && styles.disabledButton]} disabled={!selectedOfficer} onPress={() => setStep(5)}>
                  <Ionicons name="arrow-forward-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>{t.continueBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              <Text style={styles.signatureHelperDescriptionText}>{t.signDesc}</Text>
              
              <View style={styles.signatureCanvasBoxFrame} {...signatureResponder.panHandlers}>
                <Svg style={styles.absoluteFillView} pointerEvents="none">
                  {completedPaths.map((pathStr, idx) => <Path key={`comp-path-${idx}`} d={pathStr} stroke="#7A1020" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
                  {livePath ? <Path d={livePath} stroke="#7A1020" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
                </Svg>
                {!completedPaths.length && !livePath && (
                  <View style={styles.watermarkContainer} pointerEvents="none"><Ionicons name="create-outline" size={24} color="#CBD5E1" /><Text style={styles.watermarkText}>{t.signWatermark}</Text></View>
                )}
              </View>
              
              <View style={styles.controlActionRowStack}>
                <TouchableOpacity style={styles.clearCanvasBtnPill} onPress={clearSignature} activeOpacity={0.7}>
                  <Ionicons name="refresh-circle-outline" size={18} color="#475569" />
                  <Text style={styles.clearBtnText}>{t.clearBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.blockActionBtn} onPress={handleShowPreview} activeOpacity={0.85}>
                  {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="document-text" size={18} color="#FFF" />}
                  <Text style={styles.blockActionBtnText}>{isSubmitting ? 'Processing...' : (safeLang === 'si' ? 'අයදුම්පතේ පෙරදසුන බලන්න' : 'Preview Application')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      <Modal visible={showOfficerModal} transparent animationType="slide" onRequestClose={() => setShowOfficerModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.selectOfficer}</Text>
                <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => { if(profile.departmentId && profile.id) fetchCoverageOfficers(Number(profile.departmentId), profile.id, leaveDetails.startDate, leaveDetails.endDate) }}>
                    {isCoverageLoading ? <ActivityIndicator size="small" color="#7A1020"/> : <Ionicons name="refresh" size={22} color="#7A1020" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowOfficerModal(false)}><Ionicons name="close" size={26} color="#7A1020" /></TouchableOpacity>
                </View>
              </View>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.searchInput} placeholder={t.searchPlaceholder} placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
                {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#CBD5E1" /></TouchableOpacity> : null}
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
                {!filteredOfficers.length ? (
                  <Text style={styles.noOfficerText}>{searchQuery ? t.noSearchResults : t.noOfficers}</Text>
                ) : (
                  filteredOfficers.map((officer) => (
                    <TouchableOpacity 
                      key={officer.id} 
                      style={[styles.officerRow, selectedOfficer?.id === officer.id && styles.officerRowSelected, !officer.isAvailable && { opacity: 0.5 }]} 
                      disabled={!officer.isAvailable}
                      onPress={() => { setSelectedOfficer(officer); setShowOfficerModal(false); }}
                    >
                      <View style={styles.avatar}><Text style={styles.avatarText}>{officer.name?.charAt(0)?.toUpperCase()}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.officerNameText}>{officer.name}</Text>
                        <Text style={styles.officerDesignationText}>{officer.designation}</Text>
                        {!officer.isAvailable && (
                          <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700', marginTop: 3 }}>
                            {officer.unavailReason}
                          </Text>
                        )}
                      </View>
                      {selectedOfficer?.id === officer.id && <Ionicons name="checkmark-circle" size={23} color="#16803D" />}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>   
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showPreviewModal} animationType="slide" transparent={false} onRequestClose={() => setShowPreviewModal(false)}>
        <View style={styles.previewRoot}>
          <View style={styles.header}>
            <View style={styles.hCircle1} pointerEvents="none" />
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtnPill} onPress={() => setShowPreviewModal(false)} activeOpacity={0.75}>
                <Ionicons name="chevron-back" size={16} color="#FFD54F" />
                <Text style={styles.backText}>{t.back}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.hTitle, { fontSize: responsive.title }]}>{safeLang === 'si' ? 'අයදුම්පතේ පෙරදසුන' : safeLang === 'ta' ? 'விண்ணப்ப முன்னோட்டம்' : 'Application Preview'}</Text>
          </View>
          
          <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={styles.a4Paper}>
              <View style={styles.a4HeaderBox}>
                 <Image source={require('../../../assets/images/ui/logo.png')} style={styles.a4LogoImg} />
                 <Text style={styles.a4MainTitle}>{t.form.title}</Text>
                 <Image source={require('../../../assets/images/ui/srilankalogo.png')} style={styles.a4LogoImg} />
              </View>

              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f1}</Text><Text style={styles.a4Value}>: {profile.name}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f2}</Text><Text style={styles.a4Value}>: {profile.department || '-'}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f3}</Text><Text style={styles.a4Value}>: {profile.designation}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f4}</Text><Text style={styles.a4Value}>: {leaveDetails.leaveTypeString}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f5}</Text><Text style={styles.a4Value}>: {leaveDetails.duration}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f6}</Text><Text style={styles.a4Value}>: {leaveDetails.startDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f7}</Text><Text style={styles.a4Value}>: {leaveDetails.returningDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f8}</Text><Text style={styles.a4Value}>: {translatedReason}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f9}</Text><Text style={styles.a4Value}>: {t.form.days} {leaveHistoryData.totalLeavesThisYear}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f10}</Text><Text style={styles.a4Value}>: {selectedOfficer ? selectedOfficer.name : t.form.notApp}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f11}</Text><Text style={styles.a4Value}>: {profile.joinedDate}</Text></View>
              <View style={styles.a4Row}><Text style={styles.a4Label}>{t.form.f12}</Text><Text style={styles.a4Value}>: {leaveHistoryData.lastLeaveDate}</Text></View>
              
              <View style={styles.a4SignatureSection}>
                <View style={styles.a4SignatureCanvas}>
                  <Svg style={StyleSheet.absoluteFill} viewBox="0 0 350 300">
                    {completedPaths.map((pathStr, idx) => <Path key={`preview-path-${idx}`} d={pathStr} stroke="#1E293B" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
                  </Svg>
                </View>
                <Text style={styles.a4SignatureLine}>.............................................</Text>
                <Text style={styles.a4SignatureText}>{t.form.sign}</Text>
                <Text style={styles.a4DateText}>({t.form.date}: {leaveDetails.applyDate})</Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.previewFooterColumn}>
            <TouchableOpacity style={styles.previewCancelBtn} onPress={() => setShowPreviewModal(false)}><Text style={styles.previewCancelText}>{safeLang === 'si' ? 'නැවත වෙනස් කරන්න' : safeLang === 'ta' ? 'மீண்டும் மாற்றவும்' : 'Edit Again'}</Text></TouchableOpacity>
            
            <TouchableOpacity style={[styles.previewSubmitBtn, isSubmitting && styles.disabledButton]} onPress={executeFinalSubmission} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="checkmark-circle" size={20} color="#FFF" />}
              <Text style={styles.previewSubmitText}>{isSubmitting ? (safeLang === 'si' ? 'සුරකිමින්...' : 'Saving...') : (safeLang === 'si' ? 'තහවුරු කර ඉදිරිපත් කරන්න' : safeLang === 'ta' ? 'உறுதிப்படுத்தி சமர்ப்பிக்கவும்' : 'Confirm & Submit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: '#7A1020', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', elevation: 5 },
  hCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50 },
  headerTopRow: { marginBottom: 12, flexDirection: 'row' },
  backBtnPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  backText: { color: '#FFD54F', fontSize: 13, fontWeight: '800' },
  hTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  scroll: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 100, flexGrow: 1 },
  cardFrame: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1.5, borderColor: '#94A3B8', marginBottom: 20 },
  inputLabelHeader: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  reasonInputField: { backgroundColor: '#F8FAFC',width: '100%',
flexShrink: 0, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 14, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, fontSize: 15, lineHeight: 26, color: '#334155', textAlignVertical: 'top', minHeight: 120, fontWeight: '500', includeFontPadding: true },
  editableTranslationField: { borderColor: '#B45309', backgroundColor: '#FFFBEB', color: '#78350F', lineHeight: 28, minHeight: 130, includeFontPadding: true },
  flexPrimaryBtn: { flex: 1.2, minHeight: 52, marginTop: 0 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#B45309', paddingVertical: 14, paddingHorizontal: 8, borderRadius: 14, marginTop: 16 },
  primaryActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14, flexShrink: 1, textAlign: 'center' },
  disabledButton: { opacity: 0.65 },
  directContinueBtn: { marginTop: 12, minHeight: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#7A1020', backgroundColor: '#FFF7F8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 14 },
  directContinueBtnText: { color: '#7A1020', fontWeight: '900', textAlign: 'center', flexShrink: 1 },
  helperDescription: { fontSize: 13, lineHeight: 20, fontWeight: '700', color: '#475569', marginBottom: 16 },
  quickSelectContainer: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, borderWidth: 1.5, borderColor: '#94A3B8' },
  quickSelectHeaderLabel: { fontSize: 14, fontWeight: '900', color: '#1A2940', marginBottom: 12 },
  reasonPillItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1.5, borderColor: '#94A3B8' },
  reasonPillText: { fontSize: 14, fontWeight: '800', color: '#334155', flex: 1, flexWrap: 'wrap' },
  alertHeaderBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  alertHeaderTitle: { fontSize: 17, fontWeight: '900', color: '#B45309' },
  formSectionSubLabel: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 8 },
  splitBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18, alignItems: 'stretch', width: '100%' },
  compactBtnColumn: { flexDirection: 'column' },
  fullWidthBtn: { width: '100%', flex: 0 },
  secondarySplitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#94A3B8', paddingVertical: 16, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#F8FAFC' },
  secondarySplitBtnText: { color: '#4A5568', fontWeight: '800', fontSize: 15, textAlign: 'center', flexShrink: 0 ,width: '95%',},
  
  uploadDashedArea: { borderWidth: 2, borderColor: '#D6C2C6', borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9FA', marginBottom: 14 },
  uploadBtnLabel: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#7A1020' },
  noFilesText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, fontStyle: 'italic', marginVertical: 10 },
  photoGrid: { gap: 10 },
  photoCard: { minHeight: 82, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', padding: 9, position: 'relative' },
  photoPreview: { width: 62, height: 62, borderRadius: 10, backgroundColor: '#E2E8F0' },
  photoInfo: { flex: 1, paddingHorizontal: 10 },
  photoName: { fontSize: 12, fontWeight: '800', color: '#334155' },
  photoSize: { fontSize: 10, color: '#64748B', marginTop: 4 },
  removePhotoBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DC2626', position: 'absolute', right: -5, top: -5, alignItems: 'center', justifyContent: 'center' },

  signatureHelperDescriptionText: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 16, textAlign: 'center', lineHeight: 20 },
  signatureCanvasBoxFrame: { height: 300, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#94A3B8', borderRadius: 24, overflow: 'hidden', position: 'relative' },
  absoluteFillView: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', gap: 6 },
  watermarkText: { color: '#CBD5E1', fontSize: 15, fontWeight: '800' },
  controlActionRowStack: { gap: 12, marginTop: 20 },
  clearCanvasBtnPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#E2E8F0', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#94A3B8' },
  clearBtnText: { color: '#475569', fontWeight: '800', fontSize: 15 },
  blockActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7A1020', paddingVertical: 16, borderRadius: 14, width: '100%' },
  blockActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  
  officerSelector: { minHeight: 70, borderWidth: 1.3, borderColor: '#CBD5E1', borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, backgroundColor: '#F8FAFC' },
  officerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F7EFF1', alignItems: 'center', justifyContent: 'center' },
  officerName: { fontSize: 14, lineHeight: 19, fontWeight: '900', color: '#1E293B' },
  officerDesignation: { fontSize: 11, lineHeight: 16, fontWeight: '700', color: '#64748B', marginTop: 3 },
  callButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#16803D', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 10, marginTop: 11 },
  callButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  
  previewRoot: { flex: 1, backgroundColor: '#F8FAFC' }, 
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#94A3B8', zIndex: 10, elevation: 5 },
  previewHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  previewCloseBtn: { padding: 5, backgroundColor: '#F1F5F9', borderRadius: 12 },
  previewScroll: { flex: 1 }, 
  a4Paper: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8, marginBottom: 20, width: '100%', maxWidth: 500, minHeight: 650 },
  
  a4HeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', marginBottom: 30 },
  a4LogoImg: { width: 60, height: 60, resizeMode: 'contain' },
  a4MainTitle: { flex: 1, fontSize: 18, fontWeight: '900', color: '#7A1020', textAlign: 'center', textDecorationLine: 'underline', paddingHorizontal: 10 },

  a4Row: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
  a4Label: { width: 140, fontSize: 12, fontWeight: '800', color: '#334155', lineHeight: 18 },
  a4Value: { flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A', lineHeight: 18, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 2 },
  a4SignatureSection: { marginTop: 40, alignItems: 'flex-end', paddingRight: 10 },
  a4SignatureCanvas: { width: 110, height: 70, marginBottom: 5 },
  a4SignatureLine: { fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  a4SignatureText: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 2, marginRight: 15 },
  a4DateText: { fontSize: 11, fontWeight: '600', color: '#64748B', marginRight: 15 },
  previewFooterColumn: { flexDirection: 'column', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#F4E8EA', gap: 12, paddingBottom: 30 },
  previewCancelBtn: { paddingVertical: 15, borderRadius: 14, backgroundColor: '#FFF7F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#7A1020' },
  previewCancelText: { color: '#7A1020', fontSize: 15, fontWeight: '900' },
  previewSubmitBtn: { flexDirection: 'row', paddingVertical: 15, borderRadius: 14, backgroundColor: '#7A1020', alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '78%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  modalTitle: { flex: 1, paddingRight: 12, fontSize: 16, lineHeight: 22, fontWeight: '900', color: '#1E293B' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, minHeight: 46, marginVertical: 12 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155', marginLeft: 8 },
  noOfficerText: { textAlign: 'center', color: '#94A3B8', paddingVertical: 30, fontSize: 12, lineHeight: 18 },
  officerRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: '#EEF2F6', paddingHorizontal: 5 },
  officerRowSelected: { backgroundColor: '#F0FDF4' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7A1020', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  officerNameText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  officerDesignationText: { fontSize: 12, color: '#64748B', marginTop: 2 },
});