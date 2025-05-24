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
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/api';
import { colors } from '../../theme/colors';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TokenService from '../../services/TokenService';
import LinearGradient from 'react-native-linear-gradient';
import theme, { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { RNCamera } from 'react-native-camera';

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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

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

  const openImagePickerModal = () => {
    setShowImagePicker(true);
  };

  const handleCamera = () => {
    setCameraVisible(true);
    setShowImagePicker(false);
  };

  const handleTakePicture = async (camera) => {
    try {
      const options = { quality: 0.8, base64: false };
      const data = await camera.takePictureAsync(options);
      
      // Dosya boyutu kontrolü (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (data.uri) {
        // Kamera ile çekilen fotoğrafı attachments listesine ekle
        const newPhoto = {
          uri: data.uri,
          type: 'image/jpeg',
          fileName: `photo_${Date.now()}.jpg`
        };
        
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, newPhoto]
        }));
        
        setCameraVisible(false);
      }
    } catch (err) {
      console.error('Fotoğraf çekme hatası:', err);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu');
      setCameraVisible(false);
    }
  };

  const handleGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        setShowImagePicker(false);
        return;
      }

      if (result.errorCode) {
        Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
        setShowImagePicker(false);
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
      
      setShowImagePicker(false);
    } catch (err) {
      console.error('Dosya seçme hatası:', err);
      Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
      setShowImagePicker(false);
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
      setLoading(true); // Loading durumunu başlangıçta true yapalım

      if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.priority) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
        return;
      }

      const token = await TokenService.getToken();
      if (!token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigation.navigate('Login');
        return;
      }

      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      };

      console.log('Destek talebi oluşturuluyor:', ticketData);
      const result = await ticketService.createTicket(ticketData);
      
      if (!result.success) {
        Alert.alert('Hata', result.message || 'Destek talebi oluşturulurken bir hata oluştu');
        return;
      }

      // Dosya yükleme işlemi
      if (formData.attachments && formData.attachments.length > 0) {
        try {
          for (const file of formData.attachments) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', {
              uri: file.uri,
              type: file.type || 'image/jpeg',
              name: file.fileName || `file-${Date.now()}.jpg`
            });

            const uploadResult = await ticketService.uploadFiles(result.data.id, uploadFormData);
            if (!uploadResult.success) {
              console.warn('Dosya yükleme uyarısı:', uploadResult.message);
              continue;
            }
          }
        } catch (uploadError) {
          console.error('Dosya yükleme hatası:', uploadError);
          // Dosya yükleme hatası olsa bile devam ediyoruz
        }
      }

      // Başarılı mesajı ve yönlendirme
      Alert.alert(
        'Başarılı',
        'Destek talebi başarıyla oluşturuldu',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Önce loading'i false yapalım
              setLoading(false);
              // Sonra yönlendirme yapalım
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'TicketDetail',
                    params: { ticketId: result.data.id }
                  }
                ],
              });
            },
          },
        ]
      );

    } catch (error) {
      console.error('Destek talebi oluşturma hatası:', error);
      Alert.alert('Hata', 'Destek talebi oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Kamera ekranı
  const renderCameraView = () => {
    return (
      <Modal
        visible={cameraVisible}
        transparent={false}
        animationType="slide"
      >
        <View style={styles.cameraContainer}>
          <RNCamera
            style={styles.camera}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            captureAudio={false}
          >
            {({ camera }) => {
              return (
                <View style={styles.cameraControls}>
                  <TouchableOpacity 
                    style={styles.cameraCancelButton}
                    onPress={() => setCameraVisible(false)}
                  >
                    <Ionicons name="close-circle" size={30} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.captureButton}
                    onPress={() => handleTakePicture(camera)}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                </View>
              );
            }}
          </RNCamera>
        </View>
      </Modal>
    );
  };

  // Resim seçim modalı
  const renderImagePickerModal = () => {
    return (
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Fotoğraf Ekle</Text>
              <TouchableOpacity 
                onPress={() => setShowImagePicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <TouchableOpacity 
                style={styles.mediaOption}
                onPress={handleCamera}
              >
                <Ionicons name="camera" size={30} color={theme.colors.primary} />
                <Text style={styles.mediaOptionText}>Kamera ile Çek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mediaOption}
                onPress={handleGallery}
              >
                <Ionicons name="images" size={30} color={theme.colors.primary} />
                <Text style={styles.mediaOptionText}>Galeriden Seç</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Yeni Destek Talebi Oluştur</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput
            style={styles.input}
            placeholder="Destek talebiniz için kısa bir başlık"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Sorununuzu detaylı bir şekilde açıklayın"
            multiline
            numberOfLines={6}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.radioButton,
                    formData.category === category.value && styles.radioButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.value })}
                >
                  <Text style={[
                    styles.radioButtonText,
                    formData.category === category.value && styles.radioButtonTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Öncelik</Text>
            <View style={styles.pickerContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.radioButton,
                    formData.priority === priority.value && styles.radioButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, priority: priority.value })}
                >
                  <Text style={[
                    styles.radioButtonText,
                    formData.priority === priority.value && styles.radioButtonTextSelected
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ekler</Text>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={openImagePickerModal}
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={styles.attachmentButtonText}>Fotoğraf Ekle</Text>
          </TouchableOpacity>

          {formData.attachments.length > 0 && (
            <View style={styles.attachmentList}>
              <Text style={styles.attachmentHeader}>
                Ekli Dosyalar ({formData.attachments.length})
              </Text>
              <FlatList
                data={formData.attachments}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.attachmentItem}>
                    {item.uri && (
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.attachmentImage}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeAttachment}
                      onPress={() => removeAttachment(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Gönder</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Fotoğraf seçici modal */}
      {renderImagePickerModal()}
      
      {/* Kamera görünümü */}
      {renderCameraView()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  radioButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radioButtonSelected: {
    backgroundColor: colors.primaryLight,
  },
  radioButtonText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  radioButtonTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: 12,
  },
  attachmentButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
  },
  attachmentList: {
    marginTop: 16,
  },
  attachmentHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  attachmentItem: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  removeAttachment: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  // Image picker modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 15,
  },
  mediaOptionText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.text,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraControls: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  captureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cameraCancelButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});