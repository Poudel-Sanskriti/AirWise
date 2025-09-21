// Air Quality API service for mobile app
import Constants from 'expo-constants';

// Automatically detect the development server IP from Expo
const getApiBaseUrl = () => {
  if (__DEV__) {
    // In development, use Expo's detected IP
    const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
    return expoHost ? `http://${expoHost}:3001/api` : 'http://localhost:3001/api';
  } else {
    // In production, use your deployed API
    return 'https://your-production-api.com/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface AirQualityData {
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

export interface WeatherData {
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uvIndex?: number;
  };
  wind: {
    speed: number;
    direction: number;
    directionText: string;
    gust?: number;
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
    cloudCover: number;
  };
  sun: {
    sunrise: string;
    sunset: string;
  };
  timestamp: string;
}

export interface CombinedData {
  airQuality: AirQualityData;
  weather: WeatherData;
}

export interface ApiResponse {
  success: boolean;
  data: CombinedData;
  sources: {
    airQuality: string;
    weather: string;
  };
  timestamp: string;
}

class AirQualityApiService {
  async getCurrentAirQuality(latitude: number, longitude: number): Promise<AirQualityData> {
    const combined = await this.getCurrentAirQualityAndWeather(latitude, longitude);
    return combined.airQuality;
  }

  async getCurrentAirQualityAndWeather(latitude: number, longitude: number): Promise<CombinedData> {
    try {
      console.log(`📱 Fetching air quality for: ${latitude}, ${longitude}`);
      console.log(`📱 Using API URL: ${API_BASE_URL}`);

      const requestUrl = `${API_BASE_URL}/air-quality/current?lat=${latitude}&lon=${longitude}`;
      console.log(`📱 Making request to: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log(`📱 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`📱 Error response body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log(`📱 Raw API Response:`, JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error('API returned error response');
      }

      console.log(`✅ Received air quality data from ${result.sources.airQuality}`);
      console.log(`✅ Received weather data from ${result.sources.weather}`);
      console.log(`📱 Final processed data:`, JSON.stringify(result.data, null, 2));

      return result.data;

    } catch (error) {
      console.error('❌ Mobile API error:', error);

      // Return fallback mock data if API fails
      console.log('📱 Using fallback mock data');
      return {
        airQuality: this.getFallbackMockData(latitude, longitude),
        weather: this.getFallbackWeatherData(latitude, longitude)
      };
    }
  }

  async testApiConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/air-quality/health`);
      const result = await response.json();
      return result.status === 'OK';
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  private getFallbackMockData(lat: number, lon: number): AirQualityData {
    // Enhanced fallback data for when backend is unavailable
    const mockAqi = Math.floor(Math.random() * 100) + 30; // AQI between 30-130

    return {
      location: {
        latitude: lat,
        longitude: lon,
        area: 'Houston-Galveston-Brazoria',
        state: 'TX',
        timezone: 'CST'
      },
      measurements: {
        ozone: Math.max(20, mockAqi - 10),
        pm25: mockAqi,
        pm10: mockAqi + 15,
        overall_aqi: mockAqi
      },
      status: this.getStatusFromAqi(mockAqi),
      statusName: this.getStatusNameFromAqi(mockAqi),
      recommendation: this.getRecommendationFromAqi(mockAqi),
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  private getStatusFromAqi(aqi: number): AirQualityData['status'] {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy_sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very_unhealthy';
    return 'hazardous';
  }

  private getStatusNameFromAqi(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  private getRecommendationFromAqi(aqi: number): string {
    if (aqi <= 50) return 'Air quality is good. Perfect day for outdoor activities! 🌞';
    if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion. 😷';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. Reduce outdoor activities if you experience symptoms. ⚠️';
    if (aqi <= 200) return 'Unhealthy air quality. Everyone should limit outdoor activities. 🏠';
    if (aqi <= 300) return 'Very unhealthy air. Avoid all outdoor activities. 🚨';
    return 'Hazardous air quality! Stay indoors and avoid all outdoor activities. ☠️';
  }

  private getFallbackWeatherData(lat: number, lon: number): WeatherData {
    // Generate realistic weather data for fallback
    const temperature = Math.round(Math.random() * 30) + 65; // 65-95°F
    const humidity = Math.round(Math.random() * 40) + 40; // 40-80%
    const windSpeed = Math.round(Math.random() * 15) + 5; // 5-20 mph
    const windDirection = Math.round(Math.random() * 360);

    const conditions = ['Clear', 'Clouds', 'Rain'];
    const weatherCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      location: {
        city: 'Houston',
        country: 'US',
        latitude: lat,
        longitude: lon
      },
      current: {
        temperature,
        feelsLike: temperature + Math.round(Math.random() * 10) - 5,
        humidity,
        pressure: 1013 + Math.round(Math.random() * 20) - 10,
        visibility: Math.round(Math.random() * 5) + 5,
        uvIndex: Math.round(Math.random() * 10) + 1
      },
      wind: {
        speed: windSpeed,
        direction: windDirection,
        directionText: this.getWindDirection(windDirection)
      },
      conditions: {
        main: weatherCondition,
        description: weatherCondition.toLowerCase(),
        icon: '01d',
        cloudCover: Math.round(Math.random() * 100)
      },
      sun: {
        sunrise: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        sunset: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  private getWindDirection(degrees: number): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];

    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export default new AirQualityApiService();