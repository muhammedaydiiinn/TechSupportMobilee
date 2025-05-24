import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import theme from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const CustomDrawerContent = ({ navigation, onLogout }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  // Kullanıcı rolünü kontrol et
  const isManager = user?.role === 'DEPARTMENT_MANAGER';
  const isSupport = user?.role === 'SUPPORT';

  useEffect(() => {
    console.log('CustomDrawerContent içinde kullanıcı rolü:', user?.role);
    console.log('Admin mi?', isAdmin);
    console.log('Yönetici mi?', isManager);
    console.log('Destek ekibi mi?', isSupport);
  }, [user, isAdmin, isManager, isSupport]);

  const generalMenuItems = [
    { name: 'Dashboard', icon: 'home', label: 'Ana Sayfa' },
    { name: 'CreateTicket', icon: 'add-circle', label: 'Yeni Destek Talebi Oluştur' },
    { name: 'MyTickets', icon: 'list', label: 'Destek Taleplerim' },
  ];

  const adminMenuItems = [
    { name: 'UserManagement', icon: 'people', label: 'Kullanıcı Yönetimi' },
    { name: 'DepartmentManagement', icon: 'business', label: 'Departman Yönetimi' },
    { name: 'EquipmentManagement', icon: 'hardware-chip', label: 'Ekipman Yönetimi' },
  ];
  
  const managerMenuItems = [
    { name: 'DepartmentUsers', icon: 'people', label: 'Departman Kullanıcıları' },
    { name: 'DepartmentTickets', icon: 'document-text', label: 'Departman Talepleri' },
    { name: 'DepartmentEquipment', icon: 'hardware-chip', label: 'Departman Ekipmanları' },
  ];
  
  const supportMenuItems = [
    { name: 'AllTickets', icon: 'list', label: 'Tüm Destek Talepleri' },
    { name: 'ActiveTickets', icon: 'alert-circle', label: 'Aktif Talepler' },
  ];

  const profileMenuItems = [
    { name: 'Profile', icon: 'person', label: 'Profil' },
    { name: 'Settings', icon: 'settings', label: 'Ayarlar' },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.name}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.name)}
    >
      <Ionicons name={item.icon} size={22} color={COLORS.white} />
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.appName}>Tech Support</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>
                  {isAdmin ? 'Yönetici' : 
                  isManager ? 'Departman Yöneticisi' :
                  isSupport ? 'Destek Ekibi' : 'Kullanıcı'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Genel</Text>
            {generalMenuItems.map(renderMenuItem)}
          </View>
          
          {isAdmin && (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Yönetim</Text>
              {adminMenuItems.map(renderMenuItem)}
            </View>
          )}
          
          {isManager && (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Departman Yönetimi</Text>
              {managerMenuItems.map(renderMenuItem)}
            </View>
          )}
          
          {isSupport && (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Destek Ekibi</Text>
              {supportMenuItems.map(renderMenuItem)}
            </View>
          )}
          
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Hesap</Text>
            {profileMenuItems.map(renderMenuItem)}
          </View>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Ionicons name="log-out" size={22} color={COLORS.white} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    marginTop: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuSection: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.white,
  },
});

export default CustomDrawerContent; 