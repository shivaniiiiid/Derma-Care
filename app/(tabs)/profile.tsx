import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { UserProfile } from '@/types';

export default function ProfileScreen() {
  const { userProfile, setUserProfile, isDetailedMode, toggleDetailedMode, clearHistory } = useApp();
  const [showSkinTypeAssessment, setShowSkinTypeAssessment] = useState(false);

  const skinTypes = [
    {
      type: 'dry' as const,
      title: 'Dry Skin',
      description: 'Feels tight, flaky, or rough. May have visible fine lines.',
      icon: 'grain',
      color: Colors.warning
    },
    {
      type: 'oily' as const,
      title: 'Oily Skin', 
      description: 'Shiny appearance, enlarged pores, prone to acne.',
      icon: 'opacity',
      color: Colors.primary
    },
    {
      type: 'combination' as const,
      title: 'Combination Skin',
      description: 'Oily T-zone (forehead, nose, chin) with dry cheeks.',
      icon: 'palette',
      color: Colors.secondary
    },
    {
      type: 'sensitive' as const,
      title: 'Sensitive Skin',
      description: 'Easily irritated, burns, stings, or itches.',
      icon: 'warning',
      color: Colors.danger
    },
    {
      type: 'normal' as const,
      title: 'Normal Skin',
      description: 'Well-balanced, not too oily or dry, minimal issues.',
      icon: 'check-circle',
      color: Colors.success
    }
  ];

  const handleSkinTypeSelect = (skinType: UserProfile['skinType']) => {
    try {
      const newProfile: UserProfile = {
        id: userProfile?.id || Date.now().toString(),
        name: userProfile?.name || 'User',
        skinType,
        allergies: userProfile?.allergies || [],
        isDetailedMode
      };
      setUserProfile(newProfile);
      setShowSkinTypeAssessment(false);
    } catch (error) {
      console.error('Skin type selection error:', error);
      showAlert('Error', 'Failed to save skin type. Please try again.');
    }
  };

  const handleToggleDetailedMode = () => {
    try {
      toggleDetailedMode();
    } catch (error) {
      console.error('Mode toggle error:', error);
    }
  };

  const handleShowSkinTypeAssessment = () => {
    try {
      setShowSkinTypeAssessment(true);
    } catch (error) {
      console.error('Assessment show error:', error);
    }
  };

  const handleBackFromAssessment = () => {
    try {
      setShowSkinTypeAssessment(false);
    } catch (error) {
      console.error('Assessment back error:', error);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleClearData = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        clearHistory();
        setUserProfile(null);
      }
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to clear all data? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: () => {
              clearHistory();
              setUserProfile(null);
            }
          }
        ]
      );
    }
  };

  const handleQuickSetup = () => {
    try {
      router.push('/onboarding');
    } catch (error) {
      console.error('Quick setup navigation error:', error);
    }
  };

  if (showSkinTypeAssessment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackFromAssessment}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Skin Type Assessment</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.assessmentTitle}>What's Your Skin Type?</Text>
          <Text style={styles.assessmentSubtitle}>
            Understanding your skin type helps us provide personalized recommendations
          </Text>

          {skinTypes.map((skin, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.skinTypeCard,
                userProfile?.skinType === skin.type && styles.selectedSkinType
              ]}
              onPress={() => handleSkinTypeSelect(skin.type)}
            >
              <View style={[styles.skinTypeIcon, { backgroundColor: skin.color + '20' }]}>
                <MaterialIcons name={skin.icon as any} size={32} color={skin.color} />
              </View>
              <View style={styles.skinTypeContent}>
                <Text style={styles.skinTypeTitle}>{skin.title}</Text>
                <Text style={styles.skinTypeDescription}>{skin.description}</Text>
              </View>
              {userProfile?.skinType === skin.type && (
                <MaterialIcons name="check-circle" size={24} color={Colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{userProfile?.name || 'Welcome!'}</Text>
          <Text style={styles.userSubtitle}>
            {userProfile?.skinType 
              ? `${skinTypes.find(s => s.type === userProfile.skinType)?.title} Skin Type` 
              : 'Complete your profile for better advice'
            }
          </Text>
          
          {!userProfile?.skinType && (
            <TouchableOpacity style={styles.quickSetupButton} onPress={handleQuickSetup}>
              <MaterialIcons name="auto-fix-high" size={20} color={Colors.background} />
              <Text style={styles.quickSetupText}>Quick Setup (2 minutes)</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Profile</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleShowSkinTypeAssessment}
          >
            <MaterialIcons name="face" size={24} color={Colors.primary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Skin Type</Text>
              <Text style={styles.settingSubtitle}>
                {userProfile?.skinType 
                  ? skinTypes.find(s => s.type === userProfile.skinType)?.title
                  : 'Not set - Take assessment'
                }
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <MaterialIcons name="science" size={24} color={Colors.accent} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Analysis Mode</Text>
              <Text style={styles.settingSubtitle}>
                {isDetailedMode ? 'Detailed (Professional)' : 'Simple (Easy)'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleToggleDetailedMode}>
              <View style={[styles.toggle, isDetailedMode && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isDetailedMode && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color={Colors.secondary} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Reminders</Text>
              <Text style={styles.settingSubtitle}>Daily skincare routine</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="language" size={24} color={Colors.warning} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingSubtitle}>English</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="accessibility" size={24} color={Colors.success} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Accessibility</Text>
              <Text style={styles.settingSubtitle}>Voice & contrast settings</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <MaterialIcons name="delete" size={24} color={Colors.danger} />
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: Colors.danger }]}>Clear All Data</Text>
              <Text style={styles.settingSubtitle}>Remove all saved information</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info" size={20} color={Colors.accent} />
          <Text style={styles.disclaimerText}>
            Derma Care v1.0 - This app provides general information only and should not replace professional medical advice.
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  quickSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  quickSetupText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.background,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingTitle: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.background,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  assessmentTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  assessmentSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  skinTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSkinType: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  skinTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  skinTypeContent: {
    flex: 1,
  },
  skinTypeTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  skinTypeDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  disclaimerText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});