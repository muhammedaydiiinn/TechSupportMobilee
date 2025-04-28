import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
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
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.inputText} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ad"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={COLORS.inputText}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.inputText} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Soyad"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={COLORS.inputText}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.inputText} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.inputText}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.inputText} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={COLORS.inputText}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.inputText} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre Tekrarı"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={COLORS.inputText}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="red" />
                <Text style={styles.errorText}>
                  {typeof error === 'string' ? error : 'Kayıt işlemi sırasında bir hata oluştu'}
                </Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#45C49C" />
                <Text style={styles.successText}>
                  Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

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
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.inputBackground,
  },
  icon: {
    marginRight: 10,
    width: 24,
  },
  input: {
    flex: 1,
    padding: 15,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    color: COLORS.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE7E7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F6E7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  successText: {
    color: '#45C49C',
    marginLeft: 10,
    flex: 1,
  },
});

export default RegisterScreen;