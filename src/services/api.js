import axios from 'axios';
import TokenService from './TokenService';
import { API_URL } from '@env';
import { reset } from '../navigation/RootNavigation';

console.log('Current API_URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Hata mesajlarını yöneten yardımcı fonksiyon
const getErrorMessage = (error) => {
  const errorDetails = {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      params: error.config?.params,
      data: error.config?.data,
    }
  };
  
  console.log('API Hata Detayları:', JSON.stringify(errorDetails, null, 2));

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.response?.status === 401) {
    return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
  }
  
  if (error.response?.status === 403) {
    return 'Bu işlem için yetkiniz bulunmuyor.';
  }
  
  if (error.response?.status === 404) {
    return 'İstenilen kaynak bulunamadı.';
  }
  
  if (error.response?.status === 500) {
    return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
  }

  return 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenService.getToken();
      console.log('Token durumu:', token ? 'Token mevcut' : 'Token yok');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('İstek başlıkları:', config.headers);
      }
      
      return config;
    } catch (error) {
      console.error('Token alınırken hata:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API yanıtı:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API hatası:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('401 hatası - Yetkisiz erişim');
    
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Login İsteği Başlatılıyor:', { email });
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/login`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      });
      
      console.log('Login Başarılı:', response.data);
      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('Access token eksik');
      }

      await TokenService.setToken(access_token);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  logout: async () => {
    try {
      await TokenService.clearAllTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout Hatası:', error);
      return { success: false, message: 'Çıkış yapılırken bir hata oluştu' };
    }
  },
};

export const ticketService = {
  getTickets: async (skip = 0, limit = 100) => {
    try {
      console.log('Ticket Listesi İsteği Başlatılıyor:', { skip, limit });
      const response = await api.get('/tickets/', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Ticket Listesi Hatası:', error);
      throw error;
    }
  },

  getTicket: async (ticketId) => {
    try {
      console.log('Ticket detayları getiriliyor:', ticketId);
      const response = await api.get(`/tickets/${ticketId}`);
      console.log('Ticket detayları başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ticket detayları alınırken hata:', error);
      throw error;
    }
  },

  createTicket: async (ticketData) => {
    try {
      console.log('Ticket oluşturma isteği:', ticketData);
      const response = await api.post('/tickets/', ticketData);
      console.log('Ticket oluşturma başarılı:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Ticket oluşturma hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket oluşturulurken bir hata oluştu',
      };
    }
  },

  updateTicket: async (ticketId, ticketData) => {
    try {
      console.log('Ticket Güncelleme İsteği Başlatılıyor:', { ticketId, ticketData });
      const response = await api.put(`/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Ticket Güncelleme Hatası:', error);
      throw error;
    }
  },

  addComment: async (ticketId, comment) => {
    try {
      console.log('Yorum Ekleme İsteği Başlatılıyor:', { ticketId, comment });
      const response = await api.post(`/tickets/${ticketId}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error('Yorum Ekleme Hatası:', error);
      throw error;
    }
  },

  closeTicket: async (ticketId) => {
    try {
      console.log('Ticket Kapatma İsteği Başlatılıyor:', { ticketId });
      const response = await api.put(`/tickets/${ticketId}/close`);
      return response.data;
    } catch (error) {
      console.error('Ticket Kapatma Hatası:', error);
      throw error;
    }
  },

  uploadFiles: async (ticketId, formData) => {
    try {
      console.log('Dosya yükleme isteği:', { ticketId, formData });
      const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
      });
      console.log('Dosya yükleme başarılı:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Dosyalar yüklenirken bir hata oluştu',
      };
    }
  },
};

export const userService = {
  getUserDetails: async (userId) => {
    try {
      console.log('Kullanıcı detayları getiriliyor:', userId);
      const response = await api.get(`/auth/admin/users/${userId}`);
      console.log('Kullanıcı detayları başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Kullanıcı detayları alınırken hata:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Mevcut kullanıcı bilgileri getiriliyor');
      const response = await api.get('/auth/me');
      console.log('Mevcut kullanıcı bilgileri başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Mevcut kullanıcı bilgileri alınırken hata:', error);
      throw error;
    }
  }
};

export { api };