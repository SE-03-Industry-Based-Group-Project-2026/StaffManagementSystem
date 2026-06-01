import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

interface Props { t: any; onComplete: () => void; selectedLang: string; }

export default function SignatureScreen({ t, onComplete, selectedLang }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', padding: 20 }}>
      <Text style={styles.signatureHelperDescriptionText}>{t.signDesc}</Text>
      <View style={styles.frostedSignatureFieldBox}>
        <TextInput style={styles.italicizedSignatureInputField} placeholder="W. A. Perera" placeholderTextColor="#BBB" />
      </View>
      <TouchableOpacity style={styles.blockActionBtn} onPress={() => { Alert.alert(selectedLang === 'si' ? "සාර්ථකයි" : "Finalized", selectedLang === 'si' ? "අත්සන සාර්ථකව ඉදිරිපත් කරන ලදී." : "Verified Successfully"); onComplete(); }}>
        <Text style={styles.blockActionBtnText}>{t.submit}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  signatureHelperDescriptionText: { fontSize: 13, color: '#666', marginBottom: 15, textAlign: 'center' },
  frostedSignatureFieldBox: { height: 100, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  italicizedSignatureInputField: { fontSize: 22, fontStyle: 'italic', color: '#800020', textAlign: 'center', width: '90%' },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});