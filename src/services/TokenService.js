import AsyncStorage from '@react-native-async-storage/async-storage';

const TokenService = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Token alınamadı:', error);
      return null;
    }
  },

  setToken: async (token) => {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Token kaydedilemedi:', error);
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
    } catch (error) {
      console.error('Token silinemedi:', error);
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Refresh token alınamadı:', error);
      return null;
    }
  },

  setRefreshToken: async (token) => {
    try {
      await AsyncStorage.setItem('refresh_token', token);
    } catch (error) {
      console.error('Refresh token kaydedilemedi:', error);
    }
  },

  removeRefreshToken: async () => {
    try {
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Refresh token silinemedi:', error);
    }
  },

  clearAllTokens: async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Tokenler temizlenemedi:', error);
    }
  }
};

export default TokenService; 