import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// For web platform only - doesn't use react-native-maps at all
interface WebMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  style?: any;
}

const WebMapComponent: React.FC<WebMapProps> = ({ userLocation, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="map" size={64} color="#4CAF50" />
      {userLocation ? (
        <View style={styles.locationInfoContainer}>
          <Text style={styles.title}>Location Found</Text>
          <Text style={styles.coordinates}>
            {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
          </Text>
          <Text style={styles.subtitle}>
            Map view is available on mobile devices
          </Text>
        </View>
      ) : (
        <View style={styles.locationInfoContainer}>
          <Text style={styles.title}>Finding Location...</Text>
          <Text style={styles.subtitle}>
            Map view is available on mobile devices
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 20,
  },
  locationInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default WebMapComponent;