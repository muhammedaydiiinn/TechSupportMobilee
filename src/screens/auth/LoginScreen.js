import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { authService } from '../../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Form validasyonu
      if (!email.trim()) {
        setError('E-posta adresi boş olamaz.');
        return;
      }

      if (!password) {
        setError('Şifre boş olamaz.');
        return;
      }

      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Geçerli bir e-posta adresi giriniz.');
        return;
      }

      console.log('Attempting login with:', { email }); // Debug log
      const response = await authService.login(email.trim(), password);
      console.log('Login response:', response); // Debug log
      
      // Başarılı giriş
      setSuccess(true);
      setEmail('');
      setPassword('');
      
      // 3 saniye sonra success mesajını kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.log('Login Error Details:', {
        message: err.message,
        stack: err.stack,
        originalError: err
      });
      
      // Hata mesajını daha anlaşılır hale getir
      let errorMessage = err.message;
      if (errorMessage.includes('Network Error')) {
        errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Giriş Yap</Text>
        
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
            secureTextEntry={!showPassword}
            placeholderTextColor={COLORS.inputText}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={COLORS.inputText} 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>Giriş başarılı!</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>Hesabınız yok mu? Kayıt Olun</Text>
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
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
  },
  registerLink: {
    marginTop: 20,
  },
  registerText: {
    textAlign: 'center',
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#D63031',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  successContainer: {
    backgroundColor: '#E7F6E7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  successText: {
    color: '#45C49C',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default LoginScreen; 