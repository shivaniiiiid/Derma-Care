import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { SkinHistory } from '@/types';

interface ProgressChartProps {
  history: SkinHistory[];
  isDetailedMode: boolean;
}

export default function ProgressChart({ history, isDetailedMode }: ProgressChartProps) {
  if (history.length === 0) {
    return null;
  }

  const getProgressData = () => {
    // Group by month for progress tracking
    const monthlyData: { [key: string]: { healthy: number; issues: number } } = {};
    
    history.forEach(item => {
      const date = new Date(item.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { healthy: 0, issues: 0 };
      }
      
      if (item.result.severity === 'low') {
        monthlyData[monthKey].healthy++;
      } else {
        monthlyData[monthKey].issues++;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      healthy: data.healthy,
      issues: data.issues,
      total: data.healthy + data.issues,
      healthyPercentage: (data.healthy / (data.healthy + data.issues)) * 100
    })).slice(-6); // Last 6 months
  };

  const progressData = getProgressData();
  const latestHealthy = progressData[progressData.length - 1]?.healthyPercentage || 0;
  const trend = progressData.length > 1 ? 
    latestHealthy - progressData[progressData.length - 2].healthyPercentage : 0;

  if (!isDetailedMode) {
    return (
      <View style={styles.simpleProgress}>
        <View style={styles.simpleProgressHeader}>
          <MaterialIcons name="trending-up" size={24} color={Colors.primary} />
          <Text style={styles.simpleProgressTitle}>Your Progress</Text>
        </View>
        <View style={styles.simpleStats}>
          <View style={styles.simpleStat}>
            <Text style={[styles.simpleStatNumber, { color: Colors.success }]}>
              {Math.round(latestHealthy)}%
            </Text>
            <Text style={styles.simpleStatLabel}>Healthy Scans</Text>
          </View>
          <View style={styles.simpleStat}>
            <MaterialIcons 
              name={trend >= 0 ? "trending-up" : "trending-down"}
              size={32}
              color={trend >= 0 ? Colors.success : Colors.warning}
            />
            <Text style={styles.simpleStatLabel}>
              {trend >= 0 ? 'Getting Better!' : 'Keep Working!'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.detailedProgress}>
      <View style={styles.progressHeader}>
        <MaterialIcons name="analytics" size={24} color={Colors.primary} />
        <Text style={styles.progressTitle}>Progress Analytics</Text>
      </View>

      <View style={styles.trendContainer}>
        <Text style={styles.trendTitle}>
          Skin Health Trend ({progressData.length} months)
        </Text>
        <View style={styles.chartContainer}>
          {progressData.map((data, index) => {
            const height = Math.max(data.healthyPercentage, 10); // Minimum height for visibility
            return (
              <View key={data.month} style={styles.barContainer}>
                <View style={styles.bar}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${height}%`,
                        backgroundColor: height > 70 ? Colors.success : 
                                       height > 40 ? Colors.warning : Colors.danger
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>
                  {new Date(data.month + '-01').toLocaleDateString('en', { month: 'short' })}
                </Text>
                <Text style={styles.barValue}>{Math.round(data.healthyPercentage)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Key Insights</Text>
        <View style={styles.insightItem}>
          <MaterialIcons 
            name={trend >= 0 ? "trending-up" : "trending-down"}
            size={16}
            color={trend >= 0 ? Colors.success : Colors.warning}
          />
          <Text style={styles.insightText}>
            {trend >= 0 
              ? `${Math.abs(trend).toFixed(1)}% improvement in skin health`
              : `${Math.abs(trend).toFixed(1)}% decline - consider routine adjustment`
            }
          </Text>
        </View>
        <View style={styles.insightItem}>
          <MaterialIcons name="info" size={16} color={Colors.primary} />
          <Text style={styles.insightText}>
            Total scans: {history.length} | Average health score: {Math.round(latestHealthy)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  simpleProgress: {
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
  simpleProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  simpleProgressTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  simpleStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  simpleStat: {
    flex: 1,
    alignItems: 'center',
  },
  simpleStatNumber: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  simpleStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailedProgress: {
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  trendContainer: {
    marginBottom: Spacing.md,
  },
  trendTitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  barValue: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  insightsTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  insightText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
  },
});