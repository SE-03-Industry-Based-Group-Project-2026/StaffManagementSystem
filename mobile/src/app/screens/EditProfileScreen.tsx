// app/screens/EditProfileScreen.tsx — Premium 2026 Production Edition
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Animated, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

interface Props { t: any; onBack: () => void; }

export default function EditProfileScreen({ t, onBack }: Props) {
  const [phone, setPhone] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(20)).current;

  const currentLang = useMemo(() => t?.updateBtn?.includes('යාවත්කාලීන') ? 'si' : t?.updateBtn?.includes('புதுப்பிக்கவும்') ? 'ta' : 'en', [t]);

  const localT = useMemo(() => {
    const dict = {
      si: { title: 'පැතිකඩ වෙනස් කරන්න', back: 'ආපසු', uploadLabel: 'ඡායාරූපය වෙනස් කරන්න', phoneLabel: 'දුරකථන අංකය', saveBtn: 'වෙනස්කම් සුරකින්න', successTitle: 'සාර්ථකයි!', successMsg: 'තොරතුරු යාවත්කාලීන විය.' },
      en: { title: 'Edit Profile', back: 'Back', uploadLabel: 'Change Photo', phoneLabel: 'Phone Number', saveBtn: 'Save Changes', successTitle: 'Success!', successMsg: 'Profile updated successfully.' },
      ta: { title: 'சுயவிவரத்தைத் திருத்து', back: 'பின்னே', uploadLabel: 'புகைப்படத்தை மாற்றவும்', phoneLabel: 'தொலைபேசி எண்', saveBtn: 'சேமிக்கவும்', successTitle: 'வெற்றி!', successMsg: 'புதுப்பிக்கப்பட்டது.' }
    };
    return dict[currentLang as keyof typeof dict];
  }, [currentLang]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('users').select('phone').eq('auth_id', user?.id).single();
      if (data) setPhone(data.phone || '');
    };
    loadProfile();
    Animated.parallel([Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }), Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })]).start();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('users').update({ phone }).eq('auth_id', user?.id);
    setLoading(false);
    Alert.alert(localT.successTitle, localT.successMsg, [{ text: 'OK', onPress: onBack }]);
  };

  const pickAndUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (result.canceled) return;
    setUploading(true);
    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: 'base64' });
    const filePath = `avatars/${Date.now()}.jpg`;
    await supabase.storage.from('avatars').upload(filePath, decode(base64), { contentType: 'image/jpeg' });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('auth_id', user?.id);
    setUploading(false);
    Alert.alert(localT.successTitle, 'Photo updated!');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnPill} onPress={onBack}><Ionicons name="chevron-back" size={16} color="#FFD54F" /><Text style={styles.backText}>{localT.back}</Text></TouchableOpacity>
        <Text style={styles.hTitle}>{localT.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.formCard}>
            <TouchableOpacity style={styles.photoUploadDashedBlock} onPress={pickAndUpload} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#7A1020" /> : <><View style={styles.iconCircle}><Ionicons name="camera" size={28} color="#7A1020" /></View><Text style={styles.uploadDashedLabel}>{localT.uploadLabel}</Text></>}
            </TouchableOpacity>
            <View style={styles.divider} />
            <Text style={styles.inputFieldLabelText}>{localT.phoneLabel}</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}><Ionicons name="call" size={18} color="#64748B" /></View>
              <TextInput style={styles.roundedInputField} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          </View>
          <TouchableOpacity style={styles.blockActionBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.blockActionBtnText}>{localT.saveBtn}</Text>}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4E8EA' }, 

  // Header Styles
  header: {
    backgroundColor: '#7A1020',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#5A0010', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 18, elevation: 12,
  },
  hCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -50,
  },
  hCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20,
  },
  headerTopRow: { marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  backBtnPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  backText: { color: '#FFD54F', fontSize: 13, fontWeight: '800' },
  hTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.4 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#1A2940', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },

  // Photo Upload
  photoUploadDashedBlock: { 
    backgroundColor: '#FFF5F6', height: 130, borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', 
    borderStyle: 'dashed', borderWidth: 2, borderColor: '#FDA4AF', 
    marginBottom: 10 
  },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFE4E6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  uploadDashedLabel: { fontSize: 14, color: '#9F1239', fontWeight: '700', letterSpacing: 0.3 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },

  // Input Field
  inputFieldLabelText: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', 
    borderRadius: 12, height: 54, overflow: 'hidden'
  },
  inputIconBox: {
    width: 48, height: '100%', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRightWidth: 1.5, borderRightColor: '#E2E8F0'
  },
  roundedInputField: { 
    flex: 1, paddingHorizontal: 14, fontSize: 16, color: '#1E293B', fontWeight: '600'
  },

  // Action Button
  blockActionBtn: { 
    backgroundColor: '#7A1020', flexDirection: 'row', height: 54, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7A1020', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  blockActionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }
});