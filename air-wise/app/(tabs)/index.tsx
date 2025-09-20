import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type AirComponents = {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
};

type AirQualityResponse = {
  list: Array<{
    main: { aqi: 1 | 2 | 3 | 4 | 5 };
    components: AirComponents;
    dt: number;
  }>;
};

type StatusInfo = {
  label: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
};

function getStatusForPollutant(key: keyof AirComponents, value: number): StatusInfo {
  if (Number.isNaN(value)) return { label: 'Good', color: '#9E9E9E' };
  
  // Using OpenWeather's official AQI scale from their documentation
  switch (key) {
    case 'so2': {
      if (value < 20) return { label: 'Good', color: '#2ECC71' };
      if (value < 80) return { label: 'Fair', color: '#F1C40F' };
      if (value < 250) return { label: 'Moderate', color: '#F39C12' };
      if (value < 350) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'no2': {
      if (value < 40) return { label: 'Good', color: '#2ECC71' };
      if (value < 70) return { label: 'Fair', color: '#F1C40F' };
      if (value < 150) return { label: 'Moderate', color: '#F39C12' };
      if (value < 200) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'pm10': {
      if (value < 20) return { label: 'Good', color: '#2ECC71' };
      if (value < 50) return { label: 'Fair', color: '#F1C40F' };
      if (value < 100) return { label: 'Moderate', color: '#F39C12' };
      if (value < 200) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'pm2_5': {
      if (value < 10) return { label: 'Good', color: '#2ECC71' };
      if (value < 25) return { label: 'Fair', color: '#F1C40F' };
      if (value < 50) return { label: 'Moderate', color: '#F39C12' };
      if (value < 75) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'o3': {
      if (value < 60) return { label: 'Good', color: '#2ECC71' };
      if (value < 100) return { label: 'Fair', color: '#F1C40F' };
      if (value < 140) return { label: 'Moderate', color: '#F39C12' };
      if (value < 180) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'co': {
      if (value < 4400) return { label: 'Good', color: '#2ECC71' };
      if (value < 9400) return { label: 'Fair', color: '#F1C40F' };
      if (value < 12400) return { label: 'Moderate', color: '#F39C12' };
      if (value < 15400) return { label: 'Poor', color: '#E67E22' };
      return { label: 'Very Poor', color: '#E74C3C' };
    }
    case 'nh3': {
      // NH3 doesn't affect AQI but has min 0.1 - max 200 range
      if (value < 50) return { label: 'Good', color: '#2ECC71' };
      if (value < 100) return { label: 'Fair', color: '#F1C40F' };
      return { label: 'Poor', color: '#E74C3C' };
    }
    case 'no': {
      // NO doesn't affect AQI but has min 0.1 - max 100 range  
      if (value < 25) return { label: 'Good', color: '#2ECC71' };
      if (value < 50) return { label: 'Fair', color: '#F1C40F' };
      return { label: 'Poor', color: '#E74C3C' };
    }
    default:
      return { label: 'Good', color: '#9E9E9E' };
  }
}

function getAqiInfo(aqi: number): StatusInfo {
  switch (aqi) {
    case 1:
      return { label: 'Good', color: '#2ECC71' };
    case 2:
      return { label: 'Fair', color: '#F1C40F' };
    case 3:
      return { label: 'Moderate', color: '#F39C12' };
    case 4:
      return { label: 'Poor', color: '#E67E22' };
    case 5:
      return { label: 'Very Poor', color: '#E74C3C' };
    default:
      return { label: 'Good', color: '#9E9E9E' };
  }
}

function calculateEpaAqi(components: AirComponents): { aqi: number; status: StatusInfo } {
  // EPA AQI calculation based on highest pollutant
  const pollutants = [
    { value: components.pm2_5, breakpoints: [0, 12.0, 35.4, 55.4, 150.4, 250.4, 350.4, 500.4] },
    { value: components.pm10, breakpoints: [0, 54, 154, 254, 354, 424, 504, 604] },
    { value: components.o3 * 0.5, breakpoints: [0, 54, 70, 85, 105, 200, 300, 400] }, // Convert µg/m³ to ppb for EPA calculation
    { value: components.no2, breakpoints: [0, 53, 100, 360, 649, 1249, 1649, 2049] },
    { value: components.so2, breakpoints: [0, 35, 75, 185, 304, 604, 804, 1004] },
    { value: components.co / 1000, breakpoints: [0, 4.4, 9.4, 12.4, 15.4, 30.4, 40.4, 50.4] }, // Convert to ppm
  ];

  const aqiBreakpoints = [0, 50, 100, 150, 200, 300, 400, 500];
  
  let maxAqi = 0;
  
  for (const pollutant of pollutants) {
    const { value, breakpoints } = pollutant;
    
    // Find the correct breakpoint range
    let bpIndex = 0;
    for (let i = 0; i < breakpoints.length - 1; i++) {
      if (value >= breakpoints[i] && value <= breakpoints[i + 1]) {
        bpIndex = i;
        break;
      }
    }
    
    // Calculate AQI for this pollutant using EPA formula
    const bpLo = breakpoints[bpIndex];
    const bpHi = breakpoints[bpIndex + 1];
    const aqiLo = aqiBreakpoints[bpIndex];
    const aqiHi = aqiBreakpoints[bpIndex + 1];
    
    const aqi = Math.round(((aqiHi - aqiLo) / (bpHi - bpLo)) * (value - bpLo) + aqiLo);
    maxAqi = Math.max(maxAqi, aqi);
  }
  
  // EPA AQI status
  let status: StatusInfo;
  if (maxAqi <= 50) status = { label: 'Good', color: '#00E400' };
  else if (maxAqi <= 100) status = { label: 'Moderate', color: '#FFFF00' };
  else if (maxAqi <= 150) status = { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
  else if (maxAqi <= 200) status = { label: 'Unhealthy', color: '#FF0000' };
  else if (maxAqi <= 300) status = { label: 'Very Unhealthy', color: '#8F3F97' };
  else status = { label: 'Hazardous', color: '#7E0023' };
  
  return { aqi: maxAqi, status };
}

function formatValue(key: keyof AirComponents, value: number): string {
  const decimals = (key === 'pm2_5' || key === 'no2') ? 1 : 0;
  return `${value.toFixed(decimals)} µg/m³`;
}

function WildfireIndicator({ aqi, components }: { aqi: number; components: AirComponents }) {
  const possibleSmoke = aqi >= 4 || components.pm2_5 >= 55 || components.co >= 9000;
  return (
    <Card title="Wildfire / Smoke">
      <View style={styles.rowBetween}>
        <ThemedText style={[styles.valueText, { color: possibleSmoke ? '#E67E22' : '#2ECC71' }]}>
          {possibleSmoke ? 'Possible smoke in area' : 'No strong smoke indicators'}
        </ThemedText>
      </View>
      <ThemedText style={styles.caption}>Heuristic based on AQI, PM2.5 and CO.</ThemedText>
    </Card>
  );
}

function RadonCard() {
  return (
    <Card title="Radon">
      <ThemedText style={styles.valueText}>Contextual guidance</ThemedText>
      <ThemedText style={styles.caption}>
        Indoor radon varies by building. Consider a home test kit or local guidance.
      </ThemedText>
    </Card>
  );
}

function Card({ title, children, right }: { title: string; children?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {right}
      </View>
      <View style={styles.cardBody}>{children}</View>
    </ThemedView>
  );
}

function PollutantCard({
  label,
  keyName,
  components,
}: {
  label: string;
  keyName: keyof AirComponents;
  components: AirComponents;
}) {
  const value = components[keyName];
  const status = getStatusForPollutant(keyName, value);
  return (
    <Card
      title={label}
      right={<View style={[styles.badge, { backgroundColor: status.color }]}><ThemedText style={styles.badgeText}>{status.label}</ThemedText></View>}
    >
      <ThemedText style={styles.valueText}>{formatValue(keyName, value)}</ThemedText>
    </Card>
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [coords, setCoords] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [aqi, setAqi] = React.useState<number | null>(null);
  const [components, setComponents] = React.useState<AirComponents | null>(null);
  const [epaAqi, setEpaAqi] = React.useState<{ aqi: number; status: StatusInfo } | null>(null);

  // Debug environment variables
  console.log('🔍 Environment Variables:', {
    'process.env.OPENWEATHER_API_KEY': process.env.OPENWEATHER_API_KEY ? '***PRESENT***' : 'MISSING',
    'process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY': process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ? '***PRESENT***' : 'MISSING',
  });

  const apiKey = (Constants?.expoConfig?.extra as any)?.openWeatherApiKey as string | undefined;
  console.log('🔑 API Key being used:', apiKey ? '***PRESENT***' : 'MISSING!');

  async function loadAirQuality() {
    setError(null);
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });
      if (!apiKey) {
        throw new Error('Missing OpenWeather API key. Set EXPO_PUBLIC_OPENWEATHER_API_KEY.');
      }
      const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      console.log('🌍 Fetching air quality data from:', url.replace(apiKey, 'API_KEY_HIDDEN'));
      const res = await fetch(url);
      console.log('📡 API Response status:', res.status);
      if (!res.ok) {
        throw new Error(`Network error: ${res.status}`);
      }
      const data: AirQualityResponse = await res.json();
      console.log('🔍 FULL API RESPONSE FROM OPENWEATHER:');
      console.log('=====================================');
      console.log(JSON.stringify(data, null, 2));
      console.log('=====================================');
      
      console.log('✅ Air quality data received:', {
        aqi: data.list[0]?.main.aqi,
        pm25: data.list[0]?.components.pm2_5,
        timestamp: new Date(data.list[0]?.dt * 1000).toLocaleString()
      });
      if (!data.list?.length) {
        throw new Error('No air quality data returned');
      }
      const first = data.list[0];
      setAqi(first.main.aqi);
      setComponents(first.components);
      
      // Calculate EPA AQI
      const epaResult = calculateEpaAqi(first.components);
      setEpaAqi(epaResult);
      console.log('🇺🇸 EPA AQI calculated:', epaResult.aqi, epaResult.status.label);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAirQuality();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadAirQuality();
    setRefreshing(false);
  }, []);

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 12 }}>Loading air quality…</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">AirWise</ThemedText>
        <ThemedText style={{ marginTop: 8 }}>Error: {error}</ThemedText>
        <View style={{ height: 12 }} />
        <View style={styles.button}>
          <ThemedText style={styles.buttonText} onPress={loadAirQuality}>Retry</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!components || !aqi || !epaAqi) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>No data available.</ThemedText>
      </ThemedView>
    );
  }

  const aqiInfo = getAqiInfo(aqi);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="title">AirWise</ThemedText>
          {coords ? (
            <ThemedText style={styles.caption}>
              {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}
            </ThemedText>
          ) : null}
        </View>

        <Card title="Air Quality Index">
          <View style={styles.aqiRow}>
            <View style={styles.aqiItem}>
              <View style={styles.rowBetween}>
                <ThemedText style={styles.aqiLabel}>OpenWeather</ThemedText>
                <View style={[styles.badge, { backgroundColor: aqiInfo.color }]}>
                  <ThemedText style={styles.badgeText}>{aqiInfo.label}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.aqiValue}>AQI {aqi}</ThemedText>
            </View>
            
            <View style={styles.aqiItem}>
              <View style={styles.rowBetween}>
                <ThemedText style={styles.aqiLabel}>US EPA</ThemedText>
                <View style={[styles.badge, { backgroundColor: epaAqi.status.color }]}>
                  <ThemedText style={[styles.badgeText, { color: epaAqi.aqi <= 100 ? '#000' : '#fff' }]}>{epaAqi.status.label}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.aqiValue}>AQI {epaAqi.aqi}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.caption}>Different scales may show different values for the same air quality</ThemedText>
        </Card>

        <PollutantCard label="PM2.5" keyName="pm2_5" components={components} />
        <PollutantCard label="PM10" keyName="pm10" components={components} />
        <PollutantCard label="Ozone (O₃)" keyName="o3" components={components} />
        <PollutantCard label="Nitrogen Dioxide (NO₂)" keyName="no2" components={components} />

        <WildfireIndicator aqi={aqi} components={components} />
        <RadonCard />

        <Card title="More details">
          <ThemedText style={styles.caption}>
            CO: {formatValue('co', components.co)} · SO₂: {formatValue('so2', components.so2)} · NH₃: {formatValue('nh3', components.nh3)} · NO: {formatValue('no', components.no)}
          </ThemedText>
        </Card>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    gap: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    opacity: 0.8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLarge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#000',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  aqiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  aqiItem: {
    flex: 1,
    gap: 6,
  },
  aqiLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  aqiValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
