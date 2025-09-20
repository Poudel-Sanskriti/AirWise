import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AirQualityApiService from '../services/airQualityApi';
import LocationService from '../services/locationService';

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

interface SavedPlacesScreenProps {
  navigation: any;
  route: any;
}

interface PlaceOption {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PLACE_OPTIONS: PlaceOption[] = [
  { name: 'Home', icon: 'home' },
  { name: 'Work', icon: 'business' },
  { name: 'School', icon: 'school' },
  { name: 'Gym', icon: 'fitness' },
  { name: 'Custom', icon: 'location' },
];

const SavedPlacesScreen: React.FC<SavedPlacesScreenProps> = ({ navigation, route }) => {
  const [savedPlaces, setSavedPlaces] = React.useState<SavedPlace[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [loadingPlaceId, setLoadingPlaceId] = React.useState<string | null>(null);

  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);

  // Add Place Modal state
  const [showAddPlaceModal, setShowAddPlaceModal] = React.useState(false);
  const [selectedPlaceOption, setSelectedPlaceOption] = React.useState<PlaceOption>(PLACE_OPTIONS[0]);
  const [customPlaceName, setCustomPlaceName] = React.useState('');
  const [isAddingPlace, setIsAddingPlace] = React.useState(false);

  React.useEffect(() => {
    initializeWithCurrentLocation();
  }, []);

  const initializeWithCurrentLocation = async () => {
    if (isInitialized) return;

    try {
      console.log('📍 Initializing Saved Places with current location...');

      const location = await LocationService.getCurrentLocationWithDetails();

      if (location) {

        setUserLocation({ latitude: location.latitude, longitude: location.longitude });

        const currentLocationPlace: SavedPlace = {
          id: 'current-location',
          name: 'Current Location',
          icon: 'location',
          address: location.formattedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          currentStatus: 'moderate',
          outlook: 'stable',
        };

        setSavedPlaces([currentLocationPlace]);
        console.log('✅ Added current location as first saved place');

        // Get initial air quality data
        refreshPlaceAirQuality(currentLocationPlace);
      } else {
        console.log('📍 Using fallback location for saved places');
        const fallbackLocation = LocationService.getFallbackLocation();

        setUserLocation({ latitude: fallbackLocation.latitude, longitude: fallbackLocation.longitude });

        const fallbackPlace: SavedPlace = {
          id: 'fallback-location',
          name: 'Current Location',
          icon: 'location',
          address: fallbackLocation.formattedAddress,
          latitude: fallbackLocation.latitude,
          longitude: fallbackLocation.longitude,
          currentStatus: 'moderate',
          outlook: 'stable',
        };

        setSavedPlaces([fallbackPlace]);
        refreshPlaceAirQuality(fallbackPlace);
      }
    } catch (error) {
      console.error('❌ Error initializing saved places:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      good: '#4CAF50',
      moderate: '#FF9800',
      caution: '#FF8C00',
      unhealthy: '#FF5722',
    };
    return colors[status as keyof typeof colors] || '#999';
  };

  const getStatusText = (status: string) => {
    const texts = {
      good: 'Good',
      moderate: 'Moderate',
      caution: 'Caution',
      unhealthy: 'Unhealthy',
    };
    return texts[status as keyof typeof texts] || 'Unknown';
  };

  const getOutlookText = (outlook: string) => {
    const texts = {
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining',
    };
    return texts[outlook as keyof typeof texts] || 'Unknown';
  };

  const refreshPlaceAirQuality = async (place: SavedPlace) => {
    try {
      setLoadingPlaceId(place.id);
      console.log(`🔄 Refreshing air quality for ${place.name}...`);

      const airQualityData = await AirQualityApiService.getCurrentAirQuality(
        place.latitude,
        place.longitude
      );

      // Convert AQI to our status system
      const aqi = airQualityData.measurements.overall_aqi;
      let newStatus: SavedPlace['currentStatus'] = 'good';

      if (aqi <= 50) newStatus = 'good';
      else if (aqi <= 100) newStatus = 'moderate';
      else if (aqi <= 150) newStatus = 'caution';
      else newStatus = 'unhealthy';

      // Update the place with new data
      setSavedPlaces(prevPlaces =>
        prevPlaces.map(p =>
          p.id === place.id
            ? {
              ...p,
              currentStatus: newStatus,
              lastUpdated: new Date().toLocaleTimeString(),
            }
            : p
        )
      );

      console.log(`✅ Updated ${place.name}: AQI ${aqi} (${newStatus})`);

    } catch (error) {
      console.error(`❌ Failed to refresh ${place.name}:`, error);
    } finally {
      setLoadingPlaceId(null);
    }
  };

  const openAddPlaceModal = () => {
    setSelectedPlaceOption(PLACE_OPTIONS[0]);
    setCustomPlaceName('');
    setShowAddPlaceModal(true);
  };

  const closeAddPlaceModal = () => {
    setShowAddPlaceModal(false);
    setSelectedPlaceOption(PLACE_OPTIONS[0]);
    setCustomPlaceName('');
  };

  const confirmAddPlace = async () => {
    try {
      setIsAddingPlace(true);
      console.log('➕ Adding current location as new place...');

      const location = await LocationService.getCurrentLocationWithDetails();

      if (!location) {
        Alert.alert('Error', 'Could not get your current location. Please try again.');
        return;
      }

      // Determine the place name
      let placeName = selectedPlaceOption.name;
      let placeIcon = selectedPlaceOption.icon;

      if (selectedPlaceOption.name === 'Custom') {
        if (!customPlaceName.trim()) {
          Alert.alert('Error', 'Please enter a custom name for this place.');
          return;
        }
        placeName = customPlaceName.trim();
        placeIcon = 'location';
      }

      // Check if place name already exists
      const existingPlace = savedPlaces.find(p => p.name.toLowerCase() === placeName.toLowerCase());
      if (existingPlace) {
        Alert.alert('Error', `A place named "${placeName}" already exists.`);
        return;
      }

      // Generate unique ID
      const newId = `place-${Date.now()}`;

      const newPlace: SavedPlace = {
        id: newId,
        name: placeName,
        icon: placeIcon,
        address: location.formattedAddress,
        latitude: location.latitude,
        longitude: location.longitude,
        currentStatus: 'moderate',
        outlook: 'stable',
      };

      setSavedPlaces(prevPlaces => [...prevPlaces, newPlace]);
      console.log(`✅ Added new place: ${placeName} at ${location.formattedAddress}`);

      // Close modal and get air quality data
      closeAddPlaceModal();
      refreshPlaceAirQuality(newPlace);

    } catch (error) {
      console.error('❌ Error adding new place:', error);
      Alert.alert('Error', 'Failed to add place. Please try again.');
    } finally {
      setIsAddingPlace(false);
    }
  };

  const handlePlacePress = (place: SavedPlace) => {
    // Navigate to the Home screen with this place
    navigation.navigate('Home', { selectedPlace: place });
    refreshPlaceAirQuality(place);
  };

  const renderSavedPlace = (place: SavedPlace) => (
    <TouchableOpacity
      key={place.id}
      style={styles.placeCard}
      onPress={() => handlePlacePress(place)}
      activeOpacity={0.7}
    >
      <View style={styles.placeHeader}>
        <View style={styles.placeIconContainer}>
          <Ionicons
            name={place.icon}
            size={24}
            color="#666"
          />
        </View>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeAddress}>
            {place.address} • 6-hour outlook: {getOutlookText(place.outlook || 'stable')}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          {loadingPlaceId === place.id ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(place.currentStatus || 'good') }]}>
              <Text style={styles.statusText}>
                {getStatusText(place.currentStatus || 'good')}
              </Text>
            </View>
          )}
        </View>
      </View>
      {place.lastUpdated && (
        <Text style={styles.lastUpdatedText}>
          Updated: {place.lastUpdated}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {userLocation ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.04, // Controls zoom level
                longitudeDelta: 0.02, // Controls zoom level
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
        ) : (
          <View style={styles.mapContainer}>
            <ActivityIndicator size="large" color="#666" />
            <Text style={{ marginTop: 10, color: '#666' }}>Finding your location...</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Places</Text>
          <Text style={styles.headerSubtitle}>Tap any location for current air quality</Text>
        </View>

        <View style={styles.listContainer}>
          {savedPlaces.map(renderSavedPlace)}

          <TouchableOpacity
            style={styles.addPlaceButton}
            onPress={openAddPlaceModal}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.addPlaceText}>Save Current Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Place Modal */}
      <Modal
        visible={showAddPlaceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAddPlaceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save New Place</Text>
            <Text style={styles.modalSubtitle}>Choose a name for your current location</Text>

            <View style={styles.placeOptionsContainer}>
              {PLACE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  style={[
                    styles.placeOptionButton,
                    selectedPlaceOption.name === option.name && styles.selectedPlaceOption
                  ]}
                  onPress={() => setSelectedPlaceOption(option)}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={selectedPlaceOption.name === option.name ? '#4CAF50' : '#666'}
                  />
                  <Text
                    style={[
                      styles.placeOptionText,
                      selectedPlaceOption.name === option.name && styles.selectedPlaceOptionText
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPlaceOption.name === 'Custom' && (
              <TextInput
                style={styles.customNameInput}
                placeholder="Enter custom place name"
                value={customPlaceName}
                onChangeText={setCustomPlaceName}
                maxLength={30}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeAddPlaceModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, isAddingPlace && styles.disabledButton]}
                onPress={confirmAddPlace}
                disabled={isAddingPlace}
              >
                {isAddingPlace ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Save Place</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // --- ADDED/MODIFIED STYLES START HERE ---

  // 1. RENAMED: `content` was renamed to `contentContainer` for the main ScrollView.
  contentContainer: {
    flex: 1,
  },
  // 2. ADDED: A container for the map view.
  mapContainer: {
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  // 3. ADDED: The style for the MapView component itself.
  map: {
    ...StyleSheet.absoluteFillObject, // This makes the map fill its container
  },
  // 4. MODIFIED: The header no longer needs a background or border,
  // since the main view provides the background color.
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // 5. ADDED: A new container for the list of places below the header.
  listContainer: {
    paddingHorizontal: 20,
  },

  // --- ADDED/MODIFIED STYLES END HERE ---
  // (The rest of your styles from here were correct)

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  placeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  addPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addPlaceText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  placeOptionsContainer: {
    marginBottom: 20,
  },
  placeOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlaceOption: {
    backgroundColor: '#f0f9f0',
    borderColor: '#4CAF50',
  },
  placeOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  selectedPlaceOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  customNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default SavedPlacesScreen;