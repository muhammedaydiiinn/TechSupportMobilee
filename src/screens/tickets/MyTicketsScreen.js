import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ticketService } from '../../services/api';

const MyTicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This is a placeholder - your actual API call would go here
      const dummyTickets = [
        { 
          id: '1', 
          title: 'Internet bağlantı sorunu',
          description: 'İnternetim sık sık kesiliyor. 3 gündür devam ediyor.',
          status: 'open',
          priority: 'high',
          created_at: '2023-09-15T10:30:00',
          category: 'technical'
        },
        { 
          id: '2', 
          title: 'Fatura itirazı',
          description: 'Son faturamda fazla ödeme olduğunu düşünüyorum.',
          status: 'closed',
          priority: 'normal',
          created_at: '2023-09-10T14:45:00',
          category: 'billing'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setTickets(dummyTickets);
        setLoading(false);
      }, 1000);
      
      // In a real app, you would use:
      // const response = await ticketService.getTickets();
      // setTickets(response);
      
    } catch (error) {
      console.log('Error fetching tickets:', error);
      setError('Biletler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity 
      style={styles.ticketItem}
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={styles.ticketTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'open' ? '#E3F2FD' : '#E8F5E9' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'open' ? '#1976D2' : '#388E3C' }
            ]}>
              {item.status === 'open' ? 'Açık' : 'Çözümlendi'}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.ticketFooter}>
        <Text style={styles.ticketDate}>
          {new Date(item.created_at).toLocaleDateString('tr-TR')}
        </Text>
        
        <View style={styles.priorityAndCategory}>
          <Text style={[
            styles.priorityText,
            { color: getPriorityColor(item.priority) }
          ]}>
            {getPriorityText(item.priority)}
          </Text>
          <Text style={styles.categoryText}>
            {getCategoryText(item.category)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#43A047';
      case 'normal': return '#1E88E5';
      case 'high': return '#FB8C00';
      case 'urgent': return '#E53935';
      default: return '#1E88E5';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low': return 'Düşük';
      case 'normal': return 'Normal';
      case 'high': return 'Yüksek';
      case 'urgent': return 'Acil';
      default: return 'Normal';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'technical': return 'Teknik';
      case 'billing': return 'Fatura';
      case 'account': return 'Hesap';
      case 'other': return 'Diğer';
      default: return 'Diğer';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Biletler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchTickets}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#BDBDBD" />
          <Text style={styles.emptyText}>Henüz hiç destek bileti oluşturmadınız.</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateTicket')}
          >
            <Text style={styles.createButtonText}>Bilet Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  ticketItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  ticketHeader: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  priorityAndCategory: {
    flexDirection: 'row',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
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
    marginVertical: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default MyTicketsScreen;