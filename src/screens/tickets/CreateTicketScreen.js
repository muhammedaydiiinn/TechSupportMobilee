import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/api';
import { colors } from '../../theme/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TokenService from '../../services/TokenService';

// Destek talebi kategorileri
const TicketCategory = {
  SOFTWARE: 'software',
  HARDWARE: 'hardware',
  NETWORK: 'network',
  OTHER: 'other'
};

// Destek talebi öncelikleri
const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export default function CreateTicketScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: TicketCategory.HARDWARE,
    priority: TicketPriority.LOW,
    attachments: []
  });

  const priorities = [
    { value: TicketPriority.LOW, label: 'Düşük' },
    { value: TicketPriority.MEDIUM, label: 'Orta' },
    { value: TicketPriority.HIGH, label: 'Yüksek' },
    { value: TicketPriority.URGENT, label: 'Acil' }
  ];

  const categories = [
    { value: TicketCategory.HARDWARE, label: 'Donanım' },
    { value: TicketCategory.SOFTWARE, label: 'Yazılım' },
    { value: TicketCategory.NETWORK, label: 'Ağ' },
    { value: TicketCategory.OTHER, label: 'Diğer' }
  ];

  const handleFilePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 5,
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
        return;
      }

      // Dosya boyutu kontrolü (5MB)
      const validFiles = result.assets.filter(file => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.fileSize > maxSize) {
          Alert.alert('Hata', `${file.fileName} dosyası çok büyük. Maksimum dosya boyutu 5MB olmalıdır.`);
          return false;
        }
        return true;
      });

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles]
      }));
    } catch (err) {
      console.error('Dosya seçme hatası:', err);
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const uploadAttachments = async (ticketId, attachments) => {
    for (const file of attachments) {
      const fileFormData = new FormData();
      fileFormData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.fileName || `file-${Date.now()}.jpg`
      });

      try {
        await ticketService.uploadAttachment(ticketId, fileFormData);
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        throw new Error('Dosya yüklenirken bir hata oluştu');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.priority) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
        return;
      }

      const token = await TokenService.getToken();
      if (!token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      };

      const result = await ticketService.createTicket(ticketData);
      if (!result.success) {
        Alert.alert('Hata', result.message);
        return;
      }

      if (formData.attachments && formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || `file-${Date.now()}.jpg`
          });

          const uploadResult = await ticketService.uploadFiles(result.data.id, uploadFormData);
          if (!uploadResult.success) {
            Alert.alert('Uyarı', `Dosya yüklenemedi: ${uploadResult.message}`);
            continue;
          }
        }
      }

      Alert.alert('Başarılı', 'Destek talebi başarıyla oluşturuldu', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Destek talebi oluşturma hatası:', error);
      Alert.alert('Hata', 'Destek talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Başlık *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Destek talebi başlığını girin"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Destek talebi açıklamasını girin"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  formData.category === category.value && styles.categoryButtonActive
                ]}
                onPress={() => setFormData({ ...formData, category: category.value })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === category.value && styles.categoryButtonTextActive
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.priorityButton,
                  formData.priority === priority.value && styles.priorityButtonActive
                ]}
                onPress={() => setFormData({ ...formData, priority: priority.value })}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    formData.priority === priority.value && styles.priorityButtonTextActive
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosya Ekle (Maks. 5MB)</Text>
          <TouchableOpacity
            style={styles.fileButton}
            onPress={handleFilePick}
          >
            <Ionicons name="attach" size={24} color={colors.primary} />
            <Text style={styles.fileButtonText}>Dosya Seç</Text>
          </TouchableOpacity>
          
          {formData.attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {formData.attachments.map((file, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {file.fileName || `Dosya ${index + 1}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeAttachment(index)}
                    style={styles.removeAttachment}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Destek Talebi Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  priorityButtonTextActive: {
    color: colors.white,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  fileButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 4,
    marginBottom: 4,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  removeAttachment: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});