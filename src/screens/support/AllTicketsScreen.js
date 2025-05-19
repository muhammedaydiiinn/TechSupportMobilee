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
import { ticketService } from '../../services/api';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AllTicketsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets();
      if (response.success) {
        setTickets(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Destek talepleri yüklenirken bir hata oluştu.');
      console.error('Error fetching all tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await ticketService.updateTicketStatus(ticketId, newStatus);
      if (response.success) {
        Alert.alert('Başarılı', 'Destek talebi durumu güncellendi.');
        fetchAllTickets();
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (err) {
      Alert.alert('Hata', 'Destek talebi durumu güncellenirken bir hata oluştu.');
      console.error('Error updating ticket status:', err);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      const response = await ticketService.assignTicket(ticketId, user.id);
      if (response.success) {
        Alert.alert('Başarılı', 'Destek talebi size atandı.');
        fetchAllTickets();
      } else {
        Alert.alert('Hata', response.message);
      }
    } catch (err) {
      Alert.alert('Hata', 'Destek talebi atanırken bir hata oluştu.');
      console.error('Error assigning ticket:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return COLORS.success;
      case 'in_progress':
        return COLORS.warning;
      case 'resolved':
        return COLORS.info;
      case 'closed':
        return COLORS.error;
      default:
        return COLORS.text;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open':
        return 'Açık';
      case 'in_progress':
        return 'İşlemde';
      case 'resolved':
        return 'Çözüldü';
      case 'closed':
        return 'Kapalı';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.text;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return priority;
    }
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfo}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {getPriorityLabel(item.priority)}
            </Text>
          </View>
          <Text style={styles.ticketDate}>
            {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {item.status === 'open' && !item.assigned_to && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAssignTicket(item.id)}
            >
              <Ionicons name="person-add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {item.status === 'open' && item.assigned_to === user.id && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateTicketStatus(item.id, 'in_progress')}
            >
              <Ionicons name="play-circle" size={24} color={COLORS.warning} />
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && item.assigned_to === user.id && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateTicketStatus(item.id, 'resolved')}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </TouchableOpacity>
          )}
          {item.status === 'resolved' && item.assigned_to === user.id && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpdateTicketStatus(item.id, 'closed')}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllTickets}>
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
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Destek talebi bulunamadı.</Text>
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
  ticketItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
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
    marginRight: 8,
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
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDate: {
    fontSize: 12,
    color: COLORS.textLight,
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

export default AllTicketsScreen; 