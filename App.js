import 'react-native-reanimated';
import React from 'react';
import { LogBox } from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';

// Uyarıları görmezden gel
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified',
  'AsyncStorage has been extracted',
  "Cannot read property 'makeMutable' of undefined",
  "ViewPropTypes"
]);

const App = () => {
  return <MainNavigator />;
};

export default App;
