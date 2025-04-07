import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput
} from 'react-native';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TicketDetailScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTicketDetails();
  }, []);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      setTimeout(() => {
        const dummyTicket = {
          id: ticketId,
          title: 'Internet bağlantı sorunu',
          description: 'İnternetim sık sık kesiliyor. 3 gündür devam ediyor. Modem resetleme işlemini gerçekleştirdim ancak sorun devam ediyor. Teknik destek talep ediyorum.',
          status: 'open',
          priority: 'high',
          created_at: '2023-09-15T10:30:00',
          category: 'technical',
          comments: [
            {
              id: 1,
              user: 'Teknik Destek',
              message: 'Merhaba, sorununuz için üzgünüz. Lütfen modem model bilginizi paylaşır mısınız?',
              created_at: '2023-09-15T11:15:00',
              is_staff: true
            },
            {
              id: 2,
              user: 'Mustafa Yılmaz',
              message: 'Modem modelim TP-Link Archer C6.',
              created_at: '2023-09-15T12:30:00',
              is_staff: false
            }
          ]
        };
        setTicket(dummyTicket);
        setLoading(false);
      }, 1000);
      
      // In a real app, you would use:
      // const response = await ticketService.getTicket(ticketId);
      // setTicket(response);
      
    } catch (error) {
      console.log(`Error fetching ticket ${ticketId}:`, error);
      setError('Bilet detayları yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // In a real app, you would send this to your API
      // await ticketService.addComment(ticketId, newComment);
      
      // For now, just simulate adding a comment
      const newCommentObj = {
        id: Date.now(),
        user: 'Mustafa Yılmaz',
        message: newComment,
        created_at: new Date().toISOString(),
        is_staff: false
      };
      
      setTicket({
        ...ticket,
        comments: [...ticket.comments, newCommentObj]
      });
      setNewComment('');
      
    } catch (error) {
      console.log('Error sending comment:', error);
      alert('Yorum gönderilirken bir hata oluştu.');
    }
  };

  const handleCloseTicket = async () => {
    try {
      // In a real app, you would call your API
      // await ticketService.closeTicket(ticketId);
      
      // For now, just update the local state
      setTicket({
        ...ticket,
        status: 'closed'
      });
      
    } catch (error) {
      console.log('Error closing ticket:', error);
      alert('Bilet kapatılırken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Bilet detayları yükleniyor...</Text>
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
          onPress={fetchTicketDetails}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.ticketTitle}>{ticket.title}</Text>
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
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Tarih:</Text>
              <Text style={styles.metaValue}>{new Date(ticket.created_at).toLocaleDateString('tr-TR')}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Kategori:</Text>
              <Text style={styles.metaValue}>{getCategoryText(ticket.category)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Öncelik:</Text>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(ticket.priority) }
              ]}>
                {getPriorityText(ticket.priority)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{ticket.description}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Yorumlar</Text>
          
          {ticket.comments.length === 0 ? (
            <Text style={styles.noCommentsText}>Henüz yorum bulunmamaktadır.</Text>
          ) : (
            ticket.comments.map(comment => (
              <View 
                key={comment.id} 
                style={[
                  styles.commentItem,
                  comment.is_staff && styles.staffCommentItem
                ]}
              >
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleString('tr-TR')}
                  </Text>
                </View>
                <Text style={styles.commentMessage}>{comment.message}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {ticket.status === 'open' && (
        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Yanıtınızı yazın..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.disabledButton]}
              onPress={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.closeTicketButton}
            onPress={handleCloseTicket}
          >
            <Text style={styles.closeTicketText}>Bileti Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Helper functions
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticketTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
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
  metaInfo: {
    flexDirection: 'row',
    marginTop: 15,
  },
  metaItem: {
    marginRight: 15,
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    color: COLORS.white,
    fontSize: 14,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  noCommentsText: {
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  commentItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  staffCommentItem: {
    backgroundColor: '#EDF7FF',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.text,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  commentMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    maxHeight: 100,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  closeTicketButton: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeTicketText: {
    color: '#388E3C',
    fontWeight: '500',
  },
});

export default TicketDetailScreen;