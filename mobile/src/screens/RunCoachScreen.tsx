import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RunCoachScreen = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Places', 'Profile'];

  const runRecommendations = {
    direction: {
      title: 'Best Direction: Northwest',
      description: 'Lower traffic density and better air circulation'
    },
    time: {
      title: 'Optimal Time: 6:00 - 8:00 AM',
      description: 'Cooler temps and improved air quality expected'
    },
    duration: {
      title: 'Suggested Duration: 25-30 minutes',
      description: 'Moderate intensity recommended due to current conditions'
    }
  };

  const timeForecasts = [
    { time: 'Now', status: 'Caution', color: '#FF8C00' },
    { time: '6 PM', status: 'Good', color: '#4CAF50' },
    { time: 'Tomorrow', status: 'Good', color: '#4CAF50' }
  ];

  const renderTabContent = () => {
    if (activeTab === 'Overview') {
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* Smart Run Coach Card */}
          <View style={styles.runCoachCard}>
            <View style={styles.runCoachHeader}>
              <Ionicons name="walk" size={24} color="white" />
              <Text style={styles.runCoachTitle}>Smart Run Coach</Text>
            </View>

            {/* Direction Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                {runRecommendations.direction.title}
              </Text>
              <Text style={styles.recommendationDescription}>
                {runRecommendations.direction.description}
              </Text>
            </View>

            {/* Time Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                {runRecommendations.time.title}
              </Text>
              <Text style={styles.recommendationDescription}>
                {runRecommendations.time.description}
              </Text>
            </View>

            {/* Duration Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>
                {runRecommendations.duration.title}
              </Text>
              <Text style={styles.recommendationDescription}>
                {runRecommendations.duration.description}
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

    // Placeholder content for Places and Profile tabs
    return (
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderText}>{activeTab} Content</Text>
        <Text style={styles.placeholderSubtext}>Coming Soon</Text>
      </View>
    );
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
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default RunCoachScreen;