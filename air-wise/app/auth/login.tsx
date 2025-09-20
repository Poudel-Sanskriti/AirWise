import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to AirWise
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Get personalized air quality insights based on your health profile
        </ThemedText>

        <View style={styles.features}>
          <FeatureItem 
            title="🫁 Personalized Risk" 
            description="Custom AQI thresholds based on your health conditions" 
          />
          <FeatureItem 
            title="📍 Saved Places" 
            description="Quick air quality checks for locations you care about" 
          />
          <FeatureItem 
            title="🤖 AI Coach" 
            description="Smart activity recommendations for safer outdoor time" 
          />
        </View>

        <View style={styles.loginButton}>
          <ThemedText 
            style={[styles.buttonText, loading && styles.buttonDisabled]} 
            onPress={loading ? undefined : handleGoogleLogin}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.featureDescription}>
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    gap: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: 20,
  },
  featureItem: {
    gap: 4,
  },
  featureTitle: {
    fontSize: 16,
  },
  featureDescription: {
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
