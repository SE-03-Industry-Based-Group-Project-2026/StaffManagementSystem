// app/screens/ResetPasswordScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, StyleSheet,
  Text as RNText, TextInput, TextProps, TouchableOpacity, View, ActivityIndicator, Keyboard, ScrollView
} from 'react-native';
import { useFont } from '../FontContext';

const { height, width } = Dimensions.get('window');
const AppText = (props: TextProps) => <RNText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
const responsive = (size: number) => Math.round((width / 390) * size);

// 🔥 භාෂා 3ටම අදාළ වචන මාලාව (NIC එකට අදාළ වචනත් එකතු කළා)
const L = {
  si: {
    nicTitle: 'ගිණුම සොයන්න',
    nicSub: 'ඔබගේ ජාතික හැඳුනුම්පත් අංකය පහතින් ඇතුළත් කරන්න.',
    nicLabel: 'ජාතික හැඳුනුම්පත් අංකය',
    nicPlaceholder: 'උදා: 199012345678 / 901234567V',
    findBtn: 'OTP කේතය යවන්න',
    loadingOTP: 'කරුණාකර රැඳී සිටින්න...\nOTP කේතය ඔබගේ විද්‍යුත් තැපෑලට යවමින් පවතී.',
    verifyTitle: 'කේතය තහවුරු කරන්න',
    verifySub1: 'ලිපිනයට එවූ ඉලක්කම් 6ක කේතය පහතින් ඇතුළත් කරන්න.',
    verifySub2: 'ඔබගේ විද්‍යුත් තැපෑලට එවූ ඉලක්කම් 6ක කේතය පහතින් ඇතුළත් කරන්න.',
    otpLabel: 'OTP කේතය (ඉලක්කම් 6)',
    noCode: 'කේතය ලැබුණේ නැද්ද?',
    resend: 'නැවත යවන්න',
    sending: 'යවමින්...',
    resendIn: 'තත්පර {sec} කින් නැවත යවන්න',
    continueBtn: 'ඉදිරියට යන්න',
    cancelBtn: 'අවලංගු කරන්න',
    setPwTitle: 'නව මුරපදය සකසන්න',
    setPwSub: 'ඔබගේ ගිණුමේ ආරක්ෂාව සඳහා ශක්තිමත් මුරපදයක් සකසන්න.',
    newPwLabel: 'නව මුරපදය',
    confirmPwLabel: 'මුරපදය තහවුරු කරන්න',
    submitBtn: 'මුරපදය වෙනස් කරන්න',
    reqLength: 'අවම වශයෙන් අක්ෂර 8 ක්',
    reqUpper: 'එක් කැපිටල් අකුරක් (A-Z)',
    reqNum: 'එක් ඉලක්කමක් (0-9)',
    reqMatch: 'මුරපද දෙකම සමාන වීම',
    errorTitle: 'දෝෂයකි!',
    attention: 'අවධානයයි!',
    emptyNic: 'කරුණාකර ඔබගේ හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.',
    invalidNic: 'මෙම හැඳුනුම්පත් අංකයට අදාළ ගිණුමක් පද්ධතියේ නොමැත.',
    emptyOtp: 'කරුණාකර ඉලක්කම් 6කින් යුත් නිවැරදි කේතය ඇතුළත් කරන්න.',
    invalidOtp: 'ඔබ ඇතුළත් කළ කේතය වැරදියි හෝ කල් ඉකුත් වී ඇත.',
    pwRulesError: 'කරුණාකර මුරපදය සඳහා දී ඇති සියලු නීති සම්පූර්ණ කරන්න.',
    samePwError: 'නව මුරපදය ඔබගේ පරණ මුරපදයට වඩා වෙනස් විය යුතුය.',
    sysError: 'පද්ධතිය හා සම්බන්ධ වීමේදී දෝෂයක් මතු විය.',
    successTitle: 'සාර්ථකයි!',
    successMsg: 'ඔබගේ මුරපදය සාර්ථකව වෙනස් කරන ලදී. කරුණාකර නව මුරපදය භාවිතයෙන් ලොග් වන්න.',
    ok: 'හරි'
  },
  en: {
    nicTitle: 'Find Your Account',
    nicSub: 'Please enter your National Identity Card number below.',
    nicLabel: 'NIC Number',
    nicPlaceholder: 'e.g: 199012345678 / 901234567V',
    findBtn: 'Send OTP',
    loadingOTP: 'Please wait...\nSending OTP to your email.',
    verifyTitle: 'Verify Code',
    verifySub1: 'Enter the 6-digit code sent to',
    verifySub2: 'Enter the 6-digit code sent to your email.',
    otpLabel: 'OTP Code (6 digits)',
    noCode: "Didn't receive code?",
    resend: 'Resend Code',
    sending: 'Sending...',
    resendIn: 'Resend in {sec}s',
    continueBtn: 'Continue',
    cancelBtn: 'Cancel',
    setPwTitle: 'Set New Password',
    setPwSub: 'Set a strong password for your account security.',
    newPwLabel: 'New Password',
    confirmPwLabel: 'Confirm Password',
    submitBtn: 'Change Password',
    reqLength: 'At least 8 characters',
    reqUpper: 'One capital letter (A-Z)',
    reqNum: 'One number (0-9)',
    reqMatch: 'Passwords match',
    errorTitle: 'Error!',
    attention: 'Attention!',
    emptyNic: 'Please enter your NIC number.',
    invalidNic: 'No account found for this NIC number.',
    emptyOtp: 'Please enter a valid 6-digit code.',
    invalidOtp: 'The code is incorrect or has expired.',
    pwRulesError: 'Please complete all the password rules.',
    samePwError: 'New password must be different from the old password.',
    sysError: 'A system error occurred.',
    successTitle: 'Success!',
    successMsg: 'Your password has been changed successfully. Please log in with your new password.',
    ok: 'OK'
  },
  ta: {
    nicTitle: 'கணக்கைக் கண்டறியவும்',
    nicSub: 'உங்கள் தேசிய அடையாள அட்டை எண்ணை கீழே உள்ளிடவும்.',
    nicLabel: 'அடையாள அட்டை எண்',
    nicPlaceholder: 'எ.கா: 199012345678 / 901234567V',
    findBtn: 'OTP அனுப்பு',
    loadingOTP: 'காத்திருக்கவும்...\nஉங்கள் மின்னஞ்சலுக்கு OTP அனுப்பப்படுகிறது.',
    verifyTitle: 'குறியீட்டை சரிபார்க்கவும்',
    verifySub1: 'மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6-இலக்க குறியீட்டை உள்ளிடவும்',
    verifySub2: 'உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6-இலக்க குறியீட்டை உள்ளிடவும்.',
    otpLabel: 'OTP குறியீடு (6 இலக்கங்கள்)',
    noCode: 'குறியீடு கிடைக்கவில்லையா?',
    resend: 'மீண்டும் அனுப்பு',
    sending: 'அனுப்புகிறது...',
    resendIn: '{sec} வினாடிகளில் மீண்டும் அனுப்பு',
    continueBtn: 'தொடரவும்',
    cancelBtn: 'ரத்துசெய்',
    setPwTitle: 'புதிய கடவுச்சொல்லை அமைக்கவும்',
    setPwSub: 'உங்கள் கணக்கின் பாதுகாப்பிற்காக வலுவான கடவுச்சொல்லை அமைக்கவும்.',
    newPwLabel: 'புதிய கடவுச்சொல்',
    confirmPwLabel: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    submitBtn: 'கடவுச்சொல்லை மாற்றவும்',
    reqLength: 'குறைந்தபட்சம் 8 எழுத்துகள்',
    reqUpper: 'ஒரு பெரிய எழுத்து (A-Z)',
    reqNum: 'ஒரு எண் (0-9)',
    reqMatch: 'கடவுச்சொற்கள் பொருந்துகின்றன',
    errorTitle: 'பிழை!',
    attention: 'கவனம்!',
    emptyNic: 'உங்கள் அடையாள அட்டை எண்ணை உள்ளிடவும்.',
    invalidNic: 'இந்த அடையாள அட்டை எண்ணுக்கு கணக்கு இல்லை.',
    emptyOtp: 'சரியான 6-இலக்க குறியீட்டை உள்ளிடவும்.',
    invalidOtp: 'குறியீடு தவறானது அல்லது காலாவதியானது.',
    pwRulesError: 'அனைத்து கடவுச்சொல் விதிகளையும் பூர்த்தி செய்யவும்.',
    samePwError: 'புதிய கடவுச்சொல் பழைய கடவுச்சொல்லை விட வேறுபட்டிருக்க வேண்டும்.',
    sysError: 'கணினி பிழை ஏற்பட்டது.',
    successTitle: 'வெற்றி!',
    successMsg: 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது. புதிய கடவுச்சொல்லுடன் மீண்டும் உள்நுழைக.',
    ok: 'சரி'
  }
};

export default function ResetPasswordScreen(props: any) {
  const { onBack, onSuccess, navigation } = props;
  const selectedLang = props.selectedLang || 'si';
  const t = L[selectedLang as keyof typeof L] || L.si;

  // 🔥 Flow Steps: 1 = NIC, 2 = OTP, 3 = Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const { font } = useFont();
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [step]);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (step === 2 && timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, step]);

  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword; 
  const isPasswordValid = hasMinLength && hasUpper && hasNumber && passwordsMatch;

  // ============================
  // STEP 1: NIC -> Fetch Email -> Send OTP
  // ============================
  const handleSendOTP = async () => {
    Keyboard.dismiss();
    if (!nic.trim()) {
      Alert.alert(t.attention, t.emptyNic);
      return;
    }

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('nic', nic.trim())
        .maybeSingle();

      if (userError || !userData || !userData.email) {
        Alert.alert(t.errorTitle, t.invalidNic);
        setLoading(false);
        return;
      }

      const foundEmail = userData.email;
      setEmail(foundEmail);

      const { error: otpError } = await supabase.auth.resetPasswordForEmail(foundEmail);

      if (otpError) {
        Alert.alert(t.errorTitle, t.sysError);
      } else {
        setStep(2); // Move to OTP Step
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (err) {
      Alert.alert(t.errorTitle, t.sysError);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Resend OTP Action
  // ============================
  const handleResendOTP = async () => {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setResending(false);
    
    if (error) {
      Alert.alert(t.errorTitle, t.sysError);
    } else {
      setTimeLeft(60);
      setCanResend(false);
    }
  };

  // ============================
  // STEP 2: Verify OTP
  // ============================
  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    if (!otp || otp.length < 6) {
      Alert.alert(t.attention, t.emptyOtp);
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'recovery',
      });

      if (verifyError) {
        Alert.alert(t.errorTitle, t.invalidOtp);
      } else {
        setStep(3); // Move to Password Step
      }
    } catch (err) {
      Alert.alert(t.errorTitle, t.sysError);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // STEP 3: Update Password & Finish
  // ============================
  const handleUpdatePassword = async () => {
    Keyboard.dismiss();
    if (!isPasswordValid) {
      Alert.alert(t.attention, t.pwRulesError);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        if (updateError.message.includes('different from the old password')) {
          Alert.alert(t.errorTitle, t.samePwError);
        } else {
          Alert.alert(t.errorTitle, updateError.message);
        }
      } else {
        await supabase.from('users').update({ is_first_login: false }).eq('email', email);

        // 🔥 Log out first
        await supabase.auth.signOut();

        Alert.alert(t.successTitle, t.successMsg, [
          { 
            text: t.ok, 
            onPress: () => {
               // 🔥 Route back to Login
               if (onSuccess) {
                  onSuccess();
               } else if (navigation && navigation.replace) {
                  navigation.replace('LoginScreen'); 
               } else if (navigation && navigation.navigate) {
                  navigation.navigate('LoginScreen');
               } else if (onBack) {
                  onBack();
               }
            } 
          }
        ]);
      }
    } catch (err) {
      Alert.alert(t.errorTitle, t.sysError);
    } finally {
      setLoading(false);
    }
  };

  const ValidationRow = ({ text, isValid }: { text: string, isValid: boolean }) => (
    <View style={styles.valRow}>
      <Ionicons name={isValid ? "checkmark-circle" : "close-circle"} size={font(14)} color={isValid ? "#10B981" : "#EF4444"} />
      <AppText style={[styles.valText, { color: isValid ? "#10B981" : "#64748B", fontSize: font(11) }]}>{text}</AppText>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#7A1020' }]} />
        <View style={styles.bgTopLayer} />
        <View style={styles.bgBottomLayer} />
      </View>

      {/* 🔥 ScrollContent with extra paddingBottom so keyboard never blocks the UI */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
            <View style={styles.cardTopBar} />

            {/* =========================
                STEP 1: NIC ENTRY
                ========================= */}
            {step === 1 && (
              <>
                <AppText style={[styles.cardHeading, { fontSize: font(16) }]}>{t.nicTitle}</AppText>
                <AppText style={[styles.cardSubHeading, { fontSize: font(12), lineHeight: font(16) }]}>
                  {t.nicSub}
                </AppText>

                <View style={styles.fieldWrap}>
                  <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>{t.nicLabel}</AppText>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIconBox}><Ionicons name="card-outline" size={font(16)} color="#999" /></View>
                    <TextInput
                      allowFontScaling={false}
                      style={[styles.input, { fontSize: font(14) }]}
                      placeholder={t.nicPlaceholder}
                      placeholderTextColor="#B0B8C4"
                      value={nic}
                      onChangeText={setNic}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <TouchableOpacity style={[styles.loginBtn, { marginTop: 10 }, (!nic || loading) && styles.loginBtnDisabled]} onPress={handleSendOTP} disabled={loading || !nic}>
                  {loading ? <ActivityIndicator color="#FFF" size="small" /> : <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>{t.findBtn}</AppText>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => { if (onBack) onBack(); else navigation?.goBack(); }}>
                  <Ionicons name="arrow-back" size={font(16)} color="#7A1020" />
                  <AppText style={[styles.backBtnText, { fontSize: font(13) }]}>{t.cancelBtn}</AppText>
                </TouchableOpacity>
              </>
            )}

            {/* =========================
                STEP 2: OTP VERIFICATION
                ========================= */}
            {step === 2 && (
              <>
                <AppText style={[styles.cardHeading, { fontSize: font(16) }]}>{t.verifyTitle}</AppText>
                <AppText style={[styles.cardSubHeading, { fontSize: font(12), lineHeight: font(16) }]}>
                  {email ? `${email} ${t.verifySub1}` : t.verifySub2}
                </AppText>

                <View style={styles.fieldWrap}>
                  <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>{t.otpLabel}</AppText>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIconBox}><Ionicons name="key-outline" size={font(16)} color="#999" /></View>
                    <TextInput
                      allowFontScaling={false}
                      style={[styles.input, { fontSize: font(14), letterSpacing: 4 }]}
                      placeholder="123456"
                      placeholderTextColor="#B0B8C4"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                  
                  <View style={styles.resendRow}>
                     <AppText style={{ fontSize: font(11), color: '#64748B' }}>{t.noCode}</AppText>
                     {canResend ? (
                       <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                         <AppText style={{ fontSize: font(11), color: '#7A1020', fontWeight: 'bold' }}>
                           {resending ? t.sending : t.resend}
                         </AppText>
                       </TouchableOpacity>
                     ) : (
                       <AppText style={{ fontSize: font(11), color: '#94A3B8' }}>{t.resendIn.replace('{sec}', String(timeLeft))}</AppText>
                     )}
                  </View>
                </View>

                <TouchableOpacity style={[styles.loginBtn, { marginTop: 10 }, (!otp || loading) && styles.loginBtnDisabled]} onPress={handleVerifyOTP} disabled={loading || !otp}>
                  {loading ? <ActivityIndicator color="#FFF" size="small" /> : <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>{t.continueBtn}</AppText>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                  <Ionicons name="arrow-back" size={font(16)} color="#7A1020" />
                  <AppText style={[styles.backBtnText, { fontSize: font(13) }]}>ආපසු</AppText>
                </TouchableOpacity>
              </>
            )}

            {/* =========================
                STEP 3: SET NEW PASSWORD
                ========================= */}
            {step === 3 && (
              <>
                <AppText style={[styles.cardHeading, { fontSize: font(16) }]}>{t.setPwTitle}</AppText>
                <AppText style={[styles.cardSubHeading, { fontSize: font(12), lineHeight: font(16) }]}>
                  {t.setPwSub}
                </AppText>

                <View style={styles.fieldWrap}>
                  <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>{t.newPwLabel}</AppText>
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
                      autoCapitalize="none" 
                      autoCorrect={false} 
                    />
                    <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={font(18)} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <AppText style={[styles.fieldLabel, { fontSize: font(11) }]}>{t.confirmPwLabel}</AppText>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIconBox}><Ionicons name="checkmark-done-outline" size={font(16)} color="#999" /></View>
                    <TextInput
                      allowFontScaling={false}
                      style={[styles.input, { fontSize: font(14) }]}
                      placeholder="••••••••"
                      placeholderTextColor="#B0B8C4"
                      secureTextEntry={!showConfirmPass}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none" 
                      autoCorrect={false} 
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPass(p => !p)} style={styles.eyeBtn}>
                      <Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={font(18)} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.validationBox}>
                     <ValidationRow text={t.reqLength} isValid={hasMinLength} />
                     <ValidationRow text={t.reqUpper} isValid={hasUpper} />
                     <ValidationRow text={t.reqNum} isValid={hasNumber} />
                     <ValidationRow text={t.reqMatch} isValid={passwordsMatch} />
                  </View>
                </View>

                <TouchableOpacity style={[styles.loginBtn, { marginTop: 10 }, (!isPasswordValid || loading) && styles.loginBtnDisabled]} onPress={handleUpdatePassword} disabled={loading || !isPasswordValid}>
                  {loading ? <ActivityIndicator color="#FFF" size="small" /> : <AppText style={[styles.loginBtnText, { fontSize: font(14) }]}>{t.submitBtn}</AppText>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                  <Ionicons name="arrow-back" size={font(16)} color="#7A1020" />
                  <AppText style={[styles.backBtnText, { fontSize: font(13) }]}>ආපසු</AppText>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#7A1020' },
  // 🔥 paddingTop සහ paddingBottom දුන්නම ලස්සනට Scroll වෙනවා, කීබෝඩ් එක ආවම හිරවෙන්නේ නෑ
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: responsive(24), paddingTop: height * 0.1, paddingBottom: 150 },
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
  
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 },
  validationBox: { marginTop: 10, paddingHorizontal: 5, backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  valRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  valText: { marginLeft: 8, fontWeight: '600' },

  loginBtn: { backgroundColor: '#7A1020', height: responsive(46), borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginBtnDisabled: { backgroundColor: '#C0535F' },
  loginBtnText: { color: '#FFF', fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#FFF5F7', borderWidth: 1.5, borderColor: '#F0D0D5', borderRadius: 12, height: responsive(42), marginTop: 15 },
  backBtnText: { color: '#7A1020', fontWeight: '700' },
});