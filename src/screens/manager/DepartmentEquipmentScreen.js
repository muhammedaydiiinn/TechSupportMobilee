import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/api';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DepartmentEquipmentScreen = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentEquipment();
  }, []);

  const fetchDepartmentEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getDepartmentEquipment(user.department_id);
      if (response.success) {
        setEquipment(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Ekipmanlar yüklenirken bir hata oluştu.');
      console.error('Error fetching department equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipmentStatus = async (equipmentId, newStatus) => {
    try {
      const response = await equipmentService.updateEquipmentStatus(equipmentId, newStatus);
      if (response.success) {
        Alert.alert('Başarılı', 'Ekipman durumu güncellendi.');
        fetchDepartmentEquipment();
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (err) {
      Alert.alert('Hata', 'Ekipman durumu güncellenirken bir hata oluştu.');
      console.error('Error updating equipment status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'maintenance':
        return COLORS.warning;
      case 'broken':
        return COLORS.error;
      case 'inactive':
        return COLORS.textLight;
      default:
        return COLORS.text;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Bakımda';
      case 'broken':
        return 'Arızalı';
      case 'inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  const getUserName = (userId) => {
    if (!userId) return 'Atanmamış';
    const assignedUser = equipment.find(item => item.assigned_user_id === userId);
    return assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Atanmamış';
  };

  const renderEquipmentItem = ({ item }) => (
    <View style={styles.equipmentItem}>
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentName}>{item.name}</Text>
        <Text style={styles.equipmentType}>{item.type}</Text>
        <Text style={styles.equipmentSerial}>Seri No: {item.serial_number}</Text>
        <Text style={styles.equipmentAssigned}>
          Atanan: {getUserName(item.assigned_user_id)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateEquipmentStatus(item.id, 'maintenance')}
          >
            <Ionicons name="construct" size={24} color={COLORS.warning} />
          </TouchableOpacity>
        )}
        {item.status === 'maintenance' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateEquipmentStatus(item.id, 'active')}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </TouchableOpacity>
        )}
        {item.status === 'broken' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateEquipmentStatus(item.id, 'maintenance')}
          >
            <Ionicons name="construct" size={24} color={COLORS.warning} />
          </TouchableOpacity>
        )}
        {item.status === 'inactive' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUpdateEquipmentStatus(item.id, 'active')}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDepartmentEquipment}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={equipment}
        renderItem={renderEquipmentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Departman ekipmanı bulunamadı.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: {
    padding: 16,
  },
  equipmentItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  equipmentSerial: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  equipmentAssigned: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
});

export default DepartmentEquipmentScreen; 