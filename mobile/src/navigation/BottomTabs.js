import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Platform, Image, Linking, Alert } from 'react-native';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ScanScreen from '../screens/ScanScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const handleAlexaPress = async () => {
  const skillId = 'amzn1.ask.skill.b2b75995-aaa3-4dfd-80c5-83416db4b1e6'; // <-- PON AQUÍ TU SKILL ID REAL
  const url = `https://alexa-skills.amazon.es/apis/custom/skills/${skillId}/launch`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert(
      'No se puede abrir Alexa',
      'Instala la app de Alexa o prueba desde un navegador.'
    );
  }

  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.brandPrimary,
          tabBarInactiveTintColor: '#9aa0a6',
          tabBarStyle: {
            backgroundColor: Colors.backgroundPrimary,
            borderTopWidth: 1,
            borderTopColor: Colors.backgroundSecondary,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          },
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
        <Image
          source={require('../../assets/alexa-icon.png')}
          style={styles.alexaIcon}
          resizeMode="contain"
        />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  alexaButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  alexaButtonPressed: {
    transform: [{ scale: 0.92 }],
    elevation: 2,
  },
  alexaIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
});
