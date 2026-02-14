import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useTTS } from '@/hooks/useTTS';
import { IngredientAnalysis } from '@/types';

export default function IngredientResultScreen() {
  const { results, originalText } = useLocalSearchParams<{ 
    results: string; 
    originalText: string; 
  }>();
  const { isDetailedMode } = useApp();
  const { speak, isSpeaking } = useTTS();

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={Colors.textSecondary} />
          <Text style={styles.errorText}>No results found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const analysisResults: IngredientAnalysis[] = JSON.parse(results);
  
  const safeCount = analysisResults.filter(r => r.safe).length;
  const cautionCount = analysisResults.filter(r => r.severity === 'caution').length;
  const harmfulCount = analysisResults.filter(r => r.severity === 'harmful').length;
  
  const overallSafety = harmfulCount > 0 ? 'harmful' : 
                       cautionCount > 0 ? 'caution' : 'safe';

  const getSafetyColor = (severity: string) => {
    switch (severity) {
      case 'safe': return Colors.success;
      case 'caution': return Colors.warning;
      case 'harmful': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getSafetyIcon = (severity: string) => {
    switch (severity) {
      case 'safe': return 'check-circle';
      case 'caution': return 'warning';
      case 'harmful': return 'dangerous';
      default: return 'help';
    }
  };

  const getSimpleSummary = () => {
    if (overallSafety === 'safe') {
      return "This product looks safe for most people! All ingredients are generally well-tolerated.";
    } else if (overallSafety === 'caution') {
      return `This product has some ingredients that might cause irritation. Found ${cautionCount} ingredient(s) to watch out for.`;
    } else {
      return `Warning: This product contains ${harmfulCount} potentially harmful ingredient(s). Consider avoiding this product.`;
    }
  };

  const speakResults = () => {
    const message = isDetailedMode
      ? `Ingredient analysis complete. Found ${safeCount} safe ingredients, ${cautionCount} ingredients needing caution, and ${harmfulCount} potentially harmful ingredients.`
      : getSimpleSummary();
    speak(message);
  };

  const shareResults = async () => {
    try {
      const message = isDetailedMode
        ? `Derma Care Ingredient Analysis:\nSafe: ${safeCount} | Caution: ${cautionCount} | Harmful: ${harmfulCount}\nOverall: ${overallSafety.toUpperCase()}`
        : `Derma Care Analysis: ${getSimpleSummary()}`;
      
      if (Platform.OS === 'web') {
        navigator.share?.({ text: message }) || navigator.clipboard?.writeText(message);
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="science" size={48} color={Colors.accent} />
          <Text style={styles.title}>
            {isDetailedMode ? 'Ingredient Analysis Results' : 'Safety Check Results'}
          </Text>
          <TouchableOpacity style={styles.speakButton} onPress={speakResults} disabled={isSpeaking}>
            <MaterialIcons 
              name={isSpeaking ? "volume-up" : "record-voice-over"} 
              size={20} 
              color={Colors.accent} 
            />
            <Text style={styles.speakButtonText}>
              {isSpeaking ? 'Speaking...' : 'Hear Results'}
            </Text>
          </TouchableOpacity>
        </View>

        {isDetailedMode ? (
          <DetailedResults 
            results={analysisResults} 
            safeCount={safeCount}
            cautionCount={cautionCount}
            harmfulCount={harmfulCount}
            overallSafety={overallSafety}
          />
        ) : (
          <SimpleResults 
            overallSafety={overallSafety}
            summary={getSimpleSummary()}
            safeCount={safeCount}
            cautionCount={cautionCount}
            harmfulCount={harmfulCount}
          />
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={shareResults}>
            <MaterialIcons name="share" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/ingredients')}
          >
            <MaterialIcons name="search" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Check More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info" size={20} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            This analysis is based on general ingredient safety data. Individual reactions may vary. 
            Always patch test new products and consult a dermatologist for specific concerns.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SimpleResults({ 
  overallSafety, 
  summary, 
  safeCount, 
  cautionCount, 
  harmfulCount 
}: {
  overallSafety: string;
  summary: string;
  safeCount: number;
  cautionCount: number;
  harmfulCount: number;
}) {
  const safetyColor = getSafetyColor(overallSafety);
  const safetyIcon = getSafetyIcon(overallSafety);

  return (
    <View style={styles.resultsContainer}>
      <View style={styles.simpleResultCard}>
        <View style={styles.simpleResultHeader}>
          <MaterialIcons 
            name={safetyIcon} 
            size={64} 
            color={safetyColor} 
          />
          <View style={styles.simpleResultContent}>
            <Text style={[styles.safetyStatus, { color: safetyColor }]}>
              {overallSafety === 'safe' ? '✅ Safe Product' :
               overallSafety === 'caution' ? '⚠️ Use With Caution' :
               '❌ Potentially Harmful'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.simpleSummary}>{summary}</Text>

        <View style={styles.simpleStatsContainer}>
          <View style={styles.simpleStatCard}>
            <Text style={[styles.simpleStatNumber, { color: Colors.success }]}>
              {safeCount}
            </Text>
            <Text style={styles.simpleStatLabel}>Safe</Text>
          </View>
          <View style={styles.simpleStatCard}>
            <Text style={[styles.simpleStatNumber, { color: Colors.warning }]}>
              {cautionCount}
            </Text>
            <Text style={styles.simpleStatLabel}>Caution</Text>
          </View>
          <View style={styles.simpleStatCard}>
            <Text style={[styles.simpleStatNumber, { color: Colors.danger }]}>
              {harmfulCount}
            </Text>
            <Text style={styles.simpleStatLabel}>Harmful</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function DetailedResults({ 
  results, 
  safeCount, 
  cautionCount, 
  harmfulCount, 
  overallSafety 
}: {
  results: IngredientAnalysis[];
  safeCount: number;
  cautionCount: number;
  harmfulCount: number;
  overallSafety: string;
}) {
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Analysis Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{safeCount}</Text>
            <Text style={styles.statLabel}>Safe</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>{cautionCount}</Text>
            <Text style={styles.statLabel}>Caution</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>{harmfulCount}</Text>
            <Text style={styles.statLabel}>Harmful</Text>
          </View>
        </View>
        <View style={[styles.overallBadge, { backgroundColor: getSafetyColor(overallSafety) + '20' }]}>
          <MaterialIcons 
            name={getSafetyIcon(overallSafety)} 
            size={20} 
            color={getSafetyColor(overallSafety)} 
          />
          <Text style={[styles.overallText, { color: getSafetyColor(overallSafety) }]}>
            Overall: {overallSafety.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.ingredientsCard}>
        <Text style={styles.sectionTitle}>Ingredient Details</Text>
        {results.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingredientName}>{ingredient.ingredient}</Text>
              <View style={[
                styles.severityBadge, 
                { backgroundColor: getSafetyColor(ingredient.severity) + '20' }
              ]}>
                <MaterialIcons 
                  name={getSafetyIcon(ingredient.severity)} 
                  size={16} 
                  color={getSafetyColor(ingredient.severity)} 
                />
                <Text style={[
                  styles.severityText, 
                  { color: getSafetyColor(ingredient.severity) }
                ]}>
                  {ingredient.severity}
                </Text>
              </View>
            </View>
            <Text style={styles.ingredientRationale}>{ingredient.rationale}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getSafetyColor(severity: string) {
  switch (severity) {
    case 'safe': return Colors.success;
    case 'caution': return Colors.warning;
    case 'harmful': return Colors.danger;
    default: return Colors.textSecondary;
  }
}

function getSafetyIcon(severity: string) {
  switch (severity) {
    case 'safe': return 'check-circle';
    case 'caution': return 'warning';
    case 'harmful': return 'dangerous';
    default: return 'help';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
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
  resultsContainer: {
    padding: Spacing.md,
  },
  simpleResultCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  simpleResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  simpleResultContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  safetyStatus: {
    ...Typography.h2,
    fontWeight: '700',
  },
  simpleSummary: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  simpleStatsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  simpleStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  simpleStatNumber: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  simpleStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  statNumber: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  overallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  overallText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  ingredientsCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ingredientName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  severityText: {
    ...Typography.small,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ingredientRationale: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
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