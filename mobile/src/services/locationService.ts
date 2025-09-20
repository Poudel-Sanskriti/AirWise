import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationWithDetails extends UserLocation {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
  coordinatesDisplay: string;
}

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        return false;
      }

      console.log('✅ Location permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      console.log('📍 Getting current location...');

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      console.log(`📍 Location found: ${userLocation.latitude}, ${userLocation.longitude}`);
      return userLocation;

    } catch (error) {
      console.error('❌ Error getting location:', error);
      return null;
    }
  }

  async getCurrentLocationWithDetails(): Promise<LocationWithDetails | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        return null;
      }

      console.log('🔍 Getting location details...');

      // Get reverse geocoding (address from coordinates)
      const addressResults = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const address = addressResults[0];

      const locationWithDetails: LocationWithDetails = {
        ...location,
        address: address?.name || address?.street,
        city: address?.city,
        region: address?.region,
        country: address?.country,
        postalCode: address?.postalCode,
        formattedAddress: this.formatAddress(address),
        coordinatesDisplay: this.formatCoordinates(location.latitude, location.longitude),
      };

      console.log('✅ Location details:', locationWithDetails.formattedAddress);
      return locationWithDetails;

    } catch (error) {
      console.error('❌ Error getting location details:', error);

      // Fallback: return location without address details
      const location = await this.getCurrentLocation();
      if (location) {
        return {
          ...location,
          formattedAddress: 'Current Location',
          coordinatesDisplay: this.formatCoordinates(location.latitude, location.longitude),
        };
      }

      return null;
    }
  }

  private formatAddress(address: Location.LocationGeocodedAddress | undefined): string {
    if (!address) {
      return 'Unknown Location';
    }

    const parts = [];

    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (parts.length === 0 && address.name) parts.push(address.name);

    return parts.length > 0 ? parts.join(', ') : 'Current Location';
  }

  private formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';

    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }

  // Fallback coordinates (Houston) if GPS fails
  getFallbackLocation(): LocationWithDetails {
    return {
      latitude: 29.7604,
      longitude: -95.3698,
      timestamp: Date.now(),
      formattedAddress: 'Houston, TX',
      coordinatesDisplay: '29.7604°N, 95.3698°W',
      city: 'Houston',
      region: 'TX',
      country: 'US',
    };
  }
}

export default new LocationService();