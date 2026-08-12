// app/screens/LeaveBalanceScreen.tsx — Premium Senior-Friendly Automated Production Edition
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useFont } from '../FontContext';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextProps,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Language = 'si' | 'en' | 'ta';

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

interface Props {
  selectedLang: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
  route?: {
    params?: {
      pendingRequest?: {
        id?: number;
        date: string;
        type: string;
        status: string;
      };
      requestId?: number;
      notificationId?: number;
      openedFromNotification?: boolean;
    };
  };
}

type IconName = keyof typeof Ionicons.glyphMap;

interface LeaveTypeItem {
  id: string;
  label: string;
  color: string;
  bg: string;
  icon: IconName;
  remaining: number;
  total: number;
  subLabel: string;
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

const L = {
  si: {
    title:       'නිවාඩු කළමනාකරණය',
    motto:       '“නිවාඩු යනු වරප්‍රසාදයක් මිස අයිතිවාසිකමක් නොවේ”',
    subtitle:    'නිවාඩු සාරාංශය',
    sectionTitle:'නිවාඩුවක් ලබාගන්න',
    currentHistoryTitle: 'නිවාඩු ඉතිහාසය', 
    pastHistoryTitle: 'පසුගිය වසරවල සාරාංශය', 
    back:        'ආපසු',
    balanceOf:   'ඉතිරි දින ගණන',
    used:        'භාවිත කළ දින',
    days:        'දින',
    selectType:  'නිවාඩු ආකාරය තෝරන්න',
    fullDay:     'සම්පූර්ණ දිනය',
    halfDay:     'අර්ධ දිනය',
    applyBtn:    'නිවාඩු අයදුම් කරන්න',
    remaining:   'ඉතිරිව ඇත',
    selectDate:  'ආරම්භක දිනය තෝරන්න',
    today:       'අද දින',
    futureDate:  'වෙනත් දිනයක්', 
    enterDays:   'දින ගණන තෝරන්න',
    selectShift: 'මුරය (Shift) තෝරන්න',
    morningShift:'පෙරවරු මුරය',
    eveningShift:'පස්වරු මුරය',
    selectHour:  'ආරම්භක පැය තෝරන්න',
    selectMin:   'මිනත්තුව තෝරන්න',
    selectTime:  'වේලාව තෝරන්න (පැය : විනාඩි)',
    durationTxt: 'නිවාඩු කාලය: පැය 1 විනාඩි 30 (කෙටි නිවාඩු)',
    todayIsHolidayWarning: '*අද දින සති අන්තයක් හෝ රජයේ නිවාඩු දිනයක් බැවින් නිවාඩු අයදුම් කළ නොහැක.',
    weekendTxt:  'සති අන්තය',
    holidayTxt:  'රජයේ නිවාඩු',
    close:       'වසා දමන්න',
    casualAbbr:  'වාර්ෂික අනියම් නිවාඩු',
    medicalAbbr: 'වාර්ෂික විවේකී නිවාඩු / අසනීප නිවාඩු',
    yearLabel:   'වර්ෂය',
    months:      ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
    alreadyApplied: 'දැනටමත් ඉල්ලුම් කර ඇත',
    statusApproved: 'අනුමතයි',
    statusRejected: 'ප්‍රතික්ෂේපිතයි',
    statusPending: 'සලකා බලමින්',
    dateLabel: 'දිනය: ',
    noHistory:   'කිසිදු නිවාඩු ඉතිහාසයක් නොමැත',
    noPastHistory: 'පසුගිය වසරවල නිවාඩු දත්ත නොමැත',
    applicationLockedMessage: 'ඔබගේ පෙර නිවාඩු අයදුම්පත සලකා බලමින් පවතී. තීරණයක් ලැබෙන තෙක් නැවත අයදුම් කළ නොහැක.',
    approvedTodayMessage: 'අද දවසේ ඔබ නිවාඩුවක් ලබාගෙන ඇත. නැවත අයදුම් කළ නොහැක.',
    futureLeaveLockedMessage: 'ඉදිරි දිනයක් සඳහා අයදුම් කර ඇත',
    downloadDoc: 'ලේඛනය බාගත කරන්න',
    generating: 'සකසමින්...'
  },
  ta: {
    title:       'விடுமுறை மேலாண்மை',
    motto:       '“விடுப்பு என்பது ஒரு சலுகையே தவிர, உரிமை அல்ல”',
    subtitle:    'விடுமுறை சுருக்கம்',
    sectionTitle:'விடுமுறைக்கு விண்ணப்பம்',
    currentHistoryTitle: 'விடுமுறை வரலாறு', 
    pastHistoryTitle: 'கடந்த ஆண்டுகளின் சுருக்கம்', 
    back:        'பின்னே',
    balanceOf:   'மீதமுள்ள நாட்கள்',
    used:        'பயன்படுத்தியவை',
    days:        'நாட்கள்',
    selectType:  'விடுமுறை வகையைத் தேர்ந்தெடுக்கவும்',
    fullDay:     'முழு நாள்',
    halfDay:     'அரை நாள்',
    applyBtn:    'விடுமுறைக்கு விண்ணப்பம்',
    remaining:   'மீதமுள்ளது',
    selectDate:  'தேதியைத் தேர்ந்தெடுக்கவும்',
    today:       'இன்று',
    futureDate:  'மற்ற தேதி',
    enterDays:   'நாட்களின் எண்ணிக்கையைத் தேர்ந்தெடுக்கவும்',
    selectShift: 'ஷிப்டைத் தேர்ந்தெடுக்கவும்',
    morningShift:'காலை ஷிப்ட்',
    eveningShift:'மதியம் ஷிப்ட்',
    selectHour:  'மணிநேரத்தைத் தேர்ந்தெடு',
    selectMin:   'நிமிடத்தைத் தேர்ந்தெடு',
    selectTime:  'நேரத்தைத் தேர்ந்தெடுக்கவும் (மணி : நிமிடம்)',
    durationTxt: 'கால அளவு: 1 மணிநேரம் 30 நிமிடங்கள்',
    todayIsHolidayWarning: '*இன்று வார இறுதி அல்லது அரசு விடுமுறை என்பதால் விண்ணப்பிக்க முடியாது.',
    weekendTxt:  'வார இறுதி',
    holidayTxt:  'அரசு விடுமுறை',
    close:       'மூடு',
    casualAbbr:  'வருடாந்த தற்செயல் விடுமுறை',
    medicalAbbr: 'வருடாந்த விடுமுறை / நோய்வாய்ப்பட்ட விடுமுறை',
    yearLabel:   'வருடம்',
    months:      ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    alreadyApplied: 'ஏற்கனவே விண்ணப்பிக்கப்பட்டது',
    statusApproved: 'அங்கீகரிக்கப்பட்டது',
    statusRejected: 'நிராகரிக்கப்பட்டது',
    statusPending: 'பரிசீலனையில்',
    dateLabel: 'தேதி: ',
    noHistory:   'எந்த விடுமுறை வரலாறும் இல்லை',
    noPastHistory: 'கடந்த ஆண்டுகளின் விடுமுறை தரவு இல்லை',
    applicationLockedMessage: 'உங்கள் முந்தைய விடுப்பு விண்ணப்பம் பரிசீலனையில் உள்ளது. முடிவு கிடைக்கும் வரை மீண்டும் விண்ணப்பிக்க முடியாது.',
    approvedTodayMessage: 'இன்று உங்களுக்கு அனுமதிக்கப்பட்ட விடுப்பு உள்ளது. மீண்டும் விண்ணப்பிக்க முடியாது.',
    futureLeaveLockedMessage: 'எதிர்கால தேதிக்கு விண்ணப்பிக்கப்பட்டுள்ளது',
    downloadDoc: 'ஆவணத்தைப் பதிவிறக்குக',
    generating: 'தயாரிக்கிறது...'
  },
  en: {
    title:       'Leave Management',
    motto:       '“Leave is a privilege, not a right”',
    subtitle:    'Leave Summary',
    sectionTitle:'Request a Leave',
    currentHistoryTitle: 'Leave History', 
    pastHistoryTitle: 'Past Years Summary', 
    back:        'Back',
    balanceOf:   'Remaining Days',
    used:        'Used Days',
    days:        'days',
    selectType:  'Select Leave Type',
    fullDay:     'Full Day',
    halfDay:     'Half Day',
    applyBtn:    'Apply for Leave',
    remaining:   'remaining',
    selectDate:  'Select Start Date',
    today:       'Today',
    futureDate:  'Other Date',
    enterDays:   'Select Number of Days',
    selectShift: 'Select Shift',
    morningShift:'Morning Shift',
    eveningShift:'Evening Shift',
    selectHour:  'Select Start Hour',
    selectMin:   'Select Minute',
    selectTime:  'Select Time (Hour : Minute)',
    durationTxt: 'Duration: 1 Hour 30 Mins (Short Leave)',
    todayIsHolidayWarning: '*Leave cannot be requested as today is a weekend or public holiday.',
    weekendTxt:  'Weekend',
    holidayTxt:  'Public Holiday',
    close:       'Close',
    casualAbbr:  'Annual Casual Leave',
    medicalAbbr: 'Annual Leave / Sick Leave',
    yearLabel:   'Year',
    months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    alreadyApplied: 'Already Applied',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusPending: 'Pending',
    dateLabel: 'Date: ',
    noHistory:   'No leave history available',
    noPastHistory: 'No past years leave data available',
    applicationLockedMessage: 'Your previous leave request is still being processed. You cannot apply again until a decision is made.',
    approvedTodayMessage: 'You have approved leave for today. You cannot submit another request.',
    futureLeaveLockedMessage: 'Applied for a future date',
    downloadDoc: 'Download Document',
    generating: 'Generating...'
  },
};

const normalizeStatus = (status: string) => String(status || '').trim().toLowerCase();

export default function LeaveBalanceScreen({ selectedLang, onNavigate, onBack, route }: Props) {
  // Real-world date: always use the device/system date.
  const getToday = () => new Date();
  const currentYear = getToday().getFullYear();
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [showApplySection, setShowApplySection] = useState(false); 
  const [showCurrentHistory, setShowCurrentHistory] = useState(false);
  const [showPastHistory, setShowPastHistory] = useState(false); 
  const [dayType, setDayType] = useState<'full' | 'half' | null>(null);
  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening' | null>(null);
  const [dateOption, setDateOption] = useState<'today' | 'future' | null>(null);
  
  const [shortHour, setShortHour] = useState<number | null>(null);
  const [shortMin, setShortMin] = useState<number | null>(null);
const [activePicker, setActivePicker] = useState<'hour' | 'minute' | 'time' | null>(null);  const [medicalDays, setMedicalDays] = useState<number | null>(null);
const shortLeaveTimeSlots = useMemo<{ h: number; m: number; label: string }[]>(() => {
    if (selectedShift === 'morning') {
      return [
        { h: 8, m: 30, label: '08:30 AM' },
        { h: 9, m: 0, label: '09:00 AM' },
        { h: 9, m: 30, label: '09:30 AM' },
        { h: 10, m: 0, label: '10:00 AM' },
        { h: 10, m: 30, label: '10:30 AM' },
        { h: 11, m: 0, label: '11:00 AM' },
      ];
    } else if (selectedShift === 'evening') {
      return [
        { h: 1, m: 0, label: '01:00 PM' },
        { h: 1, m: 30, label: '01:30 PM' },
        { h: 2, m: 0, label: '02:00 PM' },
        { h: 2, m: 30, label: '02:30 PM' },
        { h: 3, m: 0, label: '03:00 PM' },
      ];
    }
    return [];
  }, [selectedShift]);
const [currentMonthIndex, setCurrentMonthIndex] =
  useState(getToday().getMonth());
    const [showModal, setShowModal] = useState(false);
  const [selectedCustomDate, setSelectedCustomDate] = useState<string | null>(null);
  const [selectedCustomDateIso, setSelectedCustomDateIso] = useState<string | null>(null);
  // Always start the leave calendar in the current month/year.
  // The maximum navigable month is December of the current year.
  // When a new year begins, this automatically becomes that new year's December.
 const [calendarMonth, setCalendarMonth] = useState(() => {
  const d = getToday();
  return new Date(d.getFullYear(), d.getMonth(), 1);
});

  // Public holidays are loaded dynamically from the Sri Lanka Holidays
  // project's verified downloadable JSON data. No holiday dates are hard-coded.
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
  const holidayCacheRef = useRef<Record<number, Set<string>>>({});
  const holidayLoadingYearsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const extractHolidayDates = (data: any): Set<string> => {
      const dates = new Set<string>();

      // The repository publishes yearly JSON files under /json/YYYY.json.
      // Be tolerant of either an array or an object containing a holidays array.
      const holidays = Array.isArray(data)
        ? data
        : Array.isArray(data?.holidays)
          ? data.holidays
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.holidays)
              ? data.data.holidays
              : [];

      holidays.forEach((item: any) => {
        const rawDate =
          item?.date ??
          item?.Date ??
          item?.start_date ??
          item?.start ??
          item?.dtstart ??
          '';

        const date = String(rawDate).slice(0, 10);

        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          // If the JSON contains a public flag, only include public holidays.
          // If no such flag exists, the yearly source file itself is treated
          // as the holiday source and the date is included.
          const hasPublicFlag =
            Object.prototype.hasOwnProperty.call(item, 'public') ||
            Object.prototype.hasOwnProperty.call(item, 'is_public');

          const isPublic =
            item?.public === true ||
            item?.is_public === true ||
            String(item?.type ?? '').toLowerCase().includes('public');

          if (!hasPublicFlag || isPublic) {
            dates.add(date);
          }
        }
      });

      return dates;
    };

    const fetchHolidayYear = async (year: number): Promise<Set<string>> => {
      if (holidayCacheRef.current[year]) {
        return holidayCacheRef.current[year];
      }

      if (holidayLoadingYearsRef.current.has(year)) {
        return holidayCacheRef.current[year] || new Set<string>();
      }

      holidayLoadingYearsRef.current.add(year);

      try {
        // The project publishes verified yearly JSON files here:
        // https://github.com/Dilshan-H/srilanka-holidays/tree/main/json
        // This avoids the API-key requirement of the live API and avoids
        // maintaining holiday dates manually inside this application.
        const url =
          `https://raw.githubusercontent.com/Dilshan-H/srilanka-holidays/main/json/${year}.json`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.status === 404) {
          // A future year may not have finalized JSON data yet.
          // Do not treat that as an application error.
          const empty = new Set<string>();
          holidayCacheRef.current[year] = empty;
          return empty;
        }

        if (!response.ok) {
          throw new Error(
            `Sri Lanka holiday data request failed for ${year}: ${response.status}`
          );
        }

        const rawText = (await response.text()).trim();

        if (!rawText) {
          throw new Error(
            `Sri Lanka holiday data returned an empty response for ${year}`
          );
        }

        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `Sri Lanka holiday data returned invalid JSON for ${year}`
          );
        }

        const dates = extractHolidayDates(data);
        holidayCacheRef.current[year] = dates;
        return dates;
      } finally {
        holidayLoadingYearsRef.current.delete(year);
      }
    };

    const loadSriLankanHolidays = async () => {
      const year = calendarMonth.getFullYear();

      // Load the displayed year and the following year so a medical leave
      // range crossing December/January can still skip holidays correctly.
      const years = [year, year + 1];

      try {
        const results = await Promise.all(
          years.map(async (holidayYear) => {
            try {
              return await fetchHolidayYear(holidayYear);
            } catch (error) {
              console.error(
                `Error loading Sri Lankan public holidays for ${holidayYear}:`,
                error
              );
              return holidayCacheRef.current[holidayYear] || new Set<string>();
            }
          })
        );

        if (cancelled) return;

        const combinedDates = new Set<string>();

        results.forEach((dates) => {
          dates.forEach((date) => combinedDates.add(date));
        });

        setHolidayDates(combinedDates);
      } catch (error) {
        console.error('Error loading Sri Lankan public holidays:', error);
      }
    };

    loadSriLankanHolidays();

    return () => {
      cancelled = true;
    };
  }, [calendarMonth]);

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(25)).current; 

  // 🔥 Database එකෙන් එන Balances
  const [currentDBBalances, setCurrentDBBalances] = useState({
    casual: { total: 21, remaining: 21, used: 0 },
    medical: { total: 24, remaining: 24, used: 0 },
    short: { total: 2, remaining: 2, used: 0 }
  });
  
  const [officerProfile, setOfficerProfile] = useState<any>({ joinedDate: '-' });
  const [currentHistory, setCurrentHistory] = useState<any[]>([]);
  // The database history contains all years so date-locking/PDF logic stays intact.
  // The visible "Current Year Leave History" is filtered to the simulated/current year.
  const visibleCurrentHistory = useMemo(
    () => currentHistory.filter((item: any) => String(item.date || '').startsWith(String(currentYear))),
    [currentHistory, currentYear]
  );
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    route?.params?.requestId || route?.params?.pendingRequest?.id || null
  );
  
  const [pastHistoryData, setPastHistoryData] = useState<any[]>([]); 
  const [leaveHistoryData, setLeaveHistoryData] = useState({ lastLeaveDate: '-', totalLeavesThisYear: 0 });
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  const t = useMemo(() => L[selectedLang] ?? L.en, [selectedLang]);

  const fetchLeaveData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbUser } = await supabase
        .from('users')
        .select('id, title, full_name, full_name_si, full_name_ta, department_id, joined_date, departments(department_name, department_name_si, department_name_ta), designations(designation_en, designation_si, designation_ta)')
        .eq('auth_id', user.id)
        .single();

      if (!dbUser) return;
      
      const getLocalizedValue = (en?: string | null, si?: string | null, ta?: string | null) => {
        if (selectedLang === 'si') return si || en || '';
        if (selectedLang === 'ta') return ta || en || '';
        return en || '';
      };

      const departmentObj = Array.isArray(dbUser.departments) ? dbUser.departments[0] : (dbUser.departments || {});
      const uDesig = Array.isArray(dbUser.designations) ? dbUser.designations[0] : (dbUser.designations || {});

      let formattedTitle = '';
      if (dbUser.title && typeof dbUser.title === 'string' && dbUser.title.trim() !== '' && dbUser.title !== 'null' && dbUser.title !== 'N/A') {
        const tText = String(dbUser.title).trim();
        formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
      }
      const baseName = getLocalizedValue(dbUser.full_name, dbUser.full_name_si, dbUser.full_name_ta);
      
      setOfficerProfile({ 
        id: dbUser.id,
        name: `${formattedTitle}${baseName}`,
        department: getLocalizedValue(departmentObj?.department_name, departmentObj?.department_name_si, departmentObj?.department_name_ta),
        designation: getLocalizedValue(uDesig?.designation_en, uDesig?.designation_si, uDesig?.designation_ta),
        joinedDate: dbUser.joined_date ? formatToYMD(dbUser.joined_date) : '-'
      });

      // 🔥 Fetch existing balances
      let { data: balanceDataResult } = await supabase
        .from('user_leave_balances')
        .select(`id, year, remaining_days, allocated_days, used_days, leave_types ( id, name_en )`)
        .eq('user_id', dbUser.id)
        .order('year', { ascending: false });

      // Auto-create the current year's leave balances when missing
      const { data: types } = await supabase.from('leave_types').select('*');

      const hasCurrentYear = balanceDataResult && balanceDataResult.some((b: any) => b.year === currentYear);
      const currentYearWasInserted = !hasCurrentYear && !!types;
      if (currentYearWasInserted && types) {
        const newInserts = types.map((t: any) => ({
          user_id: dbUser.id,
          leave_type_id: t.id,
          year: currentYear,
          allocated_days: t.max_days,
          remaining_days: t.max_days,
          used_days: 0
        }));
        await supabase.from('user_leave_balances').insert(newInserts);
      }

      // Re-fetch after current-year auto-creation.
      const { data: refreshedData } = await supabase
        .from('user_leave_balances')
        .select(`id, year, remaining_days, allocated_days, used_days, leave_type_id, leave_types ( id, name_en )`)
        .eq('user_id', dbUser.id)
        .order('year', { ascending: false });

      if (refreshedData) balanceDataResult = refreshedData;

      // 🔥 Delete old records (Keep only up to 3 past years)
      await supabase.from('user_leave_balances').delete().eq('user_id', dbUser.id).lte('year', currentYear - 4);

      let currentTotalLeaves = 0;

      if (balanceDataResult) {
        let newBalances = {
          casual: { total: 21, remaining: 21, used: 0 },
          medical: { total: 24, remaining: 24, used: 0 },
          short: { total: 2, remaining: 2, used: 0 } // Short is renewed monthly via computed function below
        };
        let pastHistoryMap: Record<number, { casual: string, medical: string }> = {};

        balanceDataResult.forEach((b: any) => {
          if (b.year <= currentYear - 4) return; // Ignore if delete hasn't propagated

          const typeName = b.leave_types?.name_en?.toLowerCase() || '';
          let typeKey = '';
          if (typeName.includes('casual')) typeKey = 'casual';
          else if (typeName.includes('sick') || typeName.includes('medical')) typeKey = 'medical';

          // 🔥 Read Current Year data directly from table
          if (b.year === currentYear && typeKey) {
            newBalances[typeKey as keyof typeof newBalances] = {
               total: b.allocated_days || 0,
               remaining: b.remaining_days || 0,
               used: b.used_days !== null ? b.used_days : (b.allocated_days - b.remaining_days)
            };
          } 
          // 🔥 Read Past Years data directly from table
          else if (b.year < currentYear && typeKey) {
            if (!pastHistoryMap[b.year]) {
              pastHistoryMap[b.year] = { casual: '- / -', medical: '- / -' };
            }
            const usedDays = b.used_days !== null ? b.used_days : (b.allocated_days - b.remaining_days);
            if (typeKey === 'casual') pastHistoryMap[b.year].casual = `${usedDays}/${b.allocated_days}`;
            else if (typeKey === 'medical') pastHistoryMap[b.year].medical = `${usedDays}/${b.allocated_days}`;
          }
        });

        setCurrentDBBalances(newBalances);
        
        // Format the Past History mapping into an Array
        const formattedPastHistory = Object.keys(pastHistoryMap)
          .map(year => Number(year))
          .sort((a, b) => b - a)
          .map(year => ({
            year: year.toString(), casual: pastHistoryMap[year].casual, medical: pastHistoryMap[year].medical
          }));

        setPastHistoryData(formattedPastHistory.slice(0, 3)); 
      }

      const { data: historyData } = await supabase
        .from('leave_requests')
        .select(`
          id, start_date, end_date, no_of_days, reason, status, approval_stage, admin_approved_at,
          final_approved_at, supervisor_remark, created_at, updated_at, leave_types ( name_en )
        `)
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });

      if (historyData) {
        const approvedLeaves = historyData.filter(h => normalizeStatus(h.status) === 'approved' || normalizeStatus(h.status) === 'admin approved');
        const lastLeaveDt = approvedLeaves.length > 0 ? formatToYMD(approvedLeaves[0].start_date) : t.noHistory;
        
        const currentYearStr = currentYear.toString();
        approvedLeaves.forEach(h => {
          if (h.start_date && h.start_date.startsWith(currentYearStr)) {
            currentTotalLeaves += Number(h.no_of_days) || 0;
          }
        });

        setLeaveHistoryData({ totalLeavesThisYear: currentTotalLeaves, lastLeaveDate: lastLeaveDt });

        const formattedHistory = historyData.map((h: any) => {
          const typeName = h.leave_types?.name_en?.toLowerCase() || '';
          let typeKey = 'casual';
          if (typeName.includes('sick') || typeName.includes('medical')) typeKey = 'medical';
          else if (typeName.includes('short')) typeKey = 'short';

          return {
            id: h.id.toString(), date: h.start_date, type: typeKey, noOfDays: Number(h.no_of_days),
            duration: h.no_of_days + ' Days', status: h.status || 'Pending', approvalStage: h.approval_stage || 'admin_review',
            reason: h.reason || '', endDate: h.end_date, adminApprovedAt: h.admin_approved_at,
            finalApprovedAt: h.final_approved_at, supervisorRemark: h.supervisor_remark,
            createdAt: h.created_at, updatedAt: h.updated_at
          };
        });
        setCurrentHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [currentYear]);

  useEffect(() => {
    const requestedId = route?.params?.requestId || route?.params?.pendingRequest?.id || null;
    if (requestedId) {
      setSelectedRequestId(Number(requestedId));
      setShowCurrentHistory(true);
    }
  }, [route?.params?.requestId, route?.params?.pendingRequest?.id]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
      if (!dbUser) return;
      channel = supabase.channel(`leave-status-${dbUser.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leave_requests', filter: `user_id=eq.${dbUser.id}` }, () => { fetchLeaveData(); }).subscribe();
    };
    subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // 🔥 Short Leave Monthly calculation 
  const computedBalances = useMemo(() => {
    let shortUsed = 0;
    const currentMonthStr = String(getToday().getMonth() + 1).padStart(2, '0');
    const currentYearStr = String(currentYear);

    currentHistory.forEach((req) => {
      const status = normalizeStatus(req.status);
      if (status === 'approved') { 
        const reqYear = req.date.substring(0, 4);
        const reqMonth = req.date.substring(5, 7);
        // Calculate only for Short leaves of current month
        if (req.type === 'short' && reqYear === currentYearStr && reqMonth === currentMonthStr) {
          shortUsed += 1;
        }
      }
    });

    return {
      casual: currentDBBalances.casual,
      medical: currentDBBalances.medical,
      short: { total: 2, remaining: Math.max(0, 2 - shortUsed), used: shortUsed }
    };
  }, [currentHistory, currentDBBalances, currentYear]);

  const futureLockedLeaveTypes = useMemo(() => {
    const lockedTypes = new Set<string>();
const today = getToday();
    today.setHours(0, 0, 0, 0);
    
    currentHistory.forEach(req => {
      const status = normalizeStatus(req.status);
      if (['approved', 'pending', 'admin approved', 'praja reviewed', 'supervisor review'].includes(status)) {
         if (!req.date) return;
         const parts = req.date.split('-');
         if (parts.length === 3) {
           const reqDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
           reqDate.setHours(0, 0, 0, 0);
           if (reqDate >= today) {
              lockedTypes.add(req.type); 
           }
         }
      }
    });
    return lockedTypes;
  }, [currentHistory]);

  const lockedDateStrings = useMemo(() => {
    const locked = new Set<string>();
    currentHistory.forEach((req) => {
      const status = normalizeStatus(req.status);
      if (status !== 'rejected' && status !== 'cancelled') {
        const start = new Date(req.date);
        const end = req.endDate ? new Date(req.endDate) : new Date(req.date);
        let current = new Date(start);
        while (current <= end) {
          locked.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return locked;
  }, [currentHistory]);

  const currentMonthName = useMemo(() => t.months[currentMonthIndex] || '', [t, currentMonthIndex]);

  const leaveTypesData = useMemo<LeaveTypeItem[]>(() => {
    return [
      { id: 'casual', label: selectedLang === 'si' ? 'වාර්ෂික අනියම් නිවාඩු' : selectedLang === 'ta' ? 'வருடாந்த தற்செயல் விடுமுறை' : 'Annual Casual Leave', color: '#B45309', bg: '#FFF7ED', icon: 'leaf-outline', remaining: computedBalances.casual.remaining, total: computedBalances.casual.total, subLabel: '' },
      { id: 'medical', label: selectedLang === 'si' ? 'වාර්ෂික විවේකී / අසනීප නිවාඩු' : selectedLang === 'ta' ? 'வருடாந்த ஓய்வு / நோய் விடுப்பு' : 'Annual Rest / Sick Leave', color: '#0F766E', bg: '#F0FDFA', icon: 'medkit-outline', remaining: computedBalances.medical.remaining, total: computedBalances.medical.total, subLabel: '' },
      { id: 'short', label: selectedLang === 'si' ? `කෙටි නිවාඩු - ${currentMonthName}` : selectedLang === 'ta' ? `குறு விடுப்பு - ${currentMonthName}` : `Short Leave - ${currentMonthName}`, color: '#1D4ED8', bg: '#EFF6FF', icon: 'time-outline', remaining: computedBalances.short.remaining, total: computedBalances.short.total, subLabel: '' },
    ];
  }, [selectedLang, currentMonthName, computedBalances]);

  const isTodayWeekendOrHoliday = useMemo(() => {
    const today = getToday();
    const todayIso = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6 || holidayDates.has(todayIso);
  }, [holidayDates]);

  const isSelectedDatePast = useMemo(() => {
    if (!selectedCustomDateIso) return false;
    const parts = selectedCustomDateIso.split('-');
    if (parts.length !== 3) return false;
    const selectedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const today = getToday();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }, [selectedCustomDateIso]);

  const availableLeaveTypes = useMemo(() => {
    let types = leaveTypesData;
    if (dateOption === 'future') {
      if (isSelectedDatePast) {
        types = types.filter((leave) => leave.id === 'medical' || leave.id === 'casual');
      } else {
        types = types.filter((leave) => leave.id !== 'short');
      }
    }
    return types;
  }, [dateOption, isSelectedDatePast, leaveTypesData]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
    ]).start();
    setCurrentMonthIndex(getToday().getMonth());
  }, [fadeAnim, slideAnim]);

  const resetApplicationFields = () => {
    setSelectedLeave(null); setDayType(null); setSelectedShift(null); setMedicalDays(null); setShortHour(null); setShortMin(null);
  };

  const isTodayCompletelyLocked = isTodayWeekendOrHoliday;
  const hasValidSelectedDate = dateOption === 'today' || (dateOption === 'future' && selectedCustomDateIso !== null);

  const latestRequest = currentHistory.length > 0 ? currentHistory[0] : null;
  const latestRequestStatus = normalizeStatus(latestRequest?.status || '');
  
  // 🔥 Lock Logic Fix: Only unlock if the status is purely Approved, Rejected or Cancelled.
  const finalStatuses = ['approved', 'rejected', 'cancelled'];
  const isLatestRequestProcessing = !!latestRequest && !finalStatuses.includes(latestRequestStatus);

  const todayIso = getToday().toISOString().split('T')[0];
  const hasLeaveToday = lockedDateStrings.has(todayIso);
  
  const isLeaveApplicationLocked = isLatestRequestProcessing || hasLeaveToday;

  const isTimeInvalidForShortLeave = false;
  const selected = leaveTypesData.find(l => l.id === selectedLeave);

  const applicationDisabled =
    isLeaveApplicationLocked ||
    !hasValidSelectedDate ||
    (dateOption === 'today' && isTodayWeekendOrHoliday) ||
    selectedLeave === null ||
    (selectedLeave === 'casual' && (dayType === null || (dayType === 'half' && selectedShift === null))) ||
    (selectedLeave === 'medical' && medicalDays === null) ||
    (selectedLeave === 'short' && (dateOption !== 'today' || selectedShift === null || shortHour === null || shortMin === null));

  const getTypeName = (type: string) => {
    if (type === 'casual') return t.casualAbbr;
    if (type === 'medical') return t.medicalAbbr;
    if (selectedLang === 'si') return 'කෙටි නිවාඩු';
    if (selectedLang === 'ta') return 'குறு விடுமுறை';
    return 'Short Leave';
  };

  const getStatusName = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') return t.statusApproved;
    if (normalized === 'rejected') return t.statusRejected;
    if (normalized === 'cancelled') return selectedLang === 'si' ? 'අවලංගු කර ඇත' : selectedLang === 'ta' ? 'ரத்து செய்யப்பட்டது' : 'Cancelled';
    if (normalized === 'admin approved') return selectedLang === 'si' ? 'පරිපාලන අනුමැතිය ලැබී ඇත' : selectedLang === 'ta' ? 'நிர்வாக அனுமதி கிடைத்தது' : 'Admin Approved';
    if (normalized === 'praja reviewed') return selectedLang === 'si' ? 'ප්‍රජා නිලධාරී සමාලෝචනය අවසන්' : selectedLang === 'ta' ? 'பிரஜா அலுவலர் மதிப்பாய்வு முடிந்தது' : 'Praja Reviewed';
    return t.statusPending;
  };

  const getStatusProgress = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'approved') return 3;
    if (normalized === 'admin approved' || normalized === 'praja reviewed') return 2;
    if (normalized === 'rejected' || normalized === 'cancelled') return -1;
    return 1;
  };

  const statusSteps = useMemo(() => [
    selectedLang === 'si' ? 'අයදුම්පත යවා ඇත' : selectedLang === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது' : 'Submitted',
    selectedLang === 'si' ? 'සමාලෝචනය වෙමින් පවතී' : selectedLang === 'ta' ? 'மதிப்பாய்வில் உள்ளது' : 'Under Review',
    selectedLang === 'si' ? 'අවසන් තීරණය' : selectedLang === 'ta' ? 'இறுதி முடிவு' : 'Final Decision',
  ], [selectedLang]);

  const getDurationName = (item: any) => {
    const matched = String(item.duration || '').match(/[0-9.]+/);
    const days = Number(item.noOfDays ?? matched?.[0] ?? 1);
    const cleanReason = String(item.reason || '');
    const shift = cleanReason.includes('[SHIFT:evening]') ? 'evening' : cleanReason.includes('[SHIFT:morning]') ? 'morning' : null;

    if (item.type === 'short') return selectedLang === 'si' ? 'කෙටි නිවාඩු' : selectedLang === 'ta' ? 'குறு விடுப்பு' : 'Short Leave';
    if (days === 0.5) {
      const shiftLabel = shift === 'evening' ? (selectedLang === 'si' ? 'පස්වරු' : selectedLang === 'ta' ? 'மாலை' : 'Evening') : (selectedLang === 'si' ? 'පෙරවරු' : selectedLang === 'ta' ? 'காலை' : 'Morning');
      return selectedLang === 'si' ? `අර්ධ දිනය (${shiftLabel})` : selectedLang === 'ta' ? `அரை நாள் (${shiftLabel})` : `Half Day (${shiftLabel})`;
    }
    if (days === 1) return selectedLang === 'si' ? 'සම්පූර්ණ දිනය' : selectedLang === 'ta' ? 'முழு நாள்' : 'Full Day';
    return selectedLang === 'si' ? `දින ${days}` : selectedLang === 'ta' ? `${days} நாட்கள்` : `${days} Days`;
  };

  const formatSinhalaMonthDate = (date: Date) => {
    const monthsSI = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
    const monthsTA = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    if (selectedLang === 'si') return `${year} ${monthsSI[monthIndex]} ${day}`;
    if (selectedLang === 'ta') return `${year} ${monthsTA[monthIndex]} ${day}`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const medicalCalculatedRange = useMemo(() => {
    if (selectedLeave !== 'medical' || !medicalDays || !dateOption) return null;
    let startD = getToday();
    if (dateOption === 'future' && selectedCustomDateIso) startD = new Date(selectedCustomDateIso);
    let current = new Date(startD);
    let daysCounted = 1; 
    while (daysCounted < medicalDays) {
      current.setDate(current.getDate() + 1);
      const iso = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayDates.has(iso);
      if (!isWeekend && !isHoliday) daysCounted++;
    }
    return {
       startFormatted: formatSinhalaMonthDate(startD),
       endFormatted: formatSinhalaMonthDate(current),
       startIso: startD.toISOString().split('T')[0],
       endIso: current.toISOString().split('T')[0],
    };
  }, [selectedLeave, medicalDays, dateOption, selectedCustomDateIso, holidayDates]);

  const computedShortLeaveDisplay = useMemo(() => {
    if (shortHour === null || shortMin === null || !selectedShift) return null;
    let startHr = shortHour;
    let startMn = shortMin;
    let isPM = selectedShift === 'evening';
    let absoluteStartMins = (startHr === 12 ? 0 : startHr) * 60 + startMn;
    if (isPM) absoluteStartMins += 12 * 60; 
    let absoluteEndMins = absoluteStartMins + 90;
    const lunchStart = 12 * 60;
    const lunchEnd = 13 * 60;
    let lunchOverlapDetected = false;
    if (absoluteStartMins < lunchEnd && absoluteEndMins > lunchStart) {
      absoluteEndMins += 60; 
      lunchOverlapDetected = true;
    }
    let endHrRaw = Math.floor(absoluteEndMins / 60);
    let endMnRaw = absoluteEndMins % 60;
    let endAMPM = endHrRaw >= 12 ? 'PM' : 'AM';
    let endHr = endHrRaw % 12 || 12;
    let endMnStr = endMnRaw < 10 ? `0${endMnRaw}` : `${endMnRaw}`;
    let startMnStr = startMn < 10 ? `0${startMn}` : `${startMn}`;
    let startAMPM = isPM ? 'PM' : 'AM';
    let formattedStartHr = startHr < 10 ? `0${startHr}` : `${startHr}`;
    let formattedEndHr = endHr < 10 ? `0${endHr}` : `${endHr}`;
    return {
      string: `${formattedStartHr}:${startMnStr} ${startAMPM} ➔ ${formattedEndHr}:${endMnStr} ${endAMPM}`,
      lunchAdded: lunchOverlapDetected
    };
  }, [shortHour, shortMin, selectedShift]);

  const normalCalendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<null | {
      day: number; iso: string; formatted: string; isLocked: boolean; subLabel: string;
    }> = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);

    const today = getToday();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const isHoliday = holidayDates.has(iso);
      const isToday = date.getTime() === today.getTime();
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
      twoMonthsAgo.setHours(0, 0, 0, 0);
      const isOlderThanTwoMonths = date < twoMonthsAgo;
      
      const isAlreadyPending = lockedDateStrings.has(iso);

      const isLocked = isToday || isWeekend || isHoliday || isOlderThanTwoMonths || isAlreadyPending;

      let subLabel = '';
      if (isAlreadyPending) subLabel = t.alreadyApplied;
      else if (isWeekend) subLabel = t.weekendTxt;
      else if (isHoliday) subLabel = t.holidayTxt;

      cells.push({ day, iso, formatted: formatSinhalaMonthDate(date), isLocked, subLabel });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth, t, selectedLang, lockedDateStrings, holidayDates]);

  const calendarWeekDays = useMemo(() => {
    if (selectedLang === 'si') return ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'];
    if (selectedLang === 'ta') return ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  }, [selectedLang]);

  const calendarTitle = useMemo(() => {
    const monthName = t.months[calendarMonth.getMonth()];
    return selectedLang === 'en' ? `${monthName} ${calendarMonth.getFullYear()}` : `${calendarMonth.getFullYear()} ${monthName}`;
  }, [calendarMonth, selectedLang, t]);

  const downloadHistoryPdf = async (item: any) => {
    setIsDownloading(Number(item.id));

    try {
      const { data: formData, error } = await supabase
        .from('leave_forms')
        .select('form_details, digital_signature')
        .eq('leave_request_id', item.id)
        .single();

      if (error || !formData || !formData.form_details) {
        Alert.alert('', selectedLang === 'si' ? 'මෙම නිවාඩුව සඳහා ඩිජිටල් අයදුම්පතක් පද්ධතියේ නොමැත.' : 'Digital form not found for this leave request.');
        setIsDownloading(null);
        return;
      }

      const { data: lr } = await supabase.from('leave_requests')
        .select('subject_signature, cc_signature, secretary_signature, chairman_signature, status')
        .eq('id', item.id)
        .single();

      const fData = typeof formData.form_details === 'string' ? JSON.parse(formData.form_details) : formData.form_details;
      const sData = typeof formData.digital_signature === 'string' ? JSON.parse(formData.digital_signature) : formData.digital_signature;

      const myLogoUri = Image.resolveAssetSource(require('../../../assets/images/ui/logo.png')).uri;
      const govLogoUri = Image.resolveAssetSource(require('../../../assets/images/ui/srilankalogo.png')).uri;

      const itemYearStr = new Date(item.date).getFullYear().toString();
      const approvedLeavesOfSameType = currentHistory.filter(h => h.type === item.type && (normalizeStatus(h.status) === 'approved' || normalizeStatus(h.status) === 'admin approved'));
      let typeTotalThisYear = 0;
      approvedLeavesOfSameType.forEach(h => {
        if (h.date && h.date.startsWith(itemYearStr)) typeTotalThisYear += Number(h.noOfDays) || 0;
      });
      const priorLeaves = approvedLeavesOfSameType.filter(h => new Date(h.date) < new Date(item.date));
      const lastLeaveDt = priorLeaves.length > 0 ? formatToYMD(priorLeaves[0].date) : (selectedLang === 'si' ? 'නැත' : selectedLang === 'ta' ? 'இல்லை' : 'None');

      let pdfTitle, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, signTxt, dateTxt, daysTxt;
      let subjLbl, ccLbl, secLbl, chairLbl;
      
      if (selectedLang === 'si') {
        pdfTitle = 'නිල නිවාඩු අයදුම්පත්‍රය';
        f1 = '01. නිලධාරියාගේ නම'; f2 = '02. දෙපාර්තමේන්තුව'; f3 = '03. තනතුර'; f4 = '04. නිවාඩු වර්ගය';
        f5 = '05. නිවාඩු දින ගණන'; f6 = '06. ආරම්භ වන දිනය'; f7 = '07. නැවත පැමිණෙන දිනය'; f8 = '08. නිවාඩුවට හේතුව';
        f9 = '09. මෙම වර්ෂයේ ගත් නිවාඩු ගණන'; f10 = '10. රාජකාරි ආවරණ නිලධාරියා';
        f11 = '11. පළමු පත්වීමේ දිනය'; f12 = '12. අවසන් වරට නිවාඩු ගත් දිනය'; f13 = '13. අයදුම්පතේ තත්ත්වය';
        signTxt = 'අයදුම්කරුගේ අත්සන'; dateTxt = 'දිනය'; daysTxt = 'දින';
        subjLbl = 'විෂය ලිපිකරු'; ccLbl = 'ප්‍රධාන කළමනාකරණ සහකාර'; secLbl = 'ලේකම්'; chairLbl = 'සභාපති';
      } else if (selectedLang === 'ta') {
        pdfTitle = 'அதிகாரபூர்வ விடுப்பு விண்ணப்பம்';
        f1 = '01. அதிகாரியின் பெயர்'; f2 = '02. திணைக்களம்'; f3 = '03. பதவி'; f4 = '04. விடுப்பு வகை';
        f5 = '05. விடுப்பு நாட்கள்'; f6 = '06. ஆரம்ப தேதி'; f7 = '07. திரும்பும் தேதி'; f8 = '08. விடுப்புக்கான காரணம்';
        f9 = '09. இவ்வருடம் எடுத்த விடுப்புகள்'; f10 = '10. பணி பொறுப்பு அதிகாரி';
        f11 = '11. நியமனத் தேதி'; f12 = '12. கடைசி விடுப்பு தேதி'; f13 = '13. விண்ணப்பத்தின் நிலை';
        signTxt = 'விண்ணப்பதாரரின் கையொப்பம்'; dateTxt = 'தேதி'; daysTxt = 'நாட்கள்';
        subjLbl = 'விடய உத்தியோகத்தர்'; ccLbl = 'பிரதம முகாமைத்துவ உதவியாளர்'; secLbl = 'செயலாளர்'; chairLbl = 'தலைவர்';
      } else {
        pdfTitle = 'Official Leave Application';
        f1 = '01. Officer Name'; f2 = '02. Department'; f3 = '03. Designation'; f4 = '04. Leave Type';
        f5 = '05. Leave Duration'; f6 = '06. Start Date'; f7 = '07. Returning Date'; f8 = '08. Reason for Leave';
        f9 = '09. Leaves Taken This Year'; f10 = '10. Duty Coverage Officer';
        f11 = '11. Joined Date'; f12 = '12. Last Leave Date'; f13 = '13. Application Status';
        signTxt = "Applicant's Signature"; dateTxt = 'Date'; daysTxt = 'Days';
        subjLbl = 'Subject Officer'; ccLbl = 'CC Officer'; secLbl = 'Secretary'; chairLbl = 'Chairman';
      }

      const subjImg = lr?.subject_signature ? `<img src="${lr.subject_signature}" style="height:50px; object-fit:contain; margin: 0 auto; display: block;" />` : '<div style="height:50px;"></div>';
      const ccImg = lr?.cc_signature ? `<img src="${lr.cc_signature}" style="height:50px; object-fit:contain; margin: 0 auto; display: block;" />` : '<div style="height:50px;"></div>';
      const topAuthImg = lr?.chairman_signature ? `<img src="${lr.chairman_signature}" style="height:50px; object-fit:contain; margin: 0 auto; display: block;" />` : lr?.secretary_signature ? `<img src="${lr.secretary_signature}" style="height:50px; object-fit:contain; margin: 0 auto; display: block;" />` : '<div style="height:50px;"></div>';
      const topAuthLbl = lr?.chairman_signature ? chairLbl : secLbl;

      const coverageName = fData.duty_coverage ? fData.duty_coverage.officer_name : (selectedLang === 'si' ? 'අදාළ නොවේ' : selectedLang === 'ta' ? 'பொருந்தாது' : 'N/A');
      const returningDate = fData.leave.end_date ? addDays(fData.leave.end_date, 1) : '-';

      const svgPaths = sData.paths ? sData.paths.map((pathStr: string) => `<path d="${pathStr}" stroke="#000" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`).join('\n') : '';
      const signatureSvg = `<svg viewBox="0 0 350 240" style="width: 140px; height: 60px; display: block; margin-left: auto; margin-right: 15px;" xmlns="http://www.w3.org/2000/svg">${svgPaths}</svg>`;

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 20px 30px; color: #000; line-height: 1.4; }
              .header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
              .logo-img { width: 65px; height: 65px; object-fit: contain; }
              .main-title { flex: 1; text-align: center; font-size: 20px; font-weight: bold; text-decoration: underline; }
              table { width: 100%; border-collapse: collapse; margin-top: 5px; }
              td { padding: 6px 5px; vertical-align: top; font-size: 14px; }
              .label-col { width: 45%; font-weight: bold; }
              .colon { width: 5%; text-align: center; font-weight: bold; }
              .val-col { width: 50%; border-bottom: 1px dotted #000; }
              .sign-line { border-top: 1px dashed #000; padding-top: 5px; font-weight: bold; margin-top: 5px; text-align: center; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header-box">
              <img src="${myLogoUri}" class="logo-img" />
              <div class="main-title">${pdfTitle}</div>
              <img src="${govLogoUri}" class="logo-img" />
            </div>
            
            <table>
             <table>
  <tr>
    <td class="label-col">${f1}</td>
    <td class="colon">:</td>
    <td class="val-col">${officerProfile.name}</td>
  </tr>

  <tr>
    <td class="label-col">${f2}</td>
    <td class="colon">:</td>
    <td class="val-col">${officerProfile.department || '-'}</td>
  </tr>

  <tr>
    <td class="label-col">${f3}</td>
    <td class="colon">:</td>
    <td class="val-col">${officerProfile.designation}</td>
  </tr>

  <tr>
    <td class="label-col">${f4}</td>
    <td class="colon">:</td>
    <td class="val-col">${getTypeName(item.type)}</td>
  </tr>

  ${
    item.type !== 'short'
      ? `
        <tr>
          <td class="label-col">${f5}</td>
          <td class="colon">:</td>
          <td class="val-col">${getDurationName(item)}</td>
        </tr>
      `
      : ''
  }

  <tr>
    <td class="label-col">${f6}</td>
    <td class="colon">:</td>
    <td class="val-col">${item.date}</td>
  </tr>

  ${
    item.type !== 'short'
      ? `
        <tr>
          <td class="label-col">${f7}</td>
          <td class="colon">:</td>
          <td class="val-col">${returningDate}</td>
        </tr>
      `
      : ''
  }

  <tr>
    <td class="label-col">${f8}</td>
    <td class="colon">:</td>
    <td class="val-col">${item.reason || '-'}</td>
  </tr>

  ${
    item.type !== 'short'
      ? `
        <tr>
          <td class="label-col">${f9}</td>
          <td class="colon">:</td>
          <td class="val-col">${daysTxt} ${typeTotalThisYear}</td>
        </tr>
      `
      : ''
  }

  <tr>
    <td class="label-col">${f10}</td>
    <td class="colon">:</td>
    <td class="val-col">${coverageName}</td>
  </tr>

  <tr>
    <td class="label-col">${f11}</td>
    <td class="colon">:</td>
    <td class="val-col">${officerProfile.joinedDate}</td>
  </tr>

  ${
    item.type !== 'short'
      ? `
        <tr>
          <td class="label-col">${f12}</td>
          <td class="colon">:</td>
          <td class="val-col">${lastLeaveDt}</td>
        </tr>
      `
      : ''
  }

  <tr>
    <td class="label-col">${f13}</td>
    <td class="colon">:</td>
    <td class="val-col">
      <b>${getStatusName(lr?.status || item.status)}</b>
    </td>
  </tr>
</table>     </table>

            <div style="margin-top: 15px; width: 100%; text-align: right;">
                ${signatureSvg}
                <div style="display: inline-block; width: 180px; text-align: center;">
                  <div class="sign-line">${signTxt}</div>
                  <div style="font-size: 13px; margin-top: 3px;">${dateTxt}: ${fData.leave.applied_date}</div>
                </div>
            </div>

            <div style="margin-top: 25px; width: 100%;">
              <div style="float: left; width: 32%; text-align: center;">
                  ${subjImg}
                  <div class="sign-line">${subjLbl}</div>
              </div>
              <div style="float: left; width: 32%; text-align: center; margin-left: 2%;">
                  ${ccImg}
                  <div class="sign-line">${ccLbl}</div>
              </div>
              <div style="float: right; width: 32%; text-align: center;">
                  ${topAuthImg}
                  <div class="sign-line">${topAuthLbl}</div>
              </div>
              <div style="clear: both;"></div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to download document.');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <View style={styles.root}>
    <Animated.View style={[{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.header}>
        <View style={styles.hCircle1} pointerEvents="none" />
        <View style={styles.hCircle2} pointerEvents="none" />
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity style={styles.backBtnPill} onPress={onBack} activeOpacity={0.75}>
              <Ionicons name="chevron-back" size={16} color="#FFD54F" />
              <Text style={styles.backText}>{t.back}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hTitle}>{t.title}</Text>
        <Text style={styles.hMottoText}>{t.motto}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <View style={styles.summaryTitleRow}>
            <View style={styles.summaryAccent} />
            <Text style={styles.mainTopicTitleText}>{currentYear} {t.subtitle}</Text>
          </View>
          <View style={styles.hSummaryRow}>
            {leaveTypesData.map((l) => (
              <View key={l.id} style={styles.hPill}>
                <Text style={styles.hPillNum}>{l.remaining}/{l.total}</Text>
                <Text style={styles.hPillLabel} numberOfLines={3}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {isLeaveApplicationLocked && (
          <View style={styles.compactLockWarning}>
            <Ionicons name="warning-outline" size={18} color="#92400E" />
            <Text style={styles.compactLockWarningText}>
              {hasLeaveToday ? t.approvedTodayMessage : t.applicationLockedMessage}
            </Text>
          </View>
        )}

        <View style={styles.dropdownSectionCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.dropdownHeaderTouchRow, isLeaveApplicationLocked && { opacity: 0.55 }]}
            onPress={() => { if (!isLeaveApplicationLocked) setShowApplySection(!showApplySection); }}
          >
            <View style={[styles.summaryTitleRow, { flex: 1, paddingRight: 10 }]}>
              <Ionicons name="document-text-outline" size={22} color="#7A1020" style={{ marginRight: 8 }} />
              <Text style={styles.mainTopicTitleText}>{t.sectionTitle}</Text>
            </View>
            <Ionicons name={isLeaveApplicationLocked ? 'lock-closed-outline' : showApplySection ? 'chevron-up' : 'chevron-down'} size={22} color={isLeaveApplicationLocked ? '#94A3B8' : '#7A1020'} />
          </TouchableOpacity>

          {showApplySection && (
            <View style={styles.unifiedFormBody}>
              <View style={styles.formStepCard}>
                <View style={styles.stepTitleRow}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                  <Text style={styles.formSectionLabel}>{t.selectDate}</Text>
                </View>

                <View style={styles.responsiveOptionRow}>
                  {isTodayCompletelyLocked ? (
                    <View style={[styles.flexOptionBtn, styles.lockedTodayBtn]}>
                      <Ionicons name="lock-closed" size={15} color="#94A3B8" />
                      <Text style={styles.lockedTodayText}>{t.today}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.flexOptionBtn, dateOption === 'today' && styles.selectedMaroonOption]}
                      onPress={() => {
                        setDateOption('today');
                        const now = getToday();
                        setSelectedCustomDate(formatSinhalaMonthDate(now));
                        setSelectedCustomDateIso(now.toISOString().split('T')[0]);
                        resetApplicationFields();
                      }}
                    >
                      <Ionicons name="today-outline" size={17} color={dateOption === 'today' ? '#fff' : '#718096'} />
                      <Text style={[styles.optionText, dateOption === 'today' && styles.toggleTextOn]}>{t.today}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.flexOptionBtn, dateOption === 'future' && styles.selectedMaroonOption]}
                    onPress={() => {
                      const now = getToday();
setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                      setShowModal(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={17} color={dateOption === 'future' ? '#fff' : '#718096'} />
                    <Text style={[styles.optionText, dateOption === 'future' && styles.toggleTextOn]} numberOfLines={2}>
                      {dateOption === 'future' && selectedCustomDate ? selectedCustomDate : t.futureDate}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isTodayWeekendOrHoliday && <Text style={styles.warningText}>{t.todayIsHolidayWarning}</Text>}
              </View>

              {dateOption !== null && (
                <View style={styles.formStepCard}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                    <Text style={styles.formSectionLabel}>{t.selectType}</Text>
                  </View>

                  <View style={styles.leaveTypeGrid}>
                    {availableLeaveTypes.map((leave) => {
                      const isActive = selectedLeave === leave.id;
                      const isFutureLocked = futureLockedLeaveTypes.has(leave.id);
                      
                      return (
                        <TouchableOpacity
                          key={leave.id}
                          activeOpacity={0.82}
                          disabled={isFutureLocked} 
                          style={[
                            styles.leaveTypeOption, 
                            { borderColor: isActive ? leave.color : '#CBD5E1' }, 
                            isActive && { backgroundColor: leave.bg, borderWidth: 2 },
                            isFutureLocked && { opacity: 0.6, backgroundColor: '#F8FAFC' }
                          ]}
                          onPress={() => {
                            if (isFutureLocked) return;
                            if (dateOption === 'future' && leave.id === 'short') return;
                            setSelectedLeave(leave.id);
                            setDayType(null); setSelectedShift(null); setMedicalDays(null); setShortHour(null); setShortMin(null);
                          }}
                        >
                          <View style={[styles.leaveTypeIcon, { backgroundColor: isFutureLocked ? '#94A3B8' : leave.color }]}>
                            <Ionicons name={isFutureLocked ? "lock-closed" : leave.icon} size={21} color="#fff" />
                          </View>
                          <View style={{ flex: 1 }}>
                              <Text style={[styles.leaveTypeOptionText, isActive && { color: leave.color }, isFutureLocked && { color: '#64748B' }]} numberOfLines={3}>
                                {leave.label}
                              </Text>
                              {isFutureLocked && (
                                 <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '800', marginTop: 2 }}>
                                    {t.futureLeaveLockedMessage}
                                 </Text>
                              )}
                          </View>
                          {isActive && <Ionicons name="checkmark-circle" size={18} color={leave.color} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {selectedLeave === 'casual' && (
                <View style={styles.formStepCard}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.formSectionLabel}>
                      {selectedLang === 'si' ? 'නිවාඩු කාලය තෝරන්න' : selectedLang === 'ta' ? 'விடுப்பு காலத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Leave Duration'}
                    </Text>
                  </View>

                  <View style={styles.responsiveOptionRow}>
                    <TouchableOpacity style={[styles.flexOptionBtn, dayType === 'full' && styles.selectedCasualOption]} onPress={() => { setDayType('full'); setSelectedShift(null); }}>
                      <Ionicons name="sunny-outline" size={17} color={dayType === 'full' ? '#fff' : '#718096'} />
                      <Text style={[styles.optionText, dayType === 'full' && styles.toggleTextOn]} numberOfLines={3}>{t.fullDay}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexOptionBtn, dayType === 'half' && styles.selectedCasualOption]} onPress={() => { setDayType('half'); setSelectedShift(null); }}>
                      <Ionicons name="contrast-outline" size={17} color={dayType === 'half' ? '#fff' : '#718096'} />
                      <Text style={[styles.optionText, dayType === 'half' && styles.toggleTextOn]} numberOfLines={3}>{t.halfDay}</Text>
                    </TouchableOpacity>
                  </View>

                  {dayType === 'half' && (
                    <View style={styles.subFormBlock}>
                      <Text style={styles.formSectionLabel}>{t.selectShift}</Text>
                      <View style={styles.responsiveOptionRow}>
                        <TouchableOpacity style={[styles.flexOptionBtn, selectedShift === 'morning' && styles.selectedCasualOption]} onPress={() => setSelectedShift('morning')}>
                          <Ionicons name="sunny-outline" size={17} color={selectedShift === 'morning' ? '#fff' : '#718096'} />
                          <Text style={[styles.optionText, selectedShift === 'morning' && styles.toggleTextOn]} numberOfLines={3}>{t.morningShift}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.flexOptionBtn, selectedShift === 'evening' && styles.selectedCasualOption]} onPress={() => setSelectedShift('evening')}>
                          <Ionicons name="moon-outline" size={17} color={selectedShift === 'evening' ? '#fff' : '#718096'} />
                          <Text style={[styles.optionText, selectedShift === 'evening' && styles.toggleTextOn]} numberOfLines={3}>{t.eveningShift}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {selectedLeave === 'medical' && (
                <View style={styles.formStepCard}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.formSectionLabel}>{t.enterDays}</Text>
                  </View>

                  <View style={styles.dayPickerGridRow}>
                    {[1, 2, 3, 4, 5, 6].map((dayNum) => (
                      <TouchableOpacity key={dayNum} style={[styles.dayPickerCellBtn, medicalDays === dayNum && { backgroundColor: '#0F766E', borderColor: '#0F766E' }]} onPress={() => setMedicalDays(dayNum)}>
                        <Text style={[styles.dayPickerCellText, medicalDays === dayNum && { color: '#fff' }]}>{dayNum}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {medicalDays !== null && medicalCalculatedRange && (
                    <View style={[styles.computedDisplayCard, { borderLeftColor: '#0F766E', marginTop: 16 }]}>
                      <Text style={styles.computedRangeHeader}>
                        {selectedLang === 'si' ? 'අනුමත නිවාඩු දින සීමාව' : selectedLang === 'ta' ? 'கணக்கிடப்பட்ட விடுப்பு வரம்பு' : 'Calculated Leave Range'}
                      </Text>
                      <Text style={[styles.computedRangeValue, { color: '#0F766E' }]}>
                        {medicalCalculatedRange.startFormatted} - {medicalCalculatedRange.endFormatted}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {selectedLeave === 'short' && (
                <View style={styles.formStepCard}>
                  <View style={styles.stepTitleRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.formSectionLabel}>{t.selectShift}</Text>
                  </View>

                  <View style={styles.responsiveOptionRow}>
                    <TouchableOpacity style={[styles.flexOptionBtn, selectedShift === 'morning' && styles.selectedShortOption]} onPress={() => { setSelectedShift('morning'); setShortHour(null); setShortMin(null); }}>
                      <Ionicons name="sunny-outline" size={17} color={selectedShift === 'morning' ? '#fff' : '#718096'} />
                      <Text style={[styles.optionText, selectedShift === 'morning' && styles.toggleTextOn]} numberOfLines={3}>{t.morningShift}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexOptionBtn, selectedShift === 'evening' && styles.selectedShortOption]} onPress={() => { setSelectedShift('evening'); setShortHour(null); setShortMin(null); }}>
                      <Ionicons name="moon-outline" size={17} color={selectedShift === 'evening' ? '#fff' : '#718096'} />
                      <Text style={[styles.optionText, selectedShift === 'evening' && styles.toggleTextOn]} numberOfLines={3}>{t.eveningShift}</Text>
                    </TouchableOpacity>
                  </View>

                 {selectedShift !== null && (
                    <View style={styles.subFormBlock}>
                      <Text style={styles.formSectionLabel}>{t.selectTime}</Text>

                      {/* 🔥 Modern Time Slot Dropdown */}
                      <TouchableOpacity 
                        style={styles.timeDropdownBtn}
                        onPress={() => setActivePicker('time' as any)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.timeDropdownIconBg}>
                          <Ionicons name="time" size={20} color="#1D4ED8" />
                        </View>
                        <Text style={[styles.timeDropdownText, (shortHour !== null) && { color: '#1E293B', fontWeight: '900' }]}>
                          {shortHour !== null && shortMin !== null 
                            ? `${String(shortHour).padStart(2, '0')}:${String(shortMin).padStart(2, '0')} ${selectedShift === 'morning' ? 'AM' : 'PM'}`
                            : (selectedLang === 'si' ? 'ආරම්භක වේලාව තෝරන්න' : selectedLang === 'ta' ? 'தொடக்க நேரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Start Time')}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                      </TouchableOpacity>

                      {/* 🔥 Modern Computed Duration Card */}
                      {computedShortLeaveDisplay && !isTimeInvalidForShortLeave && (
                        <View style={styles.modernComputedCard}>
                          <View style={styles.modernComputedIcon}>
                            <Ionicons name="timer-outline" size={20} color="#1D4ED8" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.modernComputedHeader}>{t.durationTxt}</Text>
                            <Text style={styles.modernComputedValue}>{computedShortLeaveDisplay.string}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.88}
                disabled={applicationDisabled}
                style={[styles.applyBtn, { backgroundColor: selected?.color ?? '#7A1020' }, applicationDisabled && styles.applyBtnDisabled]}
                onPress={() => {
                  if (!selectedLeave) return;
                  const targetScreen = selectedLeave === 'medical' ? 'MedicalForm' : 'DigitalForm';
                  onNavigate(targetScreen, {
                    type: selectedLeave,
                    dayType: selectedLeave === 'short' ? 'short' : selectedLeave === 'medical' ? 'full' : dayType,
                    dateOption,
                    chosenCustomDate: selectedCustomDate,
                    chosenCustomDateIso: selectedCustomDateIso,
                    medicalDays: selectedLeave === 'medical' ? String(medicalDays) : '1',
                    shortHour,
                    shortMin,
                    shift: dayType === 'half' || selectedLeave === 'short' ? selectedShift : 'none',
                    medicalDateRange: selectedLeave === 'medical' ? medicalCalculatedRange : null,
                  });
                }}
              >
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={styles.applyBtnText}>{t.applyBtn}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.pastHistoryContainer}>
          <TouchableOpacity 
            activeOpacity={0.85}
            style={styles.pastHistoryHeaderBtn}
            onPress={() => {
              const nextOpen = !showCurrentHistory;
              setShowCurrentHistory(nextOpen);
              if (nextOpen && visibleCurrentHistory.length > 0) setSelectedRequestId(Number(visibleCurrentHistory[0].id));
            }}
          >
            <View style={styles.pastHistoryTitleRow}>
              <Ionicons name="time-outline" size={22} color="#7A1020" style={{ marginRight: 8 }} />
              <Text style={styles.mainTopicTitleText}>{currentYear} {t.currentHistoryTitle}</Text>
            </View>
            <Ionicons name={showCurrentHistory ? "chevron-up" : "chevron-down"} size={22} color="#7A1020" />
          </TouchableOpacity>

          {showCurrentHistory && (
            <View style={styles.pastHistoryDropdownBody}>
              {visibleCurrentHistory.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#94A3B8', paddingVertical: 10 }}>{t.noHistory}</Text>
              ) : visibleCurrentHistory.map((item) => {
                const statusNorm = normalizeStatus(item.status);
                const canDownload = statusNorm === 'approved' || statusNorm === 'rejected';

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedRequestId(selectedRequestId === Number(item.id) ? null : Number(item.id))}
                    style={[styles.historyCard, selectedRequestId === Number(item.id) && styles.selectedHistoryCard]}
                  >
                    <View style={styles.historyCardHeader}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.historyCatText}>{getTypeName(item.type)}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748B', marginTop: 3 }}>{getDurationName(item)}</Text>
                      </View>
                      <View style={[styles.statusBadge, normalizeStatus(item.status) === 'approved' ? styles.statusApproved : normalizeStatus(item.status) === 'rejected' ? styles.statusRejected : styles.statusPending]}>
                        <Text style={[styles.statusText, normalizeStatus(item.status) === 'approved' ? styles.statusTextApproved : normalizeStatus(item.status) === 'rejected' ? styles.statusTextRejected : styles.statusTextPending]}>{getStatusName(item.status)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyCardFooter}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.historyDateText}>{t.dateLabel}{item.date}</Text>
                    </View>

                    {selectedRequestId === Number(item.id) && (
                      <View style={styles.statusTimelineBox}>
                        <Text style={styles.timelineTitle}>{selectedLang === 'si' ? 'අනුමැති ප්‍රගතිය' : selectedLang === 'ta' ? 'அனுமதி முன்னேற்றம்' : 'Approval Progress'}</Text>
                        {getStatusProgress(item.status) === -1 ? (
                          <View style={styles.rejectedTimeline}>
                            <Ionicons name="close-circle" size={20} color="#B91C1C" />
                            <Text style={styles.rejectedTimelineText}>{getStatusName(item.status)}</Text>
                          </View>
                        ) : (
                          <View style={styles.timelineRow}>
                            {statusSteps.map((stepLabel, index) => {
                              const progress = getStatusProgress(item.status);
                              const stepNumber = index + 1;
                              const completed = stepNumber < progress;
                              const active = stepNumber === progress;
                              const finalApproved = normalizeStatus(item.status) === 'approved' && stepNumber === 3;
                              return (
                                <React.Fragment key={stepLabel}>
                                  <View style={styles.timelineStep}>
                                    <View style={[styles.timelineCircle, (completed || active || finalApproved) && styles.timelineCircleActive, completed && styles.timelineCircleDone]}>
                                      <Ionicons name={completed || finalApproved ? 'checkmark' : active ? 'hourglass-outline' : 'ellipse-outline'} size={12} color={(completed || active || finalApproved) ? '#FFFFFF' : '#94A3B8'} />
                                    </View>
                                    <Text style={[styles.timelineLabel, (completed || active || finalApproved) && styles.timelineLabelActive]} numberOfLines={3}>{stepLabel}</Text>
                                  </View>
                                  {index < statusSteps.length - 1 && (
                                    <View style={[styles.timelineLine, progress > stepNumber && styles.timelineLineActive]} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </View>
                        )}
                        <View style={styles.statusDetailRow}>
                          <Text style={styles.statusDetailLabel}>{selectedLang === 'si' ? 'වත්මන් තත්ත්වය:' : selectedLang === 'ta' ? 'தற்போதைய நிலை:' : 'Current status:'}</Text>
                          <Text style={styles.statusDetailValue}>{getStatusName(item.status)}</Text>
                        </View>
                        {!!item.reason && <Text style={styles.requestReasonText}>{String(item.reason).replace(/\s*\[SHIFT:(morning|evening)\]\s*/i, '')}</Text>}
                        {!!item.supervisorRemark && <Text style={styles.requestRemarkText}>{selectedLang === 'si' ? 'සටහන: ' : selectedLang === 'ta' ? 'குறிப்பு: ' : 'Remark: '}{item.supervisorRemark}</Text>}

                        {canDownload && (
                          <TouchableOpacity 
                            style={styles.downloadHistoryBtn} 
                            onPress={() => downloadHistoryPdf(item)}
                            disabled={isDownloading === Number(item.id)}
                          >
                            {isDownloading === Number(item.id) ? (
                              <ActivityIndicator size="small" color="#7A1020" />
                            ) : (
                              <Ionicons name="download-outline" size={18} color="#7A1020" />
                            )}
                            <Text style={styles.downloadHistoryText}>
                              {isDownloading === Number(item.id) ? t.generating : t.downloadDoc}
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 🔥 Past History Table */}
        <View style={[styles.pastHistoryContainer, { marginTop: 10 }]}>
          <TouchableOpacity activeOpacity={0.85} style={styles.pastHistoryHeaderBtn} onPress={() => setShowPastHistory(!showPastHistory)}>
            <View style={styles.pastHistoryTitleRow}>
              <Ionicons name="calendar-outline" size={22} color="#7A1020" style={{ marginRight: 8 }} />
              <Text style={styles.mainTopicTitleText}>{t.pastHistoryTitle}</Text>
            </View>
            <Ionicons name={showPastHistory ? "chevron-up" : "chevron-down"} size={22} color="#7A1020" />
          </TouchableOpacity>
          {showPastHistory && (
            <View style={styles.pastHistoryDropdownBodyTable}>
              {pastHistoryData.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#94A3B8', paddingVertical: 14 }}>{t.noPastHistory}</Text>
              ) : (
                <>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, { flex: 1.2, fontSize: 14, textAlign: 'left', paddingLeft: 8 }]}>{t.yearLabel}</Text>
                    <Text style={[styles.tableHeaderCell, { fontSize: 14, textAlign: 'left', paddingLeft: 8  }]}>{t.casualAbbr}</Text>
                    <Text style={[styles.tableHeaderCell, { fontSize: 14 }]}>{t.medicalAbbr}</Text>
                  </View>
                  {pastHistoryData.map((row) => (
                    <View key={row.year} style={styles.tableDataRow}>
                      <Text style={[styles.tableDataCell, styles.tableYearCell, { fontSize: 17 }]}>{row.year}</Text>
                      <Text style={[styles.tableDataCell, { color: '#B45309', fontSize: 16 ,textAlign: 'left', paddingLeft: 23 }]}>{row.casual}</Text>
                      <Text style={[styles.tableDataCell, { color: '#0F766E', fontSize: 16 }]}>{row.medical}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={activePicker === 'time'} transparent={true} animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContentCard}>
            <Text style={styles.sheetModalTitle}>
              {selectedLang === 'si' ? 'ආරම්භක වේලාව තෝරන්න' : selectedLang === 'ta' ? 'நேரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Start Time'}
            </Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {shortLeaveTimeSlots.map((slot: { h: number; m: number; label: string }, index: number) => {
                const isSelected = shortHour === slot.h && shortMin === slot.m;
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.sheetListItem, isSelected && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }]} 
                    onPress={() => { 
                      setShortHour(slot.h); 
                      setShortMin(slot.m); 
                      setActivePicker(null); 
                    }}
                  >
                    <Text style={[styles.sheetListItemText, isSelected && { color: '#1D4ED8', fontWeight: '900' }]}>{slot.label}</Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#1D4ED8" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setActivePicker(null)}>
              <Text style={styles.sheetCloseBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.normalCalendarCard}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity disabled={calendarMonth <= new Date(getToday().getFullYear(), getToday().getMonth() - 2, 1)} style={[styles.calendarNavBtn, calendarMonth <= new Date(getToday().getFullYear(), getToday().getMonth() - 2, 1) && { opacity: 0.35 }]} onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                <Ionicons name="chevron-back" size={21} color="#7A1020" />
              </TouchableOpacity>
              <Text style={styles.calendarModalTitle}>{calendarTitle}</Text>
              <TouchableOpacity
                disabled={calendarMonth >= new Date(getToday().getFullYear(), 11, 1)}
                style={[
                  styles.calendarNavBtn,
                  calendarMonth >= new Date(getToday().getFullYear(), 11, 1) && { opacity: 0.35 },
                ]}
                onPress={() => {
                  const nextMonth = new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1,
                    1
                  );

                  // Never allow the leave calendar to move beyond
                  // December of the current calendar year.
                  const maxMonth = new Date(
                    getToday().getFullYear(),
                    11,
                    1
                  );

                  if (nextMonth <= maxMonth) {
                    setCalendarMonth(nextMonth);
                  }
                }}
              >
                <Ionicons name="chevron-forward" size={21} color="#7A1020" />
              </TouchableOpacity>
            </View>
            <View style={styles.weekDayRow}>
              {calendarWeekDays.map((day, index) => (<Text key={`${day}-${index}`} style={styles.weekDayText}>{day}</Text>))}
            </View>
            <View style={styles.normalCalendarGrid}>
              {normalCalendarDays.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.normalCalendarCell} />;
                const isSelected = selectedCustomDateIso === day.iso;
                return (
                  <TouchableOpacity key={day.iso} disabled={day.isLocked} style={[styles.normalCalendarCell, isSelected && styles.selectedCalendarCell, day.isLocked && styles.disabledCalendarCell]} onPress={() => { resetApplicationFields(); setSelectedCustomDate(day.formatted); setSelectedCustomDateIso(day.iso); setDateOption('future'); setShowModal(false); }}>
                    <Text style={[styles.normalCalendarDayText, isSelected && { color: '#fff' }, day.isLocked && styles.disabledCalendarDayText]}>{day.day}</Text>
                    {day.isLocked && <View style={styles.calendarLockedDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.calendarLegendRow}>
              <View style={styles.calendarLegendItem}><View style={styles.calendarLockedDot} /><Text style={styles.calendarLegendText}>{t.weekendTxt} / {t.holidayTxt} / {t.alreadyApplied}</Text></View>
            </View>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.closeModalText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  formSectionLabel: { fontSize: 13, fontWeight: '800', color: '#4A5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  calendarModalTitle: { fontSize: 15, fontWeight: '900', color: '#1A2940', textTransform: 'uppercase', textAlign: 'center' },
  compactLockWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: '#FFF7D6', borderWidth: 1, borderColor: '#F4D77A', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, marginBottom: 10 },
  compactLockWarningText: { flex: 1, color: '#7C5700', fontSize: 11, lineHeight: 17, fontWeight: '800' },
  root: { flex: 1, backgroundColor: '#F4E8EA' }, 
  header: { backgroundColor: '#7A1020', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', shadowColor: '#5A0010', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 12 },
  hCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50 },
  hCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20 },
  headerTopRow: { marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtnPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  backText: { color: '#FFD54F', fontSize: 13, fontWeight: '800' },
  hTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },
  hMottoText: { fontSize: 11.5, fontWeight: '700', color: '#FFD54F', fontStyle: 'italic', marginTop: 6, opacity: 0.9, letterSpacing: 0.1 },
  scroll: { paddingHorizontal: 12, paddingTop: 18 }, 
  summarySection: { marginBottom: 20, paddingHorizontal: 4 },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center' },
  summaryAccent: { width: 5, height: 18, borderRadius: 2.5, backgroundColor: '#7A1020', marginRight: 8 },
  mainTopicTitleText: { fontSize: 18, fontWeight: '900', color: '#1A2940', letterSpacing: 0.2 },
  hSummaryRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  hPill: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1.5, borderColor: '#94A3B8' },
  hPillNum: { fontSize: 18, fontWeight: '900', color: '#1A2940' },
  hPillLabel: { color: '#1A2940', fontSize: 11, fontWeight: '800', marginTop: 3, textAlign: 'center' },
  dropdownSectionCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#94A3B8', shadowColor: '#1A2940', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, overflow: 'hidden', marginBottom: 20 },
  dropdownHeaderTouchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16 },
  unifiedFormBody: { paddingHorizontal: 12, paddingBottom: 20, gap: 14, backgroundColor: '#FCFDFE' },
  formStepCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#D7DEE8', padding: 16 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepNumber: { width: 26, minHeight: 26, borderRadius: 13, backgroundColor: '#7A1020', alignItems: 'center', justifyContent: 'center', marginRight: 9, paddingVertical: 2 },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  responsiveOptionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flexOptionBtn: { flexGrow: 1, flexBasis: 130, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 13, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 10 },
  optionText: { color: '#4A5568', fontSize: 14, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  selectedMaroonOption: { backgroundColor: '#7A1020', borderColor: '#7A1020' },
  selectedCasualOption: { backgroundColor: '#B45309', borderColor: '#B45309' },
  selectedShortOption: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  leaveTypeGrid: { gap: 10 },
  leaveTypeOption: { width: '100%', minHeight: 68, borderRadius: 16, borderWidth: 1.5, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 12 },
  leaveTypeIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  leaveTypeOptionText: { flex: 1, color: '#334155', fontSize: 14, lineHeight: 19, fontWeight: '900', textAlign: 'left', flexShrink: 1 },
  subFormBlock: { marginTop: 18 },
  normalCalendarCard: { width: '92%', maxWidth: 430, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, maxHeight: '85%' },
  calendarHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calendarNavBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF1F3', alignItems: 'center', justifyContent: 'center' },
  weekDayRow: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { width: '14.2857%', textAlign: 'center', color: '#64748B', fontSize: 11, fontWeight: '900' },
  normalCalendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  normalCalendarCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, position: 'relative' },
  normalCalendarDayText: { color: '#1A2940', fontSize: 14, fontWeight: '800' },
  selectedCalendarCell: { backgroundColor: '#7A1020' },
  disabledCalendarCell: { opacity: 0.35 },
  disabledCalendarDayText: { color: '#94A3B8' },
  calendarLockedDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D32F2F', marginTop: 2 },
  calendarLegendRow: { marginTop: 12, marginBottom: 6 },
  calendarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calendarLegendText: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  selectedHistoryCard: { borderWidth: 2, borderColor: '#7A1020', backgroundColor: '#FFF9FA' },
  statusTimelineBox: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  timelineTitle: { fontSize: 13, fontWeight: '900', color: '#1A2940', marginBottom: 14 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginBottom: 14 },
  timelineStep: { flex: 1, alignItems: 'center', minWidth: 0 },
  timelineCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  timelineCircleActive: { backgroundColor: '#B45309' },
  timelineCircleDone: { backgroundColor: '#15803D' },
  timelineLabel: { fontSize: 10, lineHeight: 14, color: '#94A3B8', fontWeight: '700', textAlign: 'center' },
  timelineLabelActive: { color: '#334155', fontWeight: '900' },
  timelineLine: { height: 3, flex: 0.45, backgroundColor: '#E2E8F0', marginTop: 13, borderRadius: 2 },
  timelineLineActive: { backgroundColor: '#15803D' },
  rejectedTimeline: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 12 },
  rejectedTimelineText: { color: '#B91C1C', fontWeight: '900', flex: 1 },
  statusDetailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  statusDetailLabel: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  statusDetailValue: { fontSize: 12, color: '#7A1020', fontWeight: '900' },
  requestReasonText: { marginTop: 10, fontSize: 12, lineHeight: 18, color: '#334155', fontStyle: 'italic' },
  requestRemarkText: { marginTop: 8, fontSize: 12, lineHeight: 18, color: '#B45309', fontWeight: '700' },
  toggleTextOn: { color: '#fff' },
  lockedTodayBtn: { backgroundColor: '#CBD5E1', borderColor: '#94A3B8', opacity: 0.8 },
  lockedTodayText: { color: '#64748B', textDecorationLine: 'line-through', fontWeight: '800', fontSize: 15 },
  digitalClockContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 12, borderWidth: 1, borderColor: '#94A3B8', marginTop: 4, marginBottom: 12 },
  clockDisplayBox: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#94A3B8', borderRadius: 14, width: 75, height: 75, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  clockDisplayBoxSelected: { borderColor: '#1D4ED8', backgroundColor: '#EFF6FF' },
  clockDisplayText: { fontSize: 28, fontWeight: '900', color: '#334155' },
  clockDisplayTextSelected: { color: '#1D4ED8' },
  clockBoxLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginTop: 1 },
  clockDividerColon: { fontSize: 32, fontWeight: '900', color: '#64748B', marginHorizontal: 12, bottom: 4 },
  clockAmPmBadge: { marginLeft: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
  clockAmPmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContentCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32 },
  sheetModalTitle: { fontSize: 14, fontWeight: '900', color: '#1A2940', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 },
  sheetListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  sheetListItemText: { fontSize: 16, fontWeight: '700', color: '#334155' },
  sheetCloseBtn: { marginTop: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  sheetCloseBtnText: { fontSize: 14, fontWeight: '800', color: '#4A5568' },
  computedDisplayCard: { backgroundColor: '#F7FAFC', borderRadius: 16, padding: 14, marginTop: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: '#94A3B8' },
  computedRangeHeader: { fontSize: 11, fontWeight: '800', color: '#718096', textTransform: 'uppercase' },
  computedRangeValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  dayPickerGridRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  dayPickerCellBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#94A3B8', backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  dayPickerCellText: { fontSize: 16, fontWeight: '900', color: '#4A5568' },
  warningText: { color: '#DC2626', fontSize: 12, fontWeight: '800', marginTop: 6, marginBottom: 14, lineHeight: 18 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 56, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 4, marginTop: 16, marginBottom: 4 },
  applyBtnDisabled: { backgroundColor: '#94A3B8', opacity: 0.55, shadowOpacity: 0, elevation: 0 },
  applyBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  pastHistoryContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#94A3B8', shadowColor: '#1A2940', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, overflow: 'hidden', marginBottom: 10 },
  pastHistoryHeaderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16, backgroundColor: '#FFFFFF' },
  pastHistoryTitleRow: { flexDirection: 'row', alignItems: 'center' },
  pastHistoryDropdownBody: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 22, backgroundColor: '#FCFDFE', borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyCatText: { fontSize: 14, fontWeight: '900', color: '#1A2940' },
  historyCardFooter: { flexDirection: 'row', alignItems: 'center' },
  historyDateText: { fontSize: 12, color: '#64748B', fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusPending: { backgroundColor: '#FEF08A' },
  statusApproved: { backgroundColor: '#BBF7D0' },
  statusRejected: { backgroundColor: '#FECACA' },
  statusText: { fontSize: 11, fontWeight: '900' },
  statusTextPending: { color: '#A16207' },
  statusTextApproved: { color: '#166534' },
  statusTextRejected: { color: '#991B1B' },
  closeModalBtn: { marginTop: 18, paddingVertical: 14, alignItems: 'center', backgroundColor: '#EDF2F7', borderRadius: 12 },
  closeModalText: { fontSize: 14, fontWeight: '800', color: '#4A5568' },
  downloadHistoryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingVertical: 12, backgroundColor: '#FFF1F3', borderRadius: 12, borderWidth: 1, borderColor: '#FDA4AF' },
  downloadHistoryText: { color: '#7A1020', fontSize: 13, fontWeight: '800' },
  // 🔥 New Modern Time Picker Styles
  modernTimePickerCard: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 20, padding: 16, marginTop: 4, marginBottom: 12 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  timeSlotBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 16, width: 75, height: 75, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  timeSlotBtnActive: { borderColor: '#1D4ED8', backgroundColor: '#EFF6FF' },
  timeSlotValue: { fontSize: 26, fontWeight: '900', color: '#475569' },
  timeSlotValueActive: { color: '#1D4ED8' },
  timeSlotLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginTop: 2, textTransform: 'uppercase' },
  timeSlotLabelActive: { color: '#3B82F6' },
  timeColonContainer: { paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  timeColonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94A3B8' },
  ampmBadgeModern: { marginLeft: 16, backgroundColor: '#1E293B', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  ampmBadgeTextModern: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  // 🔥 New Modern Dropdown Styles
  timeDropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 16, padding: 8, paddingRight: 16 },
  timeDropdownIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  timeDropdownText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#64748B' },
  
  modernComputedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#BFDBFE', borderLeftWidth: 5, borderLeftColor: '#1D4ED8' },
  modernComputedIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  modernComputedHeader: { fontSize: 10, fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', marginBottom: 2 },
  modernComputedValue: { fontSize: 15, fontWeight: '900', color: '#1E3A8A' },
  
  
  pastHistoryDropdownBodyTable: { paddingHorizontal: 16, paddingBottom: 22, backgroundColor: '#FCFDFE', borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  tableHeaderRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1.8, borderBottomColor: '#94A3B8', marginTop: 6 },
  tableHeaderCell: { flex: 1, fontWeight: '900', color: '#4A5568', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableDataRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1.2, borderBottomColor: '#94A3B8', alignItems: 'center' },
  tableDataCell: { flex: 1, fontWeight: '800', textAlign: 'center' },
  tableYearCell: { color: '#1A2940', fontWeight: '900', textAlign: 'left', paddingLeft: 8 },
});