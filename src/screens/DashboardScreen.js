import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ticketService, authService } from '../services/api';
import TokenService from '../services/TokenService';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_MAP = {
  OPEN: {
    value: 'open',
    label: 'Açık',
    icon: 'open-outline',
    color: colors.info
  },
  IN_PROGRESS: {
    value: 'in_progress',
    label: 'İşlemde',
    icon: 'time-outline',
    color: colors.warning
  },
  RESOLVED: {
    value: 'resolved',
    label: 'Çözüldü',
    icon: 'checkmark-circle-outline',
    color: colors.success
  },
  CLOSED: {
    value: 'closed',
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

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ticketsData = await ticketService.getTickets();
      setTickets(ticketsData);

      // İstatistikleri hesapla
      const stats = {
        total: ticketsData.length,
        open: ticketsData.filter(t => t.status === STATUS_MAP.OPEN.value).length,
        inProgress: ticketsData.filter(t => t.status === STATUS_MAP.IN_PROGRESS.value).length,
        resolved: ticketsData.filter(t => t.status === STATUS_MAP.RESOLVED.value).length,
        closed: ticketsData.filter(t => t.status === STATUS_MAP.CLOSED.value).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.label || status;
  };

  const getStatusColor = (status) => {
    return STATUS_MAP[status?.toUpperCase()]?.color || colors.text;
  };

  const getPriorityText = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.label || priority;
  };

  const getPriorityColor = (priority) => {
    return PRIORITY_MAP[priority?.toUpperCase()]?.color || colors.text;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hoş Geldiniz, {user?.first_name || 'Kullanıcı'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Toplam Destek Talebi</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: STATUS_MAP.OPEN.color, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: STATUS_MAP.OPEN.color }]}>{stats.open}</Text>
          <Text style={styles.statLabel}>{STATUS_MAP.OPEN.label}</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: STATUS_MAP.IN_PROGRESS.color, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: STATUS_MAP.IN_PROGRESS.color }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>{STATUS_MAP.IN_PROGRESS.label}</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: STATUS_MAP.RESOLVED.color, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: STATUS_MAP.RESOLVED.color }]}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>{STATUS_MAP.RESOLVED.label}</Text>
        </Card>

        <Card style={[styles.statCard, { borderLeftColor: STATUS_MAP.CLOSED.color, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: STATUS_MAP.CLOSED.color }]}>{stats.closed}</Text>
          <Text style={styles.statLabel}>{STATUS_MAP.CLOSED.label}</Text>
        </Card>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('CreateTicket')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="add-circle" size={30} color="#2196F3" />
          </View>
          <Text style={styles.cardTitle}>Yeni Destek Talebi</Text>
          <Text style={styles.cardSubtitle}>Destek talebi oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('MyTickets')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="list" size={30} color="#4CAF50" />
          </View>
          <Text style={styles.cardTitle}>Destek Taleplerim</Text>
          <Text style={styles.cardSubtitle}>Tüm destek taleplerim</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Nasıl Destek Alırım?</Text>
        <Text style={styles.infoText}>
          1. "Yeni Destek Talebi" seçeneğine tıklayın{'\n'}
          2. Destek talebinizin detaylarını girin{'\n'}
          3. Gönder butonuna tıklayın{'\n'}
          4. Destek ekibimiz en kısa sürede size dönüş yapacaktır
        </Text>
      </View>

      {/* Son Destek Talepler */}
      <View style={styles.recentTicketsContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Son Destek Taleplerim</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bir destek talebi oluşturmadınız.</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateTicket')}
            >
              <Text style={styles.createButtonText}>Destek Talebi Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tickets.slice(0, 5).map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
            >
              <Card style={styles.ticketCardContent}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>{ticket.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(ticket.status)}</Text>
                  </View>
                </View>
                <View style={styles.ticketFooter}>
                  <View style={styles.priorityContainer}>
                    <Ionicons 
                      name={PRIORITY_MAP[ticket.priority?.toUpperCase()]?.icon || 'help-circle-outline'} 
                      size={16} 
                      color={getPriorityColor(ticket.priority)} 
                    />
                    <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                      {getPriorityText(ticket.priority)}
                    </Text>
                  </View>
                  <Text style={styles.ticketDate}>
                    {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
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
    backgroundColor: colors.white,
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
    color: colors.text,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.white,
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
    color: colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
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
    color: colors.primary,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textLight,
    padding: 20,
  },
  emptyContainer: {
    backgroundColor: colors.white,
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
    color: colors.textLight,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  ticketCard: {
    marginBottom: 10,
  },
  ticketCardContent: {
    padding: 15,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  ticketDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default DashboardScreen;