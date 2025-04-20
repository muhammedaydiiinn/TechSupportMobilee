import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

class TokenService {
  static async setToken(token) {
    try {
      if (!token) {
        await this.removeToken();
        return;
      }
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Token kaydedilirken hata oluştu:', error);
      throw new Error('Token kaydedilemedi');
    }
  }

  static async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        await this.removeToken();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Token alınırken hata oluştu:', error);
      await this.removeToken();
      return null;
    }
  }

  static async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Token silinirken hata oluştu:', error);
    }
  }

  static async setRefreshToken(token) {
    try {
      if (!token) {
        await this.removeRefreshToken();
        return;
      }
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Refresh token kaydedilirken hata oluştu:', error);
      throw new Error('Refresh token kaydedilemedi');
    }
  }

  static async getRefreshToken() {
    try {
      const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!token) {
        await this.removeRefreshToken();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Refresh token alınırken hata oluştu:', error);
      await this.removeRefreshToken();
      return null;
    }
  }

  static async removeRefreshToken() {
    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Refresh token silinirken hata oluştu:', error);
    }
  }

  static async clearAllTokens() {
    try {
      await this.removeToken();
      await this.removeRefreshToken();
    } catch (error) {
      console.error('Tokenlar temizlenirken hata oluştu:', error);
    }
  }
}

export default TokenService; 