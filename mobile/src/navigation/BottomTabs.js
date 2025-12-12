import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Platform } from 'react-native';
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
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundPrimary,
          borderTopWidth: 1,
          borderTopColor: Colors.backgroundSecondary,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pantry') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Scan') {
            iconName = 'scan';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Special styling for Scan button (FAB)
          if (route.name === 'Scan') {
            return (
              <View style={styles.scanButtonContainer}>
                <View style={styles.scanButton}>
                  <Ionicons name={iconName} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.scanLabel}>Scan</Text>
              </View>
            );
          }

          // Regular tab icons
          return (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={24}
                color={color}
                style={focused && styles.activeIcon}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{ tabBarLabel: 'Pantry' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  scanButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  scanButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.brandPrimary,
    marginTop: 6,
  },
});
