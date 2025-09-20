import Constants from 'expo-constants';

interface UserProfile {
  healthConditions: string[];
  ageGroup: 'child' | 'adult' | 'senior';
  fitnessLevel: 'low' | 'moderate' | 'high';
  outdoorActivities: string[];
  sensitivities: string[];
}

interface RunRecommendation {
  recommendation: string;
  safetyLevel: 'safe' | 'caution' | 'avoid';
  suggestedDuration: string;
  bestTime: string;
  precautions: string[];
  alternativeActivities?: string[];
}

interface RecommendationResponse {
  success: boolean;
  data: {
    recommendation: RunRecommendation;
    healthInsights: string[];
    environmentalData: any;
    timestamp: string;
  };
}

class RecommendationsApiService {
  private baseUrl: string;

  constructor() {
    // Use Expo's automatic IP detection for development
    const expoUrl = Constants.expoConfig?.hostUri;
    if (expoUrl) {
      const ip = expoUrl.split(':')[0];
      this.baseUrl = `http://${ip}:3001/api/recommendations`;
    } else {
      this.baseUrl = 'http://localhost:3001/api/recommendations';
    }

    console.log('🤖 Recommendations API service initialized:', this.baseUrl);
  }

  async getRunRecommendation(
    latitude: number,
    longitude: number,
    userProfile?: Partial<UserProfile>,
    userHistory?: any[]
  ): Promise<RunRecommendation> {
    try {
      console.log(`🏃 Fetching AI run recommendation for ${latitude}, ${longitude}`);

      const defaultProfile: UserProfile = {
        healthConditions: [],
        ageGroup: 'adult',
        fitnessLevel: 'moderate',
        outdoorActivities: ['running'],
        sensitivities: []
      };

      const response = await fetch(`${this.baseUrl}/run-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          userProfile: { ...defaultProfile, ...userProfile },
          userHistory: userHistory || []
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to get recommendation from API');
      }

      console.log('✅ AI recommendation received:', data.data.recommendation.safetyLevel);
      return data.data.recommendation;

    } catch (error) {
      console.error('❌ Error fetching run recommendation:', error);

      // Return fallback recommendation based on simple AQI rules
      return this.getFallbackRecommendation();
    }
  }

  async getHealthInsights(
    latitude: number,
    longitude: number,
    userProfile?: Partial<UserProfile>
  ): Promise<string[]> {
    try {
      console.log(`💡 Fetching health insights for ${latitude}, ${longitude}`);

      const defaultProfile: UserProfile = {
        healthConditions: [],
        ageGroup: 'adult',
        fitnessLevel: 'moderate',
        outdoorActivities: [],
        sensitivities: []
      };

      const response = await fetch(`${this.baseUrl}/health-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          userProfile: { ...defaultProfile, ...userProfile }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to get insights from API');
      }

      console.log('✅ Health insights received');
      return data.data.insights;

    } catch (error) {
      console.error('❌ Error fetching health insights:', error);

      // Return fallback insights
      return [
        'Stay hydrated during outdoor activities',
        'Monitor air quality before exercising outdoors',
        'Consider indoor alternatives when air quality is poor',
        'Keep windows closed during high pollution periods'
      ];
    }
  }

  private getFallbackRecommendation(): RunRecommendation {
    return {
      recommendation: 'Unable to get AI recommendation. Check air quality manually and exercise with caution.',
      safetyLevel: 'caution',
      suggestedDuration: '20-30 minutes',
      bestTime: 'Early morning or evening',
      precautions: ['Check current air quality', 'Stay hydrated', 'Listen to your body'],
      alternativeActivities: ['Indoor yoga', 'Strength training']
    };
  }
}

export default new RecommendationsApiService();