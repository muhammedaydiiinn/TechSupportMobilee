import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { authService } from '../services/api';

const CustomDrawer = props => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.log('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      props.navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
        
          <View style={styles.profileImageContainer}>
            <Ionicons name="person" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>
            {loading ? 'Yükleniyor...' : user ? `${user.name} ${user.surname}` : 'Kullanıcı'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>
        <View style={styles.drawerListItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.logoutContent}>
            <Ionicons name="exit-outline" size={22} color={COLORS.text} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: COLORS.primary,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    overflow: 'hidden',
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: COLORS.lightText,
    fontSize: 14,
  },
  drawerListItems: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 10,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutButton: {
    paddingVertical: 15,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    marginLeft: 5,
    color: COLORS.text,
  },
});

export default CustomDrawer;