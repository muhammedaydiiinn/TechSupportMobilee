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
} from 'react-native';
import { departmentService } from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';

const DepartmentManagementScreen = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim yetkiniz bulunmamaktadır.');
      return;
    }
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getDepartments();
      
      if (response.success) {
        setDepartments(response.data);
      } else {
        setError(response.message || 'Departmanlar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman getirme hatası:', error);
      setError('Departman verileri alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!formData.name) {
      Alert.alert('Hata', 'Lütfen departman adını girin');
      return;
    }

    try {
      setLoading(true);
      const response = await departmentService.createDepartment(formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Departman başarıyla oluşturuldu');
        setShowDepartmentModal(false);
        resetForm();
        fetchDepartments();
      } else {
        Alert.alert('Hata', response.message || 'Departman oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman oluşturma hatası:', error);
      Alert.alert('Hata', 'Departman oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!formData.name) {
      Alert.alert('Hata', 'Lütfen departman adını girin');
      return;
    }

    try {
      setLoading(true);
      const response = await departmentService.updateDepartment(selectedDepartment.id, formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Departman başarıyla güncellendi');
        setShowDepartmentModal(false);
        resetForm();
        fetchDepartments();
      } else {
        Alert.alert('Hata', response.message || 'Departman güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman güncelleme hatası:', error);
      Alert.alert('Hata', 'Departman güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      setLoading(true);
      const response = await departmentService.deleteDepartment(selectedDepartment.id);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Departman başarıyla silindi');
        setShowDeleteModal(false);
        setSelectedDepartment(null);
        fetchDepartments();
      } else {
        Alert.alert('Hata', response.message || 'Departman silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman silme hatası:', error);
      Alert.alert('Hata', 'Departman silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const editDepartment = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
    });
    setIsEditing(true);
    setShowDepartmentModal(true);
  };

  const confirmDeleteDepartment = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const viewDepartmentUsers = async (departmentId) => {
    try {
      setLoading(true);
      const response = await departmentService.getDepartmentUsers(departmentId);
      
      if (response.success) {
        // Burada kullanıcıları gösterecek bir modal açılabilir
        Alert.alert('Departman Kullanıcıları', `Bu departmanda ${response.data.length} kullanıcı bulunmaktadır.`);
      } else {
        Alert.alert('Hata', response.message || 'Departman kullanıcıları alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Departman kullanıcıları getirme hatası:', error);
      Alert.alert('Hata', 'Departman kullanıcıları alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setIsEditing(false);
    setSelectedDepartment(null);
  };

  if (loading && departments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && departments.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Departman Yönetimi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowDepartmentModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.white} />
          <Text style={styles.addButtonText}>Departman Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={departments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.departmentCard}>
            <View style={styles.departmentInfo}>
              <View>
                <Text style={styles.departmentName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.departmentDescription}>{item.description}</Text>
                )}
              </View>
              <View style={styles.departmentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => viewDepartmentUsers(item.id)}
                >
                  <Ionicons name="people-outline" size={20} color={colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => editDepartment(item)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => confirmDeleteDepartment(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      {/* Departman Ekleme/Düzenleme Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowDepartmentModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Departman Düzenle' : 'Yeni Departman Ekle'}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Departman Adı*</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Departman adını girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Departman açıklaması (isteğe bağlı)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDepartmentModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={isEditing ? handleUpdateDepartment : handleCreateDepartment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>{isEditing ? 'Güncelle' : 'Kaydet'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setSelectedDepartment(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 20 }]}>
            <Text style={styles.modalTitle}>Departman Silme</Text>
            
            <Text style={styles.confirmText}>
              {selectedDepartment ? `"${selectedDepartment.name}" departmanını silmek istediğinizden emin misiniz?` : 'Bu departmanı silmek istediğinizden emin misiniz?'}
            </Text>
            
            <Text style={styles.warningText}>
              Bu işlem, departmana bağlı tüm kullanıcı ilişkilerini etkileyebilir!
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedDepartment(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteDepartment}
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
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
  departmentCard: {
    marginBottom: 10,
    padding: 15,
  },
  departmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  departmentName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  departmentDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
  },
  departmentActions: {
    flexDirection: 'row',
  },
  actionButton: {
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
  textArea: {
    minHeight: 100,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default DepartmentManagementScreen; 