import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { t: any; onNavigate: (screen: any) => void; onLogout: () => void; }

export default function ProfileScreen({ t, onNavigate, onLogout }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150' }} style={styles.largeProfileImg} />
        <Text style={styles.profileTextName}>W.A. Perera</Text>
        <Text style={styles.profileTextRole}>{t.role}</Text>
      </View>
      <View style={styles.metaDataBlock}>
        <View style={styles.dataRow}><Text style={styles.key}>EPF අංකය:</Text><Text style={styles.val}>1024</Text></View>
        <View style={styles.dataRow}><Text style={styles.key}>අංශය:</Text><Text style={styles.val}>{t.dept}</Text></View>
        <View style={styles.dataRow}><Text style={styles.key}>{t.phoneLabel}:</Text><Text style={styles.val}>077 123 4567</Text></View>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity style={styles.blockActionBtn} onPress={() => onNavigate('EditProfile')}>
          <Text style={styles.blockActionBtnText}>{t.updateBtn}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileRedLogoutButton} onPress={onLogout}>
          <Ionicons name="power" size={18} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.profileRedLogoutButtonText}>පද්ධතියෙන් ඉවත් වන්න (Logout)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  largeProfileImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#800020' },
  profileTextName: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 10 },
  profileTextRole: { fontSize: 13, color: '#666', marginTop: 2 },
  metaDataBlock: { backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 10, margin: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  key: { fontSize: 13, color: '#666', fontWeight: '500' },
  val: { fontSize: 13, color: '#333', fontWeight: '600' },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  profileRedLogoutButton: { backgroundColor: '#FEE2E2', flexDirection: 'row', height: 46, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  profileRedLogoutButtonText: { color: '#DC2626', fontWeight: '700', fontSize: 14 }
});