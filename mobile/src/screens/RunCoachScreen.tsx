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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecommendationsApi from '../services/recommendationsApi';
import LocationService from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';

interface RunRecommendation {
  recommendation: string;
  safetyLevel: 'safe' | 'caution' | 'avoid';
  suggestedDuration: string;
  bestTime: string;
  precautions: string[];
  alternativeActivities?: string[];
}

const RunCoachScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [aiRecommendation, setAiRecommendation] = useState<RunRecommendation | null>(null);
  const [healthInsights, setHealthInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ['Overview'];

  useEffect(() => {
    loadAIRecommendations();
  }, [user?.healthProfile]); // Reload when health profile changes

  const loadAIRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🤖 Loading AI recommendations...');

      // Get current location
      let location = await LocationService.getCurrentLocationWithDetails();
      if (!location) {
        location = LocationService.getFallbackLocation();
      }

      // Get real user profile data or use defaults
      const userProfile = {
        healthConditions: user?.healthProfile?.conditions || ['none'],
        ageGroup: user?.healthProfile?.ageGroup || 'adult',
        fitnessLevel: user?.healthProfile?.lifestyle?.includes('athlete') ? 'high'
                     : user?.healthProfile?.lifestyle?.includes('regular_exercise') ? 'moderate'
                     : 'low',
        outdoorActivities: ['running', 'cycling'], // Could be extended based on lifestyle
        sensitivities: user?.healthProfile?.sensitivities || []
      };

      console.log('👤 Using personalized user profile:', userProfile);

      // Get AI recommendation
      const recommendation = await RecommendationsApi.getRunRecommendation(
        location.latitude,
        location.longitude,
        userProfile
      );

      // Get health insights
      const insights = await RecommendationsApi.getHealthInsights(
        location.latitude,
        location.longitude,
        userProfile
      );

      setAiRecommendation(recommendation);
      setHealthInsights(insights);

      console.log('✅ AI recommendations loaded:', recommendation.safetyLevel);

    } catch (err) {
      console.error('❌ Error loading AI recommendations:', err);
      setError('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const timeForecasts = [
    { time: 'Now', status: 'Caution', color: '#FF8C00' },
    { time: '6 PM', status: 'Good', color: '#4CAF50' },
    { time: 'Tomorrow', status: 'Good', color: '#4CAF50' }
  ];

  const renderTabContent = () => {
    if (activeTab === 'Overview') {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading AI recommendations...</Text>
          </View>
        );
      }

      if (error) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAIRecommendations}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* AI-Powered Smart Run Coach Card */}
          <View style={styles.runCoachCard}>
            <View style={styles.runCoachHeader}>
              <Ionicons name="walk" size={24} color="white" />
              <Text style={styles.runCoachTitle}>AI Smart Run Coach</Text>
            </View>

            {/* AI Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                🤖 AI Recommendation
              </Text>
              <Text style={styles.recommendationDescription}>
                {aiRecommendation?.recommendation || 'Loading AI recommendation...'}
              </Text>
            </View>

            {/* Safety & Duration */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                Safety: {aiRecommendation?.safetyLevel.toUpperCase() || 'Loading...'}
              </Text>
              <Text style={styles.recommendationDescription}>
                Duration: {aiRecommendation?.suggestedDuration || 'Loading...'}
              </Text>
            </View>

            {/* Best Time */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                Best Time: {aiRecommendation?.bestTime || 'Loading...'}
              </Text>
              <Text style={styles.recommendationDescription}>
                {aiRecommendation?.precautions[0] || 'Loading precautions...'}
              </Text>
            </View>
          </View>

          {/* Time-based Forecast */}
          <View style={styles.forecastContainer}>
            {timeForecasts.map((forecast, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastTime}>{forecast.time}</Text>
                <Text style={[styles.forecastStatus, { color: forecast.color }]}>
                  {forecast.status}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }

    // Since we only have Overview tab, this shouldn't be reached
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    margin: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  runCoachCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  runCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  runCoachTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  forecastContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  forecastStatus: {
    fontSize: 14,
    fontWeight: 'bold',
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
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RunCoachScreen;