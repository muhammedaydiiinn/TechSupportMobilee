import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

console.log('AuthNavigator yükleniyor...');

const Stack = createStackNavigator();

const AuthNavigator = () => {
  console.log('AuthNavigator render ediliyor...');
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          title: 'Giriş Yap',
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Kayıt Ol',
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Şifremi Unuttum',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;