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
    // Hata detaylarını hazırla
    const errorData = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.detail || error.message
    };
    
    console.log('API Error Response:', errorData);

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

      // URL encoded format için URLSearchParams kullan
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios({
        method: 'post',
        url: `${API_URL}/auth/login`,
        data: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      console.log('✅ Giriş başarılı! Status:', response.status);

      await AsyncStorage.setItem('authToken', response.data.access_token);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.log('Login Error:', {
        message: error.message,
        response: error.response?.data,
      });
      
      // Kullanıcı dostu hata mesajı
      const errorMessage = 
        error.response?.data?.detail ||
        (error.response?.status === 401 ? 'Geçersiz kullanıcı adı veya şifre' : 
         error.message === 'Network Error' ? 'Sunucuya bağlanılamıyor' :
         'Giriş yapılırken bir hata oluştu');
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    console.log('Kayıt:', response.data);
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

export const ticketService = {
  // Tüm biletleri getir
  getTickets: async () => {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      console.log('Get tickets error:', error);
      throw error;
    }
  },
  
  // Tek bir bileti getir
  getTicket: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.log(`Get ticket ${ticketId} error:`, error);
      throw error;
    }
  },
  
  // Yeni bilet oluştur (dosya olmadan)
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.log('Create ticket error:', error);
      throw error;
    }
  },
  
  // Yeni bilet oluştur (dosya ekleyerek)
  createTicketWithAttachments: async (formData) => {
    try {
      const response = await api.post('/tickets/with-attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log('Create ticket with attachments error:', error);
      throw error;
    }
  },
  
  // Bilet güncelle
  updateTicket: async (ticketId, ticketData) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      console.log(`Update ticket ${ticketId} error:`, error);
      throw error;
    }
  },
  
  // Bilete yorum ekle
  addComment: async (ticketId, comment) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.log(`Add comment to ticket ${ticketId} error:`, error);
      throw error;
    }
  },
  
  // Bileti kapat
  closeTicket: async (ticketId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/close`);
      return response.data;
    } catch (error) {
      console.log(`Close ticket ${ticketId} error:`, error);
      throw error;
    }
  }
};

export default api;
