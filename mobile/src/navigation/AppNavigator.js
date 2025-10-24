import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ScanScreen from '../screens/ScanScreen';
import ReviewScreen from '../screens/ReviewScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          // Protected screens
          <>
            <Stack.Screen name="Scan" component={ScanScreen} />
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