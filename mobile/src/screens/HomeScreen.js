import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/scan2cook-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>¡Bienvenido!</Text>
        </View>

        {/* BOTONES */}
        <View style={styles.form}>
          <Button
            title="Escanear Ticket"
            onPress={() => navigation.navigate('Scan')}
            icon="camera-outline"
          />
          <Button
            title="Ver Despensa"
            onPress={() => navigation.navigate('Pantry')}
            icon="basket-outline"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'upper-left',
    marginBottom: 40,
  },
  logo: {
    alignContent: 'left',
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brandPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
});
