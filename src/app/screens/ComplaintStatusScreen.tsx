import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props { t: any; selectedLang: string; }

export default function ComplaintStatusScreen({ t, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <View style={styles.complaintLogHistoryBorderedCard}>
        <Text style={styles.complaintLogHistoryCardTitle}>{selectedLang === 'si' ? "පුස්තකාලයේ විදුලි පංකා අක්‍රීය වීම" : "Library Ceiling Fan Failure Log"}</Text>
        <View style={styles.warningAmberStatusBadge}><Text style={styles.warningAmberStatusBadgeText}>{t.replied}</Text></View>
        <Text style={styles.complaintLogHistoryCardSupervisorReplyText}>
          {selectedLang === 'si' ? "• සුපරීක්ෂක පිළිතුර: තාක්ෂණික අංශය දැනුවත් කරන ලදී. හෙට දින තුළ සකස් කරනු ඇත." : "• Supervisor wing has deployment scheduled for tomorrow close hours."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  complaintLogHistoryBorderedCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  complaintLogHistoryCardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  warningAmberStatusBadge: { backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 6 },
  warningAmberStatusBadgeText: { color: '#D97706', fontSize: 10, fontWeight: '700' },
  complaintLogHistoryCardSupervisorReplyText: { fontSize: 12, color: '#444', marginTop: 10, lineHeight: 16, fontWeight: '500' }
});