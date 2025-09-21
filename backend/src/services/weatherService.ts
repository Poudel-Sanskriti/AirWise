import axios from 'axios';

// OpenWeatherMap API response interfaces
export interface OpenWeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Our processed weather data format
export interface ProcessedWeatherData {
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number; // Fahrenheit
    feelsLike: number;
    humidity: number; // Percentage
    pressure: number; // hPa
    visibility: number; // Miles
    uvIndex?: number;
  };
  wind: {
    speed: number; // mph
    direction: number; // degrees
    directionText: string; // "NW", "SE", etc.
    gust?: number;
  };
  conditions: {
    main: string; // "Clear", "Clouds", "Rain", etc.
    description: string;
    icon: string;
    cloudCover: number; // Percentage
  };
  sun: {
    sunrise: string; // ISO timestamp
    sunset: string; // ISO timestamp
  };
  timestamp: string;
}

class WeatherService {
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<ProcessedWeatherData> {
    try {
      // Get API key fresh from environment each time it's used
      const apiKey = process.env.OPENWEATHER_API_KEY;

      // If the API key is not configured, use mock data
      if (!apiKey || apiKey === 'test_key_for_development') {
        console.log('⚠️ Using mock weather data because no valid OpenWeather API key is configured');
        return this.getMockWeatherData(latitude, longitude);
      }

      console.log(`🌤️ Fetching weather for coordinates: ${latitude}, ${longitude}`);

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: latitude.toFixed(6),
          lon: longitude.toFixed(6),
          appid: apiKey,
          units: 'imperial' // Fahrenheit
        },
        timeout: 10000
      });

      const data: OpenWeatherResponse = response.data;
      console.log(`✅ Received weather data for ${data.name}, ${data.sys.country}`);

      return this.processWeatherData(data);

    } catch (error) {
      console.error('❌ OpenWeather API error:', error);
      console.log('🌤️ Falling back to mock weather data');
      return this.getMockWeatherData(latitude, longitude);
    }
  }

  private processWeatherData(data: OpenWeatherResponse): ProcessedWeatherData {
    return {
      location: {
        city: data.name,
        country: data.sys.country,
        latitude: data.coord.lat,
        longitude: data.coord.lon
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility * 0.000621371) // Convert meters to miles
      },
      wind: {
        speed: Math.round(data.wind.speed * 2.237), // Convert m/s to mph
        direction: data.wind.deg,
        directionText: this.getWindDirection(data.wind.deg),
        gust: data.wind.gust ? Math.round(data.wind.gust * 2.237) : undefined
      },
      conditions: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        cloudCover: data.clouds.all
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString()
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

  private getMockWeatherData(lat: number, lon: number): ProcessedWeatherData {
    // Generate realistic weather data for Houston area
    const temperature = Math.round(Math.random() * 30) + 65; // 65-95°F
    const humidity = Math.round(Math.random() * 40) + 40; // 40-80%
    const windSpeed = Math.round(Math.random() * 15) + 5; // 5-20 mph
    const windDirection = Math.round(Math.random() * 360);

    const conditions = ['Clear', 'Clouds', 'Rain'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

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
        visibility: Math.round(Math.random() * 5) + 5 // 5-10 miles
      },
      wind: {
        speed: windSpeed,
        direction: windDirection,
        directionText: this.getWindDirection(windDirection)
      },
      conditions: {
        main: randomCondition,
        description: randomCondition.toLowerCase(),
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

  // Get UV Index (requires separate API call)
  async getUVIndex(latitude: number, longitude: number): Promise<number | null> {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey || apiKey === 'test_key_for_development') {
        return Math.round(Math.random() * 10) + 1; // Mock UV index 1-11
      }

      const response = await axios.get(`${this.baseUrl}/uvi`, {
        params: {
          lat: latitude.toFixed(6),
          lon: longitude.toFixed(6),
          appid: apiKey
        },
        timeout: 5000
      });

      return Math.round(response.data.value);
    } catch (error) {
      console.error('❌ UV Index API error:', error);
      return Math.round(Math.random() * 10) + 1; // Fallback mock UV index
    }
  }
}

export default new WeatherService();