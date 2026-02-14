import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useTTS } from '@/hooks/useTTS';

interface RoutineStep {
  id: string;
  title: string;
  description: string;
  time: 'morning' | 'evening' | 'both';
  completed: boolean;
  icon: string;
  importance: 'essential' | 'recommended' | 'optional';
}

export default function RoutineScreen() {
  const { userProfile, isDetailedMode } = useApp();
  const { speak, isSpeaking } = useTTS();
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>([]);
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning');

  useEffect(() => {
    generatePersonalizedRoutine();
  }, [userProfile?.skinType, isDetailedMode]);

  const generatePersonalizedRoutine = () => {
    const baseRoutine: RoutineStep[] = [
      {
        id: '1',
        title: 'Gentle Cleanser',
        description: isDetailedMode 
          ? 'Use a pH-balanced, non-comedogenic cleanser to remove impurities without disrupting skin barrier'
          : 'Wash your face with gentle soap',
        time: 'both',
        completed: false,
        icon: 'cleaning-services',
        importance: 'essential'
      },
      {
        id: '2', 
        title: 'Moisturizer',
        description: isDetailedMode
          ? 'Apply ceramide or hyaluronic acid-based moisturizer to maintain skin barrier hydration'
          : 'Put on face cream to keep skin soft',
        time: 'both',
        completed: false,
        icon: 'opacity',
        importance: 'essential'
      },
      {
        id: '3',
        title: 'Sunscreen SPF 30+',
        description: isDetailedMode
          ? 'Apply broad-spectrum SPF 30+ sunscreen 15-30 minutes before sun exposure'
          : 'Use sunscreen to protect from sun damage',
        time: 'morning',
        completed: false,
        icon: 'wb-sunny',
        importance: 'essential'
      }
    ];

    // Add skin type specific recommendations
    if (userProfile?.skinType) {
      switch (userProfile.skinType) {
        case 'oily':
          baseRoutine.push({
            id: '4',
            title: 'Salicylic Acid (BHA)',
            description: isDetailedMode
              ? '2% salicylic acid to reduce sebum production and prevent comedones'
              : 'Use BHA product to control oil and prevent breakouts',
            time: 'evening',
            completed: false,
            icon: 'science',
            importance: 'recommended'
          });
          break;
        case 'dry':
          baseRoutine.push({
            id: '4',
            title: 'Hydrating Serum',
            description: isDetailedMode
              ? 'Hyaluronic acid or glycerin-based serum for enhanced hydration'
              : 'Apply hydrating serum for extra moisture',
            time: 'both',
            completed: false,
            icon: 'water-drop',
            importance: 'recommended'
          });
          break;
        case 'sensitive':
          baseRoutine.push({
            id: '4',
            title: 'Soothing Treatment',
            description: isDetailedMode
              ? 'Niacinamide or centella asiatica for anti-inflammatory benefits'
              : 'Use gentle, soothing products for sensitive skin',
            time: 'evening',
            completed: false,
            icon: 'healing',
            importance: 'recommended'
          });
          break;
      }
    }

    // Add advanced steps for detailed mode
    if (isDetailedMode) {
      baseRoutine.push({
        id: '5',
        title: 'Antioxidant Serum',
        description: 'Vitamin C serum in morning or retinol in evening for anti-aging',
        time: 'morning',
        completed: false,
        icon: 'auto-awesome',
        importance: 'optional'
      });
    }

    setRoutineSteps(baseRoutine);
  };

    const toggleStepCompletion = (stepId: string) => {
    try {
      setRoutineSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ));
    } catch (error) {
      console.error('Step toggle error:', error);
    }
  };

  const speakRoutine = () => {
    try {
      const filteredSteps = routineSteps.filter(step => 
        step.time === selectedTime || step.time === 'both'
      );
      
      if (filteredSteps.length === 0) {
        const message = `No routine steps found for ${selectedTime}.`;
        speak(message);
        return;
      }
      
      const message = isDetailedMode
        ? `Your ${selectedTime} routine has ${filteredSteps.length} steps: ${filteredSteps.map(s => s.title).join(', ')}`
        : `Time for your ${selectedTime} skincare! Do these steps: ${filteredSteps.map(s => s.title).join(', ')}`;
      
      speak(message);
    } catch (error) {
      console.error('Speak routine error:', error);
    }
  };

  const handleTimeSelection = (time: 'morning' | 'evening') => {
    try {
      setSelectedTime(time);
    } catch (error) {
      console.error('Time selection error:', error);
    }
  };

  const getFilteredSteps = () => {
    return routineSteps.filter(step => step.time === selectedTime || step.time === 'both');
  };

  const getCompletionStats = () => {
    const filteredSteps = getFilteredSteps();
    const completed = filteredSteps.filter(step => step.completed).length;
    return { completed, total: filteredSteps.length };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'essential': return Colors.danger;
      case 'recommended': return Colors.warning;
      case 'optional': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const stats = getCompletionStats();
  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="schedule" size={32} color={Colors.primary} />
            <Text style={styles.title}>
              {isDetailedMode ? 'Skincare Protocol' : 'Daily Routine'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.speakButton}
            onPress={speakRoutine}
            disabled={isSpeaking}
          >
            <MaterialIcons 
              name={isSpeaking ? "volume-up" : "record-voice-over"} 
              size={20} 
              color={Colors.accent} 
            />
            <Text style={styles.speakButtonText}>
              {isSpeaking ? 'Speaking...' : 'Hear Routine'}
            </Text>
          </TouchableOpacity>
        </View>

        {!userProfile?.skinType && (
          <View style={styles.setupPrompt}>
            <MaterialIcons name="face" size={48} color={Colors.warning} />
            <Text style={styles.setupTitle}>Complete Your Profile</Text>
            <Text style={styles.setupText}>
              Set your skin type in Profile tab to get personalized routine recommendations
            </Text>
          </View>
        )}

        <View style={styles.timeSelector}>
          <TouchableOpacity
            style={[styles.timeButton, selectedTime === 'morning' && styles.timeButtonActive]}            onPress={() => handleTimeSelection('morning')}
          >
            <MaterialIcons 
              name="wb-sunny" 
              size={20} 
              color={selectedTime === 'morning' ? Colors.background : Colors.textSecondary} 
            />
            <Text style={[
              styles.timeButtonText,
              selectedTime === 'morning' && styles.timeButtonTextActive
            ]}>
              Morning
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.timeButton, selectedTime === 'evening' && styles.timeButtonActive]}            onPress={() => handleTimeSelection('evening')}
          >
            <MaterialIcons 
              name="brightness-3" 
              size={20} 
              color={selectedTime === 'evening' ? Colors.background : Colors.textSecondary} 
            />
            <Text style={[
              styles.timeButtonText,
              selectedTime === 'evening' && styles.timeButtonTextActive
            ]}>
              Evening
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {isDetailedMode ? 'Protocol Completion' : 'Today\'s Progress'}
          </Text>
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>
              {stats.completed}/{stats.total} completed ({Math.round(completionPercentage)}%)
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${completionPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          {getFilteredSteps().map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, step.completed && styles.stepCompleted]}
              onPress={() => toggleStepCompletion(step.id)}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                  <MaterialIcons 
                    name={step.icon as any} 
                    size={24} 
                    color={step.completed ? Colors.success : Colors.primary} 
                  />
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>
                      {step.title}
                    </Text>
                    <View style={[
                      styles.importanceTag,
                      { backgroundColor: getImportanceColor(step.importance) + '20' }
                    ]}>
                      <Text style={[
                        styles.importanceText,
                        { color: getImportanceColor(step.importance) }
                      ]}>
                        {step.importance}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.stepDescription, step.completed && styles.stepDescriptionCompleted]}>
                    {step.description}
                  </Text>
                </View>
                <MaterialIcons 
                  name={step.completed ? "check-circle" : "radio-button-unchecked"}
                  size={24} 
                  color={step.completed ? Colors.success : Colors.border} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {isDetailedMode && (
          <View style={styles.tipsContainer}>
            <MaterialIcons name="tips-and-updates" size={24} color={Colors.accent} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Professional Tips</Text>
              <Text style={styles.tipsText}>
                • Always patch test new products on inner wrist before facial application{'\n'}
                • Wait 15-30 minutes between active ingredient applications{'\n'}
                • Apply products from thinnest to thickest consistency{'\n'}
                • Consistency is more important than quantity - stick to routine daily
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  speakButtonText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
  setupPrompt: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    margin: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  setupTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  setupText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  timeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timeButtonTextActive: {
    color: Colors.background,
  },
  progressCard: {
    backgroundColor: Colors.background,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  progressStats: {
    gap: Spacing.sm,
  },
  progressText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  stepsContainer: {
    padding: Spacing.md,
  },
  stepCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepCompleted: {
    backgroundColor: Colors.success + '10',
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  stepTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  importanceTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  importanceText: {
    ...Typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stepDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  stepDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tipsText: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});