import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TokenService from './TokenService';
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

// Hata mesajlarını yöneten yardımcı fonksiyon
const getErrorMessage = (error) => {
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.status === 401) return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
  if (error.response?.status === 403) return 'Bu işlem için yetkiniz bulunmuyor.';
  if (error.response?.status === 404) return 'İstenilen kaynak bulunamadı.';
  if (error.response?.status === 500) return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
  return 'Beklenmeyen bir hata oluştu.';
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    if (config.url.startsWith('auth/')) {
      config.url = `/${config.url}`;
    }
    
    const token = await TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('❌ İstek Oluşturma Hatası:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 hatası ve refresh token varsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await TokenService.getRefreshToken();
        if (refreshToken) {
          // Refresh token ile yeni access token al
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          await TokenService.setToken(access_token);
          
          // Yeni token ile orijinal isteği tekrarla
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token yenileme hatası:', refreshError);
        await TokenService.clearAllTokens();
        return Promise.reject(refreshError);
      }
    }

    const errorData = {
      status: error.response?.status,
      data: error.response?.data,
      message: getErrorMessage(error)
    };
    
    console.error('API Error Response:', errorData);
    return Promise.reject({
      ...error,
      api: errorData
    });
  }
);

export const authService = {
  login: async (email, password) => {
    try {
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

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        error: error.response?.data
      };
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      throw error;
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
