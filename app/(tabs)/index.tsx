import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ModeToggle from '@/components/ui/ModeToggle';
import FeatureCard from '@/components/ui/FeatureCard';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export default function HomeScreen() {
  const { isDetailedMode, userProfile } = useApp();

  const handleNavigation = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const features = [
    {
      title: 'Skin Analysis',
      description: isDetailedMode 
        ? 'Advanced ML-powered skin condition detection with medical accuracy and confidence scores'
        : 'Take a photo and get simple skin health advice with easy explanations',
      icon: 'camera-alt' as const,
      color: Colors.primary,
      onPress: () => handleNavigation('/scan'),
    },
    {
      title: 'Ingredient Scanner',
      description: isDetailedMode
        ? 'Comprehensive ingredient analysis with safety classifications and toxicology data'
        : 'Check if your skincare products are safe to use with simple yes/no results',
      icon: 'search' as const,
      color: Colors.accent,
      onPress: () => handleNavigation('/ingredients'),
    },
    {
      title: 'Daily Routine',
      description: isDetailedMode
        ? 'Personalized skincare protocol based on dermatological assessment and skin type analysis'
        : 'Simple daily skincare steps customized just for your skin type',
      icon: 'schedule' as const,
      color: Colors.secondary,
      onPress: () => handleNavigation('/routine'),
    },
    {
      title: 'UV Protection',
      description: isDetailedMode
        ? 'Real-time UV index monitoring with detailed sun protection recommendations'
        : 'Get simple sun protection advice based on today\'s weather conditions',
      icon: 'wb-sunny' as const,
      color: Colors.warning,
      onPress: () => handleNavigation('/uv-care'),
    },
    {
      title: 'Analysis History',
      description: isDetailedMode
        ? 'Comprehensive analysis reports with progress tracking and downloadable records'
        : 'See your past skin photos and results in a simple timeline view',
      icon: 'history' as const,
      color: Colors.success,
      onPress: () => handleNavigation('/history'),
    },
    {
      title: 'Profile & Settings',
      description: isDetailedMode
        ? 'Complete skin type assessment, medical history, and personalized recommendations'
        : 'Tell us about your skin type to get better advice and recommendations',
      icon: 'person' as const,
      color: Colors.primary,
      onPress: () => handleNavigation('/profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="favorite" size={32} color={Colors.secondary} />
            <Text style={styles.title}>Derma Care</Text>
          </View>
          <Text style={styles.subtitle}>
            {isDetailedMode 
              ? 'Professional dermatological analysis and comprehensive skin health monitoring system'
              : 'Your friendly skin health companion for everyday skincare guidance'
            }
          </Text>
          
          {!userProfile?.skinType && (
            <View style={styles.setupPrompt}>
              <MaterialIcons name="info" size={24} color={Colors.warning} />
              <View style={styles.setupPromptContent}>
                <Text style={styles.setupPromptTitle}>Get Better Results!</Text>
                <Text style={styles.setupPromptText}>
                  Complete your profile to get personalized skincare advice
                </Text>
                <TouchableOpacity 
                  style={styles.setupPromptButton}
                  onPress={() => handleNavigation('/profile')}
                >
                  <Text style={styles.setupPromptButtonText}>Complete Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <ModeToggle />

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>
            {isDetailedMode ? 'Professional Features' : 'Easy Tools'}
          </Text>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onPress={feature.onPress}
            />
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="verified" size={24} color={Colors.success} />
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>
                {isDetailedMode ? 'Clinical Accuracy' : 'Trusted Results'}
              </Text>
              <Text style={styles.statDescription}>
                {isDetailedMode 
                  ? 'Advanced classification system with 16+ dermatological conditions'
                  : 'Simple, reliable advice you can trust'
                }
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="accessibility" size={24} color={Colors.accent} />
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>
                {isDetailedMode ? 'Dual Interface System' : 'Easy to Use'}
              </Text>
              <Text style={styles.statDescription}>
                {isDetailedMode 
                  ? 'Switch between simple and professional modes instantly'
                  : 'Designed for everyone, no medical knowledge needed'
                }
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color={Colors.warning} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              {isDetailedMode ? 'Medical Disclaimer & Liability' : 'Important Notice'}
            </Text>
            <Text style={styles.infoText}>
              {isDetailedMode 
                ? 'This application provides educational information and preliminary analysis only. It does not constitute professional medical diagnosis, treatment, or advice. Always consult qualified healthcare providers for medical concerns. The developers assume no liability for medical decisions based on app recommendations.'
                : 'This app gives helpful advice but is not a doctor. Always see a real doctor for skin problems that worry you.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  setupPrompt: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '10',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    gap: Spacing.sm,
  },
  setupPromptContent: {
    flex: 1,
  },
  setupPromptTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  setupPromptText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  setupPromptButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  setupPromptButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: Spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  infoTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});