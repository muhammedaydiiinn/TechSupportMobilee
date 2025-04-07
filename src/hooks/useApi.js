import {useState, useCallback} from 'react';
import {get} from '../services/NetworkManager';
import {BaseUrl} from '../services/NetworkUrl';

export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // url e bak
      const response = await get('');
      setData(response);
    } catch (error) {
      setError(error);
      console.error('API Hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {data, loading, error, fetchData};
}; 