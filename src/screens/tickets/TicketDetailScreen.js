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
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ticketService, equipmentService } from '../../services/api';
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
  
  // Ekipman yönetimi için state'ler
  const [ticketEquipments, setTicketEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  const [aiResponses, setAiResponses] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
    fetchUsers();
    fetchAllEquipments();
    fetchTicketEquipments();
    fetchAIResponses();
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
      setLoading(true);
      const result = await ticketService.updateTicketStatus(ticketId, 'closed');
      
      if (result.success) {
        Alert.alert('Başarılı', 'Destek talebi kapatıldı');
        fetchTicketDetails(); // Detayları yenile
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Kapatma hatası:', error);
      Alert.alert('Hata', 'Destek talebi kapatılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      const result = await ticketService.updateTicketStatus(ticketId, newStatus);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Destek talebi durumu güncellendi');
        fetchTicketDetails(); // Detayları yenile
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      Alert.alert('Hata', 'Destek talebi durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
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

  // Ekipmanları getir
  const fetchAllEquipments = async () => {
    try {
      const response = await equipmentService.getAllEquipment();
      if (response.success) {
        setAllEquipments(response.data);
      }
    } catch (error) {
      console.error('Ekipman listesi alınamadı:', error);
    }
  };

  // Ticket'a ait ekipmanları getir
  const fetchTicketEquipments = async () => {
    try {
      // API'de ticket'a ait ekipmanlar endpoint'i eklenecek
      // Şimdilik boş array döndürüyoruz
      setTicketEquipments([]);
    } catch (error) {
      console.error('Ticket ekipmanları alınamadı:', error);
    }
  };

  // Ekipman bağlantısını kaldır
  const handleDetachEquipment = async (equipmentId) => {
    try {
      setLoadingEquipment(true);
      const result = await ticketService.detachEquipment(ticketId, equipmentId);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Ekipman bağlantısı kaldırıldı');
        fetchTicketEquipments(); // Ekipman listesini yenile
      } else {
        Alert.alert('Hata', result.message || 'Ekipman bağlantısı kaldırılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Ekipman bağlantısı kaldırma hatası:', error);
      Alert.alert('Hata', 'Ekipman bağlantısı kaldırılırken bir hata oluştu');
    } finally {
      setLoadingEquipment(false);
    }
  };

  const fetchAIResponses = async () => {
    try {
      setLoadingAI(true);
      const response = await ticketService.getTicketAIResponses(ticketId);
      if (response.success) {
        setAiResponses(response.data);
      }
    } catch (error) {
      console.error('AI yanıtları alınamadı:', error);
    } finally {
      setLoadingAI(false);
    }
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
              Oluşturan: {createdBy?.data ? `${createdBy.data.first_name} ${createdBy.data.last_name}` : 'Belirtilmemiş'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={20} color={colors.textLight} />
            <Text style={styles.detailText}>
              Atanan: {assignedTo?.data ? `${assignedTo.data.first_name} ${assignedTo.data.last_name}` : 'Atanmamış'}
            </Text>
          </View>
        </View>
      </Card>

      {/* AI Responses Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>AI Analizleri ve Önerileri</Text>
        </View>
        
        {loadingAI ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : aiResponses.length > 0 ? (
          aiResponses.map((response, index) => (
            <View key={index} style={styles.aiResponseContainer}>
              <View style={styles.aiResponseHeader}>
                <Ionicons name="analytics" size={20} color={colors.primary} />
                <Text style={styles.aiResponseTitle}>
                  {response.type === 'analysis' ? 'Analiz' : 'Öneri'}
                </Text>
                <Text style={styles.aiResponseDate}>
                  {new Date(response.created_at).toLocaleString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.aiResponseContent}>{response.content}</Text>
              {response.confidence && (
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Güven Oranı:</Text>
                  <Text style={styles.confidenceValue}>{response.confidence}%</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Henüz AI analizi bulunmuyor</Text>
        )}
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
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
              onPress={() => handleUpdateStatus('in_progress')}
            >
              <Ionicons name="time-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>İşleme Al</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => handleUpdateStatus('resolved')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Çözüldü</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleCloseTicket}
            >
              <Ionicons name="close-circle-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Kapat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => setShowEquipmentModal(true)}
            >
              <Ionicons name="hardware-chip-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Ekipman Yönet</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Ekipman Listesi */}
      {ticketEquipments.length > 0 && (
        <Card style={styles.equipmentCard}>
          <Text style={styles.sectionTitle}>İlişkili Ekipmanlar</Text>
          <FlatList
            data={ticketEquipments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.equipmentItem}>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{item.name}</Text>
                  <Text style={styles.equipmentType}>{item.type}</Text>
                </View>
                {user?.role === 'admin' && ticket?.status !== 'closed' && (
                  <TouchableOpacity
                    style={styles.detachButton}
                    onPress={() => handleDetachEquipment(item.id)}
                    disabled={loadingEquipment}
                  >
                    {loadingEquipment ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </Card>
      )}

      {/* Ekipman Modal */}
      <Modal
        visible={showEquipmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ekipman Yönetimi</Text>
            
            <Text style={styles.modalSubtitle}>Bağlı Ekipmanlar</Text>
            {ticketEquipments.length === 0 ? (
              <Text style={styles.emptyMessage}>Bu destek talebine bağlı ekipman bulunmamaktadır.</Text>
            ) : (
              <FlatList
                data={ticketEquipments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.equipmentItem}>
                    <Text style={styles.equipmentName}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.detachButton}
                      onPress={() => handleDetachEquipment(item.id)}
                      disabled={loadingEquipment}
                    >
                      {loadingEquipment ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Text style={styles.detachText}>Bağlantıyı Kaldır</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.equipmentList}
              />
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEquipmentModal(false)}
              >
                <Text style={styles.modalButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    minWidth: '45%',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
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
    fontWeight: '500',
    color: colors.text,
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
    marginTop: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
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
  equipmentCard: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  equipmentType: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  detachButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  detachText: {
    color: colors.error,
    fontWeight: '500',
  },
  equipmentList: {
    maxHeight: 200,
  },
  emptyMessage: {
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: colors.text,
  },
  sectionCard: {
    margin: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiResponseContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResponseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  aiResponseDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  aiResponseContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  confidenceValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  noDataText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
    padding: 16,
  },
});