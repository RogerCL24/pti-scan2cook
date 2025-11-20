import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch {
            Alert.alert('Error', 'Could not sign out.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const firstLetter =
    (user?.name && String(user.name).trim()[0]) ||
    (user?.email && String(user.email).trim()[0]) ||
    'U';

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@domain.com'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            disabled
          >
            <Text style={styles.itemText}>Edit profile</Text>
            <Text style={styles.itemNote}>Coming soon</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.logoutBtn,
              loggingOut && styles.logoutDisabled,
              pressed && !loggingOut && styles.pressed,
            ]}
          >
            {loggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logoutText}>Sign out</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 32,
    backgroundColor: Colors.backgroundPrimary,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  itemText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  itemNote: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  pressed: { opacity: 0.85 },
  logoutBtn: {
    backgroundColor: '#E53935',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutDisabled: { opacity: 0.7 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
