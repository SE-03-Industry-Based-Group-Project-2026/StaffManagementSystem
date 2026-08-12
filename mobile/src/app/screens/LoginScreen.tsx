// app/screens/LoginScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextProps,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { useFont } from '../FontContext';

interface Props {
  t: any;
  onLogin: () => void;
  onBack: () => void;
  onForgot: () => void; 
  selectedLang: string;
}
const { height, width } = Dimensions.get('window');

const AppText = (props: TextProps) => (
  <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

const responsive = (size: number) => {
  const baseWidth = 390;
  return Math.round((width / baseWidth) * size);
};

export default function LoginScreen({ t, onLogin, onBack, onForgot, selectedLang }: Props) {
  const [showPass, setShowPass] = useState(false);
  
  const [idNumber, setIdNumber] = useState('');
  const [pass, setPass] = useState('');
  const [idFocused, setIdFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const { font } = useFont();

  const logoFade = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-24)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(logoSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 350);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.07, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1.0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const placeholder =
    selectedLang === 'si' ? 'උදා: 987654321V '
      : selectedLang === 'ta' ? 'எ.கா: 987654321V '
      : 'e.g: 987654321V ';

  const loadingText = 
    selectedLang === 'si' ? 'ප්‍රවේශ වෙමින්...'
      : selectedLang === 'ta' ? 'உள்நுழைகிறது...'
      : 'Logging in...';

  const handleLogin = async () => {
    if (!idNumber || !pass) {
      Alert.alert('අවධානයයි!', 'කරුණාකර ඔබගේ හැඳුනුම්පත් අංකය සහ මුරපදය ඇතුළත් කරන්න.');
      return;
    }

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    
    if (!nicRegex.test(idNumber.trim())) {
      const title = selectedLang === 'si' ? 'වැරදි හැඳුනුම්පත් අංකයකි' : selectedLang === 'ta' ? 'தவறான அடையாள எண்' : 'Invalid ID Number';
      const msg = selectedLang === 'si' ? 'කරුණාකර නිවැරදි ජාතික හැඳුනුම්පත් අංකයක් ඇතුළත් කරන්න.' : selectedLang === 'ta' ? 'தயவுசெய்து சரியான தேசிய அடையாள அட்டை எண்ணை உள்ளிடவும்.' : 'Please enter a valid National Identity Card number.';
      Alert.alert(title, msg);
      return;
    }

    setLoading(true);

    try {
      // 🔥 1. email එකට අමතරව is_active එකත් අදින්න
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, is_active') 
        .ilike('nic', idNumber.trim()) 
        .single();

      if (userError || !userData?.email) {
        const title = selectedLang === 'si' ? 'ලොග් වීමට නොහැක' : selectedLang === 'ta' ? 'உள்நுழைய முடியவில்லை' : 'Login Failed';
        const msg = selectedLang === 'si' ? 'ඔබ ඇතුළත් කළ හැඳුනුම්පත් අංකය පද්ධතියේ ලියාපදිංචි කර නොමැත.' : selectedLang === 'ta' ? 'நீங்கள் உள்ளிட்ட அடையாள எண் கணினியில் பதிவு செய்யப்படவில்லை.' : 'The ID number you entered is not registered in the system.';
        Alert.alert(title, msg);
        setLoading(false);
        return;
      }

      // 🔥 2. Account එක Inactive (අක්‍රිය) නම් ලොග් වෙන එක නවත්තලා මෙසේජ් එකක් දෙනවා
      if (userData.is_active === false) {
        const title = selectedLang === 'si' ? 'ගිණුම අක්‍රියයි' : selectedLang === 'ta' ? 'கணக்கு முடக்கப்பட்டுள்ளது' : 'Account Inactive';
        const msg = selectedLang === 'si' ? 'ඔබගේ ගිණුම තාවකාලිකව අක්‍රිය කර ඇත. කරුණාකර ප්‍රධාන පරිපාලක අමතන්න.' : selectedLang === 'ta' ? 'உங்கள் கணக்கு தற்காலிகமாக முடக்கப்பட்டுள்ளது. கணினி நிர்வாகியைத் தொடர்புகொள்ளவும்.' : 'Your account has been temporarily deactivated. Please contact the system administrator.';
        Alert.alert(title, msg);
        setLoading(false);
        return;
      }

      // 🔥 3. Active නම් සාමාන්‍ය විදිහට ලොග් වෙනවා
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: pass,
      });

      if (error) {
        const title = selectedLang === 'si' ? 'ලොග් වීමට නොහැක' : selectedLang === 'ta' ? 'உள்நுழைய முடியவில்லை' : 'Login Failed';
        const msg = selectedLang === 'si' ? 'හැඳුනුම්පත් අංකය හෝ මුරපදය වැරදියි.' : selectedLang === 'ta' ? 'தவறான அடையாள எண் அல்லது கடவுச்சொல்.' : 'Incorrect ID number or password.';
        Alert.alert(title, msg);
      } else {
        onLogin();
      }
    } catch (err) {
      const title = selectedLang === 'si' ? 'දෝෂයකි!' : selectedLang === 'ta' ? 'பிழை!' : 'Error!';
      const msg = selectedLang === 'si' ? 'පද්ධතිය හා සම්බන්ධ වීමේදී දෝෂයක් මතු විය.' : selectedLang === 'ta' ? 'கணினியுடன் இணைக்கும்போது பிழை ஏற்பட்டது.' : 'An error occurred while connecting to the system.';
      Alert.alert(title, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* 🔥 Background එක වෙනමම තියෙන්නේ. මේක කවදාවත් හෙලවෙන්නේ නෑ */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#7A1020' }]} />
        <View style={styles.bgTopLayer} />
        <View style={styles.bgBottomLayer} />
        <View style={[styles.circle, { width: responsive(320), height: responsive(320), top: -80, right: -80, opacity: 0.08 }]} />
        <View style={[styles.circle, { width: responsive(160), height: responsive(160), bottom: 60, left: -40, opacity: 0.06 }]} />
        <View style={styles.horizGlow} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 🔥 PaddingVertical එකක් දීලා තියෙන නිසා Scroll වෙන්න හොඳට ඉඩ තියෙනවා */}
          <View style={styles.mainContainer}>
            <Animated.View style={[styles.topBlock, { opacity: logoFade, transform: [{ translateY: logoSlide }] }]}>
              <Animated.View style={[styles.emblemOuter, { transform: [{ scale: glowPulse }] }]}>
                <View style={styles.emblemInner}>
                  <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                    <Image source={require('../../../assets/images/ui/logo.png')} style={styles.emblemImg} resizeMode="contain" />
                  </Animated.View>
                </View>
              </Animated.View>

              <View style={styles.dotRow}>
                {[0, 1, 2, 3, 4].map((i) => <View key={i} style={[styles.dot, i === 2 && styles.dotCenter]} />)}
              </View>

              <AppText style={[styles.mainTitle, { fontSize: font(16), lineHeight: font(24) }]}>{t.loginTitle}</AppText>
              <AppText style={[styles.subTitle, { fontSize: font(12) }]}>{t.govSub}</AppText>

              <View style={styles.badge}>
                <Ionicons name="shield-checkmark-outline" size={font(11)} color="rgba(255,191,0,0.8)" />
                <AppText style={[styles.badgeText, { fontSize: font(10) }]}>
                  {selectedLang === 'si' ? 'වැලිවිටිය දිවිතුර • අගලිය' : selectedLang === 'ta' ? 'வெலிவிட்டிய திவிதுர • அகலிய' : 'Welivitiya Divithura • Agaliya'}
                </AppText>
                <Ionicons name="shield-checkmark-outline" size={font(11)} color="rgba(255,191,0,0.8)" />
              </View>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
              <View style={styles.cardTopBar} />

              <AppText style={[styles.cardHeading, { fontSize: font(16) }]}>
                {selectedLang === 'si' ? 'පද්ධතියට ප්‍රවේශ වන්න' : selectedLang === 'ta' ? 'உள்நுழைக' : 'Sign In to Continue'}
              </AppText>
              <AppText style={[styles.cardSubHeading, { fontSize: font(12), lineHeight: font(16) }]}>
                {selectedLang === 'si' ? 'ඔබගේ හැඳුනුම්පත් අංකය සහ මුරපදය ඇතුළු කරන්න' : selectedLang === 'ta' ? 'உங்கள் அடையாள எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your ID number and password'}
              </AppText>

              <View style={styles.fieldWrap}>
                <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>
                  {selectedLang === 'si' ? 'හැඳුනුම්පත් අංකය' : selectedLang === 'ta' ? 'அடையாள எண்' : 'ID NUMBER'}
                </AppText>
                <View style={[styles.inputRow, idFocused && styles.inputRowFocused]}>
                  <View style={styles.inputIconBox}><Ionicons name="person-outline" size={font(16)} color={idFocused ? '#7A1020' : '#999'} /></View>
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.input, { fontSize: font(14) }]}
                    placeholder={placeholder}
                    placeholderTextColor="#B0B8C4"
                    value={idNumber}
                    onChangeText={setIdNumber}
                    onFocus={() => setIdFocused(true)}
                    onBlur={() => setIdFocused(false)}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>{t.passLabel}</AppText>
                <View style={[styles.inputRow, passFocused && styles.inputRowFocused]}>
                  <View style={styles.inputIconBox}><Ionicons name="lock-closed-outline" size={font(16)} color={passFocused ? '#7A1020' : '#999'} /></View>
                  <TextInput
                    allowFontScaling={false}
                    style={[styles.input, { fontSize: font(14) }]}
                    placeholder="••••••••"
                    placeholderTextColor="#B0B8C4"
                    secureTextEntry={!showPass}
                    value={pass}
                    onChangeText={setPass}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPass((p) => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={font(18)} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotWrap} onPress={onForgot}>
                <AppText style={[styles.forgotText, { fontSize: font(11) }]}>
                  {selectedLang === 'si' ? 'මුරපදය අමතකද?' : selectedLang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.loginBtn, (!idNumber || !pass || loading) && styles.loginBtnDisabled]} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="#FFF" size="small" />
                    <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>{loadingText}</AppText>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>{t.loginBtn}</AppText>
                    <Ionicons name="arrow-forward" size={font(18)} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.cardDivider}>
                <View style={styles.cardDividerLine} />
                <AppText style={[styles.cardDividerText, { fontSize: font(10) }]}>OR</AppText>
                <View style={styles.cardDividerLine} />
              </View>

              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
                <Ionicons name="language-outline" size={font(15)} color="#7A1020" />
                <AppText style={[styles.backBtnText, { fontSize: font(13) }]}>{t.changeLang}</AppText>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <Ionicons name="lock-closed-outline" size={font(10)} color="rgba(255,255,255,0.35)" />
              <AppText style={[styles.footerText, { fontSize: font(9) }]}> 256-bit Encrypted • Smart Governance Platform • v.1.0</AppText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7A1020' },
  // 🔥 මෙතන flex/flexGrow මුකුත් නෑ. සරලවම Center කරලා Padding එකක් දුන්නා.
  mainContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: responsive(24), width: '100%', paddingVertical: 40 },
  bgTopLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.48, backgroundColor: '#A32035', opacity: 0.4 },
  bgBottomLayer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.38, backgroundColor: '#5A0F1C', opacity: 0.5 },
  circle: { position: 'absolute', borderRadius: 9999, backgroundColor: '#FFBF00' },
  horizGlow: { position: 'absolute', top: height * 0.42, left: 28, right: 28, height: 1, backgroundColor: 'rgba(255,191,0,0.15)' },
  topBlock: { alignItems: 'center', width: '100%', marginBottom: responsive(18) },
  emblemOuter: { width: responsive(84), height: responsive(84), borderRadius: responsive(42), backgroundColor: 'rgba(255,191,0,0.10)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,191,0,0.35)', marginBottom: 2, shadowColor: '#FFBF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  emblemInner: { width: responsive(68), height: responsive(68), borderRadius: responsive(34), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFBF00', overflow: 'hidden' },
  emblemImg: { width: responsive(44), height: responsive(44) },
  dotRow: { flexDirection: 'row', gap: 5, marginVertical: 10, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,191,0,0.35)' },
  dotCenter: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFBF00' },
  mainTitle: { fontWeight: '800', color: '#FFF4C2', textAlign: 'center', letterSpacing: 0.4 },
  subTitle: { fontWeight: '500', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 4, letterSpacing: 0.3 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  badgeText: { color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 0.4 },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: responsive(22), paddingTop: 0, paddingBottom: responsive(22), shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15, overflow: 'hidden' },
  cardTopBar: { height: 0, backgroundColor: '#7A1020', marginBottom: 18, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardHeading: { fontWeight: '800', color: '#1A0005', marginBottom: 4, letterSpacing: 0.2 },
  cardSubHeading: { color: '#8A96A8', marginBottom: 18 },
  fieldWrap: { marginBottom: 13 },
  fieldLabel: { fontWeight: '700', color: '#4A5568', marginBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E8ECF2', height: responsive(46), paddingHorizontal: 4 },
  inputRowFocused: { borderColor: '#7A1020', backgroundColor: '#FFF5F7' },
  inputIconBox: { width: responsive(34), height: responsive(34), borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  input: { flex: 1, color: '#1A2940', paddingHorizontal: 6, height: '100%' },
  eyeBtn: { width: responsive(36), height: responsive(36), justifyContent: 'center', alignItems: 'center', marginRight: 2 },
  forgotWrap: { alignItems: 'flex-end', marginTop: -6, marginBottom: 16 },
  forgotText: { color: '#7A1020', fontWeight: '600' },
  loginBtn: { backgroundColor: '#7A1020', height: responsive(46), borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#7A1020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  loginBtnDisabled: { backgroundColor: '#C0535F', shadowOpacity: 0.15, elevation: 2 },
  loginBtnText: { color: '#FFF', fontWeight: '800', letterSpacing: 0.5 },
  cardDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 15 },
  cardDividerLine: { flex: 1, height: 1, backgroundColor: '#E8ECF2' },
  cardDividerText: { color: '#B0B8C4', fontWeight: '700', letterSpacing: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#FFF5F7', borderWidth: 1.5, borderColor: '#F0D0D5', borderRadius: 12, height: responsive(42) },
  backBtnText: { color: '#7A1020', fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  footerText: { color: 'rgba(255,255,255,0.35)', fontWeight: '500', letterSpacing: 0.3 },
});