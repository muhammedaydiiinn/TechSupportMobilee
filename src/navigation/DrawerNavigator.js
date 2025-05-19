import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import TokenService from '../services/TokenService';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateTicketScreen from '../screens/tickets/CreateTicketScreen';
import MyTicketsScreen from '../screens/tickets/MyTicketsScreen';
import TicketDetailScreen from '../screens/tickets/TicketDetailScreen';

// Admin Screens
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import DepartmentManagementScreen from '../screens/admin/DepartmentManagementScreen';
import EquipmentManagementScreen from '../screens/admin/EquipmentManagementScreen';

// Departman Yöneticisi Ekranları - geçici olarak mevcut ekranları kullanıyoruz
const DepartmentUsersScreen = UserManagementScreen;
const DepartmentTicketsScreen = MyTicketsScreen;
const DepartmentEquipmentScreen = EquipmentManagementScreen;

// Destek Ekibi Ekranları - geçici olarak mevcut ekranları kullanıyoruz
const AllTicketsScreen = MyTicketsScreen;
const ActiveTicketsScreen = MyTicketsScreen;

// Components
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'DEPARTMENT_MANAGER';
  const isSupport = user?.role === 'SUPPORT';
  
  // Kullanıcı bilgilerini ve rollerini logla
  console.log('DrawerNavigator içinde kullanıcı bilgileri:', user);
  console.log('Admin mi?', isAdmin);
  console.log('Departman yöneticisi mi?', isManager);
  console.log('Destek ekibi mi?', isSupport);
  
  useEffect(() => {
    if (isAdmin) {
      console.log('Kullanıcı admin rolüne sahip. Admin menüleri görünür olmalı.');
    } else if (isManager) {
      console.log('Kullanıcı departman yöneticisi rolüne sahip. Departman menüleri görünür olmalı.');
    } else if (isSupport) {
      console.log('Kullanıcı destek ekibi rolüne sahip. Destek menüleri görünür olmalı.');
    } else {
      console.log('Kullanıcı standart rollere sahip değil veya rol bilgisi eksik:', user?.role);
    }
  }, [isAdmin, isManager, isSupport, user]);

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

  // Admin rolüne ait ekranlar
  const renderAdminScreens = () => {
    if (!isAdmin) return null;
    
    return (
      <>
        <Drawer.Screen 
          name="UserManagement" 
          component={UserManagementScreen}
          options={{
            title: 'Kullanıcı Yönetimi',
            drawerIcon: ({ color }) => (
              <Ionicons name="people" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="DepartmentManagement" 
          component={DepartmentManagementScreen}
          options={{
            title: 'Departman Yönetimi',
            drawerIcon: ({ color }) => (
              <Ionicons name="business" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="EquipmentManagement" 
          component={EquipmentManagementScreen}
          options={{
            title: 'Ekipman Yönetimi',
            drawerIcon: ({ color }) => (
              <Ionicons name="hardware-chip" size={22} color={color} />
            ),
          }}
        />
      </>
    );
  };
  
  // Departman yöneticisi rolüne ait ekranlar
  const renderManagerScreens = () => {
    if (!isManager) return null;
    
    return (
      <>
        <Drawer.Screen 
          name="DepartmentUsers" 
          component={DepartmentUsersScreen}
          options={{
            title: 'Departman Kullanıcıları',
            drawerIcon: ({ color }) => (
              <Ionicons name="people" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="DepartmentTickets" 
          component={DepartmentTicketsScreen}
          options={{
            title: 'Departman Talepleri',
            drawerIcon: ({ color }) => (
              <Ionicons name="document-text" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="DepartmentEquipment" 
          component={DepartmentEquipmentScreen}
          options={{
            title: 'Departman Ekipmanları',
            drawerIcon: ({ color }) => (
              <Ionicons name="hardware-chip" size={22} color={color} />
            ),
          }}
        />
      </>
    );
  };
  
  // Destek ekibi rolüne ait ekranlar
  const renderSupportScreens = () => {
    if (!isSupport) return null;
    
    return (
      <>
        <Drawer.Screen 
          name="AllTickets" 
          component={AllTicketsScreen}
          options={{
            title: 'Tüm Destek Talepleri',
            drawerIcon: ({ color }) => (
              <Ionicons name="list" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="ActiveTickets" 
          component={ActiveTicketsScreen}
          options={{
            title: 'Aktif Talepler',
            drawerIcon: ({ color }) => (
              <Ionicons name="alert-circle" size={22} color={color} />
            ),
          }}
        />
      </>
    );
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
        
        {/* Rol bazlı ekranlar */}
        {renderAdminScreens()}
        {renderManagerScreens()}
        {renderSupportScreens()}
        
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