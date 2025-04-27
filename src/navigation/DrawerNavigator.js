import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import TokenService from '../services/TokenService';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateTicketScreen from '../screens/tickets/CreateTicketScreen';
import MyTicketsScreen from '../screens/tickets/MyTicketsScreen';
import TicketDetailScreen from '../screens/tickets/TicketDetailScreen';

// Components
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const token = await TokenService.getToken();
      console.log('Current token before logout:', token);
      await logout();
      const tokenAfterLogout = await TokenService.getToken();
      console.log('Token after logout:', tokenAfterLogout);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <Drawer.Navigator
        drawerContent={(props) => (
          <CustomDrawerContent {...props} onLogout={handleLogout} />
        )}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          drawerStyle: {
            backgroundColor: COLORS.white,
            width: '80%',
            marginTop: 0,
          },
          drawerActiveTintColor: COLORS.primary,
          drawerInactiveTintColor: COLORS.text,
          drawerLabelStyle: {
            marginLeft: -15,
            fontSize: 16,
          },
        }}
      >
        <Drawer.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            title: 'Ana Sayfa',
            drawerIcon: ({ color }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="CreateTicket" 
          component={CreateTicketScreen}
          options={{
            title: 'Yeni Destek Talebi Oluştur',
            drawerIcon: ({ color }) => (
              <Ionicons name="add-circle" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="MyTickets" 
          component={MyTicketsScreen}
          options={{
            title: 'Destek Taleplerim',
            drawerIcon: ({ color }) => (
              <Ionicons name="list" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="TicketDetail" 
          component={TicketDetailScreen}
          options={{
            title: 'Destek Talebi Detayı',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profil',
            drawerIcon: ({ color }) => (
              <Ionicons name="person" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Ayarlar',
            drawerIcon: ({ color }) => (
              <Ionicons name="settings" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </SafeAreaProvider>
  );
};

export default DrawerNavigator; 