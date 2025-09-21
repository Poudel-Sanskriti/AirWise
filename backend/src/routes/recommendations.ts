import express from 'express';
import GeminiService from '../services/geminiService';
import airQualityService from '../services/airQualityService';
import weatherService from '../services/weatherService';

const router = express.Router();

// Get AI-powered run recommendations
router.post('/run-coach', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      userProfile = {
        healthConditions: [],
        ageGroup: 'adult',
        fitnessLevel: 'moderate',
        outdoorActivities: ['running'],
        sensitivities: []
      },
      userHistory = []
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    console.log(`🏃 Generating run recommendation for ${latitude}, ${longitude}`);

    // Get current air quality and weather data in parallel
    const [airQualityData, weatherData] = await Promise.all([
      airQualityService.getCurrentAirQuality(latitude, longitude),
      weatherService.getCurrentWeather(latitude, longitude)
    ]);

    // Get UV Index if available
    const uvIndex = await weatherService.getUVIndex(latitude, longitude);

    // Prepare environmental data for Gemini with real weather data
    const environmentalData = {
      currentAQI: airQualityData.measurements.overall_aqi,
      pm25: airQualityData.measurements.pm25 || 0,
      pm10: airQualityData.measurements.pm10 || 0,
      ozone: airQualityData.measurements.ozone || 0,
      temperature: weatherData.current.temperature,
      feelsLike: weatherData.current.feelsLike,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.directionText,
      weatherCondition: weatherData.conditions.description,
      visibility: weatherData.current.visibility,
      cloudCover: weatherData.conditions.cloudCover,
      uvIndex: uvIndex || weatherData.current.uvIndex,
      location: `${airQualityData.location.area}, ${airQualityData.location.state}`
    };

    // Generate AI recommendation
    const recommendation = await GeminiService.generateRunRecommendation(
      environmentalData,
      userProfile,
      userHistory
    );

    // Generate additional health insights
    const healthInsights = await GeminiService.generateHealthInsights(
      environmentalData,
      userProfile
    );

    res.json({
      success: true,
      data: {
        recommendation,
        healthInsights,
        environmentalData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating run recommendation:', error);
    res.status(500).json({
      error: 'Failed to generate run recommendation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get general health insights based on current conditions
router.post('/health-insights', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      userProfile = {
        healthConditions: [],
        ageGroup: 'adult',
        fitnessLevel: 'moderate',
        outdoorActivities: [],
        sensitivities: []
      }
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    console.log(`💡 Generating health insights for ${latitude}, ${longitude}`);

    // Get current air quality data
    const airQualityData = await airQualityService.getCurrentAirQuality(latitude, longitude);

    // Prepare environmental data
    const environmentalData = {
      currentAQI: airQualityData.measurements.overall_aqi,
      pm25: airQualityData.measurements.pm25 || 0,
      pm10: airQualityData.measurements.pm10 || 0,
      ozone: airQualityData.measurements.ozone || 0,
      temperature: 75,
      humidity: 60,
      windSpeed: 5,
      windDirection: 'NW',
      location: `${airQualityData.location.area}, ${airQualityData.location.state}`
    };

    // Generate health insights
    const insights = await GeminiService.generateHealthInsights(
      environmentalData,
      userProfile
    );

    res.json({
      success: true,
      data: {
        insights,
        environmentalData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating health insights:', error);
    res.status(500).json({
      error: 'Failed to generate health insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;