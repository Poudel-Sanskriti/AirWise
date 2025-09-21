import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import RunCoachScreen from '../screens/RunCoachScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import BottomNavigation from './BottomNavigation';

interface SavedPlace {
  id: string;
  name: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  address: string;
  latitude: number;
  longitude: number;
  currentStatus?: 'good' | 'moderate' | 'caution' | 'unhealthy';
  outlook?: 'improving' | 'stable' | 'declining';
  lastUpdated?: string;
}

const SettingsScreen = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const settingsItems = [
    { id: 'profile', title: 'Profile', icon: 'person-outline', onPress: () => console.log('Profile') },
    { id: 'health', title: 'Health', icon: 'heart-outline', onPress: () => console.log('Health') },
    { id: 'preferences', title: 'Preferences', icon: 'settings-outline', onPress: () => console.log('Preferences') },
    { id: 'about', title: 'About', icon: 'information-circle-outline', onPress: () => console.log('About') },
  ];

  if (loading) {
    return (
      <View style={styles.settingsContainer}>
        <View style={styles.authSection}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.authSubtitle}>Signing you in...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.settingsContainer}>
        <View style={styles.authSection}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.authTitle}>Welcome to AirWise</Text>
          <Text style={styles.authSubtitle}>Sign in to personalize your air quality experience</Text>

          <TouchableOpacity style={styles.loginButton} onPress={signInWithGoogle}>
            <Text style={styles.loginButtonText}>Sign In with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Continue as guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.settingsContainer}>
      <ScrollView>
        <View style={styles.profileHeader}>
        {user.picture ? (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
        ) : (
          <Ionicons name="person-circle" size={60} color="#4CAF50" />
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsMenu}>
        {settingsItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.settingsItem} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={24} color="#666" />
            <Text style={styles.settingsItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);

  const navigateToPlaceHome = (place: SavedPlace) => {
    setSelectedPlace(place);
    setActiveTab('home');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen selectedPlace={selectedPlace} onClearSelectedPlace={() => setSelectedPlace(null)} />;
      case 'history':
        return <RunCoachScreen />;
      case 'map':
        return <SavedPlacesScreen onPlaceSelect={navigateToPlaceHome} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen selectedPlace={selectedPlace} onClearSelectedPlace={() => setSelectedPlace(null)} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutText: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '500',
  },
  settingsMenu: {
    backgroundColor: 'white',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MainNavigator;