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
import { Picker } from '@react-native-picker/picker';
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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
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
    role: 'USER',
    department_id: '',
    api_access: false,
    status: 'active',
  });

  const userRoles = [
    { value: 'ADMIN', label: 'Yönetici' },
    { value: 'SUPPORT', label: 'Destek Ekibi' },
    { value: 'USER', label: 'Kullanıcı' },
    { value: 'DEPARTMENT_MANAGER', label: 'Departman Yöneticisi' },
    { value: 'DEPARTMENT_EMPLOYEE', label: 'Departman Çalışanı' },
  ];

  const userStatuses = [
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'INACTIVE', label: 'Pasif' },
    { value: 'SUSPENDED', label: 'Askıya Alınmış' },
  ];

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
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
      status: user.status || 'active',
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
      status: 'active',
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



  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return colors.success;
      case 'INACTIVE':
        return colors.warning;
      case 'SUSPENDED':
        return colors.error;
      default:
        return colors.textLight;
    }
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
        <View style={styles.headerButtons}>
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
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={22} color={colors.primary} />
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
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
              
              </View>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userRole}>Rol: {getRoleLabel(item.role)}</Text>
              <Text style={styles.userDepartment}>Departman: {getDepartmentName(item.department_id)}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedUser(item);
                  setShowRoleModal(true);
                }}
              >
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Rol Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedUser(item);
                  setShowDepartmentModal(true);
                }}
              >
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Departman Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedUser(item);
                  setShowStatusModal(true);
                }}
              >
                <Ionicons name="toggle" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Durum Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => editUser(item)}
              >
                <Ionicons name="create" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => confirmDeleteUser(item)}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
                <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
              </TouchableOpacity>
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
                style={[styles.modalButton, styles.saveButton]}
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

      {/* Role Update Modal */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Rolünü Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                style={styles.picker}
              >
                {userRoles.map((role) => (
                  <Picker.Item key={role.value} label={role.label} value={role.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleUpdateUserRole(formData.role)}
              >
                <Text style={styles.buttonText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Department Update Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Departmanını Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.department_id}
                onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                style={styles.picker}
              >
                <Picker.Item label="Departman Seçin" value="" />
                {departments.map((dept) => (
                  <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDepartmentModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleUpdateUserDepartment(formData.department_id)}
              >
                <Text style={styles.buttonText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Durumunu Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                style={styles.picker}
              >
                {userStatuses.map((status) => (
                  <Picker.Item key={status.value} label={status.label} value={status.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleUpdateUserStatus(formData.status)}
              >
                <Text style={styles.buttonText}>Güncelle</Text>
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
    padding: 20,
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
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  infoText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: '500',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  activeFiltersText: {
    color: colors.textLight,
    fontSize: 14,
  },
  filterTag: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterTagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  clearFiltersText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  userCard: {
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  userRole: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  userDepartment: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.success,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteText: {
    color: colors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.white,
    fontSize: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textLight + '20',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  roleButtonTextSelected: {
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserManagementScreen; 