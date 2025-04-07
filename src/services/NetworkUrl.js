import {REACT_APP_BASE_URL} from '@env';

// Base URL sonunda / karakteri olduğundan emin olalım
export const BaseUrl = REACT_APP_BASE_URL.endsWith('/') 
  ? REACT_APP_BASE_URL 
  : `${REACT_APP_BASE_URL}/`;

// API versiyonu
export const API_VERSION = 'v1';

// Endpoint'ler
export const Endpoints = {
  api : '', 
  register: `api/${API_VERSION}/register`,

  // Diğer endpoint'ler buraya eklenebilir
};