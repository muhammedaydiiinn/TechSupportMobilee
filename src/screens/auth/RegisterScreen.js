import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import theme, { FONTS, SPACING, RADIUS } from '../../constants/theme';
import { Button, FormInput } from '../../components/ui';
import { authService } from '../../services/api';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form doğrulama için fonksiyon
  const validateForm = () => {
    // Email doğrulama regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!firstName.trim()) {
      setError('Adınızı girmelisiniz.');
      return false;
    }
    
    if (!lastName.trim()) {
      setError('Soyadınızı girmelisiniz.');
      return false;
    }
    
    if (!email.trim()) {
      setError('E-posta adresinizi girmelisiniz.');
      return false;
    }
    
    if (!emailRegex.test(email.trim())) {
      setError('Geçerli bir e-posta adresi girmelisiniz.');
      return false;
    }
    
    if (!password) {
      setError('Şifre girmelisiniz.');
      return false;
    }
    
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Form validasyonu
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // API isteği için verileri hazırla
      const userData = {
        email: email.trim(),
        password,
        password_confirm: confirmPassword,
        name: firstName.trim(),
        surname: lastName.trim(),
      };

      console.log('Kayıt isteği gönderiliyor:', {
        ...userData,
        password: '********',
        password_confirm: '********'
      });
      
      // Register API çağrısı
      const response = await authService.register(userData);
      console.log('Kayıt yanıtı:', response);
      
      if (response.success) {
        // Başarılı kayıt
        setSuccess(true);
        
        // Form alanlarını temizle
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // 3 saniye sonra success mesajını kaldır ve login sayfasına yönlendir
        setTimeout(() => {
          setSuccess(false);
          navigation.navigate('Login');
        }, 3000);
      } else {
        // API'den gelen hata mesajını göster
        setError(response.message);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Kayıt Ol</Text>
            
            <FormInput
              iconName="person-outline"
              placeholder="Ad"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            
            <FormInput
              iconName="person-outline"
              placeholder="Soyad"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            
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
            
            <FormInput
              iconName="lock-closed-outline"
              placeholder="Şifre Tekrarı"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.error.text} />
                <Text style={styles.errorText}>
                  {typeof error === 'string' ? error : 'Kayıt işlemi sırasında bir hata oluştu'}
                </Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success.text} />
                <Text style={styles.successText}>
                  Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
                </Text>
              </View>
            ) : null}

            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: SPACING.s }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>Zaten hesabınız var mı? Giriş Yapın</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: COLORS.text,
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success.background,
    padding: SPACING.m,
    borderRadius: RADIUS.s,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: theme.colors.success.border,
  },
  successText: {
    color: theme.colors.success.text,
    marginLeft: SPACING.s,
    flex: 1,
    fontSize: FONTS.size.normal,
  },
  loginLink: {
    marginTop: SPACING.l,
  },
  loginText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: FONTS.size.normal,
  },
});

export default RegisterScreen;