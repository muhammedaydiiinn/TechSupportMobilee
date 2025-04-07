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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { launchImageLibrary } from 'react-native-image-picker';

// Bu servisin oluşturulması gerekecek
import { ticketService } from '../../services/api';

const CreateTicketScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priorityOptions = [
    { label: 'Düşük', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'Yüksek', value: 'high' },
    { label: 'Acil', value: 'urgent' },
  ];

  const categoryOptions = [
    { label: 'Teknik Sorun', value: 'technical' },
    { label: 'Fatura', value: 'billing' },
    { label: 'Hesap', value: 'account' },
    { label: 'Diğer', value: 'other' },
  ];

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Hata', 'Görüntü yüklenirken bir hata oluştu.');
      } else {
        // Başarılı seçim
        const selectedAsset = response.assets[0];
        setAttachments([...attachments, selectedAsset]);
      }
    });
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validasyon
      if (!title || !description || !category) {
        setError('Lütfen gerekli alanları doldurunuz.');
        return;
      }

      // Form verilerini oluştur
      const ticketData = {
        title,
        description,
        priority,
        category,
      };

      // Dosya eklemesi varsa
      if (attachments.length > 0) {
        // Dosya eklemek için formData kullan
        const formData = new FormData();
        
        // Ticket verilerini ekle
        Object.keys(ticketData).forEach(key => {
          formData.append(key, ticketData[key]);
        });
        
        // Dosyaları ekle
        attachments.forEach((file, index) => {
          const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
          formData.append('files', {
            uri: fileUri,
            type: 'image/jpeg',
            name: `photo_${index}.jpg`,
          });
        });
        
        // API isteği gönder
        await ticketService.createTicketWithAttachments(formData);
      } else {
        // Dosya eklemesi yoksa direkt JSON gönder
        await ticketService.createTicket(ticketData);
      }

      Alert.alert(
        'Başarılı',
        'Destek biletiniz başarıyla oluşturuldu.',
        [
          { 
            text: 'Tamam', 
            onPress: () => navigation.navigate('MyTickets') 
          }
        ]
      );
    } catch (error) {
      console.log('Create ticket error:', error);
      if (error.api?.message) {
        setError(error.api.message);
      } else {
        setError('Bilet oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Yeni Destek Bileti Oluştur</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konu</Text>
            <TextInput
              style={styles.input}
              placeholder="Destek talebinizin konusu"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.inputText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Kategori seçin" value="" />
                {categoryOptions.map((item) => (
                  <Picker.Item 
                    key={item.value} 
                    label={item.label} 
                    value={item.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Öncelik</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue)}
                style={styles.picker}
              >
                {priorityOptions.map((item) => (
                  <Picker.Item 
                    key={item.value} 
                    label={item.label} 
                    value={item.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Sorununuzu detaylı bir şekilde açıklayın..."
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={COLORS.inputText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosya Ekle</Text>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={pickImage}
            >
              <Ionicons name="attach-outline" size={20} color={COLORS.primary} />
              <Text style={styles.attachButtonText}>Dosya Seç</Text>
            </TouchableOpacity>

            {attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {attachments.map((file, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      Dosya {index + 1}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => removeAttachment(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Bileti Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.text,
  },
  textArea: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  attachButtonText: {
    color: COLORS.primary,
    marginLeft: 8,
  },
  attachmentsContainer: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  attachmentName: {
    flex: 1,
    color: COLORS.text,
  },
  removeButton: {
    padding: 2,
  },
  errorContainer: {
    backgroundColor: '#FFE7E7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateTicketScreen;