// app/screens/DigitalFormScreen.tsx — Premium Government Multi-Step Form Engine
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextProps,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  KeyboardAvoidingView,
  Linking,
  Image,
  PanResponder,
  StatusBar,
} from 'react-native';

import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { showLeaveNotification } from '../../lib/notificationService';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';

interface Props {
  selectedLang?: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
  t?: any;
  route?: any; 
}

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

const PREDEFINED_REASONS = {
  urgent: {
    si: 'පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.',
    en: 'Urgent personal matter and essential home task.',
    ta: 'அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.',
  },
  child: {
    si: 'දරුවෙකුගේ අධ්‍යාපනික හෝ සෞඛ්‍යමය කටයුත්තක් වෙනුවෙන් පෙනී සිටීමට.',
    en: 'Child medical or educational need.',
    ta: 'குழந்தை தொடர்பான கல்வி அல்லது மருத்துவ தேவைக்காக.',
  },
  family: {
    si: 'පවුලේ සමීපතම මංගල්‍ය හෝ විශේෂ උත්සව අවස්ථාවකට සහභාගී වීම සඳහා.',
    en: 'Attending a close family wedding or special event.',
    ta: 'குடும்ப நெருக்கமான விழா அல்லது சிறப்பு நிகழ்வில் பங்கேற்க.',
  },
  bank: {
    si: 'අත්‍යවශ්‍ය බැංකු හෝ රාජ්‍ය ආයතනයක නිල කටයුත්තක් සපුරා ගැනීමට.',
    en: 'Essential bank transaction or official government matter.',
    ta: 'முக்கியமான வங்கி அல்லது அரச நிறுவன அலுவல் தேவைக்காக.',
  }
};

const L = {
  si: {
    headerTitle: 'ඩිජිටල් අයදුම්පත්‍රය',
    reasonPrompt: 'නිවාඩුව ලබා ගැනීමට හේතුව ඇතුළත් කරන්න:',
    commonReasonsTitle: 'නිතර භාවිතා වන පොදු හේතු:',
    inputPlaceholder: 'හේතුව මෙතන ටයිප් කරන්න (Singlish වලින් වුවද හැක)...',
    translateBtn: 'AI මඟින් සකස් කරන්න',
    translating: 'AI මඟින් සකසමින්...',
    continueDirectBtn: 'ලියූ පරිදි ඉදිරියට යන්න',
    confirmTitle: 'පරිවර්තන තහවුරු කිරීම',
    translatedLabel: 'පරිවර්තනය කරන ලද හේතුව:',
    editBtn: 'නැවත සංස්කරණය',
    confirmBtn: 'හේතුව ස්ථිරයි',
    profileLoadError: 'පරිශීලක තොරතුරු ලබාගත නොහැකි විය.',
    submitError: 'අයදුම්පත සුරැකීමට නොහැකි විය.',
    docTitle: 'නිල නිවාඩු අයදුම්පත්‍රය',
    statusVal: 'අනුමැතිය සඳහා රැඳී පවතී',
    signRouteBtn: 'ඩිජිටල් අත්සන තැබීමට ඉදිරියට යන්න',
    back: 'ආපසු',
    emptyAlert: 'කරුණාකර හේතුවක් ඇතුළත් කරන්න හෝ ලැයිස්තුවෙන් එකක් තෝරන්න.',
    casual: 'අනියම් නිවාඩු',
    short: 'කෙටි නිවාඩු',
    morningShift: 'පෙරවරු',
    eveningShift: 'පස්වරු',
    oneDayLabel: 'සම්පූර්ණ දිනය',
    halfDayLabel: 'අර්ධ දිනය', 
    reasonUrgent: 'පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.',
    reasonChild: 'දරුවෙකුගේ අධ්‍යාපනික හෝ සෞඛ්‍යමය කටයුත්තක් වෙනුවෙන් පෙනී සිටීමට.',
    reasonFamily: 'පවුලේ සමීපතම මංගල්‍ය හෝ විශේෂ උත්සව අවස්ථාවකට සහභාගී වීම සඳහා.',
    reasonBank: 'අත්‍යවශ්‍ය බැංකු හෝ රාජ්‍ය ආයතනයක නිල කටයුත්තක් සපුරා ගැනීමට.',
    lblUrgent: 'පෞද්ගලික හදිසි අවශ්‍යතාවයක්',
    lblChild: 'දරුවෙකුගේ අවශ්‍යතාවයක්',
    lblFamily: 'පවුලේ උත්සව අවස්ථාවක්',
    lblBank: 'බැංකු හෝ නිල කටයුත්තක්',
    signTitle: 'ඩිජිටල් අත්සන තැබීම',
    signDesc: 'පහත දැක්වෙන කොටුව තුළ ඔබගේ නිල අත්සන ඇඟිල්ලෙන් සටහන් කරන්න:',
    clearBtn: 'පැහැදිලි කරන්න',
    submitBtn: 'අයදුම්පත ඉදිරිපත් කරන්න',
    submitting: 'ඉදිරිපත් කරමින්...',
    signWatermark: 'මෙහි අත්සන් කරන්න',
    signAlertTitle: 'අවධානයයි',
    signAlertMsg: 'කරුණාකර ඉදිරියට යෑමට ප්‍රථම ඔබගේ අත්සන සටහන් කරන්න.',
    successTitle: 'සාර්ථකයි!',
    successMsg: 'ඔබගේ නිවාඩු අයදුම්පත සාර්ථකව පද්ධතියට ඇතුළත් කරන ලදී.',
    ok: 'ස්ථිරයි',
    dutyCoverage: 'රාජකාරි ආවරණය',
    dutyCoverageHelp: 'ඔබ නිවාඩු ලබා සිටින කාලයේ රාජකාරි ආවරණය සඳහා ඔබගේ දෙපාර්තමේන්තුවේ නිලධාරියෙකු තෝරන්න.',
    selectCoverageOfficer: 'රාජකාරි ආවරණ නිලධාරියා තෝරන්න',
    noCoverageOfficers: 'මෙම අංශයේ වෙනත් නිලධාරීන් නොමැත.',
    coverageRequired: 'කරුණාකර රාජකාරි ආවරණ නිලධාරියෙකු තෝරන්න.',
    searchPlaceholder: 'නම හෝ තනතුර සොයන්න...',
    noSearchResults: 'ගැලපෙන නිලධාරීන් හමු නොවිණි',
    callOfficer: 'ඇමතුමක් ගන්න',
    phoneMissing: 'තෝරාගත් නිලධාරියාගේ දුරකථන අංකය පද්ධතියේ සටහන් කර නොමැත.',
    form: {
      title: 'නිල නිවාඩු අයදුම්පත්‍රය',
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
    headerTitle: 'Digital Application', reasonPrompt: 'Enter the Reason for Leave:', commonReasonsTitle: 'Common Reasons:', inputPlaceholder: 'Type reason here...', translateBtn: 'Improve with AI', translating: 'Processing with AI...', continueDirectBtn: 'Continue as typed', confirmTitle: 'Verification', translatedLabel: 'Translated Reason:', editBtn: 'Edit text', confirmBtn: 'Confirm Reason', profileLoadError: 'Unable to load user details.', submitError: 'Unable to save the application.', docTitle: 'Official Leave Document', statusVal: 'Pending Approval', signRouteBtn: 'Proceed to Digital Signature', back: 'Back', emptyAlert: 'Please enter a reason.', casual: 'Casual Leave', short: 'Short Leave', morningShift: 'Morning', eveningShift: 'Evening', oneDayLabel: 'Full Day', halfDayLabel: 'Half Day', reasonUrgent: 'Urgent personal matter.', reasonChild: 'Child medical/educational need.', reasonFamily: 'Family function.', reasonBank: 'Bank transaction.', lblUrgent: 'Urgent Personal Matter', lblChild: 'Child-related Need', lblFamily: 'Family Event', lblBank: 'Bank or Official Matter', signTitle: 'Digital Signature', signDesc: 'Please draw your digital signature:', clearBtn: 'Clear', submitBtn: 'Submit', submitting: 'Submitting...', signWatermark: 'Sign Here', signAlertTitle: 'Attention', signAlertMsg: 'Please sign before submitting.', successTitle: 'Success!', successMsg: 'Submitted successfully.', ok: 'OK', dutyCoverage: 'Duty Coverage', dutyCoverageHelp: 'Select an officer from your department to cover your duties while you are on leave.', selectCoverageOfficer: 'Select Duty Coverage Officer', noCoverageOfficers: 'No other officers in your department.', coverageRequired: 'Please select a duty coverage officer.', searchPlaceholder: 'Search officer...', noSearchResults: 'No matching officers found', callOfficer: 'Call Officer', phoneMissing: 'The selected officer does not have a saved phone number.',
    form: {
      title: 'Official Leave Application',
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
    headerTitle: 'டிஜிட்டல் படிவம்', reasonPrompt: 'விடுப்புக்கான காரணத்தை உள்ளிடவும்:', commonReasonsTitle: 'பொதுவான காரணங்கள்:', inputPlaceholder: 'காரணத்தை இங்கே தட்டச்சு செய்யவும்...', translateBtn: 'AI மூலம் மேம்படுத்தவும்', translating: 'AI செயலாக்குகிறது...', continueDirectBtn: 'உள்ளிட்டபடி தொடரவும்', confirmTitle: 'உறுதிப்படுத்தல்', translatedLabel: 'மொழிபெயர்க்கப்பட்ட காரணம்:', editBtn: 'திருத்து', confirmBtn: 'சரி', profileLoadError: 'பயனர் விவரங்களை ஏற்ற முடியவில்லை.', submitError: 'விண்ணப்பத்தை சேமிக்க முடியவில்லை.', docTitle: 'விடுப்பு விண்ணப்பம்', statusVal: 'காத்திருக்கிறது', signRouteBtn: 'கையொப்பத்திற்குச் செல்லவும்', back: 'பின்னே', emptyAlert: 'காரணத்தை உள்ளிடவும்.', casual: 'தற்செயல்', short: 'குறு விடுமுறை', morningShift: 'காலை', eveningShift: 'மதியம்', oneDayLabel: 'முழு நாள்', halfDayLabel: 'அரை நாள்', reasonUrgent: 'அவசர வேலை.', reasonChild: 'பிள்ளையின் தேவை.', reasonFamily: 'குடும்ப நிகழ்வு.', reasonBank: 'வங்கி வேலை.', lblUrgent: 'அவசர தனிப்பட்ட தேவை', lblChild: 'குழந்தை தொடர்பான தேவை', lblFamily: 'குடும்ப நிகழ்வு', lblBank: 'வங்கி அல்லது அலுவல் தேவை', signTitle: 'கையொப்பம்', signDesc: 'கையொப்பத்தை வரையவும்:', clearBtn: 'அழி', submitBtn: 'சமர்ப்பிக்கவும்', submitting: 'சமர்ப்பிக்கப்படுகிறது...', signWatermark: 'இங்கே கையொப்பமிடுங்கள்', signAlertTitle: 'கவனம்', signAlertMsg: 'கையொப்பமிடவும்.', successTitle: 'வெற்றி!', successMsg: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது.', ok: 'சரி', dutyCoverage: 'பணி பொறுப்பு', dutyCoverageHelp: 'நீங்கள் விடுப்பில் இருக்கும் போது உங்கள் பணிகளை கவனிக்க உங்கள் துறையிலிருந்து ஒரு அலுவலரைத் தேர்ந்தெடுக்கவும்.', selectCoverageOfficer: 'பணி பொறுப்பு அலுவலரைத் தேர்ந்தெடுக்கவும்', noCoverageOfficers: 'உங்கள் துறையில் வேறு அலுவலர்கள் இல்லை.', coverageRequired: 'பணி பொறுப்பு அலுவலரைத் தேர்ந்தெடுக்கவும்.', searchPlaceholder: 'அலுவலரைத் தேடுக...', noSearchResults: 'பொருத்தமான அலுவலர்கள் காணப்படவில்லை', callOfficer: 'அழைக்கவும்', phoneMissing: 'தேர்ந்தெடுக்கப்பட்ட அலுவலரின் தொலைபேசி எண் இல்லை.',
    form: {
      title: 'அதிகாரபூர்வ விடுப்பு விண்ணப்பம்',
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
  }
};

interface UserProfileData {
  id: string;
  name: string;
  designation: string;
  department: string;
  departmentId: number | null;
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

const Text = ({ style, ...props }: TextProps) => {
  const { font } = useFont();
  const flattened = StyleSheet.flatten(style) || {};
  const dynamic: any = { ...flattened };
  if (typeof flattened.fontSize === 'number') dynamic.fontSize = font(flattened.fontSize);
  if (typeof flattened.lineHeight === 'number') dynamic.lineHeight = font(flattened.lineHeight);
  return <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} style={dynamic} />;
};

export default function DigitalFormScreen({ selectedLang = 'si', onNavigate, onBack, t: parentT, route }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const compactFont = fontScale > 1.15 || isSmallScreen;

  const safeLang: Language = selectedLang === 'si' || selectedLang === 'en' || selectedLang === 'ta' ? selectedLang : 'si';

  const t = useMemo(() => {
    const base = L[safeLang] || L.si;
    return { ...base, ...parentT };
  }, [safeLang, parentT]);

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
  
  // 🔥 Scrolling State for PanResponder
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [officerProfile, setOfficerProfile] = useState<UserProfileData>({
    id: '', name: '', designation: '', department: '', departmentId: null, joinedDate: '-'
  });
  
  const [coverageOfficers, setCoverageOfficers] = useState<CoverageOfficer[]>([]);
  const [selectedCoverageOfficer, setSelectedCoverageOfficer] = useState<CoverageOfficer | null>(null);

  const [completedPaths, setCompletedPaths] = useState<string[]>([]);
  const [livePath, setLivePath] = useState<string>('');
  const pathsRef = useRef<string[]>([]);
  const liveStringRef = useRef<string>('');
  
  // 🔥 Added new Ref to track the last point coordinate (Fixes corner tap glitch)
  const lastPointRef = useRef<{x: number, y: number} | null>(null);
  
  const submittingRef = useRef(false);

  const [leaveHistoryData, setLeaveHistoryData] = useState({ lastLeaveDate: t.form.none, totalLeavesThisYear: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const responsive = useMemo(() => ({
    titleSize: compactFont ? 20 : 24,
    labelSize: compactFont ? 14 : 16,
    bodySize: compactFont ? 13 : 15,
    valueSize: compactFont ? 14 : 16,
    cardPadding: compactFont ? 15 : 20,
    buttonPadding: compactFont ? 14 : 16,
    inputMinHeight: compactFont ? 104 : 92,
  }), [compactFont]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const fetchCoverageOfficers = async (deptId: number, currentUserId: string, sDate: string, eDate: string) => {
    setIsCoverageLoading(true);
    try {
      const { data: overlappingLeaves } = await supabase
        .from('leave_requests')
        .select('user_id, coverage_officer_id')
        .in('status', ['Pending', 'Approved', 'Admin Approved'])
        .lte('start_date', eDate)
        .gte('end_date', sDate);

      const onLeaveIds = new Set<string>();
      const coveringIds = new Set<string>();

      if (overlappingLeaves) {
        overlappingLeaves.forEach((req: any) => {
          if (req.user_id) onLeaveIds.add(req.user_id);
          if (req.coverage_officer_id) coveringIds.add(req.coverage_officer_id);
        });
      }

      const { data: deptUsers, error: covError } = await supabase
        .from('users')
        .select(`id, title, full_name, full_name_si, full_name_ta, phone, designations(designation_en, designation_si, designation_ta)`)
        .eq('department_id', deptId)
        .eq('is_active', true)
        .neq('id', currentUserId)
        .order('full_name', { ascending: true });

      if (covError) return;

      if (deptUsers) {
        const getLocalizedValue = (en?: string | null, si?: string | null, ta?: string | null) => {
          if (safeLang === 'si') return si || en || '';
          if (safeLang === 'ta') return ta || en || '';
          return en || '';
        };

        setCoverageOfficers(deptUsers.map((item: any) => {
          const offDesig = Array.isArray(item.designations) ? item.designations[0] : item.designations;
          let offTitle = '';
          if (item.title && typeof item.title === 'string' && item.title.trim() !== '' && item.title !== 'null' && item.title !== 'N/A') {
            const tText = item.title.trim();
            offTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
          }
          const offBaseName = getLocalizedValue(item.full_name, item.full_name_si, item.full_name_ta);

          const isCurrentlyOnLeave = onLeaveIds.has(item.id);
          const isCovering = coveringIds.has(item.id);
          const isAvailable = !isCurrentlyOnLeave && !isCovering;
          
          let unavailReason = '';
          if (isCurrentlyOnLeave) {
              unavailReason = safeLang === 'si' ? 'මෙම දිනවල නිවාඩු ලබා ඇත' : safeLang === 'ta' ? 'இந்த நாட்களில் விடுப்பில் உள்ளார்' : 'On leave during these dates';
          } else if (isCovering) {
              unavailReason = safeLang === 'si' ? 'වෙනත් රාජකාරි ආවරණයක යෙදී සිටී' : safeLang === 'ta' ? 'வேறொரு பணியில் ஈடுபட்டுள்ளார்' : 'Covering another duty';
          }

          return {
            id: item.id,
            name: `${offTitle}${offBaseName}`,
            designation: getLocalizedValue(offDesig?.designation_en, offDesig?.designation_si, offDesig?.designation_ta),
            phone: item.phone || null,
            isAvailable,
            unavailReason
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

    const { data, error } = await supabase
      .from('leave_requests')
      .select('start_date, no_of_days')
      .eq('user_id', userId)
      .eq('leave_type_id', leaveTypeId)
      .in('status', ['Approved', 'Admin Approved'])
      .gte('start_date', startOfYear)
      .lte('start_date', endOfYear)
      .order('start_date', { ascending: false });

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
    const loadLoggedInUser = async () => {
      try {
        setIsProfileLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user found.');

        const { data, error } = await supabase
          .from('users')
          .select(`
            id, title, full_name, full_name_si, full_name_ta, department_id, joined_date, created_at,
            departments ( department_name, department_name_si, department_name_ta ),
            designations ( designation_en, designation_si, designation_ta )
          `)
          .eq('auth_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('User profile was not found.');

        const getLocalizedValue = (en?: string | null, si?: string | null, ta?: string | null) => {
          if (safeLang === 'si') return si || en || '';
          if (safeLang === 'ta') return ta || en || '';
          return en || '';
        };

        const departmentObj = Array.isArray(data.departments) ? data.departments[0] : (data.departments || {});
        const uDesig = Array.isArray(data.designations) ? data.designations[0] : (data.designations || {});

        let formattedTitle = '';
        if (data.title && typeof data.title === 'string' && data.title.trim() !== '' && data.title !== 'null' && data.title !== 'N/A') {
          const tText = String(data.title).trim();
          formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
        }
        const baseName = getLocalizedValue(data.full_name, data.full_name_si, data.full_name_ta);
        const finalName = `${formattedTitle}${baseName}`;

        if (mounted) {
          setOfficerProfile({
            id: data.id,
            name: finalName,
            designation: getLocalizedValue(uDesig?.designation_en, uDesig?.designation_si, uDesig?.designation_ta),
            department: getLocalizedValue(departmentObj?.department_name, departmentObj?.department_name_si, departmentObj?.department_name_ta),
            departmentId: data.department_id || null,
            joinedDate: data.joined_date ? formatToYMD(data.joined_date) : '-', 
          });

          if (data.department_id) {
            // NOTE: We need leaveDetails to be defined here, but since it's dependent on route params, we'll fetch using today's date temporarily
            const tempStart = new Date().toISOString().split('T')[0];
            await fetchCoverageOfficers(data.department_id, data.id, tempStart, tempStart);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        if (mounted) Alert.alert('', t.profileLoadError);
      } finally {
        if (mounted) setIsProfileLoading(false);
      }
    };

    loadLoggedInUser();
    return () => { mounted = false; };
  }, [safeLang]);

  const filteredOfficers = useMemo(() => {
    if (!searchQuery.trim()) return coverageOfficers;
    const lower = searchQuery.toLowerCase();
    return coverageOfficers.filter(o => o.name.toLowerCase().includes(lower) || o.designation.toLowerCase().includes(lower));
  }, [searchQuery, coverageOfficers]);

 // 🔥 100% Smooth & Fast Signature Logic
  const signatureResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (event) => {
      setScrollEnabled(false);
      const { locationX, locationY } = event.nativeEvent;
      
      // Stop corner glitch
      if (locationX <= 5 && locationY <= 5) return; 
      
      lastPointRef.current = { x: locationX, y: locationY };
      liveStringRef.current = `M ${locationX} ${locationY}`;
      setLivePath(liveStringRef.current);
    },
    onPanResponderMove: (event) => {
      if (!liveStringRef.current) return;
      const { locationX, locationY } = event.nativeEvent;
      
      if (locationX <= 5 && locationY <= 5) return;

      // 🔥 මෙන්න මේ සීමාව 60 ඉඳන් 150 ට වැඩි කළා. දැන් හයියෙන් අඳින්න පුළුවන්!
      if (lastPointRef.current) {
        const dx = Math.abs(locationX - lastPointRef.current.x);
        const dy = Math.abs(locationY - lastPointRef.current.y);
        if (dx > 150 || dy > 150) return; 
      }

      lastPointRef.current = { x: locationX, y: locationY };
      liveStringRef.current += ` L ${locationX} ${locationY}`;
      setLivePath(liveStringRef.current);
    },
    onPanResponderRelease: () => {
      setScrollEnabled(true);
      lastPointRef.current = null;
      if (liveStringRef.current.trim().length > 0) {
        pathsRef.current.push(liveStringRef.current);
        setCompletedPaths([...pathsRef.current]);
      }
      liveStringRef.current = '';
      setLivePath('');
    },
    onPanResponderTerminate: () => {
      setScrollEnabled(true);
      lastPointRef.current = null;
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
    const rawParams = route?.params?.params || route?.params || route || {};
    const typeParam = String(rawParams.type || rawParams.leaveType || '').toLowerCase();
    
    const isShortLeave = typeParam === 'short' || rawParams.dayType === 'short';
    const isHalfDay = rawParams.dayType === 'half';

    let leaveTypeStr = t.casual; 
    if (isShortLeave) leaveTypeStr = t.short;

    const todayObj = new Date();
    const todayFormatted = todayObj.toISOString().split('T')[0];
    
    let rawDateStr = rawParams.chosenCustomDateIso || rawParams.chosenCustomDate || rawParams.date || rawParams.selectedDate || rawParams.leaveDate;
    if (!rawDateStr) {
      if (rawParams.dateOption === 'tomorrow') {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        rawDateStr = tmrw.toISOString().split('T')[0];
      } else {
        rawDateStr = todayFormatted; 
      }
    }
    const finalTargetDate = formatToYMD(rawDateStr);

    let durationStr = t.oneDayLabel || 'දින 1'; 
    if (isShortLeave) {
      const hr = rawParams.shortHour !== undefined ? rawParams.shortHour : 0;
      const min = rawParams.shortMin !== undefined ? rawParams.shortMin : 0;
      durationStr = `පැය ${hr} විනාඩි ${min}`;
    } else if (isHalfDay) {
      const shiftStr = rawParams.shift === 'morning' ? t.morningShift : rawParams.shift === 'evening' ? t.eveningShift : '';
      durationStr = `${t.halfDayLabel} (${shiftStr})`;
    }

    let timeRangeStr = '';
    if (isShortLeave) {
      const defaultStart = rawParams.shift === 'morning' ? 'පෙ.ව. 08:30' : 'ප.ව. 01:30';
      const defaultEnd = rawParams.shift === 'morning' ? 'පෙ.ව. 10:00' : 'ප.ව. 03:00';
      const sTime = rawParams.startTime || defaultStart;
      const eTime = rawParams.endTime || defaultEnd;
      timeRangeStr = `${sTime} සිට ${eTime} දක්වා`;
    }

    let noOfDays = 1;
    if (isShortLeave) {
      const totalMinutes = Number(rawParams.shortHour || 0) * 60 + Number(rawParams.shortMin || 0);
      noOfDays = totalMinutes > 0 ? totalMinutes / (8 * 60) : 0.25;
    } else if (isHalfDay) {
      noOfDays = 0.5;
    } else if (rawParams.noOfDays) {
      noOfDays = Number(rawParams.noOfDays) || 1;
    }

    const endDateObj = new Date(finalTargetDate);
    if (!Number.isNaN(endDateObj.getTime()) && noOfDays > 1) {
      endDateObj.setDate(endDateObj.getDate() + Math.ceil(noOfDays) - 1);
    }
    const finalEndDate = Number.isNaN(endDateObj.getTime()) ? finalTargetDate : endDateObj.toISOString().split('T')[0];

    const returningDate = addDays(finalEndDate, 1); 

    return { 
      applyDate: todayFormatted, 
      leaveDateInfo: finalTargetDate,
      startDate: finalTargetDate,
      endDate: finalEndDate,
      returningDate: returningDate, 
      duration: durationStr, 
      leaveTypeString: leaveTypeStr,
      leaveTypeKey: isShortLeave ? 'short' : isHalfDay ? 'half' : 'casual',
      noOfDays,
      isShortLeave,
      isHalfDay,
      timeRangeStr
    };
  }, [route, t, safeLang]);

  const handleShowPreview = async () => {
    if (pathsRef.current.length === 0) { Alert.alert(t.signAlertTitle, t.signAlertMsg); return; }
    if (!officerProfile.id) { Alert.alert('', t.profileLoadError); return; }

    setIsSubmitting(true);
    try {
      const leaveTypeNameMap: Record<string, string> = { casual: 'Casual Leave', half: 'Half Day', short: 'Short Leave' };
      const requestedLeaveTypeName = leaveTypeNameMap[leaveDetails.leaveTypeKey] || 'Casual Leave';
      
      const { data: leaveTypeRow } = await supabase.from('leave_types').select('id').eq('name_en', requestedLeaveTypeName).single();
      
      if (leaveTypeRow) {
        await fetchLeaveHistory(officerProfile.id, leaveTypeRow.id);
      }

      setShowPreviewModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeFinalSubmission = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    
    try {
      setIsSubmitting(true);
      if (!leaveDetails.startDate || !leaveDetails.endDate) throw new Error('Invalid leave date.');

      const leaveTypeNameMap: Record<string, string> = { casual: 'Casual Leave', half: 'Half Day', short: 'Short Leave' };
      const requestedLeaveTypeName = leaveTypeNameMap[leaveDetails.leaveTypeKey] || 'Casual Leave';

      const { data: leaveTypeRow, error: leaveTypeError } = await supabase.from('leave_types').select('id, name_en').eq('name_en', requestedLeaveTypeName).single();
      if (leaveTypeError || !leaveTypeRow) throw new Error('Leave type was not found.');

      const { data: leaveRequest, error: requestError } = await supabase.from('leave_requests').insert({
          user_id: officerProfile.id,
          leave_type_id: leaveTypeRow.id,
          start_date: leaveDetails.startDate,
          end_date: leaveDetails.endDate,
          no_of_days: leaveDetails.noOfDays,
          reason: translatedReason.trim(),
          reason_si: reasonSi || (safeLang === 'si' ? translatedReason.trim() : null),
          reason_en: reasonEn || (safeLang === 'en' ? translatedReason.trim() : null),
          reason_ta: reasonTa || (safeLang === 'ta' ? translatedReason.trim() : null),
          status: 'Pending',
          approval_stage: 'admin_review',
          coverage_officer_id: selectedCoverageOfficer?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      }).select('id').single();

      if (requestError || !leaveRequest) throw new Error('Leave request was not created.');

      const formDetails = {
        officer: { user_id: officerProfile.id, name: officerProfile.name, designation: officerProfile.designation, department: officerProfile.department },
        leave: { type: leaveDetails.leaveTypeString, type_key: leaveDetails.leaveTypeKey, start_date: leaveDetails.startDate, end_date: leaveDetails.endDate, no_of_days: leaveDetails.noOfDays, duration: leaveDetails.duration, time_range: leaveDetails.timeRangeStr || null, reason: translatedReason.trim(), applied_date: leaveDetails.applyDate },
        duty_coverage: selectedCoverageOfficer ? { officer_id: selectedCoverageOfficer.id, officer_name: selectedCoverageOfficer.name, designation: selectedCoverageOfficer.designation } : null,
        status: 'Pending', language: safeLang,
      };

      const digitalSignature = JSON.stringify({ paths: pathsRef.current, strokeColor: '#7A1020', strokeWidth: 4.5 });

      const { error: formError } = await supabase.from('leave_forms').insert({ leave_request_id: leaveRequest.id, form_details: JSON.stringify(formDetails), digital_signature: digitalSignature, submitted_at: new Date().toISOString() });

      if (formError) {
        await supabase.from('leave_requests').delete().eq('id', leaveRequest.id);
        throw formError;
      }

      const appSentTitleSi = 'නිවාඩු අයදුම්පත යවන ලදී';
      const appSentTitleTa = 'விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது';
      const appSentTitleEn = 'Leave Request Sent';

      const appSentMsgSi = `${leaveDetails.leaveDateInfo} සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.`;
      const appSentMsgTa = `${leaveDetails.leaveDateInfo} தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.`;
      const appSentMsgEn = `Your leave request for ${leaveDetails.leaveDateInfo} was sent successfully.`;

      const appSentTitle = safeLang === 'si' ? appSentTitleSi : safeLang === 'ta' ? appSentTitleTa : appSentTitleEn;
      const appSentMsg = safeLang === 'si' ? appSentMsgSi : safeLang === 'ta' ? appSentMsgTa : appSentMsgEn;

      const { data: userNotif } = await supabase.from('notifications').insert({ 
        user_id: officerProfile.id, 
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
        created_by: officerProfile.id,
        notification_type: 'leave', 
        related_entity: 'leave_requests', 
        related_id: Number(leaveRequest.id), 
        is_for_mobile: true,
        created_at: new Date().toISOString() 
      }).select('id').single();

      await showLeaveNotification({ 
        title: appSentTitle, 
        body: appSentMsg, 
        requestId: leaveRequest.id, 
        notificationId: userNotif?.id 
      });

      setShowPreviewModal(false); 
      Alert.alert(t.successTitle, t.successMsg, [{ text: t.ok, onPress: () => { onNavigate('LeaveBalance', { pendingRequest: { id: leaveRequest.id, date: leaveDetails.leaveDateInfo, type: leaveDetails.leaveTypeKey, status: 'pending' } }); } }]);
    } catch (error: any) {
      Alert.alert('', error?.message ? `${t.submitError}\n${error.message}` : t.submitError);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const callSelectedOfficer = async () => {
    if (!selectedCoverageOfficer?.phone) { Alert.alert('', t.phoneMissing); return; }
    await Linking.openURL(`tel:${selectedCoverageOfficer.phone}`);
  };

  const handleTranslateLogic = async () => {
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
      }, 1500);

    } catch (error: any) {
      setTranslatedReason(reason);
      setIsQuickSelected(false);
      setStep(2);
      setIsTranslating(false);
    }
  };

  const handleBack = () => {
    if (step === 2) { if (isQuickSelected) setRawReason(''); setStep(1); }
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
    else if (onBack) onBack();
    else onNavigate('LeaveBalance');
  };

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
        <Text style={[styles.hTitle, { fontSize: responsive.titleSize }]}>{step === 4 ? t.signTitle : t.headerTitle}</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView scrollEnabled={scrollEnabled} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {step === 1 && (
            <View style={{ gap: 16 }}>
              <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
                <Text style={[styles.inputLabelHeader, { fontSize: responsive.labelSize }]}>{t.reasonPrompt}</Text>
                <TextInput allowFontScaling={false} maxFontSizeMultiplier={1} style={[styles.reasonInputField, { fontSize: responsive.bodySize, minHeight: responsive.inputMinHeight }]} multiline numberOfLines={4} value={rawReason} onChangeText={setRawReason} placeholder={t.inputPlaceholder} placeholderTextColor="#94A3B8" textAlignVertical="top" />
                <TouchableOpacity style={[styles.primaryActionBtn, isTranslating && styles.disabledButton]} onPress={handleTranslateLogic} disabled={isTranslating}>
                  {isTranslating ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles-outline" size={18} color="#FFF" />}
                  <Text style={[styles.primaryActionBtnText, { fontSize: responsive.bodySize }]}>{isTranslating ? t.translating : t.translateBtn}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.directContinueBtn} onPress={() => { 
                  if (!rawReason.trim()) { Alert.alert('', t.emptyAlert); return; } 
                  setTranslatedReason(rawReason); 
                  setReasonSi(null); setReasonEn(null); setReasonTa(null);
                  setIsQuickSelected(false); setStep(2); 
                }} disabled={isTranslating}>
                  <Ionicons name="document-text-outline" size={18} color="#7A1020" />
                  <Text style={[styles.directContinueBtnText, { fontSize: responsive.bodySize }]}>{t.continueDirectBtn}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.quickSelectContainer, { padding: responsive.cardPadding }]}>
                <Text style={styles.quickSelectHeaderLabel}>{t.commonReasonsTitle}</Text>
                
                <TouchableOpacity style={styles.reasonPillItem} onPress={() => { 
                  setRawReason(PREDEFINED_REASONS.urgent[safeLang]); 
                  setTranslatedReason(PREDEFINED_REASONS.urgent[safeLang]); 
                  setReasonSi(PREDEFINED_REASONS.urgent.si); setReasonEn(PREDEFINED_REASONS.urgent.en); setReasonTa(PREDEFINED_REASONS.urgent.ta);
                  setIsQuickSelected(true); setStep(2); 
                }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#B45309" /><Text style={styles.reasonPillText}>{t.lblUrgent}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reasonPillItem} onPress={() => { 
                  setRawReason(PREDEFINED_REASONS.child[safeLang]); 
                  setTranslatedReason(PREDEFINED_REASONS.child[safeLang]); 
                  setReasonSi(PREDEFINED_REASONS.child.si); setReasonEn(PREDEFINED_REASONS.child.en); setReasonTa(PREDEFINED_REASONS.child.ta);
                  setIsQuickSelected(true); setStep(2); 
                }}>
                  <Ionicons name="school-outline" size={16} color="#0284C7" /><Text style={styles.reasonPillText}>{t.lblChild}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reasonPillItem} onPress={() => { 
                  setRawReason(PREDEFINED_REASONS.family[safeLang]); 
                  setTranslatedReason(PREDEFINED_REASONS.family[safeLang]); 
                  setReasonSi(PREDEFINED_REASONS.family.si); setReasonEn(PREDEFINED_REASONS.family.en); setReasonTa(PREDEFINED_REASONS.family.ta);
                  setIsQuickSelected(true); setStep(2); 
                }}>
                  <Ionicons name="people-outline" size={16} color="#059669" /><Text style={styles.reasonPillText}>{t.lblFamily}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reasonPillItem} onPress={() => { 
                  setRawReason(PREDEFINED_REASONS.bank[safeLang]); 
                  setTranslatedReason(PREDEFINED_REASONS.bank[safeLang]); 
                  setReasonSi(PREDEFINED_REASONS.bank.si); setReasonEn(PREDEFINED_REASONS.bank.en); setReasonTa(PREDEFINED_REASONS.bank.ta);
                  setIsQuickSelected(true); setStep(2); 
                }}>
                  <Ionicons name="card-outline" size={16} color="#4B5563" /><Text style={styles.reasonPillText}>{t.lblBank}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              <View style={styles.alertHeaderBadgeRow}><Ionicons name="checkbox" size={20} color="#B45309" /><Text style={styles.alertHeaderTitle}>{t.confirmTitle}</Text></View>
              <Text style={styles.formSectionSubLabel}>{t.translatedLabel}</Text>
             <TextInput allowFontScaling={false} maxFontSizeMultiplier={1} style={[styles.reasonInputField, styles.editableTranslationField, { fontSize: responsive.bodySize, minHeight: 130 }]} multiline value={translatedReason} onChangeText={setTranslatedReason} textAlignVertical="top" />
              
              <View style={styles.splitBtnRow}>
                <TouchableOpacity style={[styles.secondarySplitBtn, { flex: 1 }]} onPress={() => { setRawReason(translatedReason); setStep(1); }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="create-outline" size={16} color="#4A5568" style={{ marginRight: 5 }} /><Text style={styles.secondarySplitBtnText} numberOfLines={2}>{t.editBtn}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryActionBtn, styles.flexPrimaryBtn, { marginTop: 0 }]} onPress={() => setStep(3)}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" /><Text style={styles.primaryActionBtnText} numberOfLines={2}>{t.confirmBtn}</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}

          {step === 3 && (
            <View style={[styles.cardFrame, { padding: responsive.cardPadding }]}>
              <View style={styles.alertHeaderBadgeRow}><Ionicons name="people-circle" size={24} color="#7A1020" /><Text style={[styles.alertHeaderTitle, { color: '#7A1020', fontSize: 18 }]}>{t.dutyCoverage}</Text></View>
              <Text style={styles.helperDescription}>{t.dutyCoverageHelp}</Text>

              <TouchableOpacity style={styles.officerSelector} onPress={() => { setSearchQuery(''); setShowOfficerModal(true); }}>
                <View style={styles.officerIcon}><Ionicons name="person-outline" size={21} color="#7A1020" /></View>
                <View style={{ flex: 1 }}><Text style={styles.officerName}>{selectedCoverageOfficer?.name || t.selectCoverageOfficer}</Text>{!!selectedCoverageOfficer && <Text style={styles.officerDesignation}>{selectedCoverageOfficer.designation}</Text>}</View>
                <Ionicons name="chevron-down" size={20} color="#7A1020" />
              </TouchableOpacity>

              {!!selectedCoverageOfficer && (
                <TouchableOpacity style={styles.callButton} onPress={callSelectedOfficer}>
                  <Ionicons name="call-outline" size={18} color="#FFFFFF" /><Text style={styles.callButtonText}>{t.callOfficer}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.primaryActionBtn, !selectedCoverageOfficer && styles.disabledButton, { marginTop: 24, width: '100%' }]} disabled={!selectedCoverageOfficer} onPress={() => setStep(4)}>
                <Text style={styles.primaryActionBtnText}>{safeLang === 'si' ? 'ඉදිරියට යන්න' : 'Continue'}</Text><Ionicons name="arrow-forward-circle-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
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
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

<Modal visible={showOfficerModal} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowOfficerModal(false)}>       
   <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.selectCoverageOfficer}</Text>
                <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => setShowOfficerModal(false)}>
                    <Ionicons name="close" size={26} color="#7A1020" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput allowFontScaling={false} maxFontSizeMultiplier={1} style={styles.searchInput} placeholder={t.searchPlaceholder} placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
                {!filteredOfficers.length ? (
                  <Text style={styles.noOfficerText}>
                    {searchQuery ? t.noSearchResults : t.noCoverageOfficers}
                  </Text>
                ) : (
                  filteredOfficers.map((officer) => {
                    const isSelected = selectedCoverageOfficer?.id === officer.id;
                    return (
                      <TouchableOpacity key={officer.id} style={[styles.officerRow, isSelected && styles.officerRowSelected, !officer.isAvailable && { opacity: 0.5 }]} disabled={!officer.isAvailable} onPress={() => { setSelectedCoverageOfficer(officer); setShowOfficerModal(false); }}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>{officer.name?.charAt(0)?.toUpperCase()}</Text></View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.officerNameText}>{officer.name}</Text>
                          <Text style={styles.officerDesignationText}>{officer.designation}</Text>
                          {!officer.isAvailable && (<Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700', marginTop: 3 }}>{officer.unavailReason}</Text>)}
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={23} color="#16803D" />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>   
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

<Modal visible={showPreviewModal} animationType="slide" transparent={false} statusBarTranslucent onRequestClose={() => setShowPreviewModal(false)}>        <View style={styles.previewRoot}>
          <View style={styles.header}>
            <View style={styles.hCircle1} pointerEvents="none" />
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtnPill} onPress={() => setShowPreviewModal(false)} activeOpacity={0.75}>
                <Ionicons name="chevron-back" size={16} color="#FFD54F" />
                <Text style={styles.backText}>{t.back}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.hTitle, { fontSize: responsive.titleSize }]}>{safeLang === 'si' ? 'අයදුම්පතේ පෙරදසුන' : safeLang === 'ta' ? 'விண்ணப்ப முன்னோட்டம்' : 'Application Preview'}</Text>
          </View>
          
          <ScrollView style={styles.previewScroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <View style={styles.a4Paper}>
              <View style={styles.a4HeaderBox}>
                 <Image source={require('../../../assets/images/ui/logo.png')} style={styles.a4LogoImg} />
                 <Text style={styles.a4MainTitle}>{t.form.title}</Text>
                 <Image source={require('../../../assets/images/ui/srilankalogo.png')} style={styles.a4LogoImg} />
              </View>
<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f1}</Text>
  <Text style={styles.a4Value}>: {officerProfile.name}</Text>
</View>

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f2}</Text>
  <Text style={styles.a4Value}>: {officerProfile.department || '-'}</Text>
</View>

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f3}</Text>
  <Text style={styles.a4Value}>: {officerProfile.designation}</Text>
</View>

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f4}</Text>
  <Text style={styles.a4Value}>: {leaveDetails.leaveTypeString}</Text>
</View>

{!leaveDetails.isShortLeave && (
  <View style={styles.a4Row}>
    <Text style={styles.a4Label}>{t.form.f5}</Text>
    <Text style={styles.a4Value}>: {leaveDetails.duration}</Text>
  </View>
)}
<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f6}</Text>
  <Text style={styles.a4Value}>: {leaveDetails.startDate}</Text>
</View>

{!leaveDetails.isShortLeave && (
  <View style={styles.a4Row}>
    <Text style={styles.a4Label}>{t.form.f7}</Text>
    <Text style={styles.a4Value}>: {leaveDetails.returningDate}</Text>
  </View>
)}

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f8}</Text>
  <Text style={styles.a4Value}>: {translatedReason}</Text>
</View>

{!leaveDetails.isShortLeave && (
  <View style={styles.a4Row}>
    <Text style={styles.a4Label}>{t.form.f9}</Text>
    <Text style={styles.a4Value}>
      : {t.form.days} {leaveHistoryData.totalLeavesThisYear}
    </Text>
  </View>
)}

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f10}</Text>
  <Text style={styles.a4Value}>
    : {selectedCoverageOfficer
      ? selectedCoverageOfficer.name
      : t.form.notApp}
  </Text>
</View>

<View style={styles.a4Row}>
  <Text style={styles.a4Label}>{t.form.f11}</Text>
  <Text style={styles.a4Value}>: {officerProfile.joinedDate}</Text>
</View>

{!leaveDetails.isShortLeave && (
  <View style={styles.a4Row}>
    <Text style={styles.a4Label}>{t.form.f12}</Text>
    <Text style={styles.a4Value}>
      : {leaveHistoryData.lastLeaveDate}
    </Text>
  </View>
)}  
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
  reasonInputField: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 14, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, fontSize: 15, lineHeight: 26, color: '#334155', textAlignVertical: 'top', minHeight: 120, fontWeight: '500', includeFontPadding: true },
  editableTranslationField: { borderColor: '#B45309', backgroundColor: '#FFFBEB', color: '#78350F', lineHeight: 28, minHeight: 130, includeFontPadding: true },
  flexPrimaryBtn: { flex: 1.2, minHeight: 52, marginTop: 0 },
  primaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#B45309', paddingVertical: 16, borderRadius: 14, marginTop: 16 },
  primaryActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15, flexShrink: 1, textAlign: 'center' },
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
  secondarySplitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#94A3B8', paddingVertical: 16, borderRadius: 14, backgroundColor: '#F8FAFC' },
  secondarySplitBtnText: { color: '#4A5568', fontWeight: '800', fontSize: 15, textAlign: 'center', flexShrink: 1 },
  
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