import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { userService, departmentService } from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';

const UserManagementScreen = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [filters, setFilters] = useState({
    role: '',
    department_id: '',
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user',
    department_id: '',
    api_access: false,
  });

  const userRoles = [
    { value: 'admin', label: 'Yönetici' },
    { value: 'support', label: 'Destek Ekibi' },
    { value: 'user', label: 'Kullanıcı' },
    { value: 'department_manager', label: 'Departman Yöneticisi' },
    { value: 'department_employee', label: 'Departman Çalışanı' },
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim yetkiniz bulunmamaktadır.');
      return;
    }
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      } else {
        console.error('Departmanlar alınırken bir hata oluştu:', response.message);
      }
    } catch (error) {
      console.error('Departman getirme hatası:', error);
    }
  };

  const fetchUsers = async (customFilters = null) => {
    try {
      setLoading(true);
      const params = customFilters || filters;
      // Boş filtreleri kaldır
      const cleanedParams = {};
      Object.keys(params).forEach(key => {
        if (params[key]) {
          cleanedParams[key] = params[key];
        }
      });
      
      const response = await userService.getUsers(cleanedParams);
      
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Kullanıcılar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
      setError('Kullanıcı verileri alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    fetchUsers();
    setShowFilterModal(false);
  };
  
  const clearFilters = () => {
    setFilters({
      role: '',
      department_id: '',
    });
    fetchUsers({
      role: '',
      department_id: '',
    });
    setShowFilterModal(false);
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.createUser(formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kullanıcı başarıyla oluşturuldu');
        setShowUserModal(false);
        resetForm();
        fetchUsers();
      } else {
        Alert.alert(
          'Hata',
          `Kullanıcı oluşturulurken bir hata oluştu:\n${response.message}`
        );
      }
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      Alert.alert('Hata', 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      
      // Şifre yoksa objeyi kopyalayıp şifre alanını kaldır
      const userData = {...formData};
      if (!userData.password) {
        delete userData.password;
      }
      
      const response = await userService.updateUser(selectedUser.id, userData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kullanıcı başarıyla güncellendi');
        setShowUserModal(false);
        resetForm();
        fetchUsers();
      } else {
        Alert.alert(
          'Hata', 
          `Kullanıcı güncellenirken bir hata oluştu:\n${response.message}`
        );
      }
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await userService.deleteUser(selectedUser.id);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kullanıcı başarıyla silindi');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        Alert.alert('Hata', response.message || 'Kullanıcı silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      Alert.alert('Hata', 'Kullanıcı silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role || 'user',
      department_id: user.department_id || '',
      api_access: user.api_access || false,
    });
    setIsEditing(true);
    setShowUserModal(true);
  };

  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'user',
      department_id: '',
      api_access: false,
    });
    setIsEditing(false);
    setSelectedUser(null);
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : '';
  };

  const getRoleLabel = (roleValue) => {
    const role = userRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kullanıcı Yönetimi</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowUserModal(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={styles.addButtonText}>Kullanıcı Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Toplam: {users.length} kullanıcı</Text>
        {(filters.role || filters.department_id) && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>Aktif filtreler: </Text>
            {filters.role && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{getRoleLabel(filters.role)}</Text>
              </View>
            )}
            {filters.department_id && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{getDepartmentName(filters.department_id)}</Text>
              </View>
            )}
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Temizle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <View>
                <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.tagContainer}>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
                  </View>
                  {item.department_id && (
                    <View style={styles.departmentTag}>
                      <Text style={styles.departmentText}>{getDepartmentName(item.department_id)}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => editUser(item)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => confirmDeleteUser(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Kullanıcı Ekleme/Düzenleme Modal */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowUserModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>E-posta*</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="E-posta adresini girin"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{isEditing ? 'Şifre (değiştirmek için doldurun)' : 'Şifre*'}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  placeholder="Şifre girin"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
                  <Text style={styles.label}>Ad*</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({...formData, first_name: text})}
                    placeholder="Ad"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
                  <Text style={styles.label}>Soyad*</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({...formData, last_name: text})}
                    placeholder="Soyad"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Rol*</Text>
                <View style={styles.roleButtonsContainer}>
                  {userRoles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleButton,
                        formData.role === role.value && styles.roleButtonSelected
                      ]}
                      onPress={() => setFormData({...formData, role: role.value})}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        formData.role === role.value && styles.roleButtonTextSelected
                      ]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Departman</Text>
                <View style={styles.roleButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.department_id === '' && styles.roleButtonSelected
                    ]}
                    onPress={() => setFormData({...formData, department_id: ''})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.department_id === '' && styles.roleButtonTextSelected
                    ]}>
                      Departman yok
                    </Text>
                  </TouchableOpacity>
                  {departments.map((department) => (
                    <TouchableOpacity
                      key={department.id}
                      style={[
                        styles.roleButton,
                        formData.department_id === department.id && styles.roleButtonSelected
                      ]}
                      onPress={() => setFormData({...formData, department_id: department.id})}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        formData.department_id === department.id && styles.roleButtonTextSelected
                      ]}>
                        {department.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formData.api_access && styles.checkboxSelected
                    ]}
                    onPress={() => setFormData({...formData, api_access: !formData.api_access})}
                  >
                    {formData.api_access && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>API Erişimi</Text>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowUserModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={isEditing ? handleUpdateUser : handleCreateUser}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Kullanıcı Silme Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 20 }]}>
            <Text style={styles.modalTitle}>Kullanıcı Silme</Text>
            
            <Text style={styles.confirmText}>
              {selectedUser ? `"${selectedUser.first_name} ${selectedUser.last_name}" kullanıcısını silmek istediğinizden emin misiniz?` : 'Bu kullanıcıyı silmek istediğinizden emin misiniz?'}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Filtre Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 20 }]}>
            <Text style={styles.modalTitle}>Kullanıcıları Filtrele</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kullanıcı Rolü</Text>
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    filters.role === '' && styles.roleButtonSelected
                  ]}
                  onPress={() => setFilters({...filters, role: ''})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    filters.role === '' && styles.roleButtonTextSelected
                  ]}>
                    Tüm roller
                  </Text>
                </TouchableOpacity>
                {userRoles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleButton,
                      filters.role === role.value && styles.roleButtonSelected
                    ]}
                    onPress={() => setFilters({...filters, role: role.value})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      filters.role === role.value && styles.roleButtonTextSelected
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Departman</Text>
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    filters.department_id === '' && styles.roleButtonSelected
                  ]}
                  onPress={() => setFilters({...filters, department_id: ''})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    filters.department_id === '' && styles.roleButtonTextSelected
                  ]}>
                    Tüm departmanlar
                  </Text>
                </TouchableOpacity>
                {departments.map((department) => (
                  <TouchableOpacity
                    key={department.id}
                    style={[
                      styles.roleButton,
                      filters.department_id === department.id && styles.roleButtonSelected
                    ]}
                    onPress={() => setFilters({...filters, department_id: department.id})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      filters.department_id === department.id && styles.roleButtonTextSelected
                    ]}>
                      {department.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={clearFilters}
              >
                <Text style={styles.modalButtonText}>Temizle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={applyFilters}
              >
                <Text style={styles.modalButtonText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: colors.white,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontWeight: '500',
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoText: {
    color: colors.textLight,
    fontSize: 14,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  activeFiltersText: {
    color: colors.textLight,
    fontSize: 14,
    marginRight: 5,
  },
  filterTag: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  filterTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  clearFiltersText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  userCard: {
    marginBottom: 10,
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleTag: {
    backgroundColor: colors.primary + '20',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 5,
  },
  roleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  departmentTag: {
    backgroundColor: colors.secondary + '20',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  departmentText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginLeft: 5,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  formGroup: {
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    backgroundColor: colors.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    backgroundColor: colors.white,
    justifyContent: 'center',
    height: 50,
    overflow: 'hidden',
    marginTop: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text,
  },
  pickerItem: {
    fontSize: 16,
    color: colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  confirmText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  roleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  roleButtonTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
});

export default UserManagementScreen; 