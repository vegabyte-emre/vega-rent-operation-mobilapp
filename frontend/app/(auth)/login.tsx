import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../src/constants/theme';

const COMPANY_NAME = 'Vega Operasyon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  // Typewriter animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Typewriter effect
    let index = 0;
    const timer = setInterval(() => {
      if (index <= COMPANY_NAME.length) {
        setDisplayedText(COMPANY_NAME.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    // Cursor blink animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Login attempt starting...');
      await login(email.trim(), password);
      console.log('Login successful, navigating to tabs...');
      router.replace('/(tabs)');
      console.log('Navigation called');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Giriş Başarısız',
        error.response?.data?.detail || 'E-posta veya şifre hatalı.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            {/* Logo Icon */}
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Ionicons name="car-sport" size={40} color={COLORS.primary} />
              </View>
            </View>
            
            {/* Typewriter Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{displayedText}</Text>
              <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
            </View>
            <Text style={styles.subtitle}>Araç Operasyon Yönetimi</Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="car" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statValue}>150+</Text>
                <Text style={styles.statLabel}>Araç</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statValue}>25</Text>
                <Text style={styles.statLabel}>Personel</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="location" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Lokasyon</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Personel Girişi</Text>
            <Text style={styles.formSubtitle}>Hesabınıza giriş yapın</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="E-posta adresiniz"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton, 
                isLoading && styles.loginButtonDisabled,
                pressed && { opacity: 0.8 }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Demo Info */}
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              <Text style={styles.demoTitle}>Demo Hesap</Text>
            </View>
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>E-posta:</Text>
              <Text style={styles.demoValue}>admin@fleetease.com</Text>
            </View>
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>Şifre:</Text>
              <Text style={styles.demoValue}>admin123</Text>
            </View>
          </View>

          {/* Version */}
          <Text style={styles.version}>v1.0.0 • Vega Rent A Car</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: SIZES.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cursor: {
    width: 3,
    height: 32,
    backgroundColor: '#fff',
    marginLeft: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SIZES.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginTop: SIZES.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xl,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    ...SHADOWS.lg,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SIZES.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIconContainer: {
    width: 48,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: COLORS.text,
    paddingRight: SIZES.md,
  },
  eyeButton: {
    padding: SIZES.md,
  },
  loginButton: {
    marginTop: SIZES.md,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: SIZES.sm,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginTop: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    borderStyle: 'dashed',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  demoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  demoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SIZES.xl,
  },
});
