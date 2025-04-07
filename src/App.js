import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ApiScreen from './screens/ApiScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Api" component={ApiScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App; 