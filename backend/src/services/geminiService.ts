import { GoogleGenerativeAI } from '@google/generative-ai';

interface UserProfile {
  healthConditions: string[];
  ageGroup: 'child' | 'adult' | 'senior';
  fitnessLevel: 'low' | 'moderate' | 'high';
  outdoorActivities: string[];
  sensitivities: string[];
}

interface EnvironmentalData {
  currentAQI: number;
  pm25: number;
  pm10: number;
  ozone: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex?: number;
  pollenCount?: number;
  location: string;
  visibility?: number;
  cloudCover?: number;
  weatherCondition?: string;
  feelsLike?: number;
}

interface RunRecommendation {
  recommendation: string;
  safetyLevel: 'safe' | 'caution' | 'avoid';
  suggestedDuration: string;
  bestTime: string;
  precautions: string[];
  alternativeActivities?: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔍 Debug - GEMINI_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. AI features will be disabled.');
      this.initialized = true;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.initialized = true;
    console.log('✅ Gemini AI service initialized');
  }

  async generateRunRecommendation(
    environmentalData: EnvironmentalData,
    userProfile: UserProfile,
    userHistory?: any[]
  ): Promise<RunRecommendation> {
    this.initialize();

    if (!this.model) {
      return this.getFallbackRecommendation(environmentalData);
    }

    try {
      const prompt = this.buildRunCoachPrompt(environmentalData, userProfile, userHistory);

      console.log('🤖 Generating AI recommendation...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text, environmentalData);
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      return this.getFallbackRecommendation(environmentalData);
    }
  }

  private buildRunCoachPrompt(
    env: EnvironmentalData,
    profile: UserProfile,
    history?: any[]
  ): string {
    return `
As an expert air quality and fitness coach, provide personalized running recommendations based on:

CURRENT CONDITIONS:
- Location: ${env.location}
- Air Quality Index: ${env.currentAQI}
- PM2.5: ${env.pm25} µg/m³
- PM10: ${env.pm10} µg/m³
- Ozone: ${env.ozone} µg/m³
- Temperature: ${env.temperature}°F (Feels like: ${env.feelsLike || env.temperature}°F)
- Humidity: ${env.humidity}%
- Wind: ${env.windSpeed} mph ${env.windDirection}
- Weather: ${env.weatherCondition || 'Clear'}
${env.visibility ? `- Visibility: ${env.visibility} miles` : ''}
${env.cloudCover ? `- Cloud Cover: ${env.cloudCover}%` : ''}
${env.uvIndex ? `- UV Index: ${env.uvIndex}` : ''}
${env.pollenCount ? `- Pollen Count: ${env.pollenCount}` : ''}

USER PROFILE:
- Age Group: ${profile.ageGroup}
- Health Conditions: ${profile.healthConditions.join(', ') || 'None'}
- Fitness Level: ${profile.fitnessLevel}
- Preferred Activities: ${profile.outdoorActivities.join(', ')}
- Sensitivities: ${profile.sensitivities.join(', ') || 'None'}

${history && history.length > 0 ? `
RECENT ACTIVITY HISTORY:
${history.map(h => `- ${h.date}: ${h.activity} for ${h.duration} minutes (AQI: ${h.aqi})`).join('\n')}
` : ''}

Please provide:
1. SAFETY_LEVEL: safe, caution, or avoid
2. RECOMMENDATION: 2-3 sentence personalized advice
3. DURATION: Suggested workout duration (e.g., "20-30 minutes")
4. BEST_TIME: Optimal time window today (e.g., "6-8 AM")
5. PRECAUTIONS: List of 2-3 specific precautions
6. ALTERNATIVES: Indoor alternatives if outdoor is not recommended

Format your response as JSON:
{
  "safetyLevel": "safe|caution|avoid",
  "recommendation": "personalized advice...",
  "suggestedDuration": "duration",
  "bestTime": "time window",
  "precautions": ["precaution1", "precaution2"],
  "alternativeActivities": ["alternative1", "alternative2"]
}
`;
  }

  private parseAIResponse(text: string, env: EnvironmentalData): RunRecommendation {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendation: parsed.recommendation,
          safetyLevel: parsed.safetyLevel || this.determineSafetyLevel(env.currentAQI),
          suggestedDuration: parsed.suggestedDuration || '20-30 minutes',
          bestTime: parsed.bestTime || 'Early morning or evening',
          precautions: parsed.precautions || [],
          alternativeActivities: parsed.alternativeActivities || []
        };
      }

      // Fallback: parse unstructured response
      return {
        recommendation: text.slice(0, 200) + '...',
        safetyLevel: this.determineSafetyLevel(env.currentAQI),
        suggestedDuration: '20-30 minutes',
        bestTime: 'Early morning or evening',
        precautions: ['Monitor air quality', 'Stay hydrated'],
        alternativeActivities: ['Indoor yoga', 'Strength training']
      };
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      return this.getFallbackRecommendation(env);
    }
  }

  private getFallbackRecommendation(env: EnvironmentalData): RunRecommendation {
    const safetyLevel = this.determineSafetyLevel(env.currentAQI);

    const recommendations = {
      safe: {
        recommendation: `Air quality is good (AQI ${env.currentAQI}). Great conditions for outdoor running! The air is clean and safe for extended exercise.`,
        suggestedDuration: '30-60 minutes',
        precautions: ['Stay hydrated', 'Warm up properly']
      },
      caution: {
        recommendation: `Moderate air quality (AQI ${env.currentAQI}). Outdoor exercise is acceptable for most people, but sensitive individuals should consider reducing intensity.`,
        suggestedDuration: '20-40 minutes',
        precautions: ['Reduce intensity if you feel uncomfortable', 'Take breaks as needed', 'Avoid heavy traffic areas']
      },
      avoid: {
        recommendation: `Poor air quality (AQI ${env.currentAQI}). Outdoor exercise is not recommended. Consider indoor alternatives to protect your respiratory health.`,
        suggestedDuration: '0 minutes outdoor',
        precautions: ['Stay indoors', 'Use air purifier if available', 'Postpone outdoor activities']
      }
    };

    const rec = recommendations[safetyLevel];

    return {
      recommendation: rec.recommendation,
      safetyLevel,
      suggestedDuration: rec.suggestedDuration,
      bestTime: safetyLevel === 'avoid' ? 'Not recommended today' : 'Early morning (6-8 AM)',
      precautions: rec.precautions,
      alternativeActivities: safetyLevel === 'avoid'
        ? ['Indoor treadmill', 'Yoga', 'Strength training', 'Stationary bike']
        : []
    };
  }

  private determineSafetyLevel(aqi: number): 'safe' | 'caution' | 'avoid' {
    if (aqi <= 50) return 'safe';
    if (aqi <= 100) return 'caution';
    return 'avoid';
  }

  async generateHealthInsights(
    environmentalData: EnvironmentalData,
    userProfile: UserProfile
  ): Promise<string[]> {
    this.initialize();

    if (!this.model) {
      return this.getFallbackInsights(environmentalData, userProfile);
    }

    try {
      const prompt = `
Based on current air quality (AQI: ${environmentalData.currentAQI}) and user health profile:
- Health conditions: ${userProfile.healthConditions.join(', ') || 'None'}
- Age group: ${userProfile.ageGroup}
- Sensitivities: ${userProfile.sensitivities.join(', ') || 'None'}

Provide 3-4 brief, actionable health insights as a JSON array of strings.
Focus on: respiratory health, exposure prevention, and wellness tips.

Example format: ["Insight 1", "Insight 2", "Insight 3"]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackInsights(environmentalData, userProfile);
    } catch (error) {
      console.error('❌ Error generating health insights:', error);
      return this.getFallbackInsights(environmentalData, userProfile);
    }
  }

  private getFallbackInsights(env: EnvironmentalData, profile: UserProfile): string[] {
    const insights = [];

    if (env.currentAQI > 100) {
      insights.push('Consider staying indoors during peak pollution hours (usually mid-day)');
    }

    if (profile.healthConditions.includes('asthma')) {
      insights.push('Keep your rescue inhaler nearby when air quality is moderate or poor');
    }

    if (profile.ageGroup === 'senior' || profile.ageGroup === 'child') {
      insights.push('You may be more sensitive to air pollution - take extra precautions');
    }

    insights.push('Indoor plants like spider plants and peace lilies can help improve indoor air quality');

    return insights;
  }
}

export default new GeminiService();