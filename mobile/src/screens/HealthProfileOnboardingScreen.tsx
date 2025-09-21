import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingProps {
  onComplete: () => void;
  isEditing?: boolean; // True if user is editing existing profile
}

const HealthProfileOnboardingScreen: React.FC<OnboardingProps> = ({ onComplete, isEditing = false }) => {
  const { updateUserProfile, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Health profile state - initialize with existing data if editing
  const [healthProfile, setHealthProfile] = useState({
    conditions: (user?.healthProfile?.conditions || []) as string[],
    ageGroup: (user?.healthProfile?.ageGroup || 'adult') as 'child' | 'adult' | 'senior',
    lifestyle: (user?.healthProfile?.lifestyle || []) as string[],
    sensitivities: (user?.healthProfile?.sensitivities || []) as string[],
  });

  const steps = [
    {
      title: 'Health Conditions',
      subtitle: 'Do you have any of these conditions?',
      icon: 'medical',
      options: [
        { id: 'asthma', label: 'Asthma', icon: 'medical' },
        { id: 'heart_disease', label: 'Heart Disease', icon: 'heart' },
        { id: 'copd', label: 'COPD', icon: 'medical' },
        { id: 'pregnancy', label: 'Pregnancy', icon: 'person' },
        { id: 'none', label: 'None of the above', icon: 'checkmark-circle' },
      ],
      field: 'conditions',
      multiSelect: true,
    },
    {
      title: 'Age Group',
      subtitle: 'Which age group describes you?',
      icon: 'person',
      options: [
        { id: 'child', label: 'Child (Under 18)', icon: 'happy' },
        { id: 'adult', label: 'Adult (18-64)', icon: 'person' },
        { id: 'senior', label: 'Senior (65+)', icon: 'person-circle' },
      ],
      field: 'ageGroup',
      multiSelect: false,
    },
    {
      title: 'Lifestyle',
      subtitle: 'Which describes your lifestyle?',
      icon: 'fitness',
      options: [
        { id: 'outdoor_worker', label: 'Outdoor Worker', icon: 'sunny' },
        { id: 'regular_exercise', label: 'Regular Exercise', icon: 'fitness' },
        { id: 'athlete', label: 'Athlete', icon: 'trophy' },
        { id: 'smoking_history', label: 'Smoking History', icon: 'warning' },
      ],
      field: 'lifestyle',
      multiSelect: true,
    },
    {
      title: 'Sensitivities',
      subtitle: 'Are you sensitive to any of these?',
      icon: 'leaf',
      options: [
        { id: 'pollen', label: 'Pollen', icon: 'leaf' },
        { id: 'dust', label: 'Dust', icon: 'home' },
        { id: 'smoke', label: 'Smoke', icon: 'cloud' },
        { id: 'chemicals', label: 'Chemicals', icon: 'warning' },
        { id: 'none', label: 'No sensitivities', icon: 'checkmark-circle' },
      ],
      field: 'sensitivities',
      multiSelect: true,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (optionId: string) => {
    const field = currentStepData.field as keyof typeof healthProfile;

    if (currentStepData.multiSelect) {
      // Handle multi-select
      const currentValues = healthProfile[field] as string[];

      if (optionId === 'none') {
        // Clear all other selections if "none" is selected
        setHealthProfile(prev => ({ ...prev, [field]: ['none'] }));
      } else {
        // Remove "none" if other option is selected
        let newValues = currentValues.filter(v => v !== 'none');

        if (currentValues.includes(optionId)) {
          newValues = newValues.filter(v => v !== optionId);
        } else {
          newValues = [...newValues, optionId];
        }

        setHealthProfile(prev => ({ ...prev, [field]: newValues }));
      }
    } else {
      // Handle single select
      setHealthProfile(prev => ({ ...prev, [field]: optionId }));
    }
  };

  const isOptionSelected = (optionId: string) => {
    const field = currentStepData.field as keyof typeof healthProfile;
    const value = healthProfile[field];

    if (Array.isArray(value)) {
      return value.includes(optionId);
    } else {
      return value === optionId;
    }
  };

  const canProceed = () => {
    const field = currentStepData.field as keyof typeof healthProfile;
    const value = healthProfile[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    } else {
      return value !== '';
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Update user profile with health data
    updateUserProfile({ healthProfile });

    Alert.alert(
      'Profile Complete!',
      'Your health profile has been saved. You\'ll now receive personalized air quality recommendations.',
      [{ text: 'Great!', onPress: onComplete }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {steps.length}
          </Text>
          {isEditing && (
            <TouchableOpacity onPress={onComplete} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepHeader}>
          <Ionicons name={currentStepData.icon as any} size={48} color="#4CAF50" />
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentStepData.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isOptionSelected(option.id) && styles.optionCardSelected,
              ]}
              onPress={() => handleOptionSelect(option.id)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={isOptionSelected(option.id) ? '#4CAF50' : '#666'}
              />
              <Text
                style={[
                  styles.optionText,
                  isOptionSelected(option.id) && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {isOptionSelected(option.id) && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default HealthProfileOnboardingScreen;