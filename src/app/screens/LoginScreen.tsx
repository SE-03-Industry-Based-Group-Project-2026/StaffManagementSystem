// app/screens/LoginScreen.tsx — Enhanced v2 (Optimized Brightness & Fixed Scroll)
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  t: any;
  onLogin: () => void;
  onBack: () => void;
  selectedLang: string;
}

const { height } = Dimensions.get('window');

export default function LoginScreen({ t, onLogin, onBack, selectedLang }: Props) {
  const [showPass, setShowPass]     = useState(false);
  const [epf, setEpf]               = useState('');
  const [pass, setPass]             = useState('');
  const [epfFocused, setEpfFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // ── Entrance animations ──────────────────────────────────────
  const logoFade   = useRef(new Animated.Value(0)).current;
  const logoSlide  = useRef(new Animated.Value(-24)).current;
  const logoScale  = useRef(new Animated.Value(0.85)).current;
  const cardFade   = useRef(new Animated.Value(0)).current;
  const cardSlide  = useRef(new Animated.Value(32)).current;
  const glowPulse  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoFade,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(logoSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6,   useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 350);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.07, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1.00, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const placeholder = selectedLang === 'si' ? 'උදා: 1024' : selectedLang === 'ta' ? 'எ.கா: 1024' : 'e.g: 1024';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      {/* ── Layered Background (Brightened Maroon Palette) ───────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#7A1020' }]} />
        <View style={styles.bgTopLayer} />
        <View style={styles.bgBottomLayer} />
        {/* Decorative circles */}
        <View style={[styles.circle, { width: 320, height: 320, top: -80,  right: -80,  opacity: 0.08 }]} />
        <View style={[styles.circle, { width: 160, height: 160, bottom: 60, left: -40,  opacity: 0.06 }]} />
        {/* Horizontal divider glow */}
        <View style={styles.horizGlow} />
      </View>

      {/* Main Container replacing ScrollView to fully disable page scrolling */}
      <View style={styles.mainContainer}>
        
        {/* ── LOGO + TITLES ──────────────────────────────────── */}
        <Animated.View
          style={[
            styles.topBlock,
            { opacity: logoFade, transform: [{ translateY: logoSlide }] },
          ]}
        >
          {/* Outer glow ring */}
          <Animated.View style={[styles.emblemOuter, { transform: [{ scale: glowPulse }] }]}>
            <View style={styles.emblemInner}>
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <Image
                  source={require('../../../assets/images/ui/logo.png')}
                  style={styles.emblemImg}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Dot row accent */}
          <View style={styles.dotRow}>
            {[0,1,2,3,4].map(i => (
              <View key={i} style={[styles.dot, i === 2 && styles.dotCenter]} />
            ))}
          </View>

          <Text style={styles.mainTitle}>{t.loginTitle}</Text>
          <Text style={styles.subTitle}>{t.govSub}</Text>

          {/* Official badge */}
          {/* Official badge (Dynamic Language Support) */}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark-outline" size={11} color="rgba(255,191,0,0.8)" />
            <Text style={styles.badgeText}>
              {selectedLang === 'si' ? 'වැලිවිටිය දිවිතුර • අගලිය' : 
               selectedLang === 'ta' ? 'வெலிவிட்டிய திவிதுர • அகலிய' : 
               'Welivitiya Divithura • Agaliya'}
            </Text>
            <Ionicons name="shield-checkmark-outline" size={11} color="rgba(255,191,0,0.8)" />
          </View>
        </Animated.View>

        {/* ── AUTH CARD ──────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.card,
            { opacity: cardFade, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* Card top accent bar */}
          <View style={styles.cardTopBar} />

          <Text style={styles.cardHeading}>
            {selectedLang === 'si' ? 'පද්ධතියට ප්‍රවේශ වන්න' :
             selectedLang === 'ta' ? 'உள்நுழைக' :
             'Sign In to Continue'}
          </Text>
          <Text style={styles.cardSubHeading}>
            {selectedLang === 'si' ? 'ඔබගේ EPF අංකය සහ මුරපදය ඇතුළු කරන්න' :
             selectedLang === 'ta' ? 'உங்கள் EPF எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்' :
             'Enter your EPF number and password'}
          </Text>

          {/* EPF Field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.epfLabel}</Text>
            <View style={[styles.inputRow, epfFocused && styles.inputRowFocused]}>
              <View style={styles.inputIconBox}>
                <Ionicons name="person-outline" size={16} color={epfFocused ? '#7A1020' : '#999'} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#B0B8C4"
                value={epf}
                onChangeText={setEpf}
                onFocus={() => setEpfFocused(true)}
                onBlur={() => setEpfFocused(false)}
                keyboardType="numeric"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t.passLabel}</Text>
            <View style={[styles.inputRow, passFocused && styles.inputRowFocused]}>
              <View style={styles.inputIconBox}>
                <Ionicons name="lock-closed-outline" size={16} color={passFocused ? '#7A1020' : '#999'} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#B0B8C4"
                secureTextEntry={!showPass}
                value={pass}
                onChangeText={setPass}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>
              {selectedLang === 'si' ? 'මුරපදය අමතකද?' :
               selectedLang === 'ta' ? 'கடவுச்சொල் மறந்துவிட்டதா?' :
               'Forgot password?'}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, (!epf || !pass) && styles.loginBtnDisabled]}
            onPress={onLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{t.loginBtn}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.cardDivider}>
            <View style={styles.cardDividerLine} />
            <Text style={styles.cardDividerText}>OR</Text>
            <View style={styles.cardDividerLine} />
          </View>

          {/* Back / Change language */}
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="language-outline" size={15} color="#7A1020" />
            <Text style={styles.backBtnText}>{t.changeLang}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={10} color="rgba(255,255,255,0.35)" />
          <Text style={styles.footerText}>  256-bit Encrypted  •  Smart Governance Platform  •  v2.1.0</Text>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7A1020' },

  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    width: '100%',
  },

  // Brightened Up Government Maroon Matrix
  bgTopLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.48,
    backgroundColor: '#A32035',
    opacity: 0.4,
  },
  bgBottomLayer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: height * 0.38,
    backgroundColor: '#5A0F1C',
    opacity: 0.5,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#FFBF00',
  },
  horizGlow: {
    position: 'absolute',
    top: height * 0.42,
    left: 28, right: 28,
    height: 1,
    backgroundColor: 'rgba(255,191,0,0.15)',
  },

  // Top block
  topBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20, // Reduced padding to tighten the grid structure
  },
  emblemOuter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,191,0,0.10)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,191,0,0.35)',
    marginBottom: 2,
    shadowColor: '#FFBF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  emblemInner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFBF00',
    overflow: 'hidden',
  },
  emblemImg: { width: 46, height: 46 },

  dotRow: {
    flexDirection: 'row', gap: 5,
    marginVertical: 10, alignItems: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,191,0,0.35)' },
  dotCenter: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFBF00' },

  mainTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#FFF4C2', textAlign: 'center',
    letterSpacing: 0.4, lineHeight: 24,
  },
  subTitle: {
    fontSize: 12, fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', marginTop: 4,
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 6,
    marginTop: 12,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10, fontWeight: '600', letterSpacing: 0.4,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  cardTopBar: {
    height: 4,
    backgroundColor: '#7A1020',
    marginBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardHeading: {
    fontSize: 16, fontWeight: '800',
    color: '#1A0005',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubHeading: {
    fontSize: 12, color: '#8A96A8',
    marginBottom: 20, lineHeight: 16,
  },

  // Field
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700',
    color: '#4A5568', marginBottom: 6,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF2',
    height: 48,
    paddingHorizontal: 4,
  },
  inputRowFocused: {
    borderColor: '#7A1020',
    backgroundColor: '#FFF5F7',
  },
  inputIconBox: {
    width: 36, height: 36, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1, fontSize: 14, color: '#1A2940',
    paddingHorizontal: 6,
    height: '100%',
  },
  eyeBtn: {
    width: 38, height: 38,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 2,
  },

  // Forgot
  forgotWrap: { alignItems: 'flex-end', marginTop: -6, marginBottom: 18 },
  forgotText: {
    color: '#7A1020', fontSize: 11, fontWeight: '600',
  },

  // Login button
  loginBtn: {
    backgroundColor: '#7A1020',
    height: 48, borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7A1020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnDisabled: {
    backgroundColor: '#C0535F',
    shadowOpacity: 0.15,
    elevation: 2,
  },
  loginBtnText: {
    color: '#FFF', fontWeight: '800',
    fontSize: 14, letterSpacing: 0.5,
  },

  // Card divider
  cardDivider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginVertical: 16,
  },
  cardDividerLine: { flex: 1, height: 1, backgroundColor: '#E8ECF2' },
  cardDividerText: {
    color: '#B0B8C4', fontSize: 10, fontWeight: '700', letterSpacing: 1,
  },

  // Back button
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
    backgroundColor: '#FFF5F7',
    borderWidth: 1.5, borderColor: '#F0D0D5',
    borderRadius: 12, height: 44,
  },
  backBtnText: {
    color: '#7A1020', fontWeight: '700', fontSize: 13,
  },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10, fontWeight: '500', letterSpacing: 0.3,
  },
});