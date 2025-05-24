import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import theme, { FONTS, SPACING, RADIUS, getShadow } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { Button, FormInput } from '../../components/ui';
import { CommonActions } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (!result.success) {
        Alert.alert(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
     // setError(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Teknik Destek</Text>
          <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
          <FormInput
            iconName="mail-outline"
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <FormInput
            iconName="lock-closed-outline"
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error.text} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: SPACING.s }}
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Hesabınız yok mu? <Text style={styles.registerAccent}>Kayıt Olun</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: FONTS.size.h1,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.size.normal,
    color: COLORS.textLight,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.l,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONTS.size.normal,
    fontWeight: FONTS.weight.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error.background,
    padding: SPACING.m,
    borderRadius: RADIUS.s,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: theme.colors.error.border,
  },
  errorText: {
    color: theme.colors.error.text,
    marginLeft: SPACING.s,
    flex: 1,
    fontSize: FONTS.size.normal,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.textLight,
    fontSize: FONTS.size.normal,
  },
  registerAccent: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.semiBold,
  },
});

export default LoginScreen;