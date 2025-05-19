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
  Platform,
} from 'react-native';
import { equipmentService, departmentService, userService } from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const EquipmentManagementScreen = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    equipment_type: 'computer',
    serial_number: '',
    manufacturer: '',
    model: '',
    purchase_date: '',
    status: 'active',
    notes: '',
    department_id: '',
    assigned_to: '',
  });

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState([]);

  const equipmentTypes = [
    { value: 'computer', label: 'Bilgisayar' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'monitor', label: 'Monitör' },
    { value: 'printer', label: 'Yazıcı' },
    { value: 'server', label: 'Sunucu' },
    { value: 'network_device', label: 'Ağ Cihazı' },
    { value: 'mobile_device', label: 'Mobil Cihaz' },
    { value: 'software', label: 'Yazılım' },
    { value: 'other', label: 'Diğer' },
  ];

  const equipmentStatuses = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'maintenance', label: 'Bakımda' },
    { value: 'disposed', label: 'Kullanım Dışı' },
  ];

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim yetkiniz bulunmamaktadır.');
      return;
    }
    fetchEquipment();
    fetchDepartments();
    fetchUsers();
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

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment();
      
      if (response.success) {
        setEquipment(response.data);
      } else {
        setError(response.message || 'Ekipmanlar alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman getirme hatası:', error);
      setError('Ekipman verileri alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        console.error('Kullanıcılar alınırken bir hata oluştu:', response.message);
      }
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
    }
  };

  const handleCreateEquipment = async () => {
    if (!formData.name || !formData.equipment_type) {
      Alert.alert('Hata', 'Lütfen ekipman adı ve türünü girin');
      return;
    }

    if (!formData.department_id) {
      Alert.alert('Hata', 'Lütfen bir departman seçin');
      return;
    }

    try {
      setLoading(true);
      console.log('Gönderilen ekipman verisi:', formData);
      const response = await equipmentService.createEquipment(formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman başarıyla oluşturuldu');
        setShowEquipmentModal(false);
        resetForm();
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman oluşturma hatası:', error);
      Alert.alert('Hata', 'Ekipman oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipment = async () => {
    if (!formData.name || !formData.equipment_type) {
      Alert.alert('Hata', 'Lütfen ekipman adı ve türünü girin');
      return;
    }

    if (!formData.department_id) {
      Alert.alert('Hata', 'Lütfen bir departman seçin');
      return;
    }

    try {
      setLoading(true);
      const response = await equipmentService.updateEquipment(selectedEquipment.id, formData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman başarıyla güncellendi');
        setShowEquipmentModal(false);
        resetForm();
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman güncelleme hatası:', error);
      Alert.alert('Hata', 'Ekipman güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      setLoading(true);
      const response = await equipmentService.deleteEquipment(selectedEquipment.id);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman başarıyla silindi');
        setShowDeleteModal(false);
        setSelectedEquipment(null);
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman silme hatası:', error);
      Alert.alert('Hata', 'Ekipman silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const editEquipment = (item) => {
    setSelectedEquipment(item);
    setFormData({
      name: item.name,
      equipment_type: item.equipment_type || 'computer',
      serial_number: item.serial_number || '',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      purchase_date: item.purchase_date || '',
      status: item.status || 'active',
      notes: item.notes || '',
      department_id: item.department_id || '',
      assigned_to: item.assigned_to || '',
    });
    setIsEditing(true);
    setShowEquipmentModal(true);
  };

  const confirmDeleteEquipment = (item) => {
    setSelectedEquipment(item);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      equipment_type: 'computer',
      serial_number: '',
      manufacturer: '',
      model: '',
      purchase_date: '',
      status: 'active',
      notes: '',
      department_id: '',
      assigned_to: '',
    });
    setIsEditing(false);
    setSelectedEquipment(null);
  };

  const getTypeLabel = (typeValue) => {
    const type = equipmentTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  const getStatusLabel = (statusValue) => {
    const status = equipmentStatuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.textLight;
      case 'maintenance': return colors.warning;
      case 'disposed': return colors.error;
      default: return colors.text;
    }
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : '';
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDate(selectedDate);
      setFormData({...formData, purchase_date: formattedDate});
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleUpdateEquipmentStatus = async (newStatus) => {
    if (!selectedEquipment) return;

    try {
      setLoading(true);
      const response = await equipmentService.updateEquipmentStatus(selectedEquipment.id, newStatus);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman durumu başarıyla güncellendi');
        setShowStatusModal(false);
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman durumu güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman durumu güncelleme hatası:', error);
      Alert.alert('Hata', 'Ekipman durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipmentDepartment = async (newDepartmentId) => {
    if (!selectedEquipment) return;

    try {
      setLoading(true);
      const response = await equipmentService.updateEquipmentDepartment(selectedEquipment.id, newDepartmentId);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman departmanı başarıyla güncellendi');
        setShowDepartmentModal(false);
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman departmanı güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman departmanı güncelleme hatası:', error);
      Alert.alert('Hata', 'Ekipman departmanı güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEquipment = async (userId) => {
    if (!selectedEquipment) return;

    try {
      setLoading(true);
      const response = await equipmentService.assignEquipment(selectedEquipment.id, userId);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman başarıyla atandı');
        setShowAssignModal(false);
        fetchEquipment();
      } else {
        Alert.alert('Hata', response.message || 'Ekipman atanırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman atama hatası:', error);
      Alert.alert('Hata', 'Ekipman atanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Atanmamış';
  };

  const renderEquipmentItem = ({ item }) => (
    <Card style={styles.equipmentCard}>
      <View style={styles.equipmentInfo}>
        <View style={styles.equipmentHeader}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.equipmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="hardware-chip" size={16} color={colors.textLight} />
            <Text style={styles.equipmentType}>{getTypeLabel(item.equipment_type)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="business" size={16} color={colors.textLight} />
            <Text style={styles.equipmentDepartment}>{getDepartmentName(item.department_id)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color={colors.textLight} />
            <Text style={styles.equipmentUser}>{getUserName(item.assigned_to)}</Text>
          </View>
          
          {item.serial_number && (
            <View style={styles.detailRow}>
              <Ionicons name="barcode" size={16} color={colors.textLight} />
              <Text style={styles.equipmentSerial}>{item.serial_number}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.equipmentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedEquipment(item);
            setShowStatusModal(true);
          }}
        >
          <Ionicons name="toggle" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Durum</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedEquipment(item);
            setShowDepartmentModal(true);
          }}
        >
          <Ionicons name="business" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Departman</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedEquipment(item);
            setShowAssignModal(true);
          }}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Kullanıcı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => editEquipment(item)}
        >
          <Ionicons name="create" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Düzenle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDeleteEquipment(item)}
        >
          <Ionicons name="trash" size={20} color={colors.error} />
          <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading && equipment.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && equipment.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ekipman Yönetimi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowEquipmentModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={colors.white} />
          <Text style={styles.addButtonText}>Ekipman Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        renderItem={renderEquipmentItem}
      />

      {/* Ekipman Ekleme/Düzenleme Modal */}
      <Modal
        visible={showEquipmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowEquipmentModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{isEditing ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ekipman Adı*</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Ekipman adını girin"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ekipman Türü*</Text>
                <View style={styles.radioGroup}>
                  {equipmentTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.radioButton,
                        formData.equipment_type === type.value && styles.radioButtonSelected
                      ]}
                      onPress={() => setFormData({...formData, equipment_type: type.value})}
                    >
                      <Text style={[
                        styles.radioText,
                        formData.equipment_type === type.value && styles.radioTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Departman*</Text>
                <View style={styles.radioGroup}>
                  {departments.map((department) => (
                    <TouchableOpacity
                      key={department.id}
                      style={[
                        styles.departmentButton,
                        formData.department_id === department.id && styles.departmentButtonSelected
                      ]}
                      onPress={() => setFormData({...formData, department_id: department.id})}
                    >
                      <Text style={[
                        styles.departmentButtonText,
                        formData.department_id === department.id && styles.departmentButtonTextSelected
                      ]}>
                        {department.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Seri Numarası</Text>
                <TextInput
                  style={styles.input}
                  value={formData.serial_number}
                  onChangeText={(text) => setFormData({...formData, serial_number: text})}
                  placeholder="Seri numarasını girin"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
                  <Text style={styles.label}>Üretici</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.manufacturer}
                    onChangeText={(text) => setFormData({...formData, manufacturer: text})}
                    placeholder="Üretici"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
                  <Text style={styles.label}>Model</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.model}
                    onChangeText={(text) => setFormData({...formData, model: text})}
                    placeholder="Model"
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Alım Tarihi</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePickerModal}
                >
                  <Text style={styles.datePickerButtonText}>
                    {formData.purchase_date || 'Tarih seçin'}
                  </Text>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={formData.purchase_date ? new Date(formData.purchase_date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Durum</Text>
                <View style={styles.statusRadioGroup}>
                  {equipmentStatuses.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.statusRadioButton,
                        formData.status === status.value && {
                          backgroundColor: getStatusColor(status.value) + '20',
                          borderColor: getStatusColor(status.value),
                        }
                      ]}
                      onPress={() => setFormData({...formData, status: status.value})}
                    >
                      <Text style={[
                        styles.statusRadioText,
                        formData.status === status.value && { color: getStatusColor(status.value) }
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notlar</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({...formData, notes: text})}
                  placeholder="Ekipman hakkında notlar"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEquipmentModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.modalButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={isEditing ? handleUpdateEquipment : handleCreateEquipment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.modalButtonText}>{isEditing ? 'Güncelle' : 'Kaydet'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
          setSelectedEquipment(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 20 }]}>
            <Text style={styles.modalTitle}>Ekipman Silme</Text>
            
            <Text style={styles.confirmText}>
              {selectedEquipment ? `"${selectedEquipment.name}" ekipmanını silmek istediğinizden emin misiniz?` : 'Bu ekipmanı silmek istediğinizden emin misiniz?'}
            </Text>
            
            <Text style={styles.warningText}>
              Bu işlem, bu ekipmana bağlı tüm destek talepleri ilişkilerini etkileyebilir!
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedEquipment(null);
                }}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteEquipment}
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

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ekipman Durumunu Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedEquipment ? selectedEquipment.name : ''}
            </Text>
            
            <View style={styles.statusOptions}>
              {equipmentStatuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.statusOption,
                    formData.status === status.value && {
                      backgroundColor: getStatusColor(status.value) + '20',
                      borderColor: getStatusColor(status.value),
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, status: status.value })}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status.value && { color: getStatusColor(status.value) }
                  ]}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
                onPress={() => handleUpdateEquipmentStatus(formData.status)}
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
            <Text style={styles.modalTitle}>Ekipman Departmanını Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedEquipment ? selectedEquipment.name : ''}
            </Text>
            
            <View style={styles.departmentOptions}>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.departmentOption,
                    formData.department_id === dept.id && styles.departmentOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, department_id: dept.id })}
                >
                  <Text style={[
                    styles.departmentOptionText,
                    formData.department_id === dept.id && styles.departmentOptionTextSelected
                  ]}>
                    {dept.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
                onPress={() => handleUpdateEquipmentDepartment(formData.department_id)}
              >
                <Text style={styles.buttonText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Equipment Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ekipman Kullanıcıya Ata</Text>
            <Text style={styles.modalSubtitle}>
              {selectedEquipment ? selectedEquipment.name : ''}
            </Text>
            
            <View style={styles.userOptions}>
              <TouchableOpacity
                style={[
                  styles.userOption,
                  formData.assigned_to === '' && styles.userOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, assigned_to: '' })}
              >
                <Text style={[
                  styles.userOptionText,
                  formData.assigned_to === '' && styles.userOptionTextSelected
                ]}>
                  Atanmamış
                </Text>
              </TouchableOpacity>
              
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userOption,
                    formData.assigned_to === user.id && styles.userOptionSelected
                  ]}
                  onPress={() => setFormData({ ...formData, assigned_to: user.id })}
                >
                  <Text style={[
                    styles.userOptionText,
                    formData.assigned_to === user.id && styles.userOptionTextSelected
                  ]}>
                    {user.first_name} {user.last_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleAssignEquipment(formData.assigned_to)}
              >
                <Text style={styles.buttonText}>Ata</Text>
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
  equipmentCard: {
    marginBottom: 10,
    padding: 15,
  },
  equipmentInfo: {
    marginBottom: 15,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  equipmentDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentType: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  equipmentDepartment: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  equipmentUser: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  equipmentSerial: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  equipmentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: colors.background,
    marginBottom: 5,
    minWidth: '18%',
    justifyContent: 'center',
  },
  actionText: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.error + '10',
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
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    backgroundColor: colors.white,
  },
  datePickerButtonText: {
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioText: {
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.white,
  },
  statusRadioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  statusRadioButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  statusRadioText: {
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
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  departmentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  departmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  departmentButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  departmentButtonText: {
    color: colors.text,
  },
  departmentButtonTextSelected: {
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '500',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statusOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    marginBottom: 10,
    minWidth: '45%',
  },
  statusOptionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  departmentOptions: {
    marginTop: 10,
  },
  departmentOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  departmentOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  departmentOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  departmentOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  userOptions: {
    marginTop: 10,
    maxHeight: 300,
  },
  userOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  userOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  userOptionTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
});

export default EquipmentManagementScreen; 