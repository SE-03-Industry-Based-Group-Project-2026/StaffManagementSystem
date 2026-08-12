// app/screens/ComplaintDetailsScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import AppText from '../AppText';

const formatDateOnly = (dateString: string) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ComplaintDetailsScreen({ selectedLang = 'si', onNavigate, onBack, route }: any) {
  const complaintId = route?.params?.complaintId;
  const [complaint, setComplaint] = useState<any>(null);
  const [complaintUser, setComplaintUser] = useState<any>(null);
  const [assignedToUser, setAssignedToUser] = useState<string>('-');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: selectedLang === 'si' ? 'පැමිණිලි විස්තරය' : selectedLang === 'ta' ? 'புகார் விவரங்கள்' : 'Complaint Details',
    back: selectedLang === 'si' ? 'ආපසු' : selectedLang === 'ta' ? 'பின்னே' : 'Back',
    category: selectedLang === 'si' ? 'පැමිණිලි මාතෘකාව' : selectedLang === 'ta' ? 'புகார் தலைப்பு' : 'Complaint Title',
    desc: selectedLang === 'si' ? 'විස්තරය' : selectedLang === 'ta' ? 'விளக்கம்' : 'Description',
    status: selectedLang === 'si' ? 'වත්මන් තත්ත්වය' : selectedLang === 'ta' ? 'தற்போதைய நிலை' : 'Status',
    date: selectedLang === 'si' ? 'යොමු කළ දිනය' : selectedLang === 'ta' ? 'சமர்ப்பித்த தேதி' : 'Submitted Date',
    submittedBy: selectedLang === 'si' ? 'ඉදිරිපත් කළේ' : selectedLang === 'ta' ? 'சமர்ப்பித்தவர்' : 'Submitted By',
    sentTo: selectedLang === 'si' ? 'යොමු කළේ' : selectedLang === 'ta' ? 'அனுப்பப்பட்டது' : 'Sent To',
    adminDefault: selectedLang === 'si' ? 'ප්‍රධාන පරිපාලක' : selectedLang === 'ta' ? 'கணினி நிர்வாகி' : 'System Administrator',
    attachmentsTitle: selectedLang === 'si' ? 'ඇමුණුම්' : selectedLang === 'ta' ? 'இணைப்புகள்' : 'Attachments',
    noAttachments: selectedLang === 'si' ? 'ඇමුණුම් කිසිවක් එක් කර නොමැත.' : selectedLang === 'ta' ? 'எந்த இணைப்புகளும் வழங்கப்படவில்லை.' : 'No attachments provided.',
    repliesTitle: selectedLang === 'si' ? 'ලබාදුන් පිළිතුරු / යාවත්කාලීන' : selectedLang === 'ta' ? 'பதில்கள் & புதுப்பிப்புகள்' : 'Replies & Updates',
    noReplies: selectedLang === 'si' ? 'මෙතෙක් පිළිතුරු ලබා දී නොමැත.' : selectedLang === 'ta' ? 'இதுவரை எந்த பதிலும் இல்லை.' : 'No replies yet.',
    error: selectedLang === 'si' ? 'දත්ත ලබාගත නොහැක' : selectedLang === 'ta' ? 'தரவை ஏற்ற முடியவில்லை' : 'Unable to load data',
    complaintId: selectedLang === 'si' ? 'පැමිණිලි අංකය' : selectedLang === 'ta' ? 'புகார் எண்' : 'Complaint ID',
  };

  // 🔥 භාෂාවට අනුව හරියටම Field එක තෝරන Function එක
  const getLocalizedField = (data: any, fieldBase: string) => {
    if (!data) return '';
    const valLang = data[`${fieldBase}_${selectedLang}`];
    if (valLang && valLang.trim() !== '') return valLang;
    
    if (data[`${fieldBase}_si`] && data[`${fieldBase}_si`].trim() !== '') return data[`${fieldBase}_si`];
    if (data[`${fieldBase}_en`] && data[`${fieldBase}_en`].trim() !== '') return data[`${fieldBase}_en`];
    if (data[`${fieldBase}_ta`] && data[`${fieldBase}_ta`].trim() !== '') return data[`${fieldBase}_ta`];
    if (data[fieldBase] && data[fieldBase].trim() !== '') return data[fieldBase];
    
    return '-';
  };

  const getUserName = (userObj: any) => {
    if (!userObj) return '-';
    let title = userObj.title ? (userObj.title.trim().endsWith('.') ? `${userObj.title.trim()} ` : `${userObj.title.trim()}. `) : '';
    let name = getLocalizedField(userObj, 'full_name');
    return `${title}${name}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!complaintId) return;
      try {
        const { data: compData, error: compError } = await supabase.from('complaints').select('*').eq('id', complaintId).single();
        if (compError) throw compError;
        
        if (compData) {
          setComplaint(compData);

          // 1. පැමිණිල්ල කාටද යැව්වේ කියලා ලබා ගැනීම
          let assignedName = t.adminDefault; // Default කෙනා
          if (compData.assigned_supervisor_id) {
             const { data: assignData } = await supabase.from('users').select('title, full_name, full_name_si, full_name_ta').eq('id', compData.assigned_supervisor_id).single();
             if (assignData) {
                 assignedName = getUserName(assignData);
             }
          }
          setAssignedToUser(assignedName);

          // 2. පැමිණිල්ල ඉදිරිපත් කළ කෙනාගේ දත්ත ලබා ගැනීම
          if (compData.user_id) {
            const { data: userData } = await supabase.from('users').select('id, title, full_name, full_name_si, full_name_ta').eq('id', compData.user_id).single();
            if (userData) setComplaintUser(userData);
          }

       // 3. Attachments ලබා ගැනීම (JSON Error එක මඟහරින ලදි)
          if (compData.attachment_url) {
            try {
              let parsedUrls: string[] = [];
              const rawUrl = compData.attachment_url;
              
              if (Array.isArray(rawUrl)) {
                parsedUrls = rawUrl;
              } else if (typeof rawUrl === 'string') {
                try {
                  // මුලින්ම JSON විදිහට Parse කරන්න බලනවා ( '["link"]' වගේ තිබ්බොත් )
                  parsedUrls = JSON.parse(rawUrl);
                } catch (parseError) {
                  // JSON නෙවෙයි නම් (Error ආවොත්), කෙලින්ම String එකක් විදිහට ගන්නවා
                  if (rawUrl.includes(',')) {
                    // ලින්ක් කිහිපයක් කොමා වලින් වෙන් කරලා තිබ්බොත්
                    parsedUrls = rawUrl.split(',').map(u => u.trim());
                  } else {
                    // එකම එක ලින්ක් එකක් විතරක් තිබ්බොත්
                    parsedUrls = [rawUrl];
                  }
                }
              }

              if (Array.isArray(parsedUrls)) {
                const formattedAtts = parsedUrls.map((url: string, index: number) => {
                  const parts = url.split('/');
                  // URL එකේ අගට ?t=123 වගේ පරාමිතීන් තිබ්බොත් ඒවා අයින් කරනවා
                  let fileName = parts[parts.length - 1]?.split('?')[0] || `Attachment_${index + 1}`;
                  
                  // ඒක දැනටමත් සම්පූර්ණ ලින්ක් එකක්ද බලනවා (http න් පටන් ගන්නවද කියලා)
                  const publicUrl = url.startsWith('http') 
                    ? url 
                    : supabase.storage.from('complaint-documents').getPublicUrl(url).data.publicUrl;
                  
                  return {
                    file_name: fileName,
                    public_url: publicUrl,
                    file_type: fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'photo' : 'document'
                  };
                });
                setAttachments(formattedAtts);
              }
            } catch (e) {
              console.error("Error formatting attachments:", e);
            }
          }
        }

        // 4. Replies ලබා ගැනීම
        const { data: repData } = await supabase.from('complaint_replies').select('*').eq('complaint_id', complaintId).order('created_at', { ascending: true });
        if (repData) setReplies(repData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [complaintId]);

  const openLink = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const getLocalizedStatus = (status: string) => {
    const normalized = String(status || '').trim().toLowerCase();

    if (selectedLang === 'si') {
      if (normalized === 'pending') return 'පොරොත්තුවෙන්';
      if (normalized === 'in progress' || normalized === 'in_progress') return 'ක්‍රියාත්මක වෙමින් පවතී';
      if (normalized === 'resolved') return 'විසඳා ඇත';
      if (normalized === 'closed') return 'වසා ඇත';
      if (normalized === 'rejected') return 'ප්‍රතික්ෂේප කර ඇත';
      return status || 'පොරොත්තුවෙන්';
    }

    if (selectedLang === 'ta') {
      if (normalized === 'pending') return 'நிலுவையில்';
      if (normalized === 'in progress' || normalized === 'in_progress') return 'செயல்பாட்டில் உள்ளது';
      if (normalized === 'resolved') return 'தீர்க்கப்பட்டது';
      if (normalized === 'closed') return 'மூடப்பட்டது';
      if (normalized === 'rejected') return 'நிராகரிக்கப்பட்டது';
      return status || 'நிலுவையில்';
    }

    if (normalized === 'in_progress') return 'In Progress';
    if (normalized === 'pending') return 'Pending';
    if (normalized === 'resolved') return 'Resolved';
    if (normalized === 'closed') return 'Closed';
    if (normalized === 'rejected') return 'Rejected';

    return status || 'Pending';
  };

  const getStatusColor = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'resolved' || s === 'closed') return { bg: '#DCFCE7', text: '#166534', icon: 'checkmark-circle' };
    if (s === 'rejected') return { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' };
    if (s === 'pending' || s === 'in progress') return { bg: '#FEF3C7', text: '#92400E', icon: 'time' };
    return { bg: '#DBEAFE', text: '#1D4ED8', icon: 'information-circle' };
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#7A1020" /></View>;
  }

  if (!complaint) {
    return <View style={styles.center}><AppText style={styles.errorText}>{t.error}</AppText></View>;
  }

  const statusColors = getStatusColor(complaint.status);
  const complaintTitle = getLocalizedField(complaint, 'title');
  const complaintDesc = getLocalizedField(complaint, 'description');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerCircle} pointerEvents="none" />
        <TouchableOpacity style={styles.backButton} onPress={onBack || (() => onNavigate('Home'))}>
          <Ionicons name="chevron-back" size={18} color="#FFD54F" />
          <AppText style={styles.backText}>{t.back}</AppText>
        </TouchableOpacity>
        
        <View style={styles.headerTitleRow}>
          <View style={styles.iconBox}><Ionicons name="document-text" size={28} color="#7A1020" /></View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.headerTitle}>{t.title}</AppText>
            <AppText style={styles.headerSub}>{t.complaintId}: #{complaint.id}</AppText>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.accentLine} />
          
          <AppText style={styles.label}>{t.status}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Ionicons name={statusColors.icon as any} size={16} color={statusColors.text} />
            <AppText style={[styles.statusText, { color: statusColors.text }]}>
                {getLocalizedStatus(complaint.status)}
              </AppText>
          </View>

          <View style={styles.divider} />

          <AppText style={styles.label}>{t.sentTo}</AppText>
          <AppText style={styles.value}>{assignedToUser}</AppText>
          
          <View style={styles.divider} />

          
          {complaintUser && (
             <View style={{marginBottom: 15}}>
                <AppText style={styles.label}>{t.submittedBy}</AppText>
                <AppText style={styles.value}>{getUserName(complaintUser)}</AppText>
                <View style={styles.divider} />
             </View>
          )}

          <AppText style={styles.label}>{t.category}</AppText>
          <AppText style={styles.value}>{complaintTitle}</AppText>

          <View style={styles.divider} />

          <AppText style={styles.label}>{t.desc}</AppText>
          <View style={styles.descBox}>
            <AppText style={styles.descValue}>{complaintDesc}</AppText>
          </View>

          <View style={styles.divider} />

          <AppText style={styles.label}>{t.date}</AppText>
          <AppText style={styles.value}>{formatDateOnly(complaint.created_at)}</AppText>
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionHeader}>{t.attachmentsTitle}</AppText>
          {attachments.length === 0 ? (
            <AppText style={styles.emptySubText}>{t.noAttachments}</AppText>
          ) : (
            attachments.map((att, idx) => (
              <TouchableOpacity key={idx} style={styles.attachmentRow} onPress={() => openLink(att.public_url)}>
                <View style={styles.attachmentIcon}>
                  <Ionicons name={att.file_type === 'photo' ? "image-outline" : "document-text-outline"} size={22} color="#2563EB" />
                </View>
                <AppText style={styles.attachmentName} numberOfLines={1}>{att.file_name}</AppText>
                <Ionicons name="download-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionHeader}>{t.repliesTitle}</AppText>
          {replies.length === 0 ? (
            <AppText style={styles.emptySubText}>{t.noReplies}</AppText>
          ) : (
            replies.map((reply, idx) => {
              const replyMsg = getLocalizedField(reply, 'reply_message');

              return (
                <View key={idx} style={styles.replyBox}>
                  <AppText style={styles.replyText}>{replyMsg}</AppText>
                  <AppText style={styles.replyDate}>{formatDateOnly(reply.created_at)}</AppText>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#7A1020', paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  headerCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50 },
  backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 15 },
  backText: { color: '#FFD54F', fontWeight: '800', marginLeft: 4 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 55, height: 55, backgroundColor: '#FFD54F', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 50 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', elevation: 2, position: 'relative', overflow: 'hidden', marginBottom: 15 },
  accentLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: '#7A1020' },
  label: { fontSize: 12, color: '#64748B', fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 },
  value: { fontSize: 16, color: '#1E293B', fontWeight: '800' },
  descBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  descValue: { fontSize: 14, color: '#334155', fontWeight: '600', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: '900', fontSize: 14 },
  errorText: { color: '#7A1020', fontWeight: '800', fontSize: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  emptySubText: { fontSize: 13, color: '#94A3B8', fontWeight: '600', fontStyle: 'italic' },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  attachmentIcon: { width: 36, height: 36, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  attachmentName: { flex: 1, fontSize: 13, fontWeight: '700', color: '#334155' },
  replyBox: { backgroundColor: '#FFF7F8', padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#F1B7C1', marginBottom: 10 },
  replyText: { fontSize: 14, fontWeight: '600', color: '#334155', lineHeight: 21 },
  replyDate: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginTop: 8, textAlign: 'right' }
});