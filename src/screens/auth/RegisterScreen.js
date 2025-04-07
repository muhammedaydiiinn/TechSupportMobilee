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

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Form validasyonu
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Lütfen tüm alanları doldurun.');
        return;
      }

      if (password.length < 8) {
        setError('Şifre en az 8 karakter olmalıdır.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor.');
        return;
      }

      await authService.register({
        email,
        password,
        password_confirm: confirmPassword,
        name: firstName,
        surname: lastName,
      });
      
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
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successContainer}>
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
          <Text style={styles.buttonText}>
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>Zaten hesabınız var mı? Giriş Yapın</Text>
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
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    textAlign: 'center',
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: '#FFE7E7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
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

export default RegisterScreen; 