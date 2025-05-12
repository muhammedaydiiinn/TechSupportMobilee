/**
 * Tarih formatlama yardımcı fonksiyonları
 */

/**
 * Verilen tarihi Türkçe formatında döndürür
 * @param {string|Date} date - Formatlanacak tarih
 * @returns {string} Formatlanmış tarih
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Geçerli bir tarih değilse boş string döndür
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Verilen tarihi kısa formatta döndürür (GG.AA.YYYY)
 * @param {string|Date} date - Formatlanacak tarih
 * @returns {string} Formatlanmış tarih
 */
export const formatShortDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Geçerli bir tarih değilse boş string döndür
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Verilen tarihi saat formatında döndürür (SS:DD)
 * @param {string|Date} date - Formatlanacak tarih
 * @returns {string} Formatlanmış saat
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Geçerli bir tarih değilse boş string döndür
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Verilen tarihi göreceli olarak döndürür (örn: "2 saat önce")
 * @param {string|Date} date - Formatlanacak tarih
 * @returns {string} Göreceli tarih
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Geçerli bir tarih değilse boş string döndür
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Az önce';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }
  
  // 7 günden eski tarihler için normal format kullan
  return formatDate(date);
}; 