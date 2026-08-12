// app/index.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text as RNText,
  TextProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFont } from './FontContext';
import MainLayout from './mainLayout';


type Language = 'si' | 'en' | 'ta';

const { height, width } = Dimensions.get('window');

const AppText = (props: TextProps) => (
  <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

const LANG_OPTIONS: { code: Language; native: string; sub: string }[] = [
  { code: 'si', native: 'සිංහල', sub: 'SI' },
  { code: 'ta', native: 'தமிழ்', sub: 'TA' },
  { code: 'en', native: 'English', sub: 'EN' },
];

const responsive = (size: number) => {
  const baseWidth = 390;
  return Math.round((width / baseWidth) * size);
};

export default function LanguageWelcomeScreen() {
  const [lang, setLang] = useState<Language | null>(null);
  const [pressing, setPressing] = useState<Language | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const { fontSize, setFontSize, font } = useFont();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(35)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const btnsFade = useRef(new Animated.Value(0)).current;
  const btnsSlide = useRef(new Animated.Value(25)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const forceDefaultMedium = async () => {
      const alreadyReset = await AsyncStorage.getItem('fontDefaultResetDone');

      if (!alreadyReset) {
        await AsyncStorage.setItem('appFontSize', 'M');
        await AsyncStorage.setItem('fontDefaultResetDone', 'yes');
        setFontSize('M');
      }
    };

    forceDefaultMedium();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(btnsFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(btnsSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.06,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
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

        <View
          style={[
            styles.decCircle,
            {
              width: responsive(320),
              height: responsive(320),
              top: -80,
              right: -90,
              opacity: 0.08,
            },
          ]}
        />

        <View
          style={[
            styles.decCircle,
            {
              width: responsive(220),
              height: responsive(220),
              bottom: 90,
              left: -80,
              opacity: 0.06,
            },
          ]}
        />

        <View
          style={[
            styles.decCircle,
            {
              width: responsive(110),
              height: responsive(110),
              top: 170,
              left: 18,
              opacity: 0.05,
            },
          ]}
        />

        <View style={styles.goldAccentLine} />

        <Image
          source={require('../../assets/images/ui/srilankalogo.png')}
          style={styles.watermarkImage}
          blurRadius={3}
          resizeMode="contain"
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cornerDropdownWrapper}>
          <TouchableOpacity
            style={styles.cornerBtn}
            activeOpacity={0.8}
            onPress={() => setShowMenu(!showMenu)}
          >
            <AppText style={[styles.cornerBtnText, { fontSize: font(12) }]}>
              Size: {fontSize}
            </AppText>

            <Ionicons
              name={showMenu ? 'chevron-up' : 'chevron-down'}
              size={13}
              color="#FFD54F"
            />
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.dropdownBox}>
              <AppText style={[styles.dropdownLabel, { fontSize: font(11) }]}>
                ප්‍රමාණය තෝරන්න
              </AppText>

              <AppText style={[styles.dropdownLabelEn, { fontSize: font(9) }]}>
                Select Size
              </AppText>

              <View style={styles.dropdownDivider} />

              {(['S', 'M', 'L'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.dropItem, fontSize === s && styles.dropItemActive]}
                  onPress={() => {
                    setFontSize(s);
                    setShowMenu(false);
                  }}
                >
                  <AppText
                    style={[
                      styles.dropItemText,
                      fontSize === s && styles.dropItemTextActive,
                      { fontSize: font(12) },
                    ]}
                  >
                    {s === 'S' ? 'Small' : s === 'M' ? 'Medium' : 'Large'}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.emblemOuter,
              {
                transform: [{ scale: glowPulse }],
              },
            ]}
          >
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

          <AppText style={[styles.siTitle, { fontSize: font(18), lineHeight: font(25) }]}>
            ප්‍රාදේශීය සභා සේවක ද්වාරය
          </AppText>

          <AppText style={[styles.enTitle, { fontSize: font(12) }]}>
            Pradeshiya Sabha Staff Portal
          </AppText>

          <AppText style={[styles.taTitle, { fontSize: font(12) }]}>
            உள்ளூர் அரசு ஊழியர் நுழைவாயில்
          </AppText>

          <View style={styles.badgeStrip}>
            <Ionicons name="shield-checkmark" size={11} color="#FFD54F" />

            <AppText style={[styles.badgeText, { fontSize: font(9) }]}>
              Welivitiya Divithura • Agaliya
            </AppText>

            <Ionicons name="shield-checkmark" size={11} color="#FFD54F" />
          </View>
        </Animated.View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />

          <AppText style={[styles.dividerText, { fontSize: font(11) }]}>
            භාෂාව තෝරන්න / SELECT LANGUAGE
          </AppText>

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
                style={[styles.circleLangBtn, isActive && styles.circleLangBtnActive]}
              >
                <AppText
                  style={[
                    styles.circleLangNativeText,
                    isActive && styles.circleLangNativeTextActive,
                    { fontSize: font(15) },
                  ]}
                >
                  {opt.native}
                </AppText>

                <AppText
                  style={[
                    styles.circleLangSubText,
                    isActive && styles.circleLangSubTextActive,
                    { fontSize: font(10) },
                  ]}
                >
                  {opt.sub}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerIconRow}>
            <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.6)" />

            <AppText style={[styles.footerText, { fontSize: font(8) }]}>
              {' '}
              Secure Login • Smart Employee Management System • v1.1.3
            </AppText>
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
    paddingHorizontal: responsive(22),
    paddingBottom: 8,
  },

  centerEmblemImage: {
    width: responsive(48),
    height: responsive(48),
    borderRadius: responsive(24),
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
    width: responsive(280),
    height: responsive(280),
    bottom: 170,
    alignSelf: 'center',
    opacity: 0.12,
  },

  cornerDropdownWrapper: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 100,
    alignItems: 'flex-end',
    elevation: 15,
  },

  cornerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    gap: 5,
  },

  cornerBtnText: {
    color: '#FFD54F',
    fontWeight: 'bold',
  },

  dropdownBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    width: responsive(145),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  dropdownLabel: {
    fontWeight: '900',
    color: '#7A1020',
    textAlign: 'center',
  },

  dropdownLabelEn: {
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 6,
  },

  dropdownDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },

  dropItem: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },

  dropItemActive: {
    backgroundColor: '#FFF4C2',
  },

  dropItemText: {
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },

  dropItemTextActive: {
    color: '#7A1020',
  },

  topSection: {
    alignItems: 'center',
    marginTop: 52,
    width: '100%',
    zIndex: 1,
  },

  emblemOuter: {
    width: responsive(84),
    height: responsive(84),
    borderRadius: responsive(42),
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
    width: responsive(68),
    height: responsive(68),
    borderRadius: responsive(34),
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },

  dotRow: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 13,
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
    fontWeight: '800',
    color: '#FFF4C2',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  enTitle: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  taTitle: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 15,
  },

  badgeText: {
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginVertical: 4,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  dividerText: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  verticalButtonsWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 16,
    marginVertical: 6,
    marginBottom: 36,
  },

  circleLangBtn: {
    width: responsive(220),
    height: responsive(56),
    borderRadius: 40,
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
    transform: [{ scale: 0.96 }],
  },

  circleLangNativeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },

  circleLangNativeTextActive: {
    color: '#7A1020',
  },

  circleLangSubText: {
    color: 'rgba(255,255,255,0.50)',
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
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});