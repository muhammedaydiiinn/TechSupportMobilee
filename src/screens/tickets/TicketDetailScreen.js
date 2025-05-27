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
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ticketService, equipmentService } from '../../services/api';
import { userService } from '../../services/api';
import { Card } from '../../components/Card';
import { colors } from '../../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatRelativeDate } from '../../utils/dateUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import LinearGradient from 'react-native-linear-gradient';
import theme, { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const STATUS_MAP = {
  OPEN: {
    value: 'OPEN',
    label: 'Açık',
    icon: 'open-outline',
    color: colors.info
  },
  IN_PROGRESS: {
    value: 'IN_PROGRESS',
    label: 'İşlemde',
    icon: 'time-outline',
    color: colors.warning
  },
  WAITING: {
    value: 'WAITING',
    label: 'Beklemede',
    icon: 'hourglass-outline',
    color: colors.secondary
  },
  RESOLVED: {
    value: 'RESOLVED',
    label: 'Çözüldü',
    icon: 'checkmark-circle-outline',
    color: colors.success
  },
  CLOSED: {
    value: 'CLOSED',
    label: 'Kapalı',
    icon: 'close-circle-outline',
    color: colors.error
  }
};

const PRIORITY_MAP = {
  LOW: {
    value: 'low',
    label: 'Düşük',
    icon: 'arrow-down-circle-outline',
    color: colors.info
  },
  MEDIUM: {
    value: 'medium',
    label: 'Orta',
    icon: 'remove-circle-outline',
    color: colors.warning
  },
  HIGH: {
    value: 'high',
    label: 'Yüksek',
    icon: 'arrow-up-circle-outline',
    color: colors.error
  },
  CRITICAL: {
    value: 'critical',
    label: 'Kritik',
    icon: 'alert-circle-outline',
    color: colors.error
  }
};

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

  const [timeline, setTimeline] = useState([]);
  const [responseContent, setResponseContent] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  // Add state for ticket images
  const [ticketImages, setTicketImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
    fetchUsers();
    fetchAllEquipments();
    fetchTicketEquipments();
    fetchAIResponses();
    fetchTicketImages();
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

      // Fetch timeline
      const timelineData = await ticketService.getTicketTimeline(ticketId);
      setTimeline(timelineData);

      // Fetch attachments
      if (ticketData.attachments) {
        setAttachments(ticketData.attachments);
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
      const result = await ticketService.updateTicketStatus(ticketId, 'CLOSED');
      
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

  const getStatusOptions = () => {
    const baseOptions = Object.values(STATUS_MAP);

    // Admin için tüm seçenekler
    if (user?.role === 'admin' || user?.role === 'ADMIN') {
      return baseOptions;
    }

    // Support için sınırlı seçenekler
    if (user?.role === 'support' || user?.role === 'SUPPORT') {
      return baseOptions.filter(option => 
        option.value !== STATUS_MAP.CLOSED.value || 
        (option.value === STATUS_MAP.CLOSED.value && ticket?.status === STATUS_MAP.RESOLVED.value)
      );
    }

    // Normal kullanıcılar için sadece çözüldü durumunu kapatabilir
    if (user?.role === 'user' || user?.role === 'USER') {
      return baseOptions.filter(option => 
        option.value === STATUS_MAP.CLOSED.value && ticket?.status === STATUS_MAP.RESOLVED.value
      );
    }

    return [];
  };

  const getStatusText = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.label || status;
  };

  const getStatusColor = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.color || colors.text;
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      
      // Status değerini büyük harfe çevirip göndermemiz gerekiyor
      // API 'OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED' veya 'CLOSED' bekliyor
      const statusConfig = STATUS_MAP[newStatus.toUpperCase()];
      const statusValue = statusConfig.value; // Artık değerler büyük harfle
      
      console.log('Gönderilen durum:', statusValue);
      
      const result = await ticketService.updateTicketStatus(ticketId, statusValue);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Destek talebi durumu güncellendi');
        setShowStatusModal(false);
        setStatusNote('');
        await fetchTicketDetails(); // Detayları yenile
      } else {
        Alert.alert('Hata', result.message || 'Durum güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      Alert.alert('Hata', 'Destek talebi durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityText = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.label || priority;
  };

  const getPriorityColor = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.color || colors.text;
  };

  const getPriorityIcon = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.icon || 'help-circle-outline';
  };

  const handleUpdatePriority = async (newPriority) => {
    try {
      setLoading(true);
      
      const priorityConfig = PRIORITY_MAP[newPriority.toUpperCase()];
      const confirm = await new Promise((resolve) => {
        Alert.alert(
          'Öncelik Değişikliği',
          `Destek talebinin önceliğini "${priorityConfig.label}" olarak değiştirmek istediğinize emin misiniz?`,
          [
            { text: 'İptal', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Evet', onPress: () => resolve(true) }
          ]
        );
      });

      if (!confirm) {
        setLoading(false);
        return;
      }

      const result = await ticketService.updateTicketPriority(ticketId, priorityConfig.value);
      
      if (result.success) {
        Alert.alert('Başarılı', 'Destek talebi önceliği güncellendi');
        await fetchTicketDetails();
      } else {
        Alert.alert('Hata', result.message || 'Öncelik güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Öncelik güncelleme hatası:', error);
      Alert.alert('Hata', 'Destek talebi önceliği güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
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

  const handleRespond = async () => {
    if (!responseContent.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir yanıt içeriği girin.');
      return;
    }

    try {
      setSendingResponse(true);
      const result = await ticketService.respondToTicket(ticketId, responseContent.trim());
      
      if (result.success) {
        setResponseContent('');
        await fetchTicketDetails(); // Refresh ticket details
        Alert.alert('Başarılı', 'Yanıtınız başarıyla gönderildi.');
      } else {
        Alert.alert('Hata', result.message || 'Yanıt gönderilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Yanıt gönderme hatası:', error);
      Alert.alert('Hata', 'Yanıt gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      setUploadingAttachment(true);
      const file = {
        uri: Platform.OS === 'ios' ? result[0].uri.replace('file://', '') : result[0].uri,
        type: result[0].type,
        name: result[0].name,
      };

      await ticketService.addAttachment(ticketId, file);
      await fetchTicketDetails(); // Refresh ticket details
      Alert.alert('Başarılı', 'Dosya başarıyla yüklendi.');
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu.');
      }
    } finally {
      setUploadingAttachment(false);
    }
  };

  const renderTimelineItem = (item, index) => {
    const getIconName = (actionType) => {
      if (!actionType) return 'info';
      
      switch (actionType.toLowerCase()) {
        case 'ticket_created':
          return 'add-circle';
        case 'status_changed':
          return 'swap-horiz';
        case 'assigned':
          return 'person-add';
        case 'response_added':
          return 'chat-bubble';
        case 'equipment_attached':
          return 'build';
        case 'equipment_detached':
          return 'build';
        case 'support_level_changed':
          return 'trending-up';
        default:
          return 'info';
      }
    };

    const getIconColor = (actionType) => {
      if (!actionType) return '#757575';
      
      switch (actionType.toLowerCase()) {
        case 'ticket_created':
          return '#4CAF50';
        case 'status_changed':
          return '#2196F3';
        case 'assigned':
          return '#9C27B0';
        case 'response_added':
          return '#FF9800';
        case 'equipment_attached':
          return '#795548';
        case 'equipment_detached':
          return '#795548';
        case 'support_level_changed':
          return '#E91E63';
        default:
          return '#757575';
      }
    };

    // Eğer item geçersizse boş bir view döndür
    if (!item) return null;

    return (
      <View key={item.id || index} style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineIcon, { backgroundColor: getIconColor(item.action_type) }]}>
            <MaterialIcons name={getIconName(item.action_type)} size={20} color="#fff" />
          </View>
          {index !== timeline.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineUser}>{item.user_name || 'Bilinmeyen Kullanıcı'}</Text>
            <Text style={styles.timelineDate}>{formatRelativeDate(item.created_at)}</Text>
          </View>
          <View style={styles.timelineActionContainer}>
            <Text style={[styles.timelineAction, { color: getIconColor(item.action_type) }]}>
              {item.action_type ? item.action_type.replace(/_/g, ' ').toUpperCase() : 'BİLİNMEYEN İŞLEM'}
            </Text>
          </View>
          <Text style={styles.timelineDescription}>{item.description || 'Açıklama bulunmuyor'}</Text>
          {item.support_level && (
            <View style={styles.timelineMetaContainer}>
              <MaterialIcons name="trending-up" size={16} color="#666" />
              <Text style={styles.timelineMetaText}>
                Destek Seviyesi: {item.support_level}
              </Text>
            </View>
          )}
          {item.status && (
            <View style={styles.timelineMetaContainer}>
              <MaterialIcons name="info" size={16} color="#666" />
              <Text style={styles.timelineMetaText}>
                Durum: {item.status}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Arayüzde durumun görünümünü render eden fonksiyon
  const renderStatusSection = () => {
    if (!ticket) return null;
    
    const isAdminOrSupport = user?.role === 'admin' || user?.role === 'ADMIN' || 
                             user?.role === 'support' || user?.role === 'SUPPORT';
    
    return (
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Durum</Text>
          {isAdminOrSupport && (
            <TouchableOpacity 
              onPress={() => setShowStatusModal(true)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(ticket.status) }
            ]}
          >
            <Ionicons 
              name={STATUS_MAP[ticket.status?.toUpperCase()]?.icon || 'help-circle-outline'} 
              size={16} 
              color={colors.white} 
            />
            <Text style={styles.statusText}>
              {getStatusText(ticket.status)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  // Durum düzenleme modalı
  const renderStatusModal = () => {
    return (
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Durum Güncelle</Text>
              <TouchableOpacity 
                onPress={() => setShowStatusModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Yeni durumu seçin</Text>
              
              <View style={styles.statusOptions}>
                {getStatusOptions().map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusOption,
                      { borderColor: status.color }
                    ]}
                    onPress={() => handleUpdateStatus(status.value)}
                  >
                    <LinearGradient
                      colors={[status.color, status.color]}
                      style={styles.statusIconContainer}
                    >
                      <Ionicons 
                        name={status.icon} 
                        size={24} 
                        color={COLORS.white} 
                      />
                    </LinearGradient>
                    <Text style={styles.statusOptionText}>{status.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={styles.noteInput}
                placeholder="Not ekleyin (isteğe bağlı)"
                value={statusNote}
                onChangeText={setStatusNote}
                multiline
                maxLength={200}
              />
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Add function to fetch ticket images
  const fetchTicketImages = async () => {
    try {
      setLoadingImages(true);
      console.log('Fetching images for ticket:', ticketId);
      const response = await ticketService.getTicketImages(ticketId);
      console.log('Images response:', response);
      
      if (response && response.success && response.data) {
        setTicketImages(response.data);
      } else {
        console.warn('No images found or error in response:', response?.message);
        setTicketImages([]);
      }
    } catch (error) {
      console.error('Ticket resimleri alınamadı:', error);
      Alert.alert('Hata', 'Resimler yüklenirken bir sorun oluştu');
      setTicketImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // Function to handle image preview
  const handleImagePreview = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
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
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <Text style={styles.title}>{ticket?.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket?.status) }]}>
              <Text style={styles.statusText}>{getStatusText(ticket?.status)}</Text>
            </View>
          </View>

          <View style={styles.priorityContainer}>
            <View style={styles.priorityInfo}>
              <Ionicons 
                name={getPriorityIcon(ticket?.priority)} 
                size={20} 
                color={getPriorityColor(ticket?.priority)} 
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(ticket?.priority) }]}>
                Öncelik: {getPriorityText(ticket?.priority)}
              </Text>
            </View>
            
            {user?.role === 'admin' && ticket?.status !== STATUS_MAP.CLOSED.value && (
              <TouchableOpacity
                style={styles.priorityButton}
                onPress={() => {
                  Alert.alert(
                    'Öncelik Değiştir',
                    'Yeni öncelik seviyesi seçin',
                    Object.values(PRIORITY_MAP).map(priority => ({
                      text: priority.label,
                      onPress: () => handleUpdatePriority(priority.value)
                    }))
                  );
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
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

        {/* Ticket Images Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Resimler</Text>
          </View>
          
          {loadingImages ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : ticketImages.length > 0 ? (
            <View style={styles.imagesContainer}>
              <FlatList
                data={ticketImages}
                keyExtractor={(item, index) => `image-${index}-${item.id || item.file_name}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity 
                    style={styles.imageItem}
                    onPress={() => handleImagePreview(item)}
                  >
                    <Image 
                      source={{ uri: item.file_url }} 
                      style={styles.imageThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.imageInfo}>
                      <Text style={styles.imageName} numberOfLines={1}>
                        {item.file_name || `Resim ${index + 1}`}
                      </Text>
                      <Text style={styles.imageDate}>
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <Text style={styles.noDataText}>Herhangi bir resim eklenmemiş.</Text>
          )}
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
          {user?.role === 'admin' && ticket?.status !== STATUS_MAP.CLOSED.value && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAssignModal(true)}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Atama Yap</Text>
            </TouchableOpacity>
          )}

          {/* Durum değiştirme butonları */}
          {getStatusOptions().map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.actionButton,
                { backgroundColor: option.color },
                ticket?.status === option.value && styles.disabledButton
              ]}
              onPress={() => handleUpdateStatus(option.value)}
              disabled={ticket?.status === option.value || loading}
            >
              <Ionicons name={option.icon} size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}

          {user?.role === 'admin' && ticket?.status !== STATUS_MAP.CLOSED.value && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => setShowEquipmentModal(true)}
            >
              <Ionicons name="hardware-chip-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Ekipman Yönet</Text>
            </TouchableOpacity>
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
                  {user?.role === 'admin' && ticket?.status !== STATUS_MAP.CLOSED.value && (
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

        <View style={styles.responseContainer}>
          <TextInput
            style={styles.responseInput}
            multiline
            placeholder="Yanıtınızı yazın..."
            value={responseContent}
            onChangeText={setResponseContent}
          />
          <View style={styles.responseActions}>
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleAttachment}
              disabled={uploadingAttachment}
            >
              <MaterialIcons name="attach-file" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleRespond}
              disabled={sendingResponse}
            >
              <Text style={styles.sendButtonText}>
                {sendingResponse ? 'Gönderiliyor...' : 'Gönder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsTitle}>Ekler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={styles.attachmentItem}
                  onPress={() => {/* Handle attachment preview */}}
                >
                  <MaterialIcons name="insert-drive-file" size={24} color="#007AFF" />
                  <Text style={styles.attachmentName}>{attachment.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Aktivite Geçmişi</Text>
          {timeline.map(renderTimelineItem)}
        </View>
      </ScrollView>
      
      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage.file_url }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      
      {/* Durum değiştirme modalı */}
      {renderStatusModal()}
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  priorityButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
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
  responseContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  responseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  attachmentButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attachmentsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  attachmentName: {
    marginLeft: 8,
    color: '#007AFF',
  },
  timelineContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
  },
  timelineActionContainer: {
    marginBottom: 8,
  },
  timelineAction: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  timelineMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timelineMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusOption: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statusOptionText: {
    fontWeight: '500',
    fontSize: 14,
    color: colors.text,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 5,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.primary,
    marginLeft: 5,
    fontWeight: '500',
  },
  imagesContainer: {
    marginVertical: 10,
  },
  imageItem: {
    width: 160,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageThumb: {
    width: '100%',
    height: 120,
  },
  imageInfo: {
    padding: 8,
  },
  imageName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  imageDate: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
});