import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import RunCoachScreen from '../screens/RunCoachScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';

// Saved place interface for sharing between components
interface SavedPlace {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  address: string;
  latitude: number;
  longitude: number;
  currentStatus?: 'good' | 'moderate' | 'caution' | 'unhealthy';
  outlook?: 'improving' | 'stable' | 'declining';
  lastUpdated?: string;
}

// Settings Screen placeholder
const SettingsScreen = () => {
  return (
    <View style={styles.placeholderScreen}>
      <Ionicons name="settings" size={60} color="#4CAF50" />
      <Text style={styles.placeholderText}>Settings</Text>
      <Text style={styles.placeholderSubtext}>Coming Soon</Text>
    </View>
  );
};

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Main navigator for the app
const MainNavigator: React.FC = () => {
  // State for tracking selected place from the saved places screen
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);

  const handlePlaceSelect = (place: SavedPlace) => {
    setSelectedPlace(place);
  };

  const handleClearSelectedPlace = () => {
    setSelectedPlace(null);
  };
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Run') {
              iconName = focused ? 'walk' : 'walk-outline';
            } else if (route.name === 'Places') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingTop: 8,
            paddingBottom: 12,
            height: 65,
          }
        })}
      >
        <Tab.Screen name="Home">
          {() => <HomeScreen 
            selectedPlace={selectedPlace}
            onClearSelectedPlace={handleClearSelectedPlace} 
          />}
        </Tab.Screen>
        <Tab.Screen name="Run" component={RunCoachScreen} />
        <Tab.Screen name="Places">
          {() => <SavedPlacesScreen onPlaceSelect={handlePlaceSelect} />}
        </Tab.Screen>
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
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
    paddingHorizontal: 30,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MainNavigator;