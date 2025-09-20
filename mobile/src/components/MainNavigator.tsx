import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import BottomNavigation from './BottomNavigation';

// Placeholder screens - we'll create these next
const HistoryScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderText}>History Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const MapScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderText}>Map Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderText}>Settings Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'map':
        return <MapScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
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