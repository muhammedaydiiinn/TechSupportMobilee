const errorMessages = {
  'Username already registered': 'Kullanıcı adı zaten kayıtlı.',
  'Invalid credentials': 'Geçersiz kullanıcı adı veya şifre.',
  'Network request failed': 'Ağ isteği başarısız oldu, lütfen bağlantınızı kontrol edin.',
  'User not found': 'Kullanıcı bulunamadı.',
  'Unknown error': 'Bilinmeyen bir hata oluştu.',
  // Diğer hata mesajları buraya eklenebilir
};

export const getErrorMessage = (errorCode) => {
  return errorMessages[errorCode] || 'Bir hata oluştu, lütfen tekrar deneyin.';
};