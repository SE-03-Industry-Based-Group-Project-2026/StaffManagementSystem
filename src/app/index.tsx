// app/index.tsx — Soft Modern Language Welcome Screen
// Pradeshiya Sabha Staff Management System

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MainLayout from './mainLayout';

type Language = 'si' | 'en' | 'ta';

const { height } = Dimensions.get('window');

const LANG_OPTIONS: { code: Language; native: string; sub: string }[] = [
  { code: 'si', native: 'සිංහල', sub: 'SI' },
  { code: 'ta', native: 'தமிழ்', sub: 'TA' },
  { code: 'en', native: 'English', sub: 'EN' },
];

export default function LanguageWelcomeScreen() {
  const [lang, setLang] = useState<Language | null>(null);
  const [pressing, setPressing] = useState<Language | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(35)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const btnsFade = useRef(new Animated.Value(0)).current;
  const btnsSlide = useRef(new Animated.Value(25)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(btnsFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(btnsSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 450);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (lang) {
    return <MainLayout selectedLang={lang} onResetLang={() => setLang(null)} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#7A1020' }]} />
        <View style={[StyleSheet.absoluteFill, styles.bgTopShine]} />
        <View style={[StyleSheet.absoluteFill, styles.bgBottomFade]} />

        <View style={[styles.decCircle, { width: 320, height: 320, top: -80, right: -90, opacity: 0.08 }]} />
        <View style={[styles.decCircle, { width: 220, height: 220, bottom: 90, left: -80, opacity: 0.06 }]} />
        <View style={[styles.decCircle, { width: 110, height: 110, top: 170, left: 18, opacity: 0.05 }]} />

        <View style={styles.goldAccentLine} />

        <Image
          source={require('../../assets/images/ui/srilankalogo.png')}
          style={styles.watermarkImage}
          blurRadius={3}
          resizeMode="contain"
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View style={[styles.emblemOuter, { transform: [{ scale: glowPulse }] }]}>
            <View style={styles.emblemInner}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
               <Image 
                  source={require('../../assets/images/ui/logo.png')} 
                  style={styles.centerEmblemImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </Animated.View>

          <View style={styles.dotRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, i === 2 && styles.dotCenter]} />
            ))}
          </View>

          <Text style={styles.siTitle}>ප්‍රාදේශීය සභා සේවක ද්වාරය</Text>
          <Text style={styles.enTitle}>Pradeshiya Sabha Staff Portal</Text>
          <Text style={styles.taTitle}>உள்ளூர் அரசு ஊழியர் நுழைவாயில்</Text>

          <View style={styles.badgeStrip}>
            <Ionicons name="shield-checkmark" size={12} color="#FFD54F" />
            <Text style={styles.badgeText}>Welivitiya Divithura • Agaliya</Text>
            <Ionicons name="shield-checkmark" size={12} color="#FFD54F" />
          </View>
        </Animated.View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>භාෂාව තෝරන්න / SELECT LANGUAGE</Text>
          <View style={styles.dividerLine} />
        </View>

       
        <Animated.View
          style={[
            styles.verticalButtonsWrapper,
            {
              opacity: btnsFade,
              transform: [{ translateY: btnsSlide }],
            },
          ]}
        >
          {LANG_OPTIONS.map((opt) => {
            const isActive = pressing === opt.code;

            return (
              <TouchableOpacity
                key={opt.code}
                activeOpacity={0.85}
                onPressIn={() => setPressing(opt.code)}
                onPressOut={() => setPressing(null)}
                onPress={() => setLang(opt.code)}
                style={[
                  styles.circleLangBtn,
                  isActive && styles.circleLangBtnActive,
                ]}
              >
                <Text style={[styles.circleLangNativeText, isActive && styles.circleLangNativeTextActive]}>
                  {opt.native}
                </Text>
                <Text style={[styles.circleLangSubText, isActive && styles.circleLangSubTextActive]}>
                  {opt.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerIconRow}>
            <Ionicons name="lock-closed" size={11} color="rgba(255,255,255,0.6)" />
            <Text style={styles.footerText}>
              {' '}Secure Login • Smart Governance Platform • v2.1.0
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7A1020',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },

  centerEmblemImage: {
    width: 52,        // රවුම ඇතුලට ලස්සනට ගැලපෙන සයිස් එකක්
    height: 52,
    borderRadius: 26, // රවුම් හැඩය ආරක්ෂා කර ගැනීමට
  },

  bgTopShine: {
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.46,
    backgroundColor: '#A32035',
    opacity: 0.38,
  },
  bgBottomFade: {
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
    backgroundColor: '#5A0F1C',
    opacity: 0.45,
  },
  decCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#FFD54F',
  },
  goldAccentLine: {
    position: 'absolute',
    top: height * 0.42,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: 'rgba(255,213,79,0.22)',
  },
  watermarkImage: {
    position: 'absolute',
    width: 310,
    height: 310,
    bottom: 170,
    alignSelf: 'center',
    opacity: 0.12,
  },

  topSection: {
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  emblemOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,213,79,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,213,79,0.28)',
    marginBottom: 6,
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  emblemInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 14,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,213,79,0.45)',
  },
  dotCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD54F',
  },
  siTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF4C2',
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 28,
  },
  enTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    marginTop: 4,
  },
  badgeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 16,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // UPDATED FROM HORIZONTAL TO VERTICAL STACK COLUMN MATRIX
  verticalButtonsWrapper: {
    flexDirection: 'column', // Buttons stack vertically
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 20, // Gap layout between the 3 vertical circles
    marginVertical: 6,
    marginBottom:40,
  },
  circleLangBtn: {
    width: 250,
    height: 65,
    borderRadius: 40, // Absolute circular layout proportion
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  circleLangBtnActive: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFD54F',
    transform: [{ scale: 0.85 }],
  },
  circleLangNativeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  circleLangNativeTextActive: {
    color: '#7A1020',
  },
  circleLangSubText: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  circleLangSubTextActive: {
    color: 'rgba(122,16,32,0.65)',
  },

  footer: {
    paddingBottom: 6,
    alignItems: 'center',
  },
  footerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});