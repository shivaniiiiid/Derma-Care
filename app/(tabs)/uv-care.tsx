import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { fetchUVIndex } from '@/services/weatherService';
import { UVData } from '@/types';
import { useApp } from '@/hooks/useApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTTS } from '@/hooks/useTTS';

export default function UVCareScreen() {
  const [uvData, setUvData] = useState<UVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { isDetailedMode } = useApp();
  const { speak, isSpeaking } = useTTS();

  useEffect(() => {
    loadUVData();
  }, []);

    const loadUVData = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Use default location for demo
        const mockData = await fetchUVIndex(37.7749, -122.4194); // San Francisco
        setUvData(mockData);
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);
        const data = await fetchUVIndex(
          location.coords.latitude,
          location.coords.longitude
        );
        setUvData(data);
      }
    } catch (error) {
      console.error('Error loading UV data:', error);
      // Fallback to default location on error
      try {
        const mockData = await fetchUVIndex(37.7749, -122.4194);
        setUvData(mockData);
      } catch (fallbackError) {
        console.error('Fallback UV data error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUVColor = (index: number): string => {
    if (index <= 2) return Colors.success;
    if (index <= 5) return Colors.warning;
    if (index <= 7) return Colors.secondary;
    return Colors.danger;
  };

  const getUVEmoji = (index: number): string => {
    if (index <= 2) return '😊';
    if (index <= 5) return '😐';
    if (index <= 7) return '😟';
    return '😰';
  };
  const speakRecommendation = () => {
    try {
      if (uvData) {
        const message = isDetailedMode 
          ? `Current UV index is ${uvData.index}, level ${uvData.level}. ${uvData.recommendation}`
          : `UV is ${uvData.level} today. ${uvData.recommendation}`;
        speak(message);
      } else {
        speak('UV data not available. Please refresh to get current information.');
      }
    } catch (error) {
      console.error('Speak recommendation error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Getting UV information..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="wb-sunny" size={48} color={Colors.warning} />
          <Text style={styles.title}>
            {isDetailedMode ? 'UV Index Monitoring' : 'Sun Protection'}
          </Text>
          <Text style={styles.subtitle}>
            {isDetailedMode 
              ? 'Real-time UV radiation monitoring and protection recommendations'
              : 'Check how strong the sun is today'
            }
          </Text>
        </View>

        {uvData && (
          <>
            <View style={styles.uvCard}>
              <View style={styles.uvHeader}>
                <Text style={styles.uvTitle}>
                  {isDetailedMode ? 'Current UV Index' : 'Sun Strength Today'}
                </Text>
                <TouchableOpacity onPress={loadUVData} style={styles.refreshButton}>
                  <MaterialIcons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.uvDisplay}>
                <View style={[styles.uvCircle, { borderColor: getUVColor(uvData.index) }]}>
                  <Text style={[styles.uvNumber, { color: getUVColor(uvData.index) }]}>
                    {uvData.index}
                  </Text>
                  {!isDetailedMode && (
                    <Text style={styles.uvEmoji}>{getUVEmoji(uvData.index)}</Text>
                  )}
                </View>
                <View style={styles.uvInfo}>
                  <Text style={[styles.uvLevel, { color: getUVColor(uvData.index) }]}>
                    {uvData.level}
                  </Text>
                  {isDetailedMode && (
                    <Text style={styles.uvTimestamp}>
                      Updated: {new Date(uvData.timestamp).toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <MaterialIcons name="health-and-safety" size={24} color={Colors.primary} />
                <Text style={styles.recommendationTitle}>
                  {isDetailedMode ? 'Protection Recommendations' : 'What to Do'}
                </Text>
                <TouchableOpacity 
                  onPress={speakRecommendation}
                  style={styles.speakButton}
                  disabled={isSpeaking}
                >
                  <MaterialIcons 
                    name={isSpeaking ? "volume-up" : "volume-off"} 
                    size={20} 
                    color={Colors.accent} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.recommendationText}>
                {uvData.recommendation}
              </Text>
            </View>

            {isDetailedMode && (
              <View style={styles.detailedInfo}>
                <Text style={styles.sectionTitle}>UV Index Scale</Text>
                <View style={styles.scaleContainer}>
                  {[
                    { range: '0-2', level: 'Low', color: Colors.success },
                    { range: '3-5', level: 'Moderate', color: Colors.warning },
                    { range: '6-7', level: 'High', color: Colors.secondary },
                    { range: '8-10', level: 'Very High', color: Colors.danger },
                    { range: '11+', level: 'Extreme', color: '#8B0000' },
                  ].map((item, index) => (
                    <View key={index} style={styles.scaleItem}>
                      <View style={[styles.scaleColor, { backgroundColor: item.color }]} />
                      <Text style={styles.scaleRange}>{item.range}</Text>
                      <Text style={styles.scaleLevel}>{item.level}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.tipsContainer}>
          <MaterialIcons name="tips-and-updates" size={24} color={Colors.accent} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>
              {isDetailedMode ? 'General Sun Safety Tips' : 'Stay Safe in the Sun'}
            </Text>
            <Text style={styles.tipsText}>
              {isDetailedMode 
                ? '• Apply broad-spectrum SPF 30+ sunscreen 15-30 minutes before exposure\n• Reapply every 2 hours or after swimming/sweating\n• Seek shade between 10 AM - 4 PM when UV is strongest\n• Wear protective clothing, wide-brimmed hats, and UV-blocking sunglasses'
                : '• Use sunscreen with SPF 30 or higher\n• Stay in shade when possible\n• Wear a hat and sunglasses\n• Drink lots of water'
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
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  uvCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  uvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  uvTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  refreshButton: {
    padding: Spacing.xs,
  },
  uvDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  uvCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uvNumber: {
    ...Typography.h1,
    fontWeight: '700',
  },
  uvEmoji: {
    fontSize: 24,
    marginTop: Spacing.xs,
  },
  uvInfo: {
    flex: 1,
  },
  uvLevel: {
    ...Typography.h2,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  uvTimestamp: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  recommendationCard: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  recommendationTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  speakButton: {
    padding: Spacing.xs,
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  detailedInfo: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
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
  scaleContainer: {
    gap: Spacing.sm,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scaleColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  scaleRange: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    minWidth: 40,
  },
  scaleLevel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsContent: {
    flex: 1,
    marginLeft: Spacing.sm,
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