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
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* USER CARD */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter.toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.name || 'User'}</Text>
              <Text style={styles.email}>
                {user?.email || 'email@domain.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingsItem,
              pressed && styles.settingsItemPressed,
            ]}
            disabled
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.brandPrimary}
                />
              </View>
              <View style={styles.settingsItemText}>
                <Text style={styles.settingsItemTitle}>Edit Profile</Text>
                <Text style={styles.settingsItemSubtitle}>Coming soon</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingsItem,
              pressed && styles.settingsItemPressed,
            ]}
            disabled
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIcon}>
                <Ionicons
                  name="shield-outline"
                  size={20}
                  color={Colors.brandPrimary}
                />
              </View>
              <View style={styles.settingsItemText}>
                <Text style={styles.settingsItemTitle}>Privacy & Security</Text>
                <Text style={styles.settingsItemSubtitle}>Coming soon</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingsItem,
              pressed && styles.settingsItemPressed,
            ]}
            disabled
          >
            <View style={styles.settingsItemLeft}>
              <View style={styles.settingsIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={Colors.brandPrimary}
                />
              </View>
              <View style={styles.settingsItemText}>
                <Text style={styles.settingsItemTitle}>Help & Support</Text>
                <Text style={styles.settingsItemSubtitle}>Coming soon</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutItemLabel}>App Version</Text>
            <Text style={styles.aboutItemValue}>1.3.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutItemLabel}>App Name</Text>
            <Text style={styles.aboutItemValue}>Scan2Cook</Text>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logoutButton,
            loggingOut && styles.logoutButtonDisabled,
            pressed && !loggingOut && styles.logoutButtonPressed,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.backgroundPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: Colors.backgroundPrimary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundPrimary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsItemPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  settingsItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${Colors.brandPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundPrimary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  aboutItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  aboutItemValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.systemError,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.systemError,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  logoutButtonPressed: {
    opacity: 0.9,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
