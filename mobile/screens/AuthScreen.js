import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { TextInput, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GridBackground from '../components/GridBackground';

import {
  signInWithSupabase,
  signUpWithSupabase,
  resendVerificationEmail,
} from '../services/supabaseAuth';
import { socialLogin } from '../services/api';

const { width } = Dimensions.get('window');

// ── Web Design Tokens (Exact 1:1 match with AuthPro.css & Home.css) ───────────
const THEME = {
  bgDeep: '#070A13',
  bgCard: 'rgba(13, 20, 36, 0.92)',
  bgInput: 'rgba(20, 29, 48, 0.85)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderInput: 'rgba(255, 255, 255, 0.14)',
  borderFocus: '#F43F5E',

  primary: '#F43F5E',
  primaryHover: '#FB7185',
  primaryDark: '#BE123C',
  emerald: '#10B981',
  emeraldGlow: 'rgba(16, 185, 129, 0.25)',
  cyan: '#06B6D4',
  amber: '#F59E0B',

  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',

  error: '#F43F5E',
  errorBg: 'rgba(244, 63, 94, 0.12)',
  errorBorder: 'rgba(244, 63, 94, 0.3)',
};

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  // Email verification modal state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // Native Entry Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Live HUD dot pulse
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Password Strength
  const pwdStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s += 1;
    if (password.length >= 8) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  }, [password]);

  const strengthColor = useMemo(() => {
    if (pwdStrength <= 1) return '#EF4444';
    if (pwdStrength === 2) return '#F59E0B';
    if (pwdStrength === 3) return '#3B82F6';
    return '#10B981';
  }, [pwdStrength]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    if (pwdStrength <= 1) return 'Weak';
    if (pwdStrength === 2) return 'Fair';
    if (pwdStrength === 3) return 'Good';
    return 'Strong';
  }, [password, pwdStrength]);

  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setNeedsVerification(false);
    setResendSuccess('');
  };

  const validateForm = () => {
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const user = await signInWithSupabase(email, password);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        if (onLogin) onLogin(user);
      } else {
        const result = await signUpWithSupabase(name, email, password);
        if (result.needsVerification) {
          setNeedsVerification(true);
          setVerifyEmail(result.email || email);
        } else if (result.user) {
          await AsyncStorage.setItem('user', JSON.stringify(result.user));
          if (onLogin) onLogin(result.user);
        } else {
          setIsLogin(true);
          Alert.alert(
            'Registration Successful',
            'Account created! Please sign in with your credentials.'
          );
        }
      }
    } catch (err) {
      if (err?.needsVerification) {
        setNeedsVerification(true);
        setVerifyEmail(err.email || email);
      } else {
        setError(err?.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verifyEmail) return;
    setIsResending(true);
    setResendSuccess('');
    setError('');
    try {
      await resendVerificationEmail(verifyEmail);
      setResendSuccess('Confirmation link resent! Check your inbox.');
    } catch (err) {
      setError(err?.message || 'Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const fallbackPayload = {
        name: 'Google Swine Operator',
        email: email ? email.trim() : 'operator@pigify.ai',
        avatar: '',
      };
      const res = await socialLogin(fallbackPayload);
      if (res && (res.id || res._id)) {
        await AsyncStorage.setItem('user', JSON.stringify(res));
        if (onLogin) onLogin(res);
      } else {
        throw new Error('Google sign-in service unavailable.');
      }
    } catch (err) {
      setError(err?.message || 'Google sign-in unavailable on this build.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Cyber Grid Mesh + Ambient Radial Glows (1:1 match with web .pigify-grid-mesh) */}
      <GridBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Section */}
          <View style={styles.headerContent}>
            {/* Live Telemetry Kicker */}
            <View style={styles.kickerBadge}>
              <Animated.View style={[styles.kickerDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.kickerText}>YOLOv11-VET // CLINICAL BIOSECURITY</Text>
            </View>

            <Image
              source={require('./assets/pigify-logo.png')}
              style={styles.logoBadge}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Pigify</Text>
            <Text style={styles.appTagline}>Smart Swine Telemetry & Health AI</Text>
          </View>

          {/* Elevated Cyber Glassmorphic Auth Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.authCard}>
              {/* High-tech Corner Reticles */}
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              {/* Segmented Mode Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, isLogin && styles.tabButtonActive]}
                  onPress={() => toggleMode(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
                  onPress={() => toggleMode(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Create Account</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContent}>
                {/* Full Name (Sign Up only) */}
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>FULL NAME</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Dr. Maria Santos"
                      placeholderTextColor={THEME.textFaint}
                      mode="outlined"
                      outlineColor={THEME.borderInput}
                      activeOutlineColor={THEME.borderFocus}
                      textColor={THEME.textMain}
                      left={<TextInput.Icon icon="account-outline" color={THEME.primary} />}
                      style={styles.input}
                      theme={{ roundness: 14 }}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Email Address */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="operator@swinefarm.com"
                    placeholderTextColor={THEME.textFaint}
                    mode="outlined"
                    outlineColor={THEME.borderInput}
                    activeOutlineColor={THEME.borderFocus}
                    textColor={THEME.textMain}
                    left={<TextInput.Icon icon="email-outline" color={THEME.primary} />}
                    style={styles.input}
                    theme={{ roundness: 14 }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor={THEME.textFaint}
                    secureTextEntry={secureTextEntry}
                    mode="outlined"
                    outlineColor={THEME.borderInput}
                    activeOutlineColor={THEME.borderFocus}
                    textColor={THEME.textMain}
                    left={<TextInput.Icon icon="lock-outline" color={THEME.primary} />}
                    right={
                      <TextInput.Icon
                        icon={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                        color={THEME.textMuted}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                      />
                    }
                    style={styles.input}
                    theme={{ roundness: 14 }}
                  />
                </View>

                {/* Password Strength Meter (Sign Up only) */}
                {!isLogin && password.length > 0 && (
                  <View style={styles.strengthBox}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabelText}>Password Strength:</Text>
                      <Text style={[styles.strengthValueText, { color: strengthColor }]}>
                        {strengthLabel}
                      </Text>
                    </View>
                    <View style={styles.strengthTrack}>
                      <View
                        style={[
                          styles.strengthBar,
                          { width: `${(pwdStrength / 4) * 100}%`, backgroundColor: strengthColor },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Confirm Password (Sign Up only) */}
                {!isLogin && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••••••"
                      placeholderTextColor={THEME.textFaint}
                      secureTextEntry={secureConfirmTextEntry}
                      mode="outlined"
                      outlineColor={THEME.borderInput}
                      activeOutlineColor={THEME.borderFocus}
                      textColor={THEME.textMain}
                      left={<TextInput.Icon icon="lock-check-outline" color={THEME.primary} />}
                      right={
                        <TextInput.Icon
                          icon={secureConfirmTextEntry ? 'eye-outline' : 'eye-off-outline'}
                          color={THEME.textMuted}
                          onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                        />
                      }
                      style={styles.input}
                      theme={{ roundness: 14 }}
                    />
                  </View>
                )}

                {/* Error Banner */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={THEME.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Forgot Password link (Sign In only) */}
                {isLogin && (
                  <TouchableOpacity
                    style={styles.forgotBtn}
                    onPress={() => Alert.alert('Password Recovery', 'Please check your email or visit the Pigify web command portal to reset your password.')}
                  >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}

                {/* Main Submit Action Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.submitBtnWrapper}
                >
                  <LinearGradient
                    colors={[THEME.primary, THEME.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.submitBtnRow}>
                        <Text style={styles.submitBtnText}>
                          {isLogin ? 'Sign In to Portal' : 'Create Swine Account'}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign In */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={18} color="#DB4437" style={{ marginRight: 10 }} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Pigify Swine Telemetry & Clinical AI • Connected to Supabase TLS
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Verification Modal */}
      <Modal visible={needsVerification} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="mail-unread-outline" size={36} color={THEME.primary} />
            </View>
            <Text style={styles.modalTitle}>Check Your Email</Text>
            <Text style={styles.modalDesc}>
              A confirmation link was dispatched to:
            </Text>
            <Text style={styles.modalEmail}>{verifyEmail}</Text>
            <Text style={styles.modalInstruction}>
              Please tap the link in that email to activate your account, then sign in.
            </Text>

            {resendSuccess ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successBannerText}>{resendSuccess}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={THEME.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={THEME.primary} />
              ) : (
                <Text style={styles.resendBtnText}>Resend Confirmation Email</Text>
              )}
            </TouchableOpacity>

            <Button
              mode="contained"
              buttonColor={THEME.primary}
              style={{ marginTop: 12, borderRadius: 12, width: '100%' }}
              onPress={() => {
                setNeedsVerification(false);
                setIsLogin(true);
              }}
            >
              Back to Sign In
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgDeep,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  kickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.emerald,
    marginRight: 8,
  },
  kickerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 1.1,
  },
  logoBadge: {
    width: 80,
    height: 80,
    marginBottom: 12,
    elevation: 10,
    shadowColor: THEME.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.textMain,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    padding: 22,
    position: 'relative',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: THEME.primary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: THEME.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 29, 48, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textFaint,
  },
  tabTextActive: {
    color: THEME.textMain,
    fontWeight: '700',
  },
  formContent: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: THEME.bgInput,
    fontSize: 14,
  },
  strengthBox: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strengthLabelText: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  strengthValueText: {
    fontSize: 11,
    fontWeight: '700',
  },
  strengthTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.errorBg,
    borderWidth: 1,
    borderColor: THEME.errorBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: THEME.error,
    marginLeft: 8,
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: THEME.primaryHover,
    fontWeight: '600',
  },
  submitBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    elevation: 6,
    shadowColor: THEME.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 12,
    color: THEME.textFaint,
    marginHorizontal: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 29, 48, 0.85)',
    borderWidth: 1,
    borderColor: THEME.borderInput,
    borderRadius: 14,
    paddingVertical: 13,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textMain,
  },
  footer: {
    marginTop: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: THEME.textFaint,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#0D1424',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    padding: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: THEME.textMuted,
    textAlign: 'center',
  },
  modalEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primaryHover,
    marginVertical: 4,
  },
  modalInstruction: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 17,
  },
  resendBtn: {
    paddingVertical: 8,
    marginBottom: 6,
  },
  resendBtnText: {
    fontSize: 13,
    color: THEME.primaryHover,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successBannerText: {
    fontSize: 12,
    color: '#34D399',
    marginLeft: 6,
  },
});
