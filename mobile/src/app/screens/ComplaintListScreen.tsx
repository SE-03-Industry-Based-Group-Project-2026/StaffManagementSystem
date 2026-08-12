// app/screens/ComplaintListScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const formatDateOnly = (dateString: string) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ComplaintListScreen({ selectedLang = 'si', onNavigate, onBack }: any) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: selectedLang === 'si' ? 'සියලු පැමිණිලි' : selectedLang === 'ta' ? 'அனைத்து புகார்கள்' : 'All Complaints',
    back: selectedLang === 'si' ? 'ආපසු' : selectedLang === 'ta' ? 'பின்னே' : 'Back',
    empty: selectedLang === 'si' ? 'පැමිණිලි කිසිවක් නැත.' : 'No complaints found.',
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
        if (!profile) return;
        const { data } = await supabase.from('complaints').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
        if (data) setComplaints(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const getStatusColor = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === 'resolved' || s === 'closed') return { bg: '#DCFCE7', text: '#166534' };
    if (s === 'rejected') return { bg: '#FEE2E2', text: '#991B1B' };
    if (s === 'pending' || s === 'in progress') return { bg: '#FEF3C7', text: '#92400E' };
    return { bg: '#DBEAFE', text: '#1D4ED8' };
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack || (() => onNavigate('Home'))}>
          <Ionicons name="chevron-back" size={18} color="#FFD54F" />
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color="#7A1020" style={{ marginTop: 50 }} />
        ) : complaints.length === 0 ? (
          <Text style={styles.emptyText}>{t.empty}</Text>
        ) : (
          complaints.map((item) => {
            const colors = getStatusColor(item.status);
            return (
              <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.8} onPress={() => onNavigate('ComplaintDetails', { complaintId: item.id })}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title || item.category}</Text>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}><Text style={[styles.badgeText, { color: colors.text }]}>{item.status || 'Open'}</Text></View>
                </View>
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                {/* 🔥 මෙතන Date එක විතරක් එන්න හැදුවා */}
                <Text style={styles.date}>{formatDateOnly(item.created_at)}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' },
  header: { backgroundColor: '#7A1020', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 10 },
  backText: { color: '#FFD54F', fontWeight: '800', marginLeft: 4 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 50 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: '#7A1020' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  desc: { fontSize: 13, color: '#475569', fontWeight: '600', lineHeight: 20 },
  date: { fontSize: 11, color: '#94A3B8', fontWeight: '800', marginTop: 10, textAlign: 'right' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748B', fontWeight: '700' }
});