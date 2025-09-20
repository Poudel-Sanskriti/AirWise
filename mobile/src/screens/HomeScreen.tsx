import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  // Mock data - will be replaced with real API data
  const mockData = {
    location: 'Houston, TX',
    status: 'CAUTION',
    statusColor: '#FF8C00',
    warningMessage: 'Elevated PM2.5 levels detected due to nearby construction activity - consider indoor exercise today.',
    metrics: {
      pm25: { value: 35, unit: 'μg/m³', color: '#FF8C00' },
      pm10: { value: 42, unit: 'μg/m³', color: '#4CAF50' },
      ozone: { value: 65, unit: 'ppb', color: '#4CAF50' },
      no2: { value: 28, unit: 'ppb', color: '#4CAF50' },
    },
    additionalInfo: {
      radonRisk: { level: 'Low', detail: 'Indoor', color: '#4CAF50' },
      wildfire: { level: 'None', detail: 'Detected', color: '#4CAF50' },
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CAUTION':
        return <Ionicons name="warning" size={40} color="#FF8C00" />;
      case 'GOOD':
        return <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />;
      case 'UNHEALTHY':
        return <Ionicons name="alert-circle" size={40} color="#FF5722" />;
      default:
        return <Ionicons name="information-circle" size={40} color="#2196F3" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>AirWise</Text>
        <Text style={styles.subtitle}>Your Lung Health Companion</Text>

        {/* Location Chip */}
        <View style={styles.locationChip}>
          <Ionicons name="location" size={16} color="#FF5722" />
          <Text style={styles.locationText}>{mockData.location}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Risk Card */}
        <View style={styles.riskCard}>
          <View style={styles.statusSection}>
            {getStatusIcon(mockData.status)}
            <Text style={[styles.statusText, { color: mockData.statusColor }]}>
              {mockData.status}
            </Text>
          </View>

          <Text style={styles.warningMessage}>
            {mockData.warningMessage}
          </Text>
        </View>

        {/* Air Quality Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* PM2.5 */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>PM2.5</Text>
            <Text style={[styles.metricValue, { color: mockData.metrics.pm25.color }]}>
              {mockData.metrics.pm25.value}
            </Text>
            <Text style={styles.metricUnit}>{mockData.metrics.pm25.unit}</Text>
          </View>

          {/* PM10 */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>PM10</Text>
            <Text style={[styles.metricValue, { color: mockData.metrics.pm10.color }]}>
              {mockData.metrics.pm10.value}
            </Text>
            <Text style={styles.metricUnit}>{mockData.metrics.pm10.unit}</Text>
          </View>

          {/* Ozone */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>O₃</Text>
            <Text style={[styles.metricValue, { color: mockData.metrics.ozone.color }]}>
              {mockData.metrics.ozone.value}
            </Text>
            <Text style={styles.metricUnit}>{mockData.metrics.ozone.unit}</Text>
          </View>

          {/* NO2 */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>NO₂</Text>
            <Text style={[styles.metricValue, { color: mockData.metrics.no2.color }]}>
              {mockData.metrics.no2.value}
            </Text>
            <Text style={styles.metricUnit}>{mockData.metrics.no2.unit}</Text>
          </View>
        </View>

        {/* Additional Info Grid */}
        <View style={styles.additionalGrid}>
          {/* Radon Risk */}
          <View style={styles.additionalCard}>
            <Text style={styles.additionalLabel}>Radon Risk</Text>
            <Text style={[styles.additionalValue, { color: mockData.additionalInfo.radonRisk.color }]}>
              {mockData.additionalInfo.radonRisk.level}
            </Text>
            <Text style={styles.additionalDetail}>
              {mockData.additionalInfo.radonRisk.detail}
            </Text>
          </View>

          {/* Wildfire */}
          <View style={styles.additionalCard}>
            <Text style={styles.additionalLabel}>Wildfire</Text>
            <Text style={[styles.additionalValue, { color: mockData.additionalInfo.wildfire.color }]}>
              {mockData.additionalInfo.wildfire.level}
            </Text>
            <Text style={styles.additionalDetail}>
              {mockData.additionalInfo.wildfire.detail}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  riskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  warningMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    color: '#999',
  },
  additionalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  additionalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  additionalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  additionalDetail: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;