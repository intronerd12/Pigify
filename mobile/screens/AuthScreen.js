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

import {
  signInWithSupabase,
  signUpWithSupabase,
  resendVerificationEmail,
} from '../services/supabaseAuth';
import { socialLogin } from '../services/api';

const { width } = Dimensions.get('window');

// ── Vibrant Signature Mobile Palette ──────────────────────────────────────────
const THEME = {
  primary: '#C71585',       // Deep Rose / Dragon Pink
  primaryDark: '#8B008B',   // Dark Magenta
  primaryLight: '#FF69B4',  // Hot Pink
  secondary: '#FFC0CB',    // Soft Pink
  accent: '#00B894',       // Emerald
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  error: '#EF4444',
  border: '#E2E8F0',
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
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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

      {/* Decorative Curved Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[THEME.primaryDark, THEME.primary, THEME.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
        </LinearGradient>
      </View>

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
            <View style={styles.logoBadge}>
              <Image
                source={require('./assets/pigify-logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appTitle}>Pigify</Text>
            <Text style={styles.appTagline}>Smart Swine Telemetry & Health AI</Text>
          </View>

          {/* Elevated Floating Auth Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Surface style={styles.authCard} elevation={4}>
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
                    <TextInput
                      label="Full Name"
                      value={name}
                      onChangeText={setName}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor={THEME.primary}
                      textColor={THEME.textDark}
                      left={<TextInput.Icon icon="account-outline" color={THEME.primary} />}
                      style={styles.input}
                      theme={{ roundness: 14 }}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Email Address */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    activeOutlineColor={THEME.primary}
                    textColor={THEME.textDark}
                    left={<TextInput.Icon icon="email-outline" color={THEME.primary} />}
                    style={styles.input}
                    theme={{ roundness: 14 }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    activeOutlineColor={THEME.primary}
                    textColor={THEME.textDark}
                    left={<TextInput.Icon icon="lock-outline" color={THEME.primary} />}
                    right={
                      <TextInput.Icon
                        icon={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                        color={THEME.textLight}
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
                    <TextInput
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={secureConfirmTextEntry}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor={THEME.primary}
                      textColor={THEME.textDark}
                      left={<TextInput.Icon icon="lock-check-outline" color={THEME.primary} />}
                      right={
                        <TextInput.Icon
                          icon={secureConfirmTextEntry ? 'eye-outline' : 'eye-off-outline'}
                          color={THEME.textLight}
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
                    onPress={() => Alert.alert('Reset Password', 'Please visit the Pigify web portal or check your email for password recovery.')}
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
                          {isLogin ? 'Sign In' : 'Create Swine Account'}
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
            </Surface>
          </Animated.View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to Pigify's Veterinary Telemetry Terms and Clinical Biosecurity Protocol.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Verification Modal */}
      <Modal visible={needsVerification} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard} elevation={6}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="mail-unread-outline" size={36} color={THEME.primary} />
            </View>
            <Text style={styles.modalTitle}>Check Your Email</Text>
            <Text style={styles.modalDesc}>
              A confirmation link was dispatched to:
            </Text>
            <Text style={styles.modalEmail}>{verifyEmail}</Text>
            <Text style={styles.modalInstruction}>
              Please tap the link in that email to activate your Pigify Swine account, then sign in.
            </Text>

            {resendSuccess ? (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
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
              style={{ marginTop: 12, borderRadius: 12 }}
              onPress={() => {
                setNeedsVerification(false);
                setIsLogin(true);
              }}
            >
              Back to Sign In
            </Button>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 290,
  },
  gradientHeader: {
    flex: 1,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  patternCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -60,
    right: -50,
  },
  patternCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 20,
    left: -40,
  },
  patternCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 40,
    left: 40,
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
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logoImage: {
    width: 58,
    height: 58,
    borderRadius: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#1E293B',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textLight,
  },
  tabTextActive: {
    color: THEME.primary,
    fontWeight: '700',
  },
  formContent: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
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
    color: THEME.textLight,
  },
  strengthValueText: {
    fontSize: 11,
    fontWeight: '700',
  },
  strengthTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: THEME.primary,
    fontWeight: '600',
  },
  submitBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    elevation: 6,
    shadowColor: THEME.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: THEME.textLight,
    marginHorizontal: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textDark,
  },
  footer: {
    marginTop: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(199, 21, 133, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: THEME.textLight,
    textAlign: 'center',
  },
  modalEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
    marginVertical: 4,
  },
  modalInstruction: {
    fontSize: 12,
    color: THEME.textLight,
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
    color: THEME.primary,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successBannerText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 6,
  },
});
