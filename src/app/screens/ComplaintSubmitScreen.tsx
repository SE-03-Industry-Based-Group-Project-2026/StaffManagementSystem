// app/screens/ComplaintSubmitScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppText from '../AppText';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { showComplaintNotification } from '../../lib/notificationService';
import { useFont } from '../FontContext';

type Language = 'si' | 'en' | 'ta';
type Category = 'damaged' | 'shortage' | 'other';
type Step = 1 | 2; 

interface Props {
  selectedLang?: Language;
  onNavigate: (screen: string, params?: any) => void;
  onBack?: () => void;
  t?: any;
  route?: any;
}
interface CurrentUser {
  id: string;
  fullName: string;
  designation: string;
  departmentId: number | null;
  departmentName: string;
}

interface Officer {
  id: string;
  fullName: string;
  designation: string;
  avatarUrl: string | null;
  roleName: string;
}

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number | null;
  fileType: 'photo' | 'document';
}

interface HistoryItem {
  id: number;
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

const STORAGE_BUCKET = 'complaint-files';

const L = {
  si: {
    headerTitle: 'පැමිණිලි කළමනාකරණය',
    back: 'ආපසු',

    step1Title: 'නව පැමිණිල්ලක් / ඉල්ලීමක්',
    step1Help: 'පැමිණිලි වර්ගයක් තෝරා හේතුව දක්වන්න.',
    
    // 🔥 මෙන්න මේකයි අඩුවෙලා තිබ්බේ
    categoryLabel: 'පැමිණිලි වර්ගය',

    damaged: 'කැඩුණු / බිඳුණු භාණ්ඩ',
    shortage: 'භාණ්ඩ හිඟයක් / ඉල්ලීමක්',
    other: 'වෙනත් පැමිණිල්ලක්',

    itemTypeLabel: 'භාණ්ඩ වර්ගය (විකල්පයි)',
    itemTypePlaceholder: 'උදා: පුටුව, පරිගණකය...',
    damageExtentLabel: 'කැඩී ඇති ප්‍රමාණය (විකල්පයි)',
    damageExtentPlaceholder: 'උදා: කකුලක් කැඩී ඇත...',
    requestedQtyLabel: 'අවශ්‍ය ප්‍රමාණය (විකල්පයි)',
    requestedQtyPlaceholder: 'උදා: 5 ක්...',

    detailsLabel: 'ගැටලුව පිළිබඳ විස්තර',
    detailsPlaceholder: 'ගැටලුව හෝ ඉල්ලීම පැහැදිලිව සඳහන් කරන්න...',
    detailsRequired: 'විස්තරය අනිවාර්යයි.',

    addPhotos: 'ඡායාරූප එක් කරන්න',
    addDocuments: 'ලේඛන එක් කරන්න',
    optional: 'විකල්පයි',

    next: 'ඉදිරියට යන්න',

    historyTitle: 'මෑත පැමිණිලි',
    historyHelp: 'අවසන් පැමිණිලි 5 පමණක් පෙන්වයි. විස්තර බැලීමට ඒ මත ක්ලික් කරන්න.',
    noHistory: 'පෙර පැමිණිලි නොමැත.',

    previewTitle: 'පැමිණිලි අයදුම්පත්‍රය',
    senderDetails: 'යවන්නාගේ විස්තර',
    name: 'නම',
    designation: 'තනතුර',
    department: 'අංශය',
    category: 'පැමිණිලි වර්ගය',
    details: 'විස්තර',
    recipients: 'යොමු කරන්නේ',
    attachments: 'ඇමුණුම්',

    submit: 'ඉල්ලීම ඉදිරිපත් කරන්න',
    submitting: 'යොමු කරමින්...',
    successTitle: 'සාර්ථකයි!',
    successMessage: 'ඔබගේ පැමිණිල්ල සාර්ථකව යොමු කරන ලදී.',
    submitError: 'පැමිණිල්ල යොමු කිරීමට නොහැකි විය.',
    loadError: 'දත්ත ලබාගත නොහැකි විය.',
    loading: 'දත්ත ලබාගනිමින්...',
    error: 'දෝෂයක්',

    statusOpen: 'විවෘතයි',
    statusPending: 'සලකා බලමින්',
    statusResolved: 'විසඳා ඇත',
    statusRejected: 'ප්‍රතික්ෂේප කර ඇත',

    chooseCategoryFirst: 'පළමුව පැමිණිලි වර්ගයක් තෝරන්න.',
    enterDetails: 'කරුණාකර ගැටලුව පිළිබඳ විස්තර ඇතුළත් කරන්න.',

    photoText: 'ඡායාරූප',
    docText: 'ලේඛන',
    deptHeadFallback: 'අංශ ප්‍රධානී',
    galleryPermission: 'Gallery වෙත පිවිසීමට අවසර ලබා දීම අනිවාර්ය වේ.',
    photoError: 'ඡායාරූප තෝරාගැනීමට නොහැකි විය.',
    docError: 'ලේඛන තෝරාගැනීමට නොහැකි විය.',
    ok: 'හරි'
  },

  en: {
    headerTitle: 'Complaint Management',
    back: 'Back',

    step1Title: 'New Complaint / Request',
    step1Help: 'Select a category and choose a reason.',
    
    // 🔥 මෙන්න මේකයි අඩුවෙලා තිබ්බේ
    categoryLabel: 'Complaint Category',

    damaged: 'Damaged Items',
    shortage: 'Item Shortage / Request',
    other: 'Other Complaint',

    itemTypeLabel: 'Item Type (Optional)',
    itemTypePlaceholder: 'e.g., Chair, Computer...',
    damageExtentLabel: 'Extent of Damage (Optional)',
    damageExtentPlaceholder: 'e.g., One leg is broken...',
    requestedQtyLabel: 'Required Quantity (Optional)',
    requestedQtyPlaceholder: 'e.g., 5 units...',

    detailsLabel: 'Problem Details',
    detailsPlaceholder: 'Clearly explain the problem or request...',
    detailsRequired: 'Details are required.',

    addPhotos: 'Add Photos',
    addDocuments: 'Add Documents',
    optional: 'Optional',

    next: 'Continue',

    historyTitle: 'Recent Complaints',
    historyHelp: 'Only the latest 5 complaints are shown. Click to view.',
    noHistory: 'No previous complaints found.',

    previewTitle: 'Complaint Form',
    senderDetails: 'Sender Details',
    name: 'Name',
    designation: 'Designation',
    department: 'Department',
    category: 'Category',
    details: 'Details',
    recipients: 'Recipient',
    attachments: 'Attachments',

    submit: 'Submit Complaint',
    submitting: 'Submitting...',
    successTitle: 'Success!',
    successMessage: 'Your complaint was submitted successfully.',
    submitError: 'Unable to submit the complaint.',
    loadError: 'Unable to load complaint data.',
    loading: 'Loading...',
    error: 'Error',

    statusOpen: 'Open',
    statusPending: 'Pending',
    statusResolved: 'Resolved',
    statusRejected: 'Rejected',

    chooseCategoryFirst: 'Select a complaint category first.',
    enterDetails: 'Please enter the problem details.',

    photoText: 'photo(s)',
    docText: 'document(s)',
    deptHeadFallback: 'Department Head',
    galleryPermission: 'Gallery permission is required.',
    photoError: 'Unable to select photos.',
    docError: 'Unable to select documents.',
    ok: 'OK'
  },

  ta: {
    headerTitle: 'புகார் மேலாண்மை',
    back: 'பின்னே',

    step1Title: 'புதிய புகார் / கோரிக்கை',
    step1Help: 'வகையையும் காரணத்தையும் தேர்வு செய்யவும்.',
    
    // 🔥 මෙන්න මේකයි අඩුවෙලා තිබ්බේ
    categoryLabel: 'புகார் வகை',

    damaged: 'சேதமடைந்த பொருட்கள்',
    shortage: 'பொருள் பற்றாக்குறை / கோரிக்கை',
    other: 'பிற புகார்',

    itemTypeLabel: 'பொருள் வகை (விருப்பம்)',
    itemTypePlaceholder: 'உ.ம்: நாற்காலி, கணினி...',
    damageExtentLabel: 'சேத அளவு (விருப்பம்)',
    damageExtentPlaceholder: 'உ.ம்: ஒரு கால் உடைந்துள்ளது...',
    requestedQtyLabel: 'தேவையான அளவு (விருப்பம்)',
    requestedQtyPlaceholder: 'உ.ம்: 5...',

    detailsLabel: 'பிரச்சினை விவரங்கள்',
    detailsPlaceholder: 'பிரச்சினையை தெளிவாக எழுதவும்...',
    detailsRequired: 'விவரங்கள் கட்டாயம்.',

    addPhotos: 'புகைப்படங்கள்',
    addDocuments: 'ஆவணங்கள்',
    optional: 'விருப்பம்',

    next: 'தொடரவும்',

    historyTitle: 'சமீபத்திய புகார்கள்',
    historyHelp: 'கடைசி 5 புகார்கள் மட்டும் காட்டப்படும். பார்க்க கிளிக் செய்யவும்.',
    noHistory: 'முந்தைய புகார்கள் இல்லை.',

    previewTitle: 'புகார் படிவம்',
    senderDetails: 'அனுப்புநர் விவரங்கள்',
    name: 'பெயர்',
    designation: 'பதவி',
    department: 'துறை',
    category: 'வகை',
    details: 'விவரங்கள்',
    recipients: 'பெறுநர்',
    attachments: 'இணைப்புகள்',

    submit: 'சமர்ப்பிக்கவும்',
    submitting: 'சமர்ப்பிக்கிறது...',
    successTitle: 'வெற்றி!',
    successMessage: 'புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
    submitError: 'புகாரை சமர்ப்பிக்க முடியவில்லை.',
    loadError: 'தரவை ஏற்ற முடியவில்லை.',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',

    statusOpen: 'திறந்தது',
    statusPending: 'நிலுவையில்',
    statusResolved: 'தீர்க்கப்பட்டது',
    statusRejected: 'நிராகரிக்கப்பட்டது',

    chooseCategoryFirst: 'முதலில் ஒரு வகையைத் தேர்வு செய்யவும்.',
    enterDetails: 'விவரங்களை உள்ளிடவும்.',

    photoText: 'புகைப்படங்கள்',
    docText: 'ஆவணங்கள்',
    deptHeadFallback: 'திணைக்களத் தலைவர்',
    galleryPermission: 'கேலரி அனுமதி தேவை.',
    photoError: 'புகைப்படங்களைத் தேர்ந்தெடுக்க முடியவில்லை.',
    docError: 'ஆவணங்களைத் தேர்ந்தெடுக்க முடியவில்லை.',
    ok: 'சரி'
  },
};

const getLocalizedValue = (
  language: Language,
  en?: string | null,
  si?: string | null,
  ta?: string | null,
) => {
  if (language === 'si') return si || en || '';
  if (language === 'ta') return ta || en || '';
  return en || '';
};

const getCategoryText = (category: Category | string, t: any) => {
  if (category === 'damaged') return t.damaged;
  if (category === 'shortage') return t.shortage;
  return t.other;
};

const getStatusText = (status: string, t: any) => {
  const value = String(status || '').toLowerCase();
  if (value === 'resolved' || value === 'closed') return t.statusResolved;
  if (value === 'rejected') return t.statusRejected;
  if (value === 'pending' || value === 'in progress') return t.statusPending;
  return t.statusOpen;
};

const getStatusStyle = (status: string) => {
  const value = String(status || '').toLowerCase();
  if (value === 'resolved' || value === 'closed') return { backgroundColor: '#DCFCE7', color: '#166534' };
  if (value === 'rejected') return { backgroundColor: '#FEE2E2', color: '#991B1B' };
  if (value === 'pending' || value === 'in progress') return { backgroundColor: '#FEF3C7', color: '#92400E' };
  return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
};

const safeFileName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');

const formatDateOnly = (dateString: string) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ComplaintSubmitScreen({
  selectedLang = 'si',
  onNavigate,
  onBack,
  t: parentT,
  route,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const { font, fontSize } = useFont();

  const compact = width < 370 || fontScale > 1.15;

  const t = useMemo(() => ({ ...L[selectedLang], ...(parentT || {}) }), [selectedLang, parentT]);
  const styles = useMemo(() => createStyles(font, compact), [font, fontSize, compact]);

  const [step, setStep] = useState<Step>(1);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [itemType, setItemType] = useState('');
  const [damageExtent, setDamageExtent] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [rawDescription, setRawDescription] = useState('');

  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [documents, setDocuments] = useState<PickedFile[]>([]);
  
  const [departmentHead, setDepartmentHead] = useState<Officer | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [step, fadeAnim]);

  useEffect(() => { loadInitialData(); }, [selectedLang]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Authenticated user was not found.');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select(`
          id, 
          title,
          full_name, 
          full_name_si, 
          full_name_ta, 
          department_id, 
          departments (department_name, department_name_si, department_name_ta),
          designations (designation_en, designation_si, designation_ta)
        `)
        .eq('auth_id', user.id).single();

      if (profileError) throw profileError;

      const department = profile?.departments as any;
      const desig = profile?.designations as any; 

      let formattedTitle = '';
      if (profile.title) {
        const tText = profile.title.trim();
        formattedTitle = tText.endsWith('.') ? `${tText} ` : `${tText}. `;
      }
      const baseName = getLocalizedValue(selectedLang, profile.full_name, profile.full_name_si, profile.full_name_ta);
      const finalName = `${formattedTitle}${baseName}`;
      
      const userProfile: CurrentUser = {
        id: profile.id,
        fullName: finalName,
        designation: getLocalizedValue(selectedLang, desig?.designation_en, desig?.designation_si, desig?.designation_ta) || '',
        departmentId: profile.department_id || null,
        departmentName: getLocalizedValue(selectedLang, department?.department_name, department?.department_name_si, department?.department_name_ta),
      };

      setCurrentUser(userProfile);
      
      await Promise.all([loadDepartmentHead(userProfile), loadRecentHistory(userProfile.id)]);
    } catch (error: any) {
      console.error('Complaint initial load error:', error);
      Alert.alert(t.error, `${t.loadError}\n${error?.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartmentHead = async (userProfile: CurrentUser) => {
    try {
      if (!userProfile.departmentId) return;

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', 'Department Head')
        .single();

      if (roleError || !roleData) return; 

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id, full_name, full_name_si, full_name_ta, avatar_url,
          designations (designation_en, designation_si, designation_ta)
        `)
        .eq('department_id', userProfile.departmentId)
        .eq('role_id', roleData.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (userData) {
        const desig = userData.designations as any;
        setDepartmentHead({
          id: userData.id,
          fullName: getLocalizedValue(selectedLang, userData.full_name, userData.full_name_si, userData.full_name_ta),
          designation: getLocalizedValue(selectedLang, desig?.designation_en, desig?.designation_si, desig?.designation_ta) || t.deptHeadFallback,
          avatarUrl: userData.avatar_url || null,
          roleName: t.deptHeadFallback,
        });
      }
    } catch (e) {
      console.warn('Error loading department head:', e);
    }
  };

  const loadRecentHistory = async (userId: string) => {
    // 🔥 description_en, description_si, description_ta තුනම Database එකෙන් ගන්නවා
    const { data, error } = await supabase
      .from('complaints')
      .select(`id, category, description, description_en, description_si, description_ta, status, created_at`)
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(5);

    if (error) throw error;
    setHistory((data || []).map((item: any) => ({
      id: item.id, 
      category: item.category || 'other', 
      // 🔥 භාෂාවට අනුව Description එක හරියටම පෙන්නනවා (Fallback: description)
      description: getLocalizedValue(selectedLang, item.description_en, item.description_si, item.description_ta) || item.description || '', 
      status: item.status || 'Open', 
      createdAt: item.created_at,
    })));
  };

  const pickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert(t.error, t.galleryPermission); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.8 });
      if (result.canceled) return;
      const selected = result.assets.map((asset, index) => ({ uri: asset.uri, name: asset.fileName || `complaint-photo-${Date.now()}-${index}.jpg`, mimeType: asset.mimeType || 'image/jpeg', size: asset.fileSize, fileType: 'photo' as const }));
      setPhotos((current) => [...current, ...selected].slice(0, 5));
    } catch (error: any) { Alert.alert(t.error, error?.message || t.photoError); }
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'], multiple: true, copyToCacheDirectory: true });
      if (result.canceled) return;
      const selected = result.assets.map((asset) => ({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType || 'application/octet-stream', size: asset.size, fileType: 'document' as const }));
      setDocuments((current) => [...current, ...selected].slice(0, 5));
    } catch (error: any) { Alert.alert(t.error, error?.message || t.docError); }
  };

  const handleNextFromStep1 = () => {
    if (!category) { Alert.alert(t.error, t.chooseCategoryFirst); return; }
    if (!rawDescription.trim()) { Alert.alert(t.error, t.enterDetails); return; }
    setStep(2); 
  };

  const uploadFile = async (file: PickedFile, complaintId: number, userId: string) => {
    const response = await fetch(file.uri);
    const buffer = await response.arrayBuffer();
    const storagePath = `${userId}/${complaintId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, { contentType: file.mimeType, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    return {
      complaint_id: complaintId, uploaded_by: userId, file_name: file.name, file_type: file.fileType, mime_type: file.mimeType, storage_path: storagePath, public_url: publicUrlData.publicUrl, file_size: file.size || null, created_at: new Date().toISOString(),
    };
  };

  // 🔥 Description එක භාෂාවට අදාළව ජනනය කරන Function එක
  const generateDescription = (lang: Language) => {
    let text = '';
    const localizedT = L[lang];
    const lblItemType = localizedT.itemTypeLabel.replace(' (විකල්පයි)', '').replace(' (Optional)', '').replace(' (விருப்பம்)', '');
    const lblDamage = localizedT.damageExtentLabel.replace(' (විකල්පයි)', '').replace(' (Optional)', '').replace(' (விருப்பம்)', '');
    const lblQty = localizedT.requestedQtyLabel.replace(' (විකල්පයි)', '').replace(' (Optional)', '').replace(' (விருப்பம்)', '');

    if (category === 'damaged') {
      if (itemType.trim()) text += `[${lblItemType}: ${itemType.trim()}]\n`;
      if (damageExtent.trim()) text += `[${lblDamage}: ${damageExtent.trim()}]\n`;
    } else if (category === 'shortage') {
      if (itemType.trim()) text += `[${lblItemType}: ${itemType.trim()}]\n`;
      if (requestedQuantity.trim()) text += `[${lblQty}: ${requestedQuantity.trim()}]\n`;
    }
    
    if (text.length > 0) text += `\n`;
    text += rawDescription.trim();
    return text;
  };

  const submitComplaint = async () => {
    if (!currentUser || !category) { Alert.alert(t.error, t.loadError); return; }

    let complaintId: number | null = null;
    const uploadedPaths: string[] = [];

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      
      // 🔥 භාෂා 3ටම වෙන වෙනම Description එක හදාගන්නවා
      const finalDescEn = generateDescription('en');
      const finalDescSi = generateDescription('si');
      const finalDescTa = generateDescription('ta');

      const titleEn = category === 'damaged' ? L.en.damaged : category === 'shortage' ? L.en.shortage : L.en.other;
      const titleSi = category === 'damaged' ? L.si.damaged : category === 'shortage' ? L.si.shortage : L.si.other;
      const titleTa = category === 'damaged' ? L.ta.damaged : category === 'shortage' ? L.ta.shortage : L.ta.other;
      const mainTitle = getCategoryText(category, t); 

      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          user_id: currentUser.id,
          department_id: currentUser.departmentId,
          title: mainTitle, 
          description: generateDescription(selectedLang), 
          status: 'Open',
          current_stage: 'Department Head', 
          assigned_supervisor_id: departmentHead ? departmentHead.id : null, 
          category,
          title_en: titleEn, 
          title_si: titleSi, 
          title_ta: titleTa, 
          // 🔥 Database එකේ Column 3ටම සේව් කරනවා
          description_en: finalDescEn,
          description_si: finalDescSi,
          description_ta: finalDescTa,
          created_at: now,
          updated_at: now,
        })
        .select('id').single();

      if (complaintError) throw complaintError;
      complaintId = complaint.id;

      if (departmentHead) {
        const recipientRows = [{ complaint_id: complaint.id, recipient_id: departmentHead.id, created_at: now }];
        const { error: recipientError } = await supabase.from('complaint_recipients').insert(recipientRows);
        if (recipientError) throw recipientError;
      }

      const attachmentRows: any[] = [];
      for (const file of [...photos, ...documents]) {
        const uploaded = await uploadFile(file, complaint.id, currentUser.id);
        uploadedPaths.push(uploaded.storage_path);
        attachmentRows.push(uploaded);
      }

      if (attachmentRows.length > 0) {
        const { error: attachmentError } = await supabase.from('complaint_attachments').insert(attachmentRows);
        if (attachmentError) throw attachmentError;

        const firstAttachment = attachmentRows[0];
        const { error: updateError } = await supabase.from('complaints').update({
          attachment_url: firstAttachment?.public_url || null,
          updated_at: new Date().toISOString(),
        }).eq('id', complaint.id);
        if (updateError) throw updateError;
      }

      const notificationTitleEn = 'New Complaint';
      const notificationTitleSi = 'නව පැමිණිල්ලක්';
      const notificationTitleTa = 'புதிய புகார்';

      const notificationMessageEn = `${currentUser.fullName} submitted a new complaint.`;
      const notificationMessageSi = `${currentUser.fullName} විසින් නව පැමිණිල්ලක් යොමු කර ඇත.`;
      const notificationMessageTa = `${currentUser.fullName} புதிய புகாரை சமர்ப்பித்துள்ளார்.`;

      const notificationTitle = selectedLang === 'si' ? notificationTitleSi : selectedLang === 'ta' ? notificationTitleTa : notificationTitleEn;
      const notificationMessage = selectedLang === 'si' ? notificationMessageSi : selectedLang === 'ta' ? notificationMessageTa : notificationMessageEn;

      if (departmentHead) {
        const notificationRow = {
          user_id: departmentHead.id,
          title: notificationTitle,
          message: notificationMessage,
          title_en: notificationTitleEn,
          title_si: notificationTitleSi,
          title_ta: notificationTitleTa,
          message_en: notificationMessageEn,
          message_si: notificationMessageSi,
          message_ta: notificationMessageTa,
          is_read: false,
          is_auto_generated: true,
          notification_type: 'Complaint',
          related_entity: 'complaints',
          related_id: complaint.id,
          created_by: currentUser.id,
          created_at: new Date().toISOString(),
        };

        const { error: notificationError } = await supabase.from('notifications').insert([notificationRow]);
        if (notificationError) console.warn('Complaint notification insert error:', notificationError.message);

        const { data: recipientUser } = await supabase.from('users').select('push_token').eq('id', departmentHead.id).single();
        
        if (recipientUser && recipientUser.push_token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Accept-encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipientUser.push_token,
              sound: 'default',
              title: notificationTitle,
              body: notificationMessage,
              data: { complaintId: complaint.id },
            }),
          });
        }
      }

      await showComplaintNotification({ title: t.successTitle, body: t.successMessage, complaintId: complaint.id });
      await loadRecentHistory(currentUser.id);

      Alert.alert(t.successTitle, t.successMessage, [{
        text: t.ok, onPress: () => {
          setStep(1); setCategory(null); setItemType(''); setDamageExtent(''); setRequestedQuantity(''); setRawDescription(''); setPhotos([]); setDocuments([]); 
        },
      }]);
    } catch (error: any) {
      console.error('Complaint submit error:', error);
      if (uploadedPaths.length > 0) { await supabase.storage.from(STORAGE_BUCKET).remove(uploadedPaths); }
      if (complaintId) { await supabase.from('complaints').delete().eq('id', complaintId); }
      Alert.alert(t.error, `${t.submitError}\n${error?.message || ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 2) { setStep(1); return; }
    if (onBack) { onBack(); } else { onNavigate('Home'); }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4E8EA" />
        <ActivityIndicator size="large" color="#7A1020" />
        <AppText style={styles.loadingText}>{t.loading}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7A1020" translucent={false} />
      
      <View style={styles.header}>
        <View style={styles.headerCircle} pointerEvents="none" />
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={font(17)} color="#FFD54F" />
          <AppText style={styles.backText}>{t.back}</AppText>
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>{t.headerTitle}</AppText>
        
        <View style={styles.stepIndicator}>
          {[1, 2].map((number) => (
            <View key={number} style={[styles.stepDot, step >= number && styles.stepDotActive]}>
              <AppText style={[styles.stepDotText, step >= number && styles.stepDotTextActive]}>{number}</AppText>
            </View>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            {step === 1 && (
              <>
                <View style={styles.card}>
                  <AppText style={styles.sectionTitle}>{t.step1Title}</AppText>
                  <AppText style={styles.sectionHelp}>{t.step1Help}</AppText>

                  {/* 🔥 Hardcode එක අයින් කරලා t.categoryLabel එක පාවිච්චි කළා */}
                  <AppText style={styles.inputLabel}>{t.categoryLabel} <AppText style={styles.required}>*</AppText></AppText>
                  <View style={styles.categoryList}>
                    {(['damaged', 'shortage', 'other'] as Category[]).map((item) => {
                      const selected = category === item;
                      return (
                        <TouchableOpacity key={item} style={[styles.categoryCard, selected && styles.categoryCardSelected]} onPress={() => { setCategory(item); }}>
                          <View style={styles.categoryIcon}>
                            <Ionicons name={item === 'damaged' ? 'construct-outline' : item === 'shortage' ? 'cube-outline' : 'chatbubbles-outline'} size={font(23)} color={selected ? '#7A1020' : '#64748B'} />
                          </View>
                          <AppText style={[styles.categoryText, selected && styles.categoryTextSelected]}>{getCategoryText(item, t)}</AppText>
                          <Ionicons name="chevron-forward" size={font(19)} color="#94A3B8" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {category === 'damaged' && (
                    <>
                      <AppText style={styles.inputLabel}>{t.itemTypeLabel}</AppText>
                      <TextInput allowFontScaling={false} value={itemType} onChangeText={setItemType} placeholder={t.itemTypePlaceholder} placeholderTextColor="#94A3B8" style={styles.singleLineInput} />

                      <AppText style={styles.inputLabel}>{t.damageExtentLabel}</AppText>
                      <TextInput allowFontScaling={false} value={damageExtent} onChangeText={setDamageExtent} placeholder={t.damageExtentPlaceholder} placeholderTextColor="#94A3B8" style={styles.singleLineInput} />
                    </>
                  )}

                  {category === 'shortage' && (
                    <>
                      <AppText style={styles.inputLabel}>{t.itemTypeLabel}</AppText>
                      <TextInput allowFontScaling={false} value={itemType} onChangeText={setItemType} placeholder={t.itemTypePlaceholder} placeholderTextColor="#94A3B8" style={styles.singleLineInput} />

                      <AppText style={styles.inputLabel}>{t.requestedQtyLabel}</AppText>
                      <TextInput allowFontScaling={false} value={requestedQuantity} onChangeText={setRequestedQuantity} placeholder={t.requestedQtyPlaceholder} placeholderTextColor="#94A3B8" style={styles.singleLineInput} />
                    </>
                  )}

                  {category && (
                    <>
                      <AppText style={styles.inputLabel}>{t.detailsLabel} <AppText style={styles.required}>*</AppText></AppText>
                      <TextInput allowFontScaling={false} value={rawDescription} onChangeText={setRawDescription} placeholder={t.detailsPlaceholder} placeholderTextColor="#94A3B8" multiline textAlignVertical="top" style={styles.descriptionInput} />
                      
                      <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1.5, borderTopColor: '#E2E8F0', borderStyle: 'dashed' }}>
                        <AppText style={[styles.inputLabel, { marginTop: 0 }]}>{t.attachments} <AppText style={styles.optionalText}>({t.optional})</AppText></AppText>
                        
                        <View style={styles.uploadContainer}>
                          <TouchableOpacity style={styles.uploadButton} onPress={pickPhotos}>
                            <Ionicons name="images-outline" size={font(22)} color="#7A1020" /><AppText style={styles.uploadText}>{t.addPhotos}</AppText>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.uploadButton} onPress={pickDocuments}>
                            <Ionicons name="document-attach-outline" size={font(22)} color="#7A1020" /><AppText style={styles.uploadText}>{t.addDocuments}</AppText>
                          </TouchableOpacity>
                        </View>

                        {photos.map((file, index) => (
                          <View key={`${file.uri}-${index}`} style={styles.fileRow}>
                            <Image source={{ uri: file.uri }} style={styles.filePreview} />
                            <AppText numberOfLines={1} style={styles.fileName}>{file.name}</AppText>
                            <TouchableOpacity onPress={() => setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Ionicons name="close-circle" size={font(22)} color="#DC2626" /></TouchableOpacity>
                          </View>
                        ))}

                        {documents.map((file, index) => (
                          <View key={`${file.uri}-${index}`} style={styles.fileRow}>
                            <View style={styles.documentIcon}><Ionicons name="document-text-outline" size={font(22)} color="#2563EB" /></View>
                            <AppText numberOfLines={1} style={styles.fileName}>{file.name}</AppText>
                            <TouchableOpacity onPress={() => setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Ionicons name="close-circle" size={font(22)} color="#DC2626" /></TouchableOpacity>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity style={styles.primaryButton} onPress={handleNextFromStep1}>
                        <AppText style={styles.primaryButtonText}>{t.next}</AppText>
                        <Ionicons name="arrow-forward" size={font(19)} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                    <View style={{ flex: 1 }}>
                      <AppText style={styles.sectionTitle}>{t.historyTitle}</AppText>
                      <AppText style={styles.sectionHelp}>{t.historyHelp}</AppText>
                    </View>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#FFF1F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FDA4AF' }}
                      onPress={() => onNavigate('ComplaintList')}
                      activeOpacity={0.7}
                    >
                      <AppText style={{ color: '#E11D48', fontSize: font(12), fontWeight: '900' }}>
                        {selectedLang === 'si' ? 'සියල්ල බලන්න' : selectedLang === 'ta' ? 'அனைத்தையும் காண்' : 'View All'}
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  {history.length === 0 ? (
                    <AppText style={styles.emptyText}>{t.noHistory}</AppText>
                  ) : (
                    history.map((item) => {
                      const statusStyle = getStatusStyle(item.status);
                      return (
                        <TouchableOpacity key={item.id} style={styles.historyCard} onPress={() => onNavigate('ComplaintDetails', { complaintId: item.id })} activeOpacity={0.7}>
                          <View style={styles.historyHeader}>
                            <AppText style={styles.historyCategory}>{getCategoryText(item.category, t)}</AppText>
                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                              <AppText style={[styles.statusText, { color: statusStyle.color }]}>{getStatusText(item.status, t)}</AppText>
                            </View>
                          </View>
                          <AppText style={styles.historyDescription} numberOfLines={2}>{item.description}</AppText>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <AppText style={styles.historyDate}>{formatDateOnly(item.createdAt)}</AppText>
                            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.formPaper}>
                  <AppText style={styles.formTitle}>{t.previewTitle}</AppText>
                  <View style={styles.formDivider} />
                  <AppText style={styles.formSectionTitle}>{t.senderDetails}</AppText>
                  <View style={styles.formInfoBox}>
                    <FormLine label={t.name} value={currentUser?.fullName || '-'} styles={styles} />
                    <FormLine label={t.designation} value={currentUser?.designation || '-'} styles={styles} />
                    <FormLine label={t.department} value={currentUser?.departmentName || '-'} styles={styles} />
                  </View>

                  <AppText style={styles.formSectionTitle}>{t.details}</AppText>
                  <View style={styles.formInfoBox}>
                    <FormLine label={t.category} value={category ? getCategoryText(category, t) : '-'} styles={styles} />
                    <FormLine label={t.details} value={generateDescription(selectedLang)} styles={styles} />
                    <FormLine label={t.recipients} value={departmentHead ? `${departmentHead.fullName} (${departmentHead.designation})` : '-'} styles={styles} />
                    <FormLine label={t.attachments} value={`${photos.length} ${t.photoText}, ${documents.length} ${t.docText}`} styles={styles} />
                  </View>
                </View>

                <View style={styles.card}>
                  <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabledButton, { marginTop: 0 }]} onPress={submitComplaint} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="paper-plane-outline" size={font(20)} color="#FFFFFF" />}
                    <AppText style={styles.submitButtonText}>{isSubmitting ? t.submitting : t.submit}</AppText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={{ height: 50 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

function FormLine({ label, value, styles }: { label: string; value: string; styles: any; }) {
  return (
    <View style={styles.formLine}>
      <AppText style={styles.formLabel}>{label}</AppText>
      <AppText style={styles.formValue}>{value || '-'}</AppText>
    </View>
  );
}

const createStyles = (font: (size: number) => number, compact: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4E8EA' },
  loadingText: { marginTop: 12, color: '#7A1020', fontSize: font(14), fontWeight: '800' },
  header: { backgroundColor: '#7A1020', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  headerCircle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -65, top: -75, backgroundColor: 'rgba(255,255,255,0.05)' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, marginBottom: 12 },
  backText: { color: '#FFD54F', fontSize: font(13), fontWeight: '800' },
  headerTitle: { color: '#FFFFFF', fontSize: font(compact ? 21 : 24), fontWeight: '900' },
  stepIndicator: { flexDirection: 'row', gap: 9, marginTop: 14 },
  stepDot: { width: 25, height: 25, borderRadius: 12.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  stepDotActive: { backgroundColor: '#FFD54F', borderColor: '#FFD54F' },
  stepDotText: { color: '#FFFFFF', fontSize: font(11), fontWeight: '900' },
  stepDotTextActive: { color: '#7A1020' },
  scrollContent: { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 150 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 23, padding: compact ? 15 : 19, borderWidth: 1.5, borderColor: '#94A3B8', marginBottom: 17 },
  sectionTitle: { color: '#1E293B', fontSize: font(compact ? 15 : 17), fontWeight: '900' },
  sectionHelp: { color: '#64748B', fontSize: font(12), fontWeight: '600', lineHeight: font(18), marginTop: 5 },
  categoryList: { gap: 10, marginTop: 10 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 14, backgroundColor: '#F8FAFC' },
  categoryCardSelected: { borderColor: '#7A1020', backgroundColor: '#FFF1F3' },
  categoryIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  categoryText: { flex: 1, color: '#475569', fontSize: font(13), fontWeight: '900' },
  categoryTextSelected: { color: '#7A1020' },
  inputLabel: { color: '#1E293B', fontSize: font(14), fontWeight: '900', marginTop: 18, marginBottom: 8 },
  required: { color: '#DC2626' },
  singleLineInput: { borderRadius: 14, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingHorizontal: 15, height: 50, color: '#334155', fontSize: font(14), fontWeight: '600' },
  descriptionInput: { minHeight: 90, maxHeight: 140, borderRadius: 14, borderWidth: 1.5, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', paddingHorizontal: 15, paddingTop: 14, paddingBottom: 14, color: '#334155', fontSize: font(14), fontWeight: '600', textAlignVertical: 'top' },
  uploadContainer: { gap: 10, marginTop: 15 },
  uploadButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#7A1020', backgroundColor: '#FFF7F8', paddingHorizontal: 12 },
  uploadText: { color: '#7A1020', fontSize: font(13), fontWeight: '900' },
  optionalText: { color: '#94A3B8', fontSize: font(10), fontWeight: '700' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 9, marginTop: 9 },
  filePreview: { width: 43, height: 43, borderRadius: 9, backgroundColor: '#E2E8F0' },
  documentIcon: { width: 43, height: 43, borderRadius: 9, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  fileName: { flex: 1, color: '#334155', fontSize: font(12), fontWeight: '700' },
  primaryButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7A1020', borderRadius: 14, marginTop: 24 },
  primaryButtonText: { color: '#FFFFFF', fontSize: font(15), fontWeight: '900' },
  emptyText: { color: '#94A3B8', fontSize: font(13), fontWeight: '700', textAlign: 'center', paddingVertical: 22 },
  historyCard: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 14, padding: 13, marginTop: 10, backgroundColor: '#FAFAFA' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  historyCategory: { flex: 1, color: '#7A1020', fontSize: font(12), fontWeight: '900' },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: font(10), fontWeight: '900' },
  historyDescription: { color: '#334155', fontSize: font(12), fontWeight: '700', lineHeight: font(19), marginTop: 9 },
  historyDate: { color: '#94A3B8', fontSize: font(10), fontWeight: '700' },
  formPaper: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: compact ? 16 : 21, borderWidth: 1.5, borderColor: '#94A3B8', marginBottom: 17 },
  formTitle: { color: '#7A1020', fontSize: font(compact ? 17 : 20), fontWeight: '900', textAlign: 'center' },
  formDivider: { height: 2, backgroundColor: '#7A1020', marginVertical: 15, opacity: 0.25 },
  formSectionTitle: { color: '#7A1020', fontSize: font(13), fontWeight: '900', marginTop: 7, marginBottom: 8, textTransform: 'uppercase' },
  formInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 13, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  formLine: { marginBottom: 10 },
  formLabel: { color: '#64748B', fontSize: font(11), fontWeight: '900' },
  formValue: { color: '#1E293B', fontSize: font(13), fontWeight: '700', lineHeight: font(20), marginTop: 3 },
  submitButton: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#7A1020', borderRadius: 14, marginTop: 11 },
  disabledButton: { opacity: 0.62 },
  submitButtonText: { color: '#FFFFFF', fontSize: font(15), fontWeight: '900' },
});