import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ticketService } from '../../services/api';
import { COLORS } from '../../constants/colors';
import { colors } from '../../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Durum sabitleri
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

const MyTicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchTickets = async () => {
    try {
      setError(null);
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Destek talebi listesi alınamadı:', error);
      setError('Destek talepleri alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={14} 
            color={COLORS.white} 
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.ticketFooter}>
        <Text style={styles.dateText}>
          {formatDate(item.created_at)}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Ionicons 
            name={getPriorityIcon(item.priority)} 
            size={14} 
            color={COLORS.white} 
            style={{ marginRight: 4 }}
          />
          <Text style={styles.priorityText}>{getPriorityText(item.priority)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Durum rengini alma
  const getStatusColor = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.color || COLORS.gray;
  };

  // Durum simgesini alma
  const getStatusIcon = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.icon || 'help-circle-outline';
  };

  // Durum metinlerini türkçeleştirme
  const getStatusText = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.label || status;
  };

  // Öncelik rengini alma
  const getPriorityColor = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.color || COLORS.gray;
  };

  // Öncelik simgesini alma
  const getPriorityIcon = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.icon || 'help-circle-outline';
  };

  // Öncelik metinlerini türkçeleştirme
  const getPriorityText = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.label || priority;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTickets}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz destek talebi bulunmuyor</Text>
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
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  ticketItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default MyTicketsScreen;