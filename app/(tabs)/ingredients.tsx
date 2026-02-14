import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { analyzeIngredients } from '@/services/mockData';
import { useApp } from '@/hooks/useApp';

export default function IngredientsScreen() {
  const [ingredientText, setIngredientText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { isDetailedMode } = useApp();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAnalyze = async () => {
    if (!ingredientText.trim()) {
      showAlert('Input Required', 'Please enter ingredients to analyze.');
      return;
    }
    
    if (isAnalyzing) return; // Prevent multiple simultaneous requests
    
    try {
      setIsAnalyzing(true);
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const results = analyzeIngredients(ingredientText);
      
      router.push({
        pathname: '/ingredient-result',
        params: { 
          results: JSON.stringify(results),
          originalText: ingredientText 
        }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      showAlert('Error', 'Failed to analyze ingredients. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectExample = (example: string) => {
    try {
      setIngredientText(example);
    } catch (error) {
      console.error('Example selection error:', error);
    }
  };

  const exampleIngredients = [
    'Water, Hyaluronic Acid, Niacinamide, Glycerin',
    'Aqua, Sodium Lauryl Sulfate, Parabens, Fragrance',
    'Retinol, Vitamin C, Ceramides, Peptides'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="search" size={48} color={Colors.accent} />
          <Text style={styles.title}>
            {isDetailedMode ? 'Ingredient Analysis' : 'Check Your Products'}
          </Text>
          <Text style={styles.subtitle}>
            {isDetailedMode 
              ? 'Get detailed safety analysis of cosmetic ingredients'
              : 'Find out if your skincare products are safe to use'
            }
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {isDetailedMode ? 'Product Ingredients List' : 'What is in your product?'}
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder={isDetailedMode 
              ? 'Paste the full ingredients list from your product label...'
              : 'Type or paste ingredients here...'
            }
            value={ingredientText}
            onChangeText={setIngredientText}
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={[
              styles.analyzeButton, 
              (!ingredientText.trim() || isAnalyzing) && styles.disabledButton
            ]}
            onPress={handleAnalyze}
            disabled={!ingredientText.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={20} color={Colors.background} />
                <Text style={styles.analyzeButtonText}>
                  {isDetailedMode ? 'Analyzing...' : 'Checking...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>
                {isDetailedMode ? 'Analyze Ingredients' : 'Check Safety'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>
            {isDetailedMode ? 'Sample Ingredient Lists' : 'Try These Examples'}
          </Text>
          {exampleIngredients.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleCard}
              onPress={() => selectExample(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
              <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <MaterialIcons name="lightbulb" size={24} color={Colors.warning} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips</Text>
            <Text style={styles.tipsText}>
              {isDetailedMode 
                ? '• Copy ingredients from product packaging or website\n• Include all listed ingredients for comprehensive analysis\n• Check expiration dates and storage recommendations'
                : '• Look for ingredients list on your product\n• Copy and paste works best\n• Check one product at a time'
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
  inputContainer: {
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
  inputLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  textInput: {
    ...Typography.body,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: Colors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  analyzeButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  examplesContainer: {
    marginBottom: Spacing.lg,
  },
  examplesTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  exampleText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
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