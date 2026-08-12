// app/screens/ResetPasswordScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet,
  Text as RNText, TextInput, TextProps, TouchableOpacity, View, ActivityIndicator, Keyboard
} from 'react-native';
import { useFont } from '../FontContext';

interface Props {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
  selectedLang: string;
}

const { height, width } = Dimensions.get('window');
const AppText = (props: TextProps) => <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
const responsive = (size: number) => Math.round((width / 390) * size);

export default function ResetPasswordScreen({ email, onBack, onSuccess, selectedLang }: Props) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { font } = useFont();

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();
    if (!otp || !newPassword) {
      Alert.alert('අවධානයයි!', 'කරුණාකර කේතය සහ නව මුරපදය ඇතුළත් කරන්න.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('අවධානයයි!', 'නව මුරපදය අවම වශයෙන් අක්ෂර 6කින් යුක්ත විය යුතුය.');
      return;
    }

    setLoading(true);
    try {
      // 🔥 1. Account එක Active ද කියලා මුලින්ම Database එකෙන් බලනවා
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_active')
        .eq('email', email)
        .single();

      if (userError) {
        Alert.alert('දෝෂයකි', 'පරිශීලක තොරතුරු ලබාගැනීමට නොහැක.');
        setLoading(false);
        return;
      }

      // 🔥 2. Account එක Inactive (අක්‍රිය) නම් Reset කරන එක නවත්තලා මැසේජ් එකක් දෙනවා
      if (userData?.is_active === false) {
        const title = selectedLang === 'si' ? 'ගිණුම අක්‍රියයි' : selectedLang === 'ta' ? 'கணக்கு முடக்கப்பட்டுள்ளது' : 'Account Inactive';
        const msg = selectedLang === 'si' ? 'ඔබගේ ගිණුම තාවකාලිකව අක්‍රිය කර ඇත. කරුණාකර ප්‍රධාන පරිපාලක අමතන්න.' : selectedLang === 'ta' ? 'உங்கள் கணக்கு தற்காலிகமாக முடக்கப்பட்டுள்ளது. கணினி நிர்வாகியைத் தொடர்புகொள்ளவும்.' : 'Your account has been temporarily deactivated. Please contact the system administrator.';
        Alert.alert(title, msg);
        setLoading(false);
        return;
      }

      // 3. Supabase Backend: OTP එක හරිද කියලා බලනවා
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'recovery',
      });

      if (verifyError) {
        Alert.alert('වැරදි කේතයකි', 'ඔබ ඇතුළත් කළ කේතය වැරදියි හෝ කල් ඉකුත් වී ඇත.');
        setLoading(false);
        return;
      }

      // 4. Supabase Backend: අලුත් Password එක Update කරනවා
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        Alert.alert('දෝෂයකි', updateError.message);
      } else {
        // පාස්වර්ඩ් එක මාරු වුණාට පස්සේ Database එකේ is_first_login එක false කරනවා.
        const { error: dbError } = await supabase
          .from('users')
          .update({ is_first_login: false })
          .eq('email', email);

        if (dbError) {
          console.error('Failed to update first login status:', dbError);
        }

        // වැඩේ සම්පූර්ණයෙන්ම ඉවරයි, සාර්ථකයි කියලා මැසේජ් එක පෙන්නනවා
        Alert.alert('සාර්ථකයි!', 'ඔබගේ මුරපදය සාර්ථකව වෙනස් කරන ලදී. නව මුරපදය භාවිතයෙන් ලොග් වන්න.', [
          { text: 'හරි', onPress: onSuccess }
        ]);
      }
    } catch (err) {
      Alert.alert('දෝෂයකි!', 'පද්ධතිය හා සම්බන්ධ වීමේදී දෝෂයක් මතු විය.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#7A1020' }]} />
        <View style={styles.bgTopLayer} />
        <View style={styles.bgBottomLayer} />
      </View>

      <View style={styles.mainContainer}>
        <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.cardTopBar} />

          <AppText style={[styles.cardHeading, { fontSize: font(16) }]}>නව මුරපදය සකසන්න</AppText>
          <AppText style={[styles.cardSubHeading, { fontSize: font(12), lineHeight: font(16) }]}>
            {email} ලිපිනයට එවූ ඉලක්කම් 6ක කේතය සහ නව මුරපදය ඇතුළත් කරන්න.
          </AppText>

          <View style={styles.fieldWrap}>
            <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>OTP කේතය (ඉලක්කම් 6)</AppText>
            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}><Ionicons name="key-outline" size={font(16)} color="#999" /></View>
              <TextInput
                allowFontScaling={false}
                style={[styles.input, { fontSize: font(14) }]}
                placeholder="123456"
                placeholderTextColor="#B0B8C4"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>නව මුරපදය</AppText>
            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}><Ionicons name="lock-closed-outline" size={font(16)} color="#999" /></View>
              <TextInput
                allowFontScaling={false}
                style={[styles.input, { fontSize: font(14) }]}
                placeholder="••••••••"
                placeholderTextColor="#B0B8C4"
                secureTextEntry={!showPass}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={font(18)} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.loginBtn, { marginTop: 10 }, (!otp || !newPassword || loading) && styles.loginBtnDisabled]} onPress={handleUpdatePassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>මුරපදය වෙනස් කරන්න</AppText>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="close" size={font(16)} color="#7A1020" />
            <AppText style={[styles.backBtnText, { fontSize: font(13) }]}>අවලංගු කරන්න</AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7A1020' },
  mainContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: responsive(24) },
  bgTopLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.48, backgroundColor: '#A32035', opacity: 0.4 },
  bgBottomLayer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.38, backgroundColor: '#5A0F1C', opacity: 0.5 },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: responsive(22), paddingTop: 0, paddingBottom: responsive(22), shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 },
  cardTopBar: { height: 0, backgroundColor: '#7A1020', marginBottom: 18, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardHeading: { fontWeight: '800', color: '#1A0005', marginBottom: 4 },
  cardSubHeading: { color: '#8A96A8', marginBottom: 18 },
  fieldWrap: { marginBottom: 13 },
  fieldLabel: { fontWeight: '700', color: '#4A5568', marginBottom: 6, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', height: responsive(46), paddingHorizontal: 4 },
  inputIconBox: { width: responsive(34), height: responsive(34), justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  input: { flex: 1, color: '#1A2940', paddingHorizontal: 6, height: '100%' },
  eyeBtn: { width: responsive(36), height: responsive(36), justifyContent: 'center', alignItems: 'center', marginRight: 2 },
  loginBtn: { backgroundColor: '#7A1020', height: responsive(46), borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginBtnDisabled: { backgroundColor: '#C0535F' },
  loginBtnText: { color: '#FFF', fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#FFF5F7', borderWidth: 1.5, borderColor: '#F0D0D5', borderRadius: 12, height: responsive(42), marginTop: 15 },
  backBtnText: { color: '#7A1020', fontWeight: '700' },
});