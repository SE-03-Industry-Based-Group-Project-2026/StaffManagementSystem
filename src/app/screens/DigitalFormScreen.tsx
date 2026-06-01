import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface Props { t: any; onNavigate: (screen: any) => void; selectedLang: string; }

export default function DigitalFormScreen({ t, onNavigate, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <View style={styles.legalDigitalDocumentPaperCard}>
        <Text style={styles.legalDocumentHeaderTitleText}>{t.digitalForm}</Text>
        <Text style={styles.legalDocumentBodyMetaText}>• නම: W.A. Perera</Text>
        <Text style={styles.legalDocumentBodyMetaText}>• නිවාඩු දිනය: 2026-06-05</Text>
        <Text style={styles.legalDocumentBodyMetaText}>• නිවාඩු වර්ගය: {t.casual}</Text>
        <Text style={styles.legalDocumentBodyMetaText}>• පැමිණීමේ වත්මන් තත්ත්වය: {selectedLang === 'si' ? "නිවාඩු මත" : "On Leave"}</Text>
      </View>
      <TouchableOpacity style={styles.blockActionBtn} onPress={() => onNavigate('Signature')}>
        <Text style={styles.blockActionBtnText}>{t.signBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  legalDigitalDocumentPaperCard: { borderWidth: 1, borderColor: '#D1D5DB', padding: 16, borderRadius: 8, backgroundColor: '#FFF', marginBottom: 15 },
  legalDocumentHeaderTitleText: { fontSize: 14, fontWeight: '700', color: '#800020', marginBottom: 12, textAlign: 'center' },
  legalDocumentBodyMetaText: { fontSize: 13, color: '#444', marginBottom: 8, fontWeight: '500' },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});