import React, {useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useApi } from '../hooks/useApi';
import { BaseUrl } from '../services/NetworkUrl';


const ApiScreen = () => {
  const { data, loading, error, fetchData } = useApi();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
      return (
        <Text style={[styles.text, styles.errorText]}>
          Hata: {error.message}
        </Text>
      );
    }

    return (
      <Text style={styles.text}>
        API Yanıtı: {JSON.stringify(data, null, 2)}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
  }
});

export default ApiScreen;
