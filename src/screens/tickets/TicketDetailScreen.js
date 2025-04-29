import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ticketService } from '../../services/api';
import { userService } from '../../services/api';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';

export default function TicketDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { ticketId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [assignedTo, setAssignedTo] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignNote, setAssignNote] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTicketDetails();
    fetchUsers();
  }, [ticketId]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Kullanıcı listesi alınamadı:', error);
    }
  };

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Destek talebi detaylarını al
      const ticketData = await ticketService.getTicket(ticketId);
      setTicket(ticketData);

      // Oluşturan kullanıcı bilgilerini al
      if (ticketData.created_by_id) {
        const creator = await userService.getUserDetails(ticketData.created_by_id);
        setCreatedBy(creator);
      }

      // Atanan kullanıcı bilgilerini al
      if (ticketData.assigned_to_id) {
        const assigned = await userService.getUserDetails(ticketData.assigned_to_id);
        setAssignedTo(assigned);
      }
    } catch (error) {
      console.error('Destek talebi detay hatası:', error);
      setError('Destek talebi detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedUser) {
      Alert.alert('Hata', 'Lütfen bir kullanıcı seçin');
      return;
    }

    try {
      setLoading(true);
      const result = await ticketService.assignTicket(ticketId, selectedUser.id);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Destek talebi başarıyla atandı');
        setShowAssignModal(false);
        fetchTicketDetails(); // Detayları yenile
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Atama hatası:', error);
      Alert.alert('Hata', 'Atama işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const result = await ticketService.closeTicket(ticketId);
      if (result.success) {
        setTicket({
          ...ticket,
          status: 'closed'
        });
        Alert.alert('Başarılı', 'Destek talebi kapatıldı');
      }
    } catch (error) {
      console.error('Kapatma hatası:', error);
      Alert.alert('Hata', 'Destek talebi kapatılırken bir hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    return colors.status[status] || colors.text;
  };

  const getPriorityColor = (priority) => {
    return colors.priority[priority] || colors.text;
  };

  const getStatusText = (status) => {
    const statusMap = {
      open: 'Açık',
      in_progress: 'İşlemde',
      closed: 'Kapalı',
      resolved: 'Çözüldü'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      low: 'Düşük',
      medium: 'Orta',
      high: 'Yüksek',
      critical: 'Kritik'
    };
    return priorityMap[priority] || priority;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Destek talebi bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <Text style={styles.title}>{ticket?.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket?.status) }]}>
            <Text style={styles.statusText}>{getStatusText(ticket?.status)}</Text>
          </View>
        </View>

        <View style={styles.priorityContainer}>
          <Text style={[styles.priorityText, { color: getPriorityColor(ticket?.priority) }]}>
            Öncelik: {getPriorityText(ticket?.priority)}
          </Text>
        </View>

        <Text style={styles.description}>{ticket?.description}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              Oluşturulma: {new Date(ticket?.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              Son Güncelleme: {new Date(ticket?.updated_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              Oluşturan: {createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : 'Belirtilmemiş'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              Atanan: {assignedTo ? `${assignedTo.first_name} ${assignedTo.last_name}` : 'Atanmamış'}
            </Text>
          </View>
        </View>
      </Card>

      {/* İşlem butonları */}
      <View style={styles.actionsContainer}>
        {user?.role === 'admin' && ticket?.status !== 'closed' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAssignModal(true)}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Atama Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleCloseTicket}
            >
              <Ionicons name="close-circle-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Kapat</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Atama Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Destek Talebi Atama</Text>
            
            <View style={styles.userList}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userItem,
                    selectedUser?.id === user.id && styles.selectedUserItem
                  ]}
                  onPress={() => setSelectedUser(user)}
                >
                  <Text style={styles.userName}>
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>

          

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.assignButton]}
                onPress={handleAssignTicket}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>Ata</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerCard: {
    margin: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: colors.white,
    fontWeight: '500',
  },
  priorityContainer: {
    marginBottom: 10,
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  userList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedUserItem: {
    backgroundColor: colors.primary + '20',
  },
  userName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textLight,
  },
  assignButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});