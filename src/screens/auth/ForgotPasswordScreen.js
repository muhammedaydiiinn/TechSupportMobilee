import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import theme, { FONTS, SPACING, RADIUS } from '../../constants/theme';
import { Button, FormInput } from '../../components/ui';
import { authService } from '../../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      if (!email) {
        setError('Lütfen e-posta adresinizi girin.');
        setLoading(false);
        return;
      }

      // E-posta formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Lütfen geçerli bir e-posta adresi girin.');
        setLoading(false);
        return;
      }

      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        Alert.alert(
          'Başarılı',
          'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        setError(response.message || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err);
      setError('Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        
        <Text style={styles.description}>
          Lütfen kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı gönderilecektir.
        </Text>
        
        <FormInput
          iconName="mail-outline"
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? (
          <Text style={styles.successText}>
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
          </Text>
        ) : null}

        <Button
          title={loading ? 'Gönderiliyor...' : 'Şifreyi Sıfırla'}
          onPress={handleResetPassword}
          loading={loading}
          style={{ marginTop: SPACING.s }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backToLogin}
        >
          <Text style={styles.backToLoginText}>Giriş sayfasına dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    padding: SPACING.xl,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.size.h1,
    fontWeight: FONTS.weight.bold,
    marginBottom: SPACING.l,
    textAlign: 'center',
    color: COLORS.text,
  },
  description: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
    color: COLORS.textLight,
    fontSize: FONTS.size.normal,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.error.text,
    textAlign: 'center',
    marginBottom: SPACING.s,
    fontSize: FONTS.size.normal,
  },
  successText: {
    color: theme.colors.success.text,
    textAlign: 'center',
    marginBottom: SPACING.s,
    fontSize: FONTS.size.normal,
  },
  backToLogin: {
    marginTop: SPACING.l,
  },
  backToLoginText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: FONTS.size.normal,
  },
});

export default ForgotPasswordScreen; 