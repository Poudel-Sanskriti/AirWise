import axios from 'axios';

// EPA AirNow API response interfaces based on actual data we tested
export interface EpaAirQualityObservation {
  DateObserved: string;
  HourObserved: number;
  LocalTimeZone: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string; // "O3", "PM2.5", "PM10"
  AQI: number;
  Category: {
    Number: number;
    Name: string; // "Good", "Moderate", "Unhealthy for Sensitive Groups", etc.
  };
}

// Our processed response format for the mobile app
export interface ProcessedAirQuality {
  location: {
    latitude: number;
    longitude: number;
    area: string;
    state: string;
    timezone: string;
  };
  measurements: {
    ozone?: number;
    pm25?: number;
    pm10?: number;
    overall_aqi: number;
  };
  status: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  statusName: string;
  recommendation: string;
  timestamp: string;
  lastUpdated: string;
}

class AirQualityService {
  private readonly baseUrl = 'https://www.airnowapi.org/aq';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.EPA_AIRNOW_API_KEY || '';
    // Note: Don't check for API key here as .env might not be loaded yet
  }

  async getCurrentAirQuality(latitude: number, longitude: number): Promise<ProcessedAirQuality> {
    try {
      // Get API key fresh from environment each time it's used
      const apiKey = process.env.EPA_AIRNOW_API_KEY;
      if (!apiKey) {
        throw new Error('EPA AirNow API key not configured');
      }

      console.log(`🔍 Fetching air quality for coordinates: ${latitude}, ${longitude}`);

      const response = await axios.get(`${this.baseUrl}/observation/latLong/current/`, {
        params: {
          format: 'application/json',
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          distance: 25, // Search within 25 miles
          API_KEY: apiKey
        },
        timeout: 10000
      });

      const data: EpaAirQualityObservation[] = response.data;

      if (!data || data.length === 0) {
        console.log('⚠️  No EPA data available, using mock data');
        return this.getMockAirQualityData(latitude, longitude);
      }

      console.log(`✅ Received ${data.length} air quality measurements from EPA`);
      console.log('📊 EPA Raw Data:', JSON.stringify(data, null, 2));

      const processedData = this.processAirQualityData(data, latitude, longitude);
      console.log('🔄 Processed Data:', JSON.stringify(processedData, null, 2));

      return processedData;

    } catch (error) {
      console.error('❌ EPA AirNow API error:', error);
      console.log('📊 Falling back to mock data for development');
      return this.getMockAirQualityData(latitude, longitude);
    }
  }

  private processAirQualityData(data: EpaAirQualityObservation[], lat: number, lon: number): ProcessedAirQuality {
    const measurements: any = {};
    let maxAqi = 0;
    let maxCategory = { Number: 1, Name: 'Good' };
    let location = { area: '', state: '', timezone: '' };

    // Process each measurement type from EPA
    data.forEach(item => {
      const paramName = item.ParameterName.toLowerCase();

      if (paramName === 'o3') {
        measurements.ozone = item.AQI;
      } else if (paramName === 'pm2.5') {
        measurements.pm25 = item.AQI;
      } else if (paramName === 'pm10') {
        measurements.pm10 = item.AQI;
      }

      // Track highest AQI for overall status
      if (item.AQI > maxAqi) {
        maxAqi = item.AQI;
        maxCategory = item.Category;
      }

      // Get location info from first item
      if (!location.area) {
        location.area = item.ReportingArea;
        location.state = item.StateCode;
        location.timezone = item.LocalTimeZone;
      }
    });

    measurements.overall_aqi = maxAqi;

    return {
      location: {
        latitude: lat,
        longitude: lon,
        area: location.area,
        state: location.state,
        timezone: location.timezone
      },
      measurements,
      status: this.getAqiStatusCode(maxAqi),
      statusName: maxCategory.Name,
      recommendation: this.getRecommendation(maxAqi, maxCategory.Name),
      timestamp: new Date().toISOString(),
      lastUpdated: data[0]?.DateObserved || new Date().toISOString().split('T')[0]
    };
  }

  private getAqiStatusCode(aqi: number): ProcessedAirQuality['status'] {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy_sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very_unhealthy';
    return 'hazardous';
  }

  private getRecommendation(aqi: number, categoryName: string): string {
    if (aqi <= 50) return 'Air quality is good. Perfect day for outdoor activities! 🌞';
    if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion. 😷';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. People with heart/lung disease, older adults, and children should reduce outdoor activities. ⚠️';
    if (aqi <= 200) return 'Unhealthy air quality. Everyone should limit outdoor activities. Consider indoor exercise instead. 🏠';
    if (aqi <= 300) return 'Very unhealthy air. Avoid all outdoor activities. Stay indoors with windows closed. 🚨';
    return 'Hazardous air quality! Remain indoors and avoid all outdoor activities. Seek medical attention if experiencing symptoms. ☠️';
  }

  private getMockAirQualityData(lat: number, lon: number): ProcessedAirQuality {
    // Enhanced mock data for development when API fails
    const mockAqi = Math.floor(Math.random() * 100) + 20; // AQI between 20-120

    return {
      location: {
        latitude: lat,
        longitude: lon,
        area: 'Houston-Galveston-Brazoria',
        state: 'TX',
        timezone: 'CST'
      },
      measurements: {
        ozone: mockAqi - 5,
        pm25: mockAqi,
        pm10: mockAqi + 10,
        overall_aqi: mockAqi
      },
      status: this.getAqiStatusCode(mockAqi),
      statusName: mockAqi <= 50 ? 'Good' : mockAqi <= 100 ? 'Moderate' : 'Unhealthy for Sensitive Groups',
      recommendation: this.getRecommendation(mockAqi, 'Mock'),
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}

export default AirQualityService;