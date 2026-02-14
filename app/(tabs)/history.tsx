import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { Platform, Alert } from 'react-native';
import { SkinHistory } from '@/types';
import ProgressChart from '@/components/ui/ProgressChart';

export default function HistoryScreen() {
  const { skinHistory, clearHistory, isDetailedMode } = useApp();

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high'): keyof typeof MaterialIcons.glyphMap => {
    switch (severity) {
      case 'low': return 'check-circle';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'help';
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (isDetailedMode) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return date.toLocaleDateString();
  };

  const renderHistoryItem = ({ item }: { item: SkinHistory }) => (
    <View style={styles.historyCard}>
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.historyImage}
        contentFit="cover"
      />
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <Text style={styles.conditionName}>{item.result.condition}</Text>
          <MaterialIcons 
            name={getSeverityIcon(item.result.severity)} 
            size={20} 
            color={getSeverityColor(item.result.severity)} 
          />
        </View>
        
        {isDetailedMode && (
          <Text style={styles.medicalName}>
            {item.result.medicalName}
          </Text>
        )}
        
        <Text style={styles.recommendation} numberOfLines={2}>
          {item.result.recommendation}
        </Text>
        
        <View style={styles.historyFooter}>
          <Text style={styles.timestamp}>
            {formatDate(item.timestamp)}
          </Text>
          {isDetailedMode && (
            <Text style={styles.confidence}>
              {Math.round(item.result.confidence * 100)}% confidence
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="photo-camera" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {isDetailedMode ? 'No Analysis History' : 'No Photos Yet'}
      </Text>
      <Text style={styles.emptyText}>
        {isDetailedMode 
          ? 'Start analyzing your skin to build a comprehensive health record'
          : 'Take your first photo to start tracking your skin health'
        }
      </Text>
    </View>
  );
  const handleClearHistory = () => {
    try {
      if (Platform.OS === 'web') {
        if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
          clearHistory();
        }
      } else {
        Alert.alert(
          'Clear History',
          'Are you sure you want to clear all history? This cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Clear', 
              style: 'destructive',
              onPress: () => clearHistory()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="history" size={32} color={Colors.success} />
          <Text style={styles.title}>
            {isDetailedMode ? 'Analysis History' : 'My Photos'}
          </Text>
        </View>
                {skinHistory.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <MaterialIcons name="delete" size={20} color={Colors.danger} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isDetailedMode && skinHistory.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{skinHistory.length}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {skinHistory.filter(h => h.result.severity === 'low').length}
            </Text>
            <Text style={styles.statLabel}>Healthy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {skinHistory.filter(h => h.result.severity !== 'low').length}
            </Text>
            <Text style={styles.statLabel}>Needs Care</Text>
          </View>
        </View>
      )}

      <ProgressChart history={skinHistory} isDetailedMode={isDetailedMode} />

      <FlatList
        data={skinHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          skinHistory.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  clearButtonText: {
    ...Typography.caption,
    color: Colors.danger,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: Spacing.md,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyImage: {
    width: 80,
    height: 80,
  },
  historyContent: {
    flex: 1,
    padding: Spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  conditionName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  medicalName: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  recommendation: {
    ...Typography.small,
    color: Colors.text,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  confidence: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});