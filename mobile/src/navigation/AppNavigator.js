import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ScanScreen from '../screens/ScanScreen';
import ReviewScreen from '../screens/ReviewScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { token, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', onPress: () => logout() },
    ]);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          // Protected screens
          <>
            <Stack.Screen 
            name="Scan" 
            component={ScanScreen} 
            options={{title: 'Escanear ticket',
              headerLeft: null,
              headerRight: () => (
                <TouchableOpacity onPress={handleLogout}>
                  <Text style={{ color: '#000', marginRight: 15, fontWeight: 'bold' }}>
                    Cerrar sesión
                  </Text>
                </TouchableOpacity>
              ),}}/>
            <Stack.Screen name="Review" component={ReviewScreen} />
          </>
        ) : (
          // Public screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}