import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ScanScreen from '../screens/ScanScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.brandPrimary,
        tabBarInactiveTintColor: '#9aa0a6',
        tabBarStyle: { backgroundColor: Colors.backgroundPrimary },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Pantry: 'basket-outline',
            Scan: 'camera-outline',
            Recipes: 'book-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Pantry" component={PantryScreen} options={{ title: 'Despensa' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: 'Escanear' }} />
      <Tab.Screen name="Recipes" component={RecipesScreen} options={{ title: 'Recetas' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}