import axios from 'axios';
import TokenService from './TokenService';
import { API_URL } from '@env';
import { reset } from '../navigation/RootNavigation';
import { Alert } from 'react-native';

console.log('Current API_URL:', API_URL);

const api = axios.create({
  baseURL: `${API_URL}`,
  timeout: 15000,
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
     // console.error('Token alınırken hata:', error);
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
      console.log('401 hatası - Oturum süresi doldu');
      
      // Token'ı temizle
      await TokenService.clearAllTokens();
      
      // Kullanıcıya bildirim göster
      Alert.alert(
        'Oturum Süresi Doldu',
        'Güvenliğiniz için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Ana sayfaya yönlendir
              reset('Login');
            }
          }
        ],
        { cancelable: false }
      );
    }
    
    return Promise.reject(error);
  }
);

// Sabit değerler
const TICKET_TYPES = {
  TECHNICAL: 'TECHNICAL',
  HARDWARE: 'HARDWARE',
  SOFTWARE: 'SOFTWARE',
  NETWORK: 'NETWORK',
  OTHER: 'OTHER'
};

const TICKET_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const authService = {
  login: async (email, password) => {
    try {
      // API'nin beklediği formata uygun olarak form-urlencoded verisi gönderelim
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Login isteği gönderiliyor:', {
        email: email,
        password: '********',
        grant_type: '',
        scope: '',
        client_id: '',
        client_secret: ''
      });

      console.log('Form verisi:', formData);
      // API_URL'i kullanarak istek yapalım
      console.log('Login isteği URL:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      });
      
      console.log('Login yanıtı:', response.data);
      
      if (response.data && response.data.access_token) {
        await TokenService.setToken(response.data.access_token);
        return { success: true, data: response.data };
      } else {
        throw new Error('Access token alınamadı');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (Array.isArray(error.response?.data)) {
        errorMessage = error.response.data.map(err => err.msg).join(', ');
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error);
      const errorMessage = getErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  },

  register: async (userData) => {
    try {
      const requestData = {
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm,
        first_name: userData.name,
        last_name: userData.surname
      };

      const response = await axios.post(`${API_URL}/auth/register`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error.response?.data || error);
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  logout: async () => {
    try {
      // Sadece yerel tokenları temizle
      await TokenService.clearAllTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout Hatası:', error);
      return { success: false, message: 'Çıkış yapılırken bir hata oluştu' };
    }
  },

  forgotPassword: async (email) => {
    try {
      console.log('Şifre sıfırlama isteği gönderiliyor:', { email });
      
      const response = await api.post('/auth/forgot-password', { email });
      
      console.log('Şifre sıfırlama isteği başarılı:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      const errorMessage = getErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  },
};

export const ticketService = {
  getTickets: async (skip = 0, limit = 100) => {
    try {
      console.log('Destek Talebi Listesi İsteği Başlatılıyor:', { skip, limit });
      const response = await api.get('/tickets/', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Destek Talebi Listesi Hatası:', error);
      return { items: [] }; // Hata durumunda boş dizi döndür
    }
  },

  getTicketAIResponses: async (ticketId) => {
    try {
      console.log('Ticket AI yanıtları getiriliyor:', ticketId);
      const response = await api.get(`/ai/ticket/${ticketId}/ai-responses`);
      console.log('Ticket AI yanıtları başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ticket AI yanıtları alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket AI yanıtları alınırken bir hata oluştu'
      };
    }
  },

  getTicket: async (ticketId) => {
    try {
      console.log('Destek talebi detayları getiriliyor:', ticketId);
      const response = await api.get(`/tickets/${ticketId}`);
      console.log('Destek talebi detayları başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Destek talebi detayları alınırken hata:', error);
      throw error;
    }
  },

  createTicket: async (ticketData) => {
    try {
      console.log('Destek talebi oluşturma isteği:', ticketData);
      
      // API'nin beklediği formata dönüştür
      const formattedData = {
        ...ticketData,
        category: ticketData.category?.toUpperCase() || TICKET_TYPES.OTHER,
        ticket_type: ticketData.ticket_type?.toUpperCase() || TICKET_TYPES.OTHER,
        priority: ticketData.priority?.toUpperCase() || TICKET_PRIORITIES.MEDIUM
      };
      
      const response = await api.post('/tickets/', formattedData, {
        timeout: 30000,
      });
      console.log('Destek talebi oluşturma başarılı:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Destek talebi oluşturma hatası:', error);
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
          error: error
        };
      }

      let errorMessage = 'Destek talebi oluşturulurken bir hata oluştu';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => {
            if (err.type === 'enum') {
              if (err.loc[1] === 'category' || err.loc[1] === 'ticket_type') {
                return 'Geçersiz destek talebi kategorisi. Lütfen listeden bir kategori seçin.';
              }
              if (err.loc[1] === 'priority') {
                return 'Geçersiz öncelik seviyesi. Lütfen listeden bir öncelik seçin.';
              }
            }
            return err.msg;
          }).join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  updateTicket: async (ticketId, ticketData) => {
    try {
      console.log('Destek Talebi Güncelleme İsteği Başlatılıyor:', { ticketId, ticketData });
      const response = await api.put(`/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Destek Talebi Güncelleme Hatası:', error);
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
      console.log('Destek Talebi Kapatma İsteği Başlatılıyor:', { ticketId });
      const response = await api.put(`/tickets/${ticketId}/close`);
      return response.data;
    } catch (error) {
      console.error('Destek Talebi Kapatma Hatası:', error);
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

  assignTicket: async (ticketId, assignedTo) => {
    try {
      console.log('Destek talebi atama isteği:', { ticketId, assignedTo });
      const response = await api.put(`/tickets/admin/tickets/${ticketId}/assign`, {
        ticket_id: ticketId,
        user_id: assignedTo
      });
      console.log('Destek talebi atama başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Destek talebi atama hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Destek talebi atanırken bir hata oluştu'
      };
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      console.log('Destek talebi durumu güncelleme isteği:', { ticketId, status });
      const response = await api.put(`/tickets/${ticketId}/status`, {
        status: status
      });
      console.log('Destek talebi durumu güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Destek talebi durumu güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Destek talebi durumu güncellenirken bir hata oluştu'
      };
    }
  },

  detachEquipment: async (ticketId, equipmentId) => {
    try {
      console.log('Ekipman bağlantısı kaldırma isteği:', { ticketId, equipmentId });
      const response = await api.delete(`/tickets/${ticketId}/equipment/${equipmentId}`);
      console.log('Ekipman bağlantısı kaldırma başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman bağlantısı kaldırma hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman bağlantısı kaldırılırken bir hata oluştu'
      };
    }
  },

  getTicketStats: async () => {
    try {
      console.log('Bilet istatistikleri getiriliyor');
      const response = await api.get('/tickets/stats/');
      console.log('Bilet istatistikleri başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Bilet istatistikleri alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Bilet istatistikleri alınırken bir hata oluştu'
      };
    }
  },

  getDepartmentStats: async () => {
    try {
      console.log('Departman istatistikleri getiriliyor');
      const response = await api.get('/tickets/stats/department');
      console.log('Departman istatistikleri başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman istatistikleri alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman istatistikleri alınırken bir hata oluştu'
      };
    }
  },

  getUserStats: async () => {
    try {
      console.log('Kullanıcı istatistikleri getiriliyor');
      const response = await api.get('/tickets/stats/user');
      console.log('Kullanıcı istatistikleri başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı istatistikleri alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı istatistikleri alınırken bir hata oluştu'
      };
    }
  },

  // Ticket Timeline
  getTicketTimeline: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/timeline`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Ticket Response
  respondToTicket: async (ticketId, responseContent) => {
    try {
      console.log('Yanıt gönderme isteği:', { ticketId, responseContent });
      const response = await api.post(`/tickets/${ticketId}/respond`, {
        response_content: responseContent
      }, {
        params: {
          response_content: responseContent
        }
      });
      console.log('Yanıt gönderme başarılı:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Yanıt gönderme hatası:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Yanıt gönderilirken bir hata oluştu'
      };
    }
  },

  // Update Support Level
  updateSupportLevel: async (ticketId, supportLevel) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/support-level`, {
        support_level: supportLevel
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Attach Equipment
  attachEquipment: async (ticketId, equipmentId) => {
    try {
      const response = await api.post(`/tickets/${ticketId}/equipment`, {
        equipment_id: equipmentId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Add Attachment
  addAttachment: async (ticketId, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get Ticket Images
  getTicketImages: async (ticketId) => {
    try {
      console.log('Ticket resimleri getiriliyor:', ticketId);
      
      // Use the api instance since we've fixed the baseURL
      const response = await api.get(`/tickets/${ticketId}/images`);
      
      console.log('Ticket resimleri başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ticket resimleri alınırken hata:', error);
      console.error('Hata detayları:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket resimleri alınırken bir hata oluştu',
        data: []
      };
    }
  }
};

export const userService = {
  getUserDetails: async (userId) => {
    try {
      console.log('Kullanıcı detayları getiriliyor:', userId);
      const response = await api.get(`/users/${userId}`);
      console.log('Kullanıcı detayları başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı detayları alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı detayları alınırken bir hata oluştu'
      };
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Mevcut kullanıcı bilgileri getiriliyor');
      const response = await api.get('/auth/me');
      console.log('Mevcut kullanıcı bilgileri başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
     // console.error('Mevcut kullanıcı bilgileri alınırken hata:', error);
      throw error;
    }
  },

  getUsers: async (params = {}) => {
    try {
      console.log('Kullanıcı listesi getiriliyor', params);
      const response = await api.get('/users/', { params });
      console.log('Kullanıcı listesi başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı listesi alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı listesi alınırken bir hata oluştu'
      };
    }
  },
  
  // API'nin beklediği rol formatına dönüştürme fonksiyonu
  formatRoleForAPI: (role) => {
    // Backend enum değerleri küçük harfler olmalı
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
      case 'SUPPORT':
        return 'support';
      case 'USER':
        return 'user';
      case 'DEPARTMENT_MANAGER':
        return 'department_manager';
      case 'DEPARTMENT_EMPLOYEE':
        return 'department_employee';
      default:
        return role.toLowerCase(); // Gelen değer zaten küçük harfliyse değiştirmez
    }
  },
  
  createUser: async (userData) => {
    try {
      console.log('Kullanıcı oluşturma isteği gönderiliyor:', userData);
      
      // Role değerini API'nin beklediği formata dönüştürelim
      const formattedData = {
        ...userData,
        role: userService.formatRoleForAPI(userData.role)
      };
      
      console.log('Formatlanmış veri:', formattedData);
      
      const response = await api.post('/users/', formattedData);
      console.log('Kullanıcı oluşturma başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error.response?.data || error);
      let errorMessage = 'Kullanıcı oluşturulurken bir hata oluştu';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => `${err.msg} (${err.loc.join('.')})`).join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      console.log('Kullanıcı güncelleme isteği gönderiliyor:', { userId, userData });
      
      // Role değerini API'nin beklediği formata dönüştürelim
      const formattedData = {
        ...userData
      };
      
      if (userData.role) {
        formattedData.role = userService.formatRoleForAPI(userData.role);
      }
      
      console.log('Formatlanmış güncelleme verisi:', formattedData);
      
      const response = await api.put(`/users/${userId}`, formattedData);
      console.log('Kullanıcı güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error.response?.data || error);
      let errorMessage = 'Kullanıcı güncellenirken bir hata oluştu';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => `${err.msg} (${err.loc.join('.')})`).join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  
  deleteUser: async (userId) => {
    try {
      console.log('Kullanıcı silme isteği gönderiliyor:', userId);
      const response = await api.delete(`/users/${userId}`);
      console.log('Kullanıcı silme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı silinirken bir hata oluştu'
      };
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      console.log('Kullanıcı rolü güncelleme isteği:', { userId, role });
      const response = await api.put(`/users/${userId}/role`, { role });
      console.log('Kullanıcı rolü güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı rolü güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı rolü güncellenirken bir hata oluştu'
      };
    }
  },

  updateUserDepartment: async (userId, departmentId) => {
    try {
      console.log('Kullanıcı departmanı güncelleme isteği:', { userId, departmentId });
      const response = await api.put(`/users/${userId}/department`, { department_id: departmentId });
      console.log('Kullanıcı departmanı güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı departmanı güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı departmanı güncellenirken bir hata oluştu'
      };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      console.log('Kullanıcı durumu güncelleme isteği:', { userId, status });
      const response = await api.put(`/users/${userId}/status`, { status });
      console.log('Kullanıcı durumu güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı durumu güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı durumu güncellenirken bir hata oluştu'
      };
    }
  },
};

export const departmentService = {
  getDepartments: async () => {
    try {
      console.log('Departman listesi getiriliyor');
      const response = await api.get('/departments/');
      console.log('Departman listesi başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman listesi alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman listesi alınırken bir hata oluştu'
      };
    }
  },
  
  createDepartment: async (departmentData) => {
    try {
      console.log('Departman oluşturma isteği:', departmentData);
      const response = await api.post('/departments/', departmentData);
      console.log('Departman oluşturma başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman oluşturma hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman oluşturulurken bir hata oluştu'
      };
    }
  },
  
  updateDepartment: async (departmentId, departmentData) => {
    try {
      console.log('Departman güncelleme isteği:', { departmentId, departmentData });
      const response = await api.put(`/departments/${departmentId}`, departmentData);
      console.log('Departman güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman güncellenirken bir hata oluştu'
      };
    }
  },
  
  deleteDepartment: async (departmentId) => {
    try {
      console.log('Departman silme isteği:', departmentId);
      const response = await api.delete(`/departments/${departmentId}`);
      console.log('Departman silme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman silme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman silinirken bir hata oluştu'
      };
    }
  },
  
  getDepartment: async (departmentId) => {
    try {
      console.log('Departman detayları getiriliyor:', departmentId);
      const response = await api.get(`/departments/${departmentId}`);
      console.log('Departman detayları başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman detayları alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman detayları alınırken bir hata oluştu'
      };
    }
  },
  
  getDepartmentUsers: async (departmentId) => {
    try {
      console.log('Departman kullanıcıları getiriliyor:', departmentId);
      const response = await api.get(`/departments/${departmentId}/users`);
      console.log('Departman kullanıcıları başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman kullanıcıları alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman kullanıcıları alınırken bir hata oluştu'
      };
    }
  },
};

export const equipmentService = {
  getAllEquipment: async () => {
    try {
      console.log('Ekipman listesi getiriliyor');
      const response = await api.get('/equipment/');
      console.log('Ekipman listesi başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman listesi alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman listesi alınırken bir hata oluştu'
      };
    }
  },
  
  createEquipment: async (equipmentData) => {
    try {
      console.log('Ekipman oluşturma isteği:', equipmentData);
      
      // API'ye gönderilecek veriyi hazırla
      const requestData = {
        ...equipmentData,
        description: equipmentData.notes || ''  // notes alanını description olarak gönder
      };
      
      const response = await api.post('/equipment/', requestData);
      console.log('Ekipman oluşturma başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman oluşturma hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman oluşturulurken bir hata oluştu'
      };
    }
  },
  
  getEquipment: async (equipmentId) => {
    try {
      console.log('Ekipman detayları getiriliyor:', equipmentId);
      const response = await api.get(`/equipment/${equipmentId}`);
      console.log('Ekipman detayları başarıyla alındı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman detayları alınırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman detayları alınırken bir hata oluştu'
      };
    }
  },
  
  updateEquipment: async (equipmentId, equipmentData) => {
    try {
      console.log('Ekipman güncelleme isteği:', { equipmentId, equipmentData });
      
      // API'ye gönderilecek veriyi hazırla
      const requestData = {
        name: equipmentData.name,
        description: equipmentData.notes || '',
        equipment_type: equipmentData.equipment_type,
        status: equipmentData.status,
        serial_number: equipmentData.serial_number,
        model: equipmentData.model,
        manufacturer: equipmentData.manufacturer,
        purchase_date: equipmentData.purchase_date,
        department_id: equipmentData.department_id,
        assigned_to_id: equipmentData.assigned_to
      };
      
      const response = await api.put(`/equipment/${equipmentId}`, requestData);
      console.log('Ekipman güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman güncellenirken bir hata oluştu'
      };
    }
  },
  
  deleteEquipment: async (equipmentId) => {
    try {
      console.log('Ekipman silme isteği:', equipmentId);
      const response = await api.delete(`/equipment/${equipmentId}`);
      console.log('Ekipman silme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman silme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman silinirken bir hata oluştu'
      };
    }
  },

  updateEquipmentStatus: async (equipmentId, status) => {
    try {
      console.log('Ekipman durumu güncelleme isteği:', { equipmentId, status });
      const response = await api.put(`/equipment/${equipmentId}`, { status });
      console.log('Ekipman durumu güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman durumu güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman durumu güncellenirken bir hata oluştu'
      };
    }
  },

  updateEquipmentDepartment: async (equipmentId, departmentId) => {
    try {
      console.log('Ekipman departmanı güncelleme isteği:', { equipmentId, departmentId });
      const response = await api.put(`/equipment/${equipmentId}`, { department_id: departmentId });
      console.log('Ekipman departmanı güncelleme başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman departmanı güncelleme hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman departmanı güncellenirken bir hata oluştu'
      };
    }
  },

  assignEquipment: async (equipmentId, userId) => {
    try {
      console.log('Ekipman atama isteği:', { equipmentId, userId });
      
      // Eğer userId boş veya null ise, assigned_to_id'yi null olarak gönder
      const requestData = userId ? { assigned_to_id: userId } : { assigned_to_id: null };
      
      const response = await api.put(`/equipment/${equipmentId}`, requestData);
      console.log('Ekipman atama başarılı:', response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman atama hatası:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ekipman atanırken bir hata oluştu'
      };
    }
  },
};

export { api };