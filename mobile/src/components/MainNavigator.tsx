import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RunCoachScreen from '../screens/RunCoachScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../contexts/auth-context';

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
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.placeholderScreen}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Signing you in...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.placeholderScreen}>
        {user.picture && (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        )}
        <Text style={styles.placeholderText}>Welcome</Text>
        <Text style={styles.userName}>{user.name || user.nickname || user.email}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.placeholderScreen}>
      <Text style={styles.placeholderText}>Login or Sign Up</Text>
      <Text style={styles.placeholderSubtext}>Continue with Google to personalize your experience.</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={signInWithGoogle}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={signInWithGoogle}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  signupButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
});

export default MainNavigator;