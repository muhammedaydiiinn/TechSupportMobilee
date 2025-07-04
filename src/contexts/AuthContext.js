import React, { createContext, useState, useContext, useEffect } from 'react';
import TokenService from '../services/TokenService';
import { authService, userService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { reset } from '../navigation/RootNavigation';

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
      
      if (token) {
        try {
          // Kullanıcı bilgilerini API'den al
          const userDetails = await userService.getCurrentUser();
          
          if (userDetails) {
            setUser({
              id: userDetails.id,
              email: userDetails.email,
              role: userDetails.role,
              department_id: userDetails.department_id,
              department_name: userDetails.department_name,
              first_name: userDetails.first_name,
              last_name: userDetails.last_name
            });
          } else {
            // Kullanıcı bilgileri alınamadıysa tokenları temizle
            await TokenService.clearAllTokens();
          }
        } catch (error) {
          // API hatası durumunda tokenları temizle
          await TokenService.clearAllTokens();
        }
      }
    } catch (error) {
      // Genel hata durumunda tokenları temizle
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
        
        // Kullanıcı bilgilerini API'den al
        const userDetails = await userService.getCurrentUser();
        
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
        const errorMessage = response.error?.detail || response.message;
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      const errorMessage = error.response?.data?.detail || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await TokenService.clearAllTokens();
      setUser(null);
      setError(null);
      // Navigasyonu sıfırla ve Login ekranına yönlendir
      reset('Login');
      return { success: true };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      return { success: false, message: 'Çıkış yapılırken bir hata oluştu' };
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