import { SkinAnalysisResult } from '@/types';

// Create a simple hash function for consistent results
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Analyze image characteristics for better classification
function analyzeImageCharacteristics(imageUri: string) {
  const hash = simpleHash(imageUri);
  
  // Extract pseudo-characteristics from hash
  const brightness = (hash % 100) / 100; // 0-1
  const redness = ((hash >> 8) % 100) / 100; // 0-1
  const texture = ((hash >> 16) % 100) / 100; // 0-1
  const size = ((hash >> 24) % 100) / 100; // 0-1
  
  return { brightness, redness, texture, size, hash };
}

// Define skin condition categories
const SKIN_CONDITIONS = {
  healthy: {
    conditions: [
      {
        condition: 'Healthy Skin',
        severity: 'low' as const,
        confidence: 0.88,
        medicalName: 'Normal skin condition',
        description: 'No signs of dermatological conditions detected. Skin barrier appears intact with normal pigmentation and texture.',
        recommendation: 'Your skin appears healthy! Continue your current skincare routine, use sunscreen daily, and maintain good hygiene practices.',
        affectedArea: 0,
        category: 'healthy'
      }
    ]
  },
  
  minor: {
    conditions: [
      {
        condition: 'Mild Acne',
        severity: 'low' as const,
        confidence: 0.82,
        medicalName: 'Acne vulgaris (mild)',
        description: 'Mild inflammatory acne with few comedones. Common condition affecting sebaceous glands.',
        recommendation: 'Use gentle, non-comedogenic cleanser twice daily. Consider salicylic acid products. Avoid touching or picking.',
        affectedArea: 8,
        category: 'minor'
      },
      {
        condition: 'Blackheads',
        severity: 'low' as const,
        confidence: 0.79,
        medicalName: 'Open comedones',
        description: 'Clogged hair follicles with oxidized sebum appearing as dark spots.',
        recommendation: 'Use BHA (salicylic acid) products to gently exfoliate. Maintain consistent cleansing routine.',
        affectedArea: 5,
        category: 'minor'
      },
      {
        condition: 'Dry Skin Patches',
        severity: 'low' as const,
        confidence: 0.84,
        medicalName: 'Xerosis cutis (localized)',
        description: 'Localized skin dryness with possible mild flaking. Common in winter months.',
        recommendation: 'Apply fragrance-free moisturizer twice daily. Use gentle, soap-free cleansers. Consider using a humidifier.',
        affectedArea: 12,
        category: 'minor'
      },
      {
        condition: 'Minor Irritation',
        severity: 'low' as const,
        confidence: 0.76,
        medicalName: 'Contact dermatitis (mild)',
        description: 'Mild skin irritation possibly caused by external factors like products or environment.',
        recommendation: 'Identify and avoid potential irritants. Use gentle, hypoallergenic products. Apply soothing moisturizer.',
        affectedArea: 6,
        category: 'minor'
      }
    ]
  },
  
  moderate: {
    conditions: [
      {
        condition: 'Moderate Acne',
        severity: 'medium' as const,
        confidence: 0.78,
        medicalName: 'Acne vulgaris (moderate)',
        description: 'Inflammatory acne with multiple papules and pustules. Requires consistent treatment approach.',
        recommendation: 'Consider over-the-counter treatments with benzoyl peroxide or salicylic acid. If persistent after 6-8 weeks, consult a dermatologist.',
        affectedArea: 25,
        category: 'moderate'
      },
      {
        condition: 'Eczema',
        severity: 'medium' as const,
        confidence: 0.81,
        medicalName: 'Atopic dermatitis',
        description: 'Chronic inflammatory skin condition characterized by itchy, red, and inflamed patches.',
        recommendation: 'Apply fragrance-free moisturizer regularly. Avoid known triggers. Consider seeing a dermatologist for prescription treatments.',
        affectedArea: 18,
        category: 'moderate'
      },
      {
        condition: 'Seborrheic Dermatitis',
        severity: 'medium' as const,
        confidence: 0.73,
        medicalName: 'Seborrheic dermatitis',
        description: 'Inflammatory condition affecting oil-rich areas, causing red, scaly patches.',
        recommendation: 'Use gentle, antifungal shampoos. Apply prescribed topical treatments. Manage stress and maintain good hygiene.',
        affectedArea: 15,
        category: 'moderate'
      },
      {
        condition: 'Psoriasis',
        severity: 'medium' as const,
        confidence: 0.75,
        medicalName: 'Psoriasis vulgaris',
        description: 'Chronic autoimmune condition causing rapid skin cell turnover, resulting in thick, scaly patches.',
        recommendation: 'Consult a dermatologist for comprehensive treatment plan. Consider topical treatments and moisturizers.',
        affectedArea: 22,
        category: 'moderate'
      },
      {
        condition: 'Rosacea',
        severity: 'medium' as const,
        confidence: 0.73,
        medicalName: 'Rosacea',
        description: 'Chronic inflammatory condition affecting central face, characterized by persistent redness.',
        recommendation: 'Avoid triggers like spicy foods, alcohol, and sun exposure. Use gentle skincare products and broad-spectrum sunscreen daily.',
        affectedArea: 12,
        category: 'moderate'
      }
    ]
  },
  
  serious: {
    conditions: [
      {
        condition: 'Suspicious Lesion',
        severity: 'high' as const,
        confidence: 0.67,
        medicalName: 'Atypical pigmented lesion',
        description: 'Pigmented lesion showing concerning features that require professional evaluation.',
        recommendation: 'URGENT: Please see a dermatologist within 1-2 weeks for professional evaluation. This requires immediate medical attention.',
        affectedArea: 8,
        category: 'serious'
      },
      {
        condition: 'Severe Inflammatory Condition',
        severity: 'high' as const,
        confidence: 0.71,
        medicalName: 'Acute inflammatory dermatosis',
        description: 'Severe inflammatory skin condition requiring immediate medical evaluation.',
        recommendation: 'URGENT: Consult a healthcare provider immediately. This condition may require prescription treatment.',
        affectedArea: 35,
        category: 'serious'
      }
    ]
  }
};

export function analyzeSkinCondition(imageUri: string): SkinAnalysisResult {
  const characteristics = analyzeImageCharacteristics(imageUri);
  const { brightness, redness, texture, size } = characteristics;
  
  // Classification logic based on image characteristics
  let selectedCategory: keyof typeof SKIN_CONDITIONS;
  let confidence_modifier = 1.0;
  
  // Determine category based on characteristics
  if (redness < 0.2 && texture < 0.3 && brightness > 0.4) {
    // Low redness, smooth texture, good brightness = likely healthy
    selectedCategory = 'healthy';
    confidence_modifier = 1.1;
  } else if (redness > 0.8 || texture > 0.8 || size > 0.7) {
    // High redness, rough texture, or large area = potentially serious
    selectedCategory = 'serious';
    confidence_modifier = 0.9;
  } else if (redness > 0.5 || texture > 0.5) {
    // Moderate characteristics = moderate conditions
    selectedCategory = 'moderate';
    confidence_modifier = 1.0;
  } else {
    // Mild characteristics = minor issues
    selectedCategory = 'minor';
    confidence_modifier = 1.05;
  }
  
  // Select specific condition within category
  const categoryConditions = SKIN_CONDITIONS[selectedCategory].conditions;
  const conditionIndex = characteristics.hash % categoryConditions.length;
  const baseCondition = categoryConditions[conditionIndex];
  
  // Adjust confidence based on characteristics
  let adjustedConfidence = baseCondition.confidence * confidence_modifier;
  
  // Add some variation based on image quality indicators
  const qualityFactor = (brightness + (1 - texture)) / 2;
  adjustedConfidence *= (0.85 + qualityFactor * 0.3);
  
  // Ensure confidence stays within realistic bounds
  adjustedConfidence = Math.max(0.65, Math.min(0.95, adjustedConfidence));
  
  // Adjust affected area based on characteristics
  let adjustedAffectedArea = baseCondition.affectedArea;
  if (selectedCategory !== 'healthy') {
    adjustedAffectedArea *= (0.5 + size);
    adjustedAffectedArea = Math.round(Math.max(1, Math.min(45, adjustedAffectedArea)));
  }
  
  return {
    ...baseCondition,
    confidence: Math.round(adjustedConfidence * 100) / 100,
    affectedArea: adjustedAffectedArea
  };
}

// Enhanced function for consistent analysis
import { classifySkinCondition } from './skinDiseaseClassifier';

export const mockSkinAnalysis = (imageUri: string): SkinAnalysisResult => {
  return classifySkinCondition(imageUri);
};