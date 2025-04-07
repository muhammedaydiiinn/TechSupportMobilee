import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ticketService, authService } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getProfile();
      const ticketsData = await ticketService.getTickets();
      
      setUser(userData);
      setTickets(ticketsData.slice(0, 5)); // Son 5 bileti göster
    } catch (error) {
      console.log('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Destek Sistemi</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="add-circle" size={30} color="#2196F3" />
          </View>
          <Text style={styles.cardTitle}>Yeni Bilet</Text>
          <Text style={styles.cardSubtitle}>Destek talebi oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('TicketsStack')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="list" size={30} color="#4CAF50" />
          </View>
          <Text style={styles.cardTitle}>Biletlerim</Text>
          <Text style={styles.cardSubtitle}>Tüm destek taleplerim</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Nasıl Destek Alırım?</Text>
        <Text style={styles.infoText}>
          1. "Yeni Bilet" seçeneğine tıklayın{'\n'}
          2. Destek talebinizin detaylarını girin{'\n'}
          3. Gönder butonuna tıklayın{'\n'}
          4. Destek ekibimiz en kısa sürede size dönüş yapacaktır
        </Text>
      </View>

      {/* Son Biletler */}
      <View style={styles.recentTicketsContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Son Biletlerim</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TicketsStack')}>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bir destek bileti oluşturmadınız.</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateTicket')}
            >
              <Text style={styles.createButtonText}>Bilet Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketItem}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle} numberOfLines={1}>
                  {ticket.title}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: ticket.status === 'open' ? '#E3F2FD' : '#E8F5E9' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: ticket.status === 'open' ? '#1976D2' : '#388E3C' }
                  ]}>
                    {ticket.status === 'open' ? 'Açık' : 'Çözümlendi'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.ticketDescription} numberOfLines={2}>
                {ticket.description}
              </Text>
              
              <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>
                  {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                </Text>
                <View style={styles.priorityContainer}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(ticket.priority) }
                  ]}>
                    {getPriorityText(ticket.priority)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// Yardımcı fonksiyonlar
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    margin: 15,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 24,
  },
  recentTicketsContainer: {
    margin: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.textLight,
    padding: 20,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyText: {
    color: COLORS.textLight,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  ticketItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
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
  priorityContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DashboardScreen;