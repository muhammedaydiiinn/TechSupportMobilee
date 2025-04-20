import 'react-native-reanimated';
import React from 'react';
import { LogBox } from 'react-native';
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
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
};

export default App;
