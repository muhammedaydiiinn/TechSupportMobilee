import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @env ile ilgili hatayı düzeltiyoruz
import { API_URL } from '@env';

console.log('Current API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - auth token ekle ve istek logla
api.interceptors.request.use(
  async (config) => {
    // auth/ şeklinde başlayan istekler için URL'i düzelt
    if (config.url.startsWith('auth/')) {
      config.url = `/${config.url}`;
    }
    
    console.log('Full Request URL:', `${config.baseURL}${config.url}`);
    console.log('Request Method:', config.method);
    console.log('Request Data:', config.data);
    
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.log('❌ İstek Oluşturma Hatası:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - hataları yönet
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
    }
    
    return Promise.reject({
      ...error,
      api: errorData // API ile ilgili detaylı hata bilgisi
    });
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Giriş denemesi:', { username: email });

      // FormData ile veri gönder
      const formData = new FormData();
      formData.append('username', email); // "username" kullanıyorsun
      formData.append('password', password);

      console.log('📦 Giriş Verisi:', formData);

      const response = await axios({
        method: 'post',
        url: `${API_URL}/auth/login`,
        data: formData,  // FormData kullanarak veriyi gönder
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      console.log('✅ Giriş başarılı! Status:', response.status);

      // API yanıtını işle
      await AsyncStorage.setItem('authToken', response.data.access_token);
      return response.data;
    } catch (error) {
      console.log('Login Error:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },


  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword, newPasswordConfirm) => {
    const response = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
