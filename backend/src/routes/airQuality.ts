import { Router, Request, Response } from 'express';
import airQualityService from '../services/airQualityService';

const router = Router();

// GET /api/air-quality/current?lat=29.7604&lon=-95.3698
router.get('/current', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    // Validate required parameters
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both lat and lon query parameters are required',
        example: '/api/air-quality/current?lat=29.7604&lon=-95.3698'
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    // Validate coordinate ranges
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'lat and lon must be valid numbers'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Coordinates out of range',
        message: 'lat must be between -90 and 90, lon must be between -180 and 180'
      });
    }

    console.log(`🌍 Air quality request for: ${latitude}, ${longitude}`);

    // Fetch air quality data
    const airQualityData = await airQualityService.getCurrentAirQuality(latitude, longitude);

    // Success response
    res.json({
      success: true,
      data: airQualityData,
      source: 'EPA AirNow API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Air quality API error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch air quality data',
      message: 'Please try again later or check your coordinates',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/air-quality/health - Health check for air quality service
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test with Houston coordinates
    const testData = await airQualityService.getCurrentAirQuality(29.7604, -95.3698);

    res.json({
      status: 'OK',
      service: 'Air Quality API',
      epa_api_configured: !!process.env.EPA_AIRNOW_API_KEY,
      test_location: 'Houston, TX',
      test_result: {
        aqi: testData.measurements.overall_aqi,
        status: testData.status,
        area: testData.location.area
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      service: 'Air Quality API',
      error: 'Service health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;