import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useTTS } from '@/hooks/useTTS';
import AnalysisAccuracy from '@/components/ui/AnalysisAccuracy';
import classifySkinCondition from '@/services/skinDiseaseClassifier';

export default function ScanResultScreen() {
  const { historyId } = useLocalSearchParams<{ historyId: string }>();
  const { skinHistory, isDetailedMode } = useApp();
  const { speak, isSpeaking } = useTTS();
  const [activeTab, setActiveTab] = useState<'overview' | 'home' | 'otc' | 'lifestyle'>('overview');

  const historyItem = skinHistory.find(item => item.id === historyId);

  if (!historyItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={Colors.textSecondary} />
          <Text style={styles.errorText}>Result not found</Text>
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

  const { result, imageUri } = historyItem;
  
  // Get full disease info with remedies
  const fullResult = classifySkinCondition(imageUri);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return 'check-circle';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'help';
    }
  };

  const getSimpleRecommendation = (severity: string, condition: string) => {
    if (severity === 'low') {
      return "Your skin looks healthy! Keep up your current routine.";
    } else if (severity === 'medium') {
      return `Detected ${condition}. Follow the care tips below to improve.`;
    } else {
      return `Urgent: ${condition} detected. Please consult a dermatologist immediately.`;
    }
  };

  const speakResult = () => {
    const message = isDetailedMode 
      ? `Analysis complete. Detected ${result.condition} with ${Math.round(result.confidence * 100)}% confidence. ${result.recommendation}`
      : getSimpleRecommendation(result.severity, result.condition);
    speak(message);
  };

  const shareResult = async () => {
    try {
      const message = isDetailedMode
        ? `Derma Care Analysis:\nCondition: ${result.condition}\nConfidence: ${Math.round(result.confidence * 100)}%\nRecommendation: ${result.recommendation}`
        : `Derma Care Analysis:\n${getSimpleRecommendation(result.severity, result.condition)}`;
      
      if (Platform.OS === 'web') {
        navigator.share?.({ text: message }) || navigator.clipboard?.writeText(message);
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Error sharing result:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.resultImage} contentFit="cover" />
          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.speakButton} onPress={speakResult} disabled={isSpeaking}>
              <MaterialIcons 
                name={isSpeaking ? "volume-up" : "record-voice-over"} 
                size={24} 
                color={Colors.background} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {isDetailedMode ? (
          <DetailedResults result={result} fullResult={fullResult} activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <SimpleResults result={result} fullResult={fullResult} />
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={shareResult}>
            <MaterialIcons name="share" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/scan')}
          >
            <MaterialIcons name="camera-alt" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="info" size={20} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and should not replace professional medical advice. 
            Always consult a healthcare provider for medical concerns.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SimpleResults({ result, fullResult }: { result: any; fullResult: any }) {
  const severityColor = getSeverityColor(result.severity);
  const severityIcon = getSeverityIcon(result.severity);

  return (
    <View style={styles.resultsContainer}>
      <View style={styles.simpleResultCard}>
        <View style={styles.simpleResultHeader}>
          <MaterialIcons 
            name={severityIcon} 
            size={48} 
            color={severityColor} 
          />
          <View style={styles.simpleResultContent}>
            <Text style={styles.simpleConditionName}>{result.condition}</Text>
            <Text style={[styles.simpleSeverity, { color: severityColor }]}>
              {result.severity === 'low' ? '😊 Looking Good' : 
               result.severity === 'medium' ? '😐 Needs Attention' : '😟 See Doctor Soon'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.simpleRecommendation}>
          {getSimpleRecommendation(result.severity, result.condition)}
        </Text>

        {fullResult.expectedRecovery && (
          <View style={styles.recoveryContainer}>
            <MaterialIcons name="access-time" size={18} color={Colors.accent} />
            <Text style={styles.recoveryText}>{fullResult.expectedRecovery}</Text>
          </View>
        )}

        <AnalysisAccuracy confidence={result.confidence} isDetailedMode={false} />
      </View>

      {/* Simple Care Tips */}
      {fullResult.homeRemedies && fullResult.homeRemedies.length > 0 && (
        <View style={styles.simpleCareCard}>
          <Text style={styles.simpleCareTitle}>🏠 Easy Home Care</Text>
          {fullResult.homeRemedies.slice(0, 3).map((remedy: any, index: number) => (
            <View key={index} style={styles.simpleRemedyItem}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success} />
              <Text style={styles.simpleRemedyText}>{remedy.step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Do's and Don'ts */}
      {fullResult.doAndDont && (
        <View style={styles.simpleTipsCard}>
          <Text style={styles.simpleCareTitle}>✅ Do This</Text>
          {fullResult.doAndDont.do.slice(0, 3).map((tip: string, index: number) => (
            <View key={index} style={styles.simpleRemedyItem}>
              <MaterialIcons name="thumb-up" size={18} color={Colors.success} />
              <Text style={styles.simpleTipText}>{tip}</Text>
            </View>
          ))}
          
          <Text style={[styles.simpleCareTitle, { marginTop: Spacing.md }]}>❌ Avoid This</Text>
          {fullResult.doAndDont.dont.slice(0, 3).map((tip: string, index: number) => (
            <View key={index} style={styles.simpleRemedyItem}>
              <MaterialIcons name="thumb-down" size={18} color={Colors.danger} />
              <Text style={styles.simpleTipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* When to See Doctor */}
      {fullResult.whenToSeeDoctor && (
        <View style={styles.doctorAlertCard}>
          <MaterialIcons name="local-hospital" size={24} color={Colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorAlertTitle}>When to See a Doctor:</Text>
            <Text style={styles.doctorAlertText}>{fullResult.whenToSeeDoctor}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function DetailedResults({ result, fullResult, activeTab, setActiveTab }: { result: any; fullResult: any; activeTab: string; setActiveTab: (tab: any) => void }) {
  const severityColor = getSeverityColor(result.severity);

  return (
    <View style={styles.resultsContainer}>
      <View style={styles.detailedResultCard}>
        <Text style={styles.sectionTitle}>Analysis Results</Text>
        
        <View style={styles.conditionContainer}>
          <Text style={styles.conditionName}>{result.condition}</Text>
          {result.medicalName && (
            <Text style={styles.medicalName}>({result.medicalName})</Text>
          )}
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={[styles.metricValue, { color: Colors.primary }]}>
              {Math.round(result.confidence * 100)}%
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Severity</Text>
            <Text style={[styles.metricValue, { color: severityColor }]}>
              {result.severity.toUpperCase()}
            </Text>
          </View>
          
          {result.affectedArea && result.affectedArea > 0 && (
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Affected Area</Text>
              <Text style={[styles.metricValue, { color: Colors.secondary }]}>
                {result.affectedArea}%
              </Text>
            </View>
          )}
        </View>

        {result.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{result.description}</Text>
          </View>
        )}

        {fullResult.expectedRecovery && (
          <View style={styles.recoveryInfoCard}>
            <MaterialIcons name="schedule" size={20} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.recoveryInfoTitle}>Expected Recovery Time</Text>
              <Text style={styles.recoveryInfoText}>{fullResult.expectedRecovery}</Text>
            </View>
          </View>
        )}

        {/* Treatment Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'home' && styles.activeTab]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Home Care</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'otc' && styles.activeTab]}
            onPress={() => setActiveTab('otc')}
          >
            <Text style={[styles.tabText, activeTab === 'otc' && styles.activeTabText]}>Treatments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'lifestyle' && styles.activeTab]}
            onPress={() => setActiveTab('lifestyle')}
          >
            <Text style={[styles.tabText, activeTab === 'lifestyle' && styles.activeTabText]}>Lifestyle</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <OverviewTab fullResult={fullResult} />
          )}
          {activeTab === 'home' && (
            <HomeRemediesTab fullResult={fullResult} />
          )}
          {activeTab === 'otc' && (
            <TreatmentsTab fullResult={fullResult} />
          )}
          {activeTab === 'lifestyle' && (
            <LifestyleTab fullResult={fullResult} />
          )}
        </View>

        <AnalysisAccuracy confidence={result.confidence} isDetailedMode={true} />
      </View>
    </View>
  );
}

function OverviewTab({ fullResult }: { fullResult: any }) {
  return (
    <View>
      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationTitle}>Professional Recommendation</Text>
        <Text style={styles.recommendationText}>{fullResult.recommendation}</Text>
      </View>

      {fullResult.whenToSeeDoctor && (
        <View style={styles.urgentCareCard}>
          <View style={styles.urgentCareHeader}>
            <MaterialIcons name="warning" size={24} color={Colors.danger} />
            <Text style={styles.urgentCareTitle}>When to Seek Medical Care</Text>
          </View>
          <Text style={styles.urgentCareText}>{fullResult.whenToSeeDoctor}</Text>
        </View>
      )}

      {fullResult.doAndDont && (
        <View style={styles.dosDontsContainer}>
          <View style={styles.dosSection}>
            <Text style={styles.dosTitle}>✓ Do's</Text>
            {fullResult.doAndDont.do.map((item: string, index: number) => (
              <View key={index} style={styles.doItem}>
                <MaterialIcons name="check" size={16} color={Colors.success} />
                <Text style={styles.doText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dontsSection}>
            <Text style={styles.dontsTitle}>✗ Don'ts</Text>
            {fullResult.doAndDont.dont.map((item: string, index: number) => (
              <View key={index} style={styles.dontItem}>
                <MaterialIcons name="close" size={16} color={Colors.danger} />
                <Text style={styles.dontText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function HomeRemediesTab({ fullResult }: { fullResult: any }) {
  if (!fullResult.homeRemedies || fullResult.homeRemedies.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="info" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyStateText}>No home remedies available for this condition</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.tabSectionTitle}>Natural Home Remedies</Text>
      {fullResult.homeRemedies.map((remedy: any, index: number) => (
        <View key={index} style={styles.remedyCard}>
          <View style={styles.remedyHeader}>
            <View style={styles.remedyNumber}>
              <Text style={styles.remedyNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.remedyStep}>{remedy.step}</Text>
          </View>
          {(remedy.duration || remedy.frequency) && (
            <View style={styles.remedyDetails}>
              {remedy.duration && (
                <View style={styles.remedyDetail}>
                  <MaterialIcons name="schedule" size={14} color={Colors.accent} />
                  <Text style={styles.remedyDetailText}>{remedy.duration}</Text>
                </View>
              )}
              {remedy.frequency && (
                <View style={styles.remedyDetail}>
                  <MaterialIcons name="repeat" size={14} color={Colors.accent} />
                  <Text style={styles.remedyDetailText}>{remedy.frequency}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function TreatmentsTab({ fullResult }: { fullResult: any }) {
  if (!fullResult.otcTreatments || fullResult.otcTreatments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="info" size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyStateText}>No specific treatments listed for this condition</Text>
      </View>
    );
  }

  const otcTreatments = fullResult.otcTreatments.filter((t: any) => t.type === 'otc');
  const prescriptionTreatments = fullResult.otcTreatments.filter((t: any) => t.type === 'prescription');

  return (
    <View>
      {otcTreatments.length > 0 && (
        <>
          <Text style={styles.tabSectionTitle}>Over-the-Counter Treatments</Text>
          {otcTreatments.map((treatment: any, index: number) => (
            <View key={index} style={styles.treatmentCard}>
              <View style={styles.treatmentHeader}>
                <MaterialIcons name="medical-services" size={20} color={Colors.primary} />
                <Text style={styles.treatmentName}>{treatment.name}</Text>
              </View>
              <Text style={styles.treatmentInstructions}>{treatment.instructions}</Text>
              {treatment.duration && (
                <View style={styles.treatmentMeta}>
                  <MaterialIcons name="event" size={14} color={Colors.textSecondary} />
                  <Text style={styles.treatmentMetaText}>Duration: {treatment.duration}</Text>
                </View>
              )}
              {treatment.notes && (
                <View style={styles.treatmentNote}>
                  <MaterialIcons name="info-outline" size={14} color={Colors.warning} />
                  <Text style={styles.treatmentNoteText}>{treatment.notes}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      {prescriptionTreatments.length > 0 && (
        <>
          <Text style={[styles.tabSectionTitle, { marginTop: Spacing.lg }]}>Prescription Options</Text>
          {prescriptionTreatments.map((treatment: any, index: number) => (
            <View key={index} style={[styles.treatmentCard, { borderLeftColor: Colors.danger }]}>
              <View style={styles.treatmentHeader}>
                <MaterialIcons name="local-pharmacy" size={20} color={Colors.danger} />
                <Text style={styles.treatmentName}>{treatment.name}</Text>
              </View>
              <Text style={styles.treatmentInstructions}>{treatment.instructions}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function LifestyleTab({ fullResult }: { fullResult: any }) {
  return (
    <View>
      {fullResult.lifestyleChanges && fullResult.lifestyleChanges.length > 0 && (
        <View style={styles.lifestyleSection}>
          <Text style={styles.tabSectionTitle}>Lifestyle Modifications</Text>
          {fullResult.lifestyleChanges.map((change: string, index: number) => (
            <View key={index} style={styles.lifestyleItem}>
              <MaterialIcons name="fitness-center" size={18} color={Colors.secondary} />
              <Text style={styles.lifestyleText}>{change}</Text>
            </View>
          ))}
        </View>
      )}

      {fullResult.preventionTips && fullResult.preventionTips.length > 0 && (
        <View style={[styles.lifestyleSection, { marginTop: Spacing.lg }]}>
          <Text style={styles.tabSectionTitle}>Prevention Tips</Text>
          {fullResult.preventionTips.map((tip: string, index: number) => (
            <View key={index} style={styles.lifestyleItem}>
              <MaterialIcons name="shield" size={18} color={Colors.accent} />
              <Text style={styles.lifestyleText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low': return Colors.success;
    case 'medium': return Colors.warning;
    case 'high': return Colors.danger;
    default: return Colors.textSecondary;
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'low': return 'check-circle';
    case 'medium': return 'warning';
    case 'high': return 'error';
    default: return 'help';
  }
}

function getSimpleRecommendation(severity: string, condition: string) {
  if (severity === 'low') {
    return "Your skin looks healthy! Keep up your current routine.";
  } else if (severity === 'medium') {
    return `Detected ${condition}. Follow the care tips below to improve.`;
  } else {
    return `Urgent: ${condition} detected. Please consult a dermatologist immediately.`;
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
  imageContainer: {
    position: 'relative',
    height: 250,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  speakButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
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
    marginBottom: Spacing.md,
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
  simpleConditionName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  simpleSeverity: {
    ...Typography.body,
    fontWeight: '600',
  },
  simpleRecommendation: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  recoveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  recoveryText: {
    ...Typography.small,
    color: Colors.text,
    flex: 1,
  },
  simpleCareCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  simpleCareTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  simpleRemedyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  simpleRemedyText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  simpleTipsCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  simpleTipText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  doctorAlertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
    gap: Spacing.sm,
  },
  doctorAlertTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: Spacing.xs,
  },
  doctorAlertText: {
    ...Typography.small,
    color: Colors.text,
    lineHeight: 18,
  },
  detailedResultCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  conditionContainer: {
    marginBottom: Spacing.lg,
  },
  conditionName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  medicalName: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginBottom: Spacing.lg,
  },
  descriptionTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  recoveryInfoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  recoveryInfoTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  recoveryInfoText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    marginTop: Spacing.md,
  },
  recommendationContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    marginBottom: Spacing.md,
  },
  recommendationTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  urgentCareCard: {
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginBottom: Spacing.md,
  },
  urgentCareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  urgentCareTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.danger,
  },
  urgentCareText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
  },
  dosDontsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dosSection: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  dosTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  doItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  doText: {
    ...Typography.small,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  dontsSection: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  dontsTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  dontText: {
    ...Typography.small,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  tabSectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  remedyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  remedyNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remedyNumberText: {
    ...Typography.small,
    color: Colors.background,
    fontWeight: '700',
  },
  remedyStep: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  remedyDetails: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    marginLeft: 32,
    gap: Spacing.md,
  },
  remedyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  remedyDetailText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  treatmentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  treatmentName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  treatmentInstructions: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  treatmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  treatmentMetaText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  treatmentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  treatmentNoteText: {
    ...Typography.small,
    color: Colors.text,
    flex: 1,
  },
  lifestyleSection: {
    marginBottom: Spacing.md,
  },
  lifestyleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  lifestyleText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
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
