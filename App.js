import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import { LogBox, Text, View } from 'react-native';

// Geliştirme aşamasında konsola daha fazla bilgi için
if (__DEV__) {
  // Sarı kutuları ve bazı uyarıları görmezden gelmek için
  LogBox.ignoreLogs([
    'Animated: `useNativeDriver` was not specified',
    'AsyncStorage has been extracted',
  ]);

  // Global hata dinleyicisi
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('Require cycle:')) {
      return;
    }
    originalConsoleError(...args);
  };
}

// Basit hata sınırı bileşeni
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('App Error:', error);
    console.log('Error Info:', info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>Uygulama Hatası!</Text>
          <Text style={{ marginTop: 10 }}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  useEffect(() => {
    console.log('App başlatıldı!');
    // ENV modülü kontrolünü kaldırdık çünkü hata veriyor
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default App;
