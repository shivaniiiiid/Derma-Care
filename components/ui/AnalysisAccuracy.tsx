import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface AnalysisAccuracyProps {
  confidence: number;
  isDetailedMode: boolean;
}

export default function AnalysisAccuracy({ confidence, isDetailedMode }: AnalysisAccuracyProps) {
  const getAccuracyLevel = (conf: number): { level: string; color: string; icon: keyof typeof MaterialIcons.glyphMap } => {
    if (conf >= 0.85) return { level: 'High', color: Colors.success, icon: 'verified' };
    if (conf >= 0.75) return { level: 'Good', color: Colors.primary, icon: 'check-circle' };
    if (conf >= 0.65) return { level: 'Fair', color: Colors.warning, icon: 'info' };
    return { level: 'Low', color: Colors.danger, icon: 'warning' };
  };

  const accuracy = getAccuracyLevel(confidence);

  if (!isDetailedMode) {
    return (
      <View style={styles.simpleContainer}>
        <MaterialIcons name={accuracy.icon} size={16} color={accuracy.color} />
        <Text style={[styles.simpleText, { color: accuracy.color }]}>
          {accuracy.level} Confidence
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.detailedContainer}>
      <View style={styles.header}>
        <MaterialIcons name="analytics" size={20} color={Colors.primary} />
        <Text style={styles.title}>Analysis Confidence</Text>
      </View>
      
      <View style={styles.confidenceBar}>
        <View style={styles.confidenceTrack}>
          <View 
            style={[
              styles.confidenceFill, 
              { 
                width: `${confidence * 100}%`, 
                backgroundColor: accuracy.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(confidence * 100)}% ({accuracy.level})
        </Text>
      </View>

      <Text style={styles.description}>
        This analysis is based on image characteristics and pattern recognition. 
        Same image will always produce consistent results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  simpleText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  detailedContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  confidenceBar: {
    marginBottom: Spacing.sm,
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  description: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});