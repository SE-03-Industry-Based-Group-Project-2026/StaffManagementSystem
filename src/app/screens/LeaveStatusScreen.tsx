import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface Props { t: any; onNavigate: (screen: any) => void; selectedLang: string; }

export default function LeaveStatusScreen({ t, onNavigate, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <View style={styles.statusNotificationDisplayCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.statusCardTitle}>2026-06-05 ({t.casual})</Text>
          <View style={styles.approvedBadgeTag}><Text style={styles.approvedBadgeTagText}>{selectedLang === 'si' ? "අනුමතයි" : "Approved"}</Text></View>
        </View>
        <Text style={styles.statusCardDescriptionBody}>
          {selectedLang === 'si' ? "සුපරීක්ෂක විසින් ඔබගේ ඉල්ලීම අනුමත කර ඇත. කරුණාකර නිල ඩිජිටල් පෝරමය සම්පූර්ණ කරන්න." : "Supervisor approved. Please complete digital form validation process."}
        </Text>
        <TouchableOpacity style={styles.embeddedCardActionBtn} onPress={() => onNavigate('DigitalForm')}>
          <Text style={styles.embeddedCardActionBtnText}>{t.digitalForm}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusNotificationDisplayCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#008080', elevation: 2 },
  statusCardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  approvedBadgeTag: { backgroundColor: '#E6F2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  approvedBadgeTagText: { color: '#008080', fontSize: 11, fontWeight: '700' },
  statusCardDescriptionBody: { fontSize: 12, color: '#666', marginTop: 8, lineHeight: 16 },
  embeddedCardActionBtn: { backgroundColor: '#800020', marginTop: 12, height: 38, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  embeddedCardActionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' }
});