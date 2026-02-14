import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { UserProfile } from '@/types';
import { useTTS } from '@/hooks/useTTS';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Derma Care!',
    subtitle: 'Your personal skin health assistant that speaks your language',
    icon: 'favorite',
    color: Colors.secondary
  },
  {
    id: 'features',
    title: 'What Can I Do?',
    subtitle: 'Scan skin, check products, get UV alerts, and track your progress',
    icon: 'camera-alt',
    color: Colors.primary
  },
  {
    id: 'modes',
    title: 'Choose Your Style',
    subtitle: 'Simple mode for easy use, or detailed mode for more information',
    icon: 'tune',
    color: Colors.accent
  },
  {
    id: 'profile',
    title: 'Tell Us About You',
    subtitle: 'Help us give you better advice (you can skip this)',
    icon: 'person',
    color: Colors.success
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { setUserProfile, setFirstTime, isDetailedMode } = useApp();
  const { speak, isSpeaking } = useTTS();

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowProfileSetup(true);
    }
  };

  const handleSkipToApp = () => {
    try {
      setFirstTime(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleStartProfile = () => {
    setShowProfileSetup(true);
  };

  const speakCurrentStep = () => {
    const message = `${currentStepData.title}. ${currentStepData.subtitle}`;
    speak(message);
  };

  if (showProfileSetup) {
    return <QuickProfileSetup onComplete={handleSkipToApp} onSkip={handleSkipToApp} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipToApp}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.audioButton} onPress={speakCurrentStep} disabled={isSpeaking}>
          <MaterialIcons 
            name={isSpeaking ? "volume-up" : "volume-off"} 
            size={24} 
            color={Colors.accent} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <View style={[styles.iconContainer, { backgroundColor: currentStepData.color + '20' }]}>
            <MaterialIcons 
              name={currentStepData.icon} 
              size={80} 
              color={currentStepData.color} 
            />
          </View>
          
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>

          {currentStep === 1 && <FeaturesPreview />}
          {currentStep === 2 && <ModesPreview />}
          {currentStep === 3 && <ProfilePreview />}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons name="arrow-forward" size={24} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeaturesPreview() {
  const features = [
    { icon: 'camera-alt', title: 'Scan Skin', desc: 'Take photos for analysis' },
    { icon: 'search', title: 'Check Products', desc: 'Scan ingredient safety' },
    { icon: 'wb-sunny', title: 'UV Alerts', desc: 'Sun protection advice' },
    { icon: 'history', title: 'Track Progress', desc: 'See your skin journey' }
  ];

  return (
    <View style={styles.previewContainer}>
      {features.map((feature, index) => (
        <View key={index} style={styles.featurePreview}>
          <MaterialIcons name={feature.icon as any} size={32} color={Colors.primary} />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ModesPreview() {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.modePreview}>
        <MaterialIcons name="accessibility" size={48} color={Colors.success} />
        <Text style={styles.modeTitle}>Simple Mode</Text>
        <Text style={styles.modeDesc}>Easy words, big buttons, voice help</Text>
      </View>
      
      <View style={styles.modePreview}>
        <MaterialIcons name="science" size={48} color={Colors.accent} />
        <Text style={styles.modeTitle}>Detailed Mode</Text>
        <Text style={styles.modeDesc}>Medical terms, charts, full reports</Text>
      </View>
    </View>
  );
}

function ProfilePreview() {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.profileBenefit}>
        <MaterialIcons name="recommend" size={32} color={Colors.secondary} />
        <Text style={styles.benefitText}>Get personalized advice for your skin type</Text>
      </View>
      <View style={styles.profileBenefit}>
        <MaterialIcons name="schedule" size={32} color={Colors.warning} />
        <Text style={styles.benefitText}>Receive custom daily routines</Text>
      </View>
      <View style={styles.profileBenefit}>
        <MaterialIcons name="trending-up" size={32} color={Colors.success} />
        <Text style={styles.benefitText}>Track your progress over time</Text>
      </View>
    </View>
  );
}

function QuickProfileSetup({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState<UserProfile['skinType'] | null>(null);
  const { setUserProfile, setFirstTime, isDetailedMode } = useApp();

  const skinTypes = [
    {
      type: 'normal' as const,
      title: 'Normal',
      emoji: '😊',
      description: 'Not too oily, not too dry',
      color: Colors.success
    },
    {
      type: 'dry' as const,
      title: 'Dry',
      emoji: '🌵',
      description: 'Feels tight, flaky',
      color: Colors.warning
    },
    {
      type: 'oily' as const,
      title: 'Oily',
      emoji: '✨',
      description: 'Shiny, large pores',
      color: Colors.primary
    },
    {
      type: 'combination' as const,
      title: 'Combination',
      emoji: '🎭',
      description: 'Oily T-zone, dry cheeks',
      color: Colors.secondary
    },
    {
      type: 'sensitive' as const,
      title: 'Sensitive',
      emoji: '🌸',
      description: 'Gets irritated easily',
      color: Colors.danger
    }
  ];

  const handleFinishSetup = () => {
    try {
      if (selectedSkinType) {
        const profile: UserProfile = {
          id: Date.now().toString(),
          name: name || 'User',
          skinType: selectedSkinType,
          allergies: [],
          isDetailedMode
        };
        setUserProfile(profile);
      }
      setFirstTime(false);
      onComplete();
    } catch (error) {
      console.error('Profile setup error:', error);
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step {step} of 2</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <View style={styles.setupStep}>
            <MaterialIcons name="person" size={80} color={Colors.primary} />
            <Text style={styles.setupTitle}>What should we call you?</Text>
            <Text style={styles.setupSubtitle}>This helps us personalize your experience</Text>
            
            <View style={styles.nameOptions}>
              {['User', 'Friend', 'Guest'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.nameOption,
                    name === option && styles.nameOptionSelected
                  ]}
                  onPress={() => setName(option)}
                >
                  <Text style={[
                    styles.nameOptionText,
                    name === option && styles.nameOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => setStep(2)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.setupStep}>
            <MaterialIcons name="face" size={80} color={Colors.secondary} />
            <Text style={styles.setupTitle}>What's your skin like?</Text>
            <Text style={styles.setupSubtitle}>Choose the one that sounds most like you</Text>
            
            <View style={styles.skinTypeGrid}>
              {skinTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.skinTypeCard,
                    selectedSkinType === type.type && styles.skinTypeCardSelected,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedSkinType(type.type)}
                >
                  <Text style={styles.skinTypeEmoji}>{type.emoji}</Text>
                  <Text style={styles.skinTypeTitle}>{type.title}</Text>
                  <Text style={styles.skinTypeDesc}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.finishButton,
                selectedSkinType && styles.finishButtonActive
              ]} 
              onPress={handleFinishSetup}
              disabled={!selectedSkinType}
            >
              <Text style={[
                styles.finishButtonText,
                selectedSkinType && styles.finishButtonTextActive
              ]}>
                {selectedSkinType ? "Let's Go!" : 'Please select your skin type'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  audioButton: {
    padding: Spacing.sm,
  },
  stepIndicator: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  previewContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  featurePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureDesc: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  modePreview: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modeTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modeDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  profileBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  benefitText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  setupStep: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  setupTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  setupSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  nameOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  nameOption: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  nameOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  nameOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  nameOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  continueButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  skinTypeGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  skinTypeCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 280,
  },
  skinTypeCardSelected: {
    backgroundColor: Colors.primary + '10',
  },
  skinTypeEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  skinTypeTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  skinTypeDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  finishButtonActive: {
    backgroundColor: Colors.success,
  },
  finishButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  finishButtonTextActive: {
    color: Colors.background,
  },
});