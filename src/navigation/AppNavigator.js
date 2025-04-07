import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import CustomDrawer from '../components/CustomDrawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Ekranlar
import DashboardScreen from '../screens/DashboardScreen';
import CreateTicketScreen from '../screens/tickets/CreateTicketScreen';
import MyTicketsScreen from '../screens/tickets/MyTicketsScreen';
import TicketDetailScreen from '../screens/tickets/TicketDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Bilet işlemleri için stack navigator
const TicketsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="MyTickets" 
      component={MyTicketsScreen} 
      options={{ title: 'Biletlerim' }}
    />
    <Stack.Screen 
      name="CreateTicket" 
      component={CreateTicketScreen} 
      options={{ title: 'Yeni Destek Bileti' }}
    />
    <Stack.Screen 
      name="TicketDetail" 
      component={TicketDetailScreen} 
      options={{ title: 'Bilet Detayları' }}
    />
  </Stack.Navigator>
);

// Ana drawer navigator
const AppNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.text,
        drawerLabelStyle: {
          marginLeft: -25,
          fontSize: 15,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Ana Sayfa',
          drawerIcon: ({color}) => (
            <Ionicons name="home-outline" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="TicketsStack" 
        component={TicketsStack}
        options={{
          title: 'Destek Biletleri',
          drawerIcon: ({color}) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
          headerShown: false
        }}
      />
      <Drawer.Screen 
        name="CreateTicket" 
        component={CreateTicketScreen}
        options={{
          title: 'Yeni Bilet Oluştur',
          drawerIcon: ({color}) => (
            <Ionicons name="add-circle-outline" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profilim',
          drawerIcon: ({color}) => (
            <Ionicons name="person-outline" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          drawerIcon: ({color}) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
};

export default AppNavigator;