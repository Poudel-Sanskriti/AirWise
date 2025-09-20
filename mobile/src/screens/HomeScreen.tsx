import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AirQualityApiService, { AirQualityData } from '../services/airQualityApi';
import LocationService, { LocationWithDetails } from '../services/locationService';

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

interface HomeScreenProps {
  selectedPlace?: SavedPlace | null;
  onClearSelectedPlace?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ selectedPlace, onClearSelectedPlace }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [userLocation, setUserLocation] = useState<LocationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlace) {
      loadSelectedPlaceAirQuality();
    } else {
      loadLocationAndAirQuality();
    }
  }, [selectedPlace]);

  const loadLocationAndAirQuality = async () => {
    try {
      setLoading(true);
      setLocationLoading(true);
      setError(null);

      console.log('📍 Starting location and air quality fetch...');

      // Get user's current location
      let location = await LocationService.getCurrentLocationWithDetails();

      if (!location) {
        console.log('📍 Using fallback location (Houston)');
        location = LocationService.getFallbackLocation();
      }

      setUserLocation(location);
      setLocationLoading(false);

      // Get air quality for the location
      const data = await AirQualityApiService.getCurrentAirQuality(
        location.latitude,
        location.longitude
      );

      setAirQualityData(data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Location/Air quality error:', err);

      // Use fallback location if everything fails
      const fallbackLocation = LocationService.getFallbackLocation();
      setUserLocation(fallbackLocation);
      setLocationLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPlaceAirQuality = async () => {
    if (!selectedPlace) return;

    try {
      setLoading(true);
      setLocationLoading(false);
      setError(null);

      console.log(`📍 Loading air quality for ${selectedPlace.name}...`);

      // Convert savedPlace to location format
      const location: LocationWithDetails = {
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        timestamp: Date.now(),
        formattedAddress: selectedPlace.address,
        coordinatesDisplay: `${selectedPlace.latitude.toFixed(4)}°${selectedPlace.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(selectedPlace.longitude).toFixed(4)}°${selectedPlace.longitude >= 0 ? 'E' : 'W'}`,
      };

      setUserLocation(location);

      // Get air quality for the selected place
      const data = await AirQualityApiService.getCurrentAirQuality(
        selectedPlace.latitude,
        selectedPlace.longitude
      );

      setAirQualityData(data);
    } catch (err) {
      setError('Failed to load data for selected place');
      console.error('Selected place air quality error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    if (selectedPlace) {
      await loadSelectedPlaceAirQuality();
    } else {
      await loadLocationAndAirQuality();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <View style={styles.header}>
          <Text style={styles.appTitle}>AirWise</Text>
          <Text style={styles.subtitle}>Your Lung Health Companion</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading air quality data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !airQualityData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <View style={styles.header}>
          <Text style={styles.appTitle}>AirWise</Text>
          <Text style={styles.subtitle}>Your Lung Health Companion</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#FF5722" />
          <Text style={styles.errorText}>{error || 'Unable to load data'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Convert API data to display format
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      good: { text: 'GOOD', color: '#4CAF50' },
      moderate: { text: 'MODERATE', color: '#FF9800' },
      unhealthy_sensitive: { text: 'CAUTION', color: '#FF8C00' },
      unhealthy: { text: 'UNHEALTHY', color: '#FF5722' },
      very_unhealthy: { text: 'VERY UNHEALTHY', color: '#9C27B0' },
      hazardous: { text: 'HAZARDOUS', color: '#8B0000' },
    };
    return statusMap[status] || { text: 'UNKNOWN', color: '#666' };
  };

  const getMetricColor = (value?: number) => {
    if (!value) return '#999';
    if (value <= 50) return '#4CAF50';
    if (value <= 100) return '#FF9800';
    if (value <= 150) return '#FF8C00';
    return '#FF5722';
  };

  const statusDisplay = getStatusDisplay(airQualityData.status);
  const locationText = selectedPlace ? selectedPlace.name : (userLocation?.formattedAddress || `${airQualityData.location.area}, ${airQualityData.location.state}`);
  const coordinatesText = userLocation?.coordinatesDisplay || '';
  const showBackButton = !!selectedPlace;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CAUTION':
        return <Ionicons name="warning" size={40} color="#FF8C00" />;
      case 'GOOD':
        return <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />;
      case 'UNHEALTHY':
        return <Ionicons name="alert-circle" size={40} color="#FF5722" />;
      default:
        return <Ionicons name="information-circle" size={40} color="#2196F3" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onClearSelectedPlace}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back to Current Location</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.appTitle}>AirWise</Text>
        <Text style={styles.subtitle}>
          {selectedPlace ? `Air Quality for ${selectedPlace.name}` : 'Your Lung Health Companion'}
        </Text>

        {/* Location Section */}
        <TouchableOpacity style={styles.locationContainer} onPress={refreshLocation}>
          <View style={styles.locationChip}>
            <Ionicons
              name={selectedPlace ? selectedPlace.icon : "location"}
              size={16}
              color="#FF5722"
            />
            <Text style={styles.locationText}>{locationText}</Text>
            {locationLoading && (
              <ActivityIndicator size="small" color="white" style={styles.locationSpinner} />
            )}
          </View>
          {coordinatesText && (
            <Text style={styles.coordinatesText}>{coordinatesText}</Text>
          )}
          {selectedPlace && (
            <Text style={styles.coordinatesText}>{selectedPlace.address}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Risk Card */}
        <View style={styles.riskCard}>
          <View style={styles.statusSection}>
            {getStatusIcon(statusDisplay.text)}
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>

          <Text style={styles.warningMessage}>
            {airQualityData.recommendation}
          </Text>
        </View>

        {/* Air Quality Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* PM2.5 */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>PM2.5</Text>
            <Text style={[styles.metricValue, { color: getMetricColor(airQualityData.measurements.pm25) }]}>
              {airQualityData.measurements.pm25 || '--'}
            </Text>
            <Text style={styles.metricUnit}>AQI</Text>
          </View>

          {/* PM10 */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>PM10</Text>
            <Text style={[styles.metricValue, { color: getMetricColor(airQualityData.measurements.pm10) }]}>
              {airQualityData.measurements.pm10 || '--'}
            </Text>
            <Text style={styles.metricUnit}>AQI</Text>
          </View>

          {/* Ozone */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>O₃</Text>
            <Text style={[styles.metricValue, { color: getMetricColor(airQualityData.measurements.ozone) }]}>
              {airQualityData.measurements.ozone || '--'}
            </Text>
            <Text style={styles.metricUnit}>AQI</Text>
          </View>

          {/* Overall AQI */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Overall</Text>
            <Text style={[styles.metricValue, { color: getMetricColor(airQualityData.measurements.overall_aqi) }]}>
              {airQualityData.measurements.overall_aqi}
            </Text>
            <Text style={styles.metricUnit}>AQI</Text>
          </View>
        </View>

        {/* Additional Info Grid */}
        <View style={styles.additionalGrid}>
          {/* Radon Risk */}
          <View style={styles.additionalCard}>
            <Text style={styles.additionalLabel}>Radon Risk</Text>
            <Text style={[styles.additionalValue, { color: '#4CAF50' }]}>
              Low
            </Text>
            <Text style={styles.additionalDetail}>
              Indoor
            </Text>
          </View>

          {/* Wildfire */}
          <View style={styles.additionalCard}>
            <Text style={styles.additionalLabel}>Wildfire</Text>
            <Text style={[styles.additionalValue, { color: '#4CAF50' }]}>
              None
            </Text>
            <Text style={styles.additionalDetail}>
              Detected
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
  },
  locationContainer: {
    alignItems: 'center',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  locationText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  locationSpinner: {
    marginLeft: 8,
  },
  coordinatesText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  riskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  warningMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    color: '#999',
  },
  additionalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  additionalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  additionalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  additionalDetail: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;