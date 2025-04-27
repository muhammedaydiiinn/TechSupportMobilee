import 'react-native-reanimated';
import React from 'react';
import { LogBox, StyleSheet, View, StatusBar } from 'react-native';
// react-native-safe-area-context'ten SafeAreaView kullanmak daha iyidir
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

// Uyarıları görmezden gel
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified',
  'AsyncStorage has been extracted',
  "Cannot read property 'makeMutable' of undefined",
  "ViewPropTypes"
]);

const App = () => {
  // Arkaplan renginize göre barStyle'ı ayarlayın:
  // Açık arkaplan için: 'dark-content'
  // Koyu arkaplan için: 'light-content'
  const statusBarStyle = 'dark-content'; // Varsayılan açık tema için
  // Uygulamanızın genel arkaplan rengi (StatusBar arkasında görünecek olan)
  const appBackgroundColor = '#FFFFFF'; // Varsayılan beyaz

  return (
    // SafeAreaProvider, SafeAreaView'in düzgün çalışması için gereklidir
    <SafeAreaProvider>
      {/* Bu View tüm ekranı kaplar ve status bar arkasındaki rengi belirler */}
      <View style={[styles.rootContainer, { backgroundColor: appBackgroundColor }]}>
        <StatusBar
          translucent // İçeriğin status bar altına uzanmasını sağlar
          backgroundColor="transparent" // Status bar'ı şeffaf yapar
          barStyle={statusBarStyle} // İkon/yazı rengini ayarlar
        />
        {/* SafeAreaView, içeriği güvenli alanlara (çentik, alt bar vb. dışına) iter */}
        <SafeAreaView style={styles.safeArea}>
          <AuthProvider>
            <MainNavigator />
          </AuthProvider>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    // backgroundColor burada dinamik olarak yukarıdan ayarlanıyor
  },
  safeArea: {
    flex: 1, // SafeAreaView'in mevcut alanı doldurmasını sağlar
    // SafeAreaView'in kendisine bir arkaplan rengi vermek isterseniz buraya ekleyebilirsiniz
    // Ancak genellikle rootContainer'ın rengi yeterli olur.
    // backgroundColor: 'lightblue', // Örnek
  },
});

export default App;