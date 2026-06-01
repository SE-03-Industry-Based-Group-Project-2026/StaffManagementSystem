import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

interface Props { t: any; onSubmit: () => void; selectedLang: string; }

export default function ApplyLeaveScreen({ t, onSubmit, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA', padding: 20 }}>
      <Text style={styles.inputFieldLabelText}>දිනය</Text>
      <View style={styles.disabledDateDisplayField}><Text style={{ color: '#333' }}>2026-06-05</Text></View>
      <Text style={styles.inputFieldLabelText}>{t.reason}</Text>
      <TextInput style={styles.multilineTextAreaField} multiline numberOfLines={4} placeholder={selectedLang === 'si' ? "හේතුව මෙතන සටහන් කරන්න..." : "Enter reason..."} />
      <TouchableOpacity style={styles.blockActionBtn} onPress={onSubmit}>
        <Text style={styles.blockActionBtnText}>{t.submit}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputFieldLabelText: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  disabledDateDisplayField: { backgroundColor: '#E5E7EB', height: 44, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12, marginBottom: 15 },
  multilineTextAreaField: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, height: 110, textAlignVertical: 'top', fontSize: 14, marginBottom: 15 },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});