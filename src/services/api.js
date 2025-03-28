import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

console.log('Current API_URL:', API_URL); // URL'i kontrol etmek için

const api = axios.create({
  baseURL: API_URL,
  
  headers: {
    'Content-Type': 'application/json',
  },
  // HTTP için güvenlik ayarları
  httpsAgent: {  
    rejectUnauthorized: false
  }
});

// İstek interceptor'ı
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
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
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
    
    // API'den gelen detaylı hata mesajını al
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    throw new Error(errorMessage);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('auth/login', { email, password });
      await AsyncStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.log('Login Error:', {
        message: error.message,
        response: error.response?.data
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
