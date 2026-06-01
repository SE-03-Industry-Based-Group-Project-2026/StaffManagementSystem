import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

interface Props { t: any; onSubmit: () => void; selectedLang: string; }

export default function ComplaintSubmitScreen({ t, onSubmit, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', padding: 20 }}>
      <Text style={styles.inputFieldLabelText}>{t.complaintLabel}</Text>
      <TextInput style={styles.multilineTextAreaField} multiline numberOfLines={5} placeholder={selectedLang === 'si' ? "ඔබගේ ගැටලුව මෙහි සටහන් කරන්න..." : "Enter details..."} />
      <TouchableOpacity style={styles.blockActionBtn} onPress={onSubmit}>
        <Text style={styles.blockActionBtnText}>{t.submit}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputFieldLabelText: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  multilineTextAreaField: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, height: 110, textAlignVertical: 'top', fontSize: 14, marginBottom: 15 },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});