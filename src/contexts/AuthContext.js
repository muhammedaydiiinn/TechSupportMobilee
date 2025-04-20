import React, { createContext, useState, useContext, useEffect } from 'react';
import TokenService from '../services/TokenService';
import { authService, userService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await TokenService.getToken();
      console.log('Token kontrolü:', token ? 'Token bulundu' : 'Token bulunamadı');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log('Çözümlenen token:', decoded);
          
          // Kullanıcı bilgilerini API'den al
          const userDetails = await userService.getCurrentUser();
          console.log('Kullanıcı detayları:', userDetails);
          
          setUser({
            id: decoded.sub,
            email: userDetails.email,
            role: userDetails.role,
            department_id: userDetails.department_id,
            department_name: userDetails.department_name,
            first_name: userDetails.first_name,
            last_name: userDetails.last_name
          });
        } catch (decodeError) {
          console.error('Token çözümleme hatası:', decodeError);
          await TokenService.clearAllTokens();
        }
      }
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      await TokenService.clearAllTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        const decoded = jwtDecode(response.data.access_token);
        console.log('Login - Çözümlenen token:', decoded);
        
        // Kullanıcı bilgilerini API'den al
        const userDetails = await userService.getCurrentUser();
        console.log('Login - Kullanıcı detayları:', userDetails);
        
        setUser({
          id: decoded.sub,
          email: userDetails.email,
          role: userDetails.role,
          department_id: userDetails.department_id,
          department_name: userDetails.department_name,
          first_name: userDetails.first_name,
          last_name: userDetails.last_name
        });
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Giriş yapılırken bir hata oluştu');
      return { success: false, message: 'Giriş yapılırken bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      await TokenService.clearAllTokens();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      setError('Çıkış yapılırken bir hata oluştu');
      return { success: false, message: 'Çıkış yapılırken bir hata oluştu' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 