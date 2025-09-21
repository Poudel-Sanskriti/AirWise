import React from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define props type
interface MapComponentProps {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  style?: any;
}

const MapComponent: React.FC<MapComponentProps> = ({ userLocation, style }) => {
  // On web platform, just render a placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="map" size={64} color="#4CAF50" />
        <Text style={styles.placeholder}>
          Map view is available on mobile devices
        </Text>
      </View>
    );
  }

  // For mobile platforms, dynamically import the map component
  // We use this approach to avoid the React Native Maps module being loaded on web
  try {
    // This will only be executed on mobile platforms
    const { default: MapView, Marker } = require('react-native-maps');

    if (!userLocation) {
      return (
        <View style={[styles.container, style]}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loading}>Finding your location...</Text>
        </View>
      );
    }

    return (
      <View style={[styles.mapContainer, style]}>
        <MapView
          style={styles.map}
          region={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
          loadingEnabled
        >
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="This is your current position."
          />
        </MapView>
      </View>
    );
  } catch (error) {
    // Fallback if there's any issue with the map
    return (
      <View style={[styles.container, style]}>
        <Ionicons name="alert-circle" size={64} color="#FF5722" />
        <Text style={styles.error}>
          Unable to load map component
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  error: {
    marginTop: 16,
    color: '#FF5722',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MapComponent;