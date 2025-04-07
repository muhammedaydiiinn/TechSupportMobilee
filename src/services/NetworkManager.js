import {BaseUrl} from './NetworkUrl';
import {Alert} from 'react-native';
import {getErrorMessage} from './errorMessages';

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

export const get = async (endpoint) => {
  try {
    const url = `${BaseUrl}${endpoint}`;
    console.log('GET isteği yapılıyor:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await handleResponse(response);
      throw {
        message: errorData.detail || getErrorMessage('UNKNOWN_ERROR'),
        status: response.status,
        data: errorData
      };
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('GET Hatası:', error);
    throw {
      message: error.message || getErrorMessage('NETWORK_ERROR'),
      status: error.status,
      data: error.data || error.response?.data
    };
  }
};

export const post = async (endpoint, data) => {
  try {
    const url = `${BaseUrl}${endpoint}`;
    console.log('POST isteği yapılıyor:', url);
    console.log('POST data:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await handleResponse(response);
      const errorMessage = getErrorMessage(errorData.detail) || getErrorMessage('UNKNOWN_ERROR');
      
      // Hata mesajını konsola yazdır
    

      // Kullanıcıya alert ile göster
      Alert.alert('Hata', errorMessage);

      throw {
        message: errorMessage,
        status: response.status,
        data: errorData
      };
    }

    return await handleResponse(response);
  } catch (error) {
    console.log('POST Hatası:', error);
    throw {
      message: error.message || getErrorMessage('NETWORK_ERROR'),
      status: error.status || error.response?.status,
      data: error.data || error.response?.data
    };
  }
};