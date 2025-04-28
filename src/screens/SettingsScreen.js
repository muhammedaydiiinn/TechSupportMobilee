import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const { logout } = useAuth();

  const toggleSwitch = (setting, value) => {
    if (setting === 'notifications') {
      setNotifications(value);
    } else if (setting === 'darkMode') {
      setDarkMode(value);
      // In a real app, you would apply the theme here
    } else if (setting === 'emailUpdates') {
      setEmailUpdates(value);
    }
  };

  const clearCache = () => {
    Alert.alert(
      'Önbelleği Temizle',
      'Tüm önbellek temizlenecek. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Başarılı', 'Önbellek temizlendi.');
          } 
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (!result.success) {
                Alert.alert('Hata', result.message || 'Çıkış yapılırken bir hata oluştu.');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          } 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Bildirimler</Text>
        </View>
        <Switch
          trackColor={{ false: '#d1d1d6', true: 'rgba(33, 150, 243, 0.4)' }}
          thumbColor={notifications ? COLORS.primary : '#f4f3f4'}
          onValueChange={(value) => toggleSwitch('notifications', value)}
          value={notifications}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="moon-outline" size={22} color={COLORS.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Karanlık Mod</Text>
        </View>
        <Switch
          trackColor={{ false: '#d1d1d6', true: 'rgba(33, 150, 243, 0.4)' }}
          thumbColor={darkMode ? COLORS.primary : '#f4f3f4'}
          onValueChange={(value) => toggleSwitch('darkMode', value)}
          value={darkMode}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="mail-outline" size={22} color={COLORS.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>E-posta Bildirimleri</Text>
        </View>
        <Switch
          trackColor={{ false: '#d1d1d6', true: 'rgba(33, 150, 243, 0.4)' }}
          thumbColor={emailUpdates ? COLORS.primary : '#f4f3f4'}
          onValueChange={(value) => toggleSwitch('emailUpdates', value)}
          value={emailUpdates}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Uygulama</Text>
      
      <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Bilgi', 'Uygulama Sürümü: 1.0.0')}>
        <View style={styles.settingContent}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Hakkında</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#c7c7cc" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.settingItem} onPress={clearCache}>
        <View style={styles.settingContent}>
          <Ionicons name="trash-outline" size={22} color={COLORS.primary} style={styles.settingIcon} />
          <Text style={styles.settingText}>Önbelleği Temizle</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#c7c7cc" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: COLORS.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
    width: 24,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;