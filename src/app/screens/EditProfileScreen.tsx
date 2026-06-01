import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props { t: any; onBack: () => void; }

export default function EditProfileScreen({ t, onBack }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', padding: 20 }}>
      <TouchableOpacity style={styles.photoUploadDashedBlock} onPress={() => Alert.alert('Camera', 'Launching Roll...')}>
        <Ionicons name="camera-outline" size={24} color="#800020" />
        <Text style={styles.uploadDashedLabel}>නව ඡායාරූපයක් එක් කරන්න</Text>
      </TouchableOpacity>
      <Text style={styles.inputFieldLabelText}>{t.phoneLabel}</Text>
      <TextInput style={styles.roundedInputField} defaultValue="0771234567" keyboardType="phone-pad" />
      <TouchableOpacity style={styles.blockActionBtn} onPress={onBack}>
        <Text style={styles.blockActionBtnText}>{t.saveBtn}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  photoUploadDashedBlock: { backgroundColor: '#F9F0F2', height: 100, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#800020', marginBottom: 20 },
  uploadDashedLabel: { fontSize: 12, color: '#800020', marginTop: 4, fontWeight: '600' },
  inputFieldLabelText: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  roundedInputField: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 46, fontSize: 14, color: '#333', marginBottom: 15 },
  blockActionBtn: { backgroundColor: '#800020', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  blockActionBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});