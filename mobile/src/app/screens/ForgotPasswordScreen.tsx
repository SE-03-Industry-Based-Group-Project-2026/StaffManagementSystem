// app/screens/ResetPasswordScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFont } from '../FontContext';

interface Props {
  onBack: () => void;
  selectedLang: string;
  onSuccess?: () => void;
}

const { height, width } = Dimensions.get('window');

const responsive = (size: number) => {
  const baseWidth = 390;
  return Math.round((width / baseWidth) * size);
};

const AppText = (props: TextProps) => (
  <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
);

export default function ResetPasswordScreen({
  onBack,
  selectedLang,
  onSuccess,
}: Props) {
  const { font } = useFont();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isSinhala = selectedLang === 'si';
  const isTamil = selectedLang === 'ta';

  const texts = useMemo(() => {
    if (isSinhala) {
      return {
        title: 'නව මුරපදයක් සකසන්න',
        sub: 'ඔබගේ ගිණුම සඳහා නව මුරපදයක් ඇතුළත් කරන්න.',
        passwordLabel: 'නව මුරපදය',
        confirmLabel: 'මුරපදය තහවුරු කරන්න',
        passwordPlaceholder: 'නව මුරපදය ඇතුළත් කරන්න',
        confirmPlaceholder: 'මුරපදය නැවත ඇතුළත් කරන්න',
        requirementTitle: 'මුරපද අවශ්‍යතා',
        minLength: 'අවම වශයෙන් අක්ෂර 8ක්',
        uppercase: 'අවම වශයෙන් එක් විශාල ඉංග්‍රීසි අකුරක් (A-Z)',
        number: 'අවම වශයෙන් එක් ඉලක්කමක් (0-9)',
        match: 'මුරපද දෙක එක සමාන විය යුතුය',
        button: 'මුරපදය යාවත්කාලීන කරන්න',
        loading: 'යාවත්කාලීන කරමින්...',
        successTitle: 'සාර්ථකයි!',
        successMessage: 'ඔබගේ මුරපදය සාර්ථකව යාවත්කාලීන කරන ලදී.',
        backLogin: 'පිවිසුම් පිටුවට යන්න',
        emptyTitle: 'අවශ්‍යයි',
        emptyMessage: 'කරුණාකර මුරපද දෙකම ඇතුළත් කරන්න.',
        invalidTitle: 'මුරපදය වලංගු නොවේ',
        invalidMessage:
          'මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතු අතර, අවම වශයෙන් එක් විශාල ඉංග්‍රීසි අකුරක් සහ එක් ඉලක්කමක් අඩංගු විය යුතුය.',
        mismatchTitle: 'මුරපද නොගැලපේ',
        mismatchMessage: 'මුරපද දෙක එක සමාන නොවේ. කරුණාකර නැවත පරීක්ෂා කරන්න.',
        updateErrorTitle: 'දෝෂයකි',
        updateErrorMessage: 'මුරපදය යාවත්කාලීන කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
      };
    }

    if (isTamil) {
      return {
        title: 'புதிய கடவுச்சொல்லை அமைக்கவும்',
        sub: 'உங்கள் கணக்கிற்கான புதிய கடவுச்சொல்லை உள்ளிடவும்.',
        passwordLabel: 'புதிய கடவுச்சொல்',
        confirmLabel: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
        passwordPlaceholder: 'புதிய கடவுச்சொல்லை உள்ளிடவும்',
        confirmPlaceholder: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
        requirementTitle: 'கடவுச்சொல் தேவைகள்',
        minLength: 'குறைந்தது 8 எழுத்துகள்',
        uppercase: 'குறைந்தது ஒரு பெரிய ஆங்கில எழுத்து (A-Z)',
        number: 'குறைந்தது ஒரு எண் (0-9)',
        match: 'இரண்டு கடவுச்சொற்களும் ஒரே மாதிரியாக இருக்க வேண்டும்',
        button: 'கடவுச்சொல்லை புதுப்பிக்கவும்',
        loading: 'புதுப்பிக்கிறது...',
        successTitle: 'வெற்றி!',
        successMessage: 'உங்கள் கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.',
        backLogin: 'உள்நுழைவு பக்கத்திற்குச் செல்லவும்',
        emptyTitle: 'தேவை',
        emptyMessage: 'தயவுசெய்து இரண்டு கடவுச்சொற்களையும் உள்ளிடவும்.',
        invalidTitle: 'தவறான கடவுச்சொல்',
        invalidMessage:
          'கடவுச்சொல் குறைந்தது 8 எழுத்துகளைக் கொண்டிருக்க வேண்டும், குறைந்தது ஒரு பெரிய ஆங்கில எழுத்தும் ஒரு எண்ணும் இருக்க வேண்டும்.',
        mismatchTitle: 'கடவுச்சொற்கள் பொருந்தவில்லை',
        mismatchMessage: 'இரண்டு கடவுச்சொற்களும் ஒரே மாதிரியாக இல்லை. மீண்டும் சரிபார்க்கவும்.',
        updateErrorTitle: 'பிழை',
        updateErrorMessage: 'கடவுச்சொல்லை புதுப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      };
    }

    return {
      title: 'Set New Password',
      sub: 'Enter a new password for your account.',
      passwordLabel: 'New Password',
      confirmLabel: 'Confirm Password',
      passwordPlaceholder: 'Enter new password',
      confirmPlaceholder: 'Re-enter new password',
      requirementTitle: 'Password Requirements',
      minLength: 'At least 8 characters',
      uppercase: 'At least one uppercase English letter (A-Z)',
      number: 'At least one number (0-9)',
      match: 'Both passwords must match',
      button: 'Update Password',
      loading: 'Updating...',
      successTitle: 'Success!',
      successMessage: 'Your password has been updated successfully.',
      backLogin: 'Go to Login',
      emptyTitle: 'Required',
      emptyMessage: 'Please enter both password fields.',
      invalidTitle: 'Invalid Password',
      invalidMessage:
        'Password must be at least 8 characters long and contain at least one uppercase English letter and one number.',
      mismatchTitle: 'Passwords Do Not Match',
      mismatchMessage: 'The two passwords do not match. Please check again.',
      updateErrorTitle: 'Error',
      updateErrorMessage: 'Unable to update your password. Please try again.',
    };
  }, [isSinhala, isTamil]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    passwordsMatch;

  const handleUpdatePassword = async () => {
    Keyboard.dismiss();

    if (!password || !confirmPassword) {
      Alert.alert(texts.emptyTitle, texts.emptyMessage);
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      Alert.alert(texts.invalidTitle, texts.invalidMessage);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(texts.mismatchTitle, texts.mismatchMessage);
      return;
    }

    setLoading(true);

    try {
      // The password-reset email should have already established
      // the Supabase recovery session through the app deep link.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        Alert.alert(
          texts.updateErrorTitle,
          texts.updateErrorMessage
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('[Reset Password] updateUser error:', error);

        Alert.alert(
          texts.updateErrorTitle,
          error.message || texts.updateErrorMessage
        );
        return;
      }

      setSuccess(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[Reset Password] unexpected error:', error);

      Alert.alert(
        texts.updateErrorTitle,
        texts.updateErrorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const RequirementRow = ({
    valid,
    text,
  }: {
    valid: boolean;
    text: string;
  }) => (
    <View style={styles.requirementRow}>
      <Ionicons
        name={valid ? 'checkmark-circle' : 'ellipse-outline'}
        size={font(17)}
        color={valid ? '#10B981' : '#94A3B8'}
      />
      <AppText
        style={[
          styles.requirementText,
          {
            fontSize: font(11.5),
            color: valid ? '#047857' : '#64748B',
          },
        ]}
      >
        {text}
      </AppText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, styles.background]} />
        <View style={styles.bgTopLayer} />
        <View style={styles.bgBottomLayer} />
        <View
          style={[
            styles.circle,
            {
              width: responsive(320),
              height: responsive(320),
              top: -80,
              right: -80,
              opacity: 0.08,
            },
          ]}
        />
        <View
          style={[
            styles.circle,
            {
              width: responsive(160),
              height: responsive(160),
              bottom: 60,
              left: -40,
              opacity: 0.06,
            },
          ]}
        />
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.topBlock}>
          <View style={styles.emblemOuter}>
            <View style={styles.emblemInner}>
              <Ionicons
                name={success ? 'checkmark-outline' : 'lock-closed-outline'}
                size={responsive(32)}
                color="#FFBF00"
              />
            </View>
          </View>

          <View style={styles.dotRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[styles.dot, i === 2 && styles.dotCenter]}
              />
            ))}
          </View>

          <AppText
            style={[
              styles.mainTitle,
              { fontSize: font(18), lineHeight: font(26) },
            ]}
          >
            {success ? texts.successTitle : texts.title}
          </AppText>

          <AppText
            style={[styles.subTitle, { fontSize: font(12) }]}
          >
            {success ? texts.successMessage : texts.sub}
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopBar} />

          {success ? (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle"
                size={font(64)}
                color="#10B981"
              />

              <AppText
                style={[
                  styles.cardHeading,
                  {
                    fontSize: font(18),
                    marginTop: 15,
                    textAlign: 'center',
                  },
                ]}
              >
                {texts.successTitle}
              </AppText>

              <AppText
                style={[
                  styles.cardSubHeading,
                  {
                    fontSize: font(13),
                    textAlign: 'center',
                    marginTop: 8,
                  },
                ]}
              >
                {texts.successMessage}
              </AppText>

              <TouchableOpacity
                style={[styles.loginBtn, { marginTop: 22 }]}
                onPress={onBack}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="log-in-outline"
                  size={font(18)}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <AppText
                  style={[
                    styles.loginBtnText,
                    { fontSize: font(14) },
                  ]}
                >
                  {texts.backLogin}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <AppText
                style={[
                  styles.cardHeading,
                  { fontSize: font(16) },
                ]}
              >
                {texts.title}
              </AppText>

              <AppText
                style={[
                  styles.cardSubHeading,
                  {
                    fontSize: font(12),
                    lineHeight: font(17),
                  },
                ]}
              >
                {texts.sub}
              </AppText>

              <View style={styles.fieldWrap}>
                <AppText
                  style={[
                    styles.fieldLabel,
                    { fontSize: font(11) },
                  ]}
                >
                  {texts.passwordLabel}
                </AppText>

                <View
                  style={[
                    styles.inputRow,
                    passwordFocused && styles.inputRowFocused,
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={font(17)}
                      color={passwordFocused ? '#7A1020' : '#999'}
                    />
                  </View>

                  <TextInput
                    allowFontScaling={false}
                    style={[
                      styles.input,
                      { fontSize: font(14) },
                    ]}
                    placeholder={texts.passwordPlaceholder}
                    placeholderTextColor="#B0B8C4"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword((value) => !value)
                    }
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={font(19)}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.requirementsBox}>
                <AppText
                  style={[
                    styles.requirementTitle,
                    { fontSize: font(11.5) },
                  ]}
                >
                  {texts.requirementTitle}
                </AppText>

                <RequirementRow
                  valid={hasMinLength}
                  text={texts.minLength}
                />
                <RequirementRow
                  valid={hasUppercase}
                  text={texts.uppercase}
                />
                <RequirementRow
                  valid={hasNumber}
                  text={texts.number}
                />
              </View>

              <View style={styles.fieldWrap}>
                <AppText
                  style={[
                    styles.fieldLabel,
                    { fontSize: font(11) },
                  ]}
                >
                  {texts.confirmLabel}
                </AppText>

                <View
                  style={[
                    styles.inputRow,
                    confirmFocused && styles.inputRowFocused,
                    confirmPassword.length > 0 &&
                      !passwordsMatch &&
                      styles.inputRowError,
                    passwordsMatch && styles.inputRowValid,
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={font(17)}
                      color={
                        passwordsMatch
                          ? '#10B981'
                          : confirmFocused
                            ? '#7A1020'
                            : '#999'
                      }
                    />
                  </View>

                  <TextInput
                    allowFontScaling={false}
                    style={[
                      styles.input,
                      { fontSize: font(14) },
                    ]}
                    placeholder={texts.confirmPlaceholder}
                    placeholderTextColor="#B0B8C4"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="password-new"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={font(19)}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {confirmPassword.length > 0 && (
                <View style={styles.matchRow}>
                  <Ionicons
                    name={
                      passwordsMatch
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={font(16)}
                    color={
                      passwordsMatch ? '#10B981' : '#DC2626'
                    }
                  />
                  <AppText
                    style={[
                      styles.matchText,
                      {
                        fontSize: font(11),
                        color: passwordsMatch
                          ? '#047857'
                          : '#B91C1C',
                      },
                    ]}
                  >
                    {passwordsMatch
                      ? texts.match
                      : isSinhala
                        ? 'මුරපද දෙක එක සමාන විය යුතුය'
                        : isTamil
                          ? 'இரண்டு கடவுச்சொற்களும் ஒரே மாதிரியாக இருக்க வேண்டும்'
                          : 'Both passwords must match'}
                  </AppText>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.loginBtn,
                  !isValid && styles.loginBtnDisabled,
                ]}
                onPress={handleUpdatePassword}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <ActivityIndicator
                      color="#FFF"
                      size="small"
                    />
                    <AppText
                      style={[
                        styles.loginBtnText,
                        { fontSize: font(14) },
                      ]}
                    >
                      {texts.loading}
                    </AppText>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name="key-outline"
                      size={font(18)}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <AppText
                      style={[
                        styles.loginBtnText,
                        { fontSize: font(14) },
                      ]}
                    >
                      {texts.button}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.cardDivider}>
                <View style={styles.cardDividerLine} />
                <AppText
                  style={[
                    styles.cardDividerText,
                    { fontSize: font(10) },
                  ]}
                >
                  OR
                </AppText>
                <View style={styles.cardDividerLine} />
              </View>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-back"
                  size={font(16)}
                  color="#7A1020"
                />
                <AppText
                  style={[
                    styles.backBtnText,
                    { fontSize: font(13) },
                  ]}
                >
                  {isSinhala
                    ? 'ආපසු පිවිසුම් පිටුවට'
                    : isTamil
                      ? 'உள்நுழைவுக்குத் திரும்பு'
                      : 'Back to Login'}
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Ionicons
            name="lock-closed-outline"
            size={font(10)}
            color="rgba(255,255,255,0.35)"
          />
          <AppText
            style={[
              styles.footerText,
              { fontSize: font(9) },
            ]}
          >
            {' '}256-bit Encrypted • Smart Governance Platform
          </AppText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#7A1020',
  },

  background: {
    backgroundColor: '#7A1020',
  },

  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsive(24),
    width: '100%',
  },

  bgTopLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.48,
    backgroundColor: '#A32035',
    opacity: 0.4,
  },

  bgBottomLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.38,
    backgroundColor: '#5A0F1C',
    opacity: 0.5,
  },

  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#FFBF00',
  },

  topBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: responsive(18),
  },

  emblemOuter: {
    width: responsive(84),
    height: responsive(84),
    borderRadius: responsive(42),
    backgroundColor: 'rgba(255,191,0,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: responsive(68),
    height: responsive(68),
    borderRadius: responsive(34),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFBF00',
    overflow: 'hidden',
  },

  dotRow: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 10,
    alignItems: 'center',
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,191,0,0.35)',
  },

  dotCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFBF00',
  },

  mainTitle: {
    fontWeight: '800',
    color: '#FFF4C2',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  subTitle: {
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: responsive(22),
    paddingTop: 0,
    paddingBottom: responsive(22),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },

  cardTopBar: {
    height: 0,
    backgroundColor: '#7A1020',
    marginBottom: 18,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  cardHeading: {
    fontWeight: '800',
    color: '#1A0005',
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  cardSubHeading: {
    color: '#8A96A8',
    marginBottom: 18,
  },

  fieldWrap: {
    marginBottom: 13,
  },

  fieldLabel: {
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 6,
    letterSpacing: 0.8,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF2',
    minHeight: responsive(46),
    paddingHorizontal: 4,
  },

  inputRowFocused: {
    borderColor: '#7A1020',
    backgroundColor: '#FFF5F7',
  },

  inputRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF7F7',
  },

  inputRowValid: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },

  inputIconBox: {
    width: responsive(34),
    height: responsive(34),
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  input: {
    flex: 1,
    color: '#1A2940',
    paddingHorizontal: 6,
    height: responsive(46),
  },

  eyeButton: {
    width: responsive(40),
    height: responsive(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  requirementsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 15,
  },

  requirementTitle: {
    fontWeight: '800',
    color: '#334155',
    marginBottom: 7,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  requirementText: {
    marginLeft: 7,
    fontWeight: '600',
    flex: 1,
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -5,
    marginBottom: 12,
    paddingHorizontal: 3,
  },

  matchText: {
    marginLeft: 6,
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: '#7A1020',
    minHeight: responsive(46),
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A1020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    paddingHorizontal: 14,
  },

  loginBtnDisabled: {
    backgroundColor: '#C0535F',
    shadowOpacity: 0.15,
    elevation: 2,
  },

  loginBtnText: {
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  cardDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 15,
  },

  cardDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF2',
  },

  cardDividerText: {
    color: '#B0B8C4',
    fontWeight: '700',
    letterSpacing: 1,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFF5F7',
    borderWidth: 1.5,
    borderColor: '#F0D0D5',
    borderRadius: 12,
    height: responsive(42),
  },

  backBtnText: {
    color: '#7A1020',
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },

  footerText: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
