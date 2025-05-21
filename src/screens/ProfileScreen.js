import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authService, departmentService } from '../services/api';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    old_password: '',
    department_id: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Departmanlar alınırken hata:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.data);
        // Edit form için başlangıç değerlerini ayarla
        setEditForm({
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          password: '',
          old_password: '',
          department_id: response.data.department_id
        });
      } else {
        setError(response.message || 'Profil bilgileri alınamadı.');
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      setError('Profil bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUser(user.id, editForm);
      if (response.success) {
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
        setShowEditModal(false);
        fetchUserProfile(); // Profili yeniden yükle
      } else {
        Alert.alert('Hata', response.message || 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Departman bilgisi yok';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person" size={60} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{user?.first_name || ''} {user?.last_name || ''}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={22} color={COLORS.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{user?.first_name || ''} {user?.last_name || ''}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={22} color={COLORS.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>E-posta</Text>
            <Text style={styles.infoValue}>{user?.email || ''}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="business-outline" size={22} color={COLORS.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Departman</Text>
            <Text style={styles.infoValue}>{getDepartmentName(user?.department_id)}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="shield-outline" size={22} color={COLORS.primary} style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{user?.role || 'Rol bilgisi yok'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => setShowEditModal(true)}
      >
        <Ionicons name="create-outline" size={20} color={COLORS.white} />
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>

      {/* Profil Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm({...editForm, first_name: text})}
                  placeholder="Adınız"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm({...editForm, last_name: text})}
                  placeholder="Soyadınız"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="E-posta adresiniz"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.old_password}
                  onChangeText={(text) => setEditForm({...editForm, old_password: text})}
                  placeholder="Mevcut şifreniz"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Yeni Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.password}
                  onChangeText={(text) => setEditForm({...editForm, password: text})}
                  placeholder="Yeni şifreniz (değiştirmek istemiyorsanız boş bırakın)"
                  secureTextEntry
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: 30,
    paddingBottom: 40,
  },
  profileImageContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 60,
    height: 120,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    marginRight: 15,
    width: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;