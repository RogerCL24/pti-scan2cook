import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ScanScreen from '../screens/ScanScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const handleAlexaPress = () => {
    console.log('🎤 Alexa button pressed');
    // TODO: Implement Alexa functionality
  };

  return (
    <>
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
            return (
              <Ionicons name={icons[route.name]} size={size} color={color} />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Pantry"
          component={PantryScreen}
          options={{ title: 'Pantry' }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{ title: 'Scan' }}
        />
        <Tab.Screen
          name="Recipes"
          component={RecipesScreen}
          options={{ title: 'Recipes' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>

      {/* Floating Alexa Button */}
      <Pressable
        style={({ pressed }) => [
          styles.alexaButton,
          pressed && styles.alexaButtonPressed,
        ]}
        onPress={handleAlexaPress}
      >
        <Ionicons name="mic" size={28} color="#fff" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  alexaButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brandSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  alexaButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
