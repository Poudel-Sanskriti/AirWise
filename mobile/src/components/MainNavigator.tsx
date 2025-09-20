import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

const SettingsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderText}>Settings Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

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
});

export default MainNavigator;