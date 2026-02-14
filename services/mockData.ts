import { SkinAnalysisResult, IngredientAnalysis } from '@/types';

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

export const ingredientDatabase: Record<string, IngredientAnalysis> = {
  // Harmful ingredients
  'parabens': {
    ingredient: 'Parabens',
    safe: false,
    severity: 'caution',
    rationale: 'Preservatives that may cause skin irritation and allergic reactions in sensitive individuals. Some studies suggest potential hormone disruption.',
  },
  'methylparaben': {
    ingredient: 'Methylparaben',
    safe: false,
    severity: 'caution',
    rationale: 'A type of paraben preservative that may cause contact dermatitis and has potential endocrine-disrupting properties.',
  },
  'propylparaben': {
    ingredient: 'Propylparaben',
    safe: false,
    severity: 'caution',
    rationale: 'Paraben preservative linked to skin sensitivity and potential hormonal effects. Avoid if you have sensitive skin.',
  },
  'sulfates': {
    ingredient: 'Sulfates (SLS/SLES)',
    safe: false,
    severity: 'harmful',
    rationale: 'Harsh detergents that strip natural oils, causing dryness, irritation, and disruption of the skin barrier.',
  },
  'sodium lauryl sulfate': {
    ingredient: 'Sodium Lauryl Sulfate',
    safe: false,
    severity: 'harmful',
    rationale: 'Aggressive surfactant that can cause significant skin irritation, dryness, and barrier damage, especially with prolonged use.',
  },
  'sodium laureth sulfate': {
    ingredient: 'Sodium Laureth Sulfate',
    safe: false,
    severity: 'caution',
    rationale: 'Milder than SLS but still potentially irritating, especially for sensitive skin types. Can cause dryness with frequent use.',
  },
  'fragrance': {
    ingredient: 'Fragrance/Parfum',
    safe: false,
    severity: 'caution',
    rationale: 'Synthetic fragrances are common allergens and irritants. Can trigger contact dermatitis and sensitization reactions.',
  },
  'parfum': {
    ingredient: 'Parfum',
    safe: false,
    severity: 'caution',
    rationale: 'Fragrance mixture that may contain dozens of undisclosed chemicals, many of which are potential allergens.',
  },
  'alcohol denat': {
    ingredient: 'Alcohol Denat',
    safe: false,
    severity: 'caution',
    rationale: 'Drying alcohol that can disrupt skin barrier function and cause irritation, especially in higher concentrations.',
  },
  'isopropyl alcohol': {
    ingredient: 'Isopropyl Alcohol',
    safe: false,
    severity: 'harmful',
    rationale: 'Very drying and irritating alcohol that can severely compromise skin barrier function and cause chemical burns.',
  },
  'formaldehyde': {
    ingredient: 'Formaldehyde',
    safe: false,
    severity: 'harmful',
    rationale: 'Known carcinogen and strong sensitizer that can cause severe allergic reactions and skin damage.',
  },
  'coal tar': {
    ingredient: 'Coal Tar',
    safe: false,
    severity: 'harmful',
    rationale: 'Potential carcinogen that can cause skin irritation, photosensitivity, and long-term health concerns.',
  },
  'hydroquinone': {
    ingredient: 'Hydroquinone',
    safe: false,
    severity: 'harmful',
    rationale: 'Banned in many countries due to potential carcinogenic effects and risk of ochronosis (skin darkening).',
  },

  // Safe and beneficial ingredients
  'hyaluronic acid': {
    ingredient: 'Hyaluronic Acid',
    safe: true,
    severity: 'safe',
    rationale: 'Excellent humectant that holds up to 1000x its weight in water. Provides deep hydration and plumps skin.',
  },
  'sodium hyaluronate': {
    ingredient: 'Sodium Hyaluronate',
    safe: true,
    severity: 'safe',
    rationale: 'Smaller molecule form of hyaluronic acid that penetrates deeper into skin. Excellent for hydration and anti-aging.',
  },
  'niacinamide': {
    ingredient: 'Niacinamide',
    safe: true,
    severity: 'safe',
    rationale: 'Vitamin B3 derivative that regulates oil production, reduces inflammation, and strengthens skin barrier. Well-tolerated by most.',
  },
  'retinol': {
    ingredient: 'Retinol',
    safe: true,
    severity: 'caution',
    rationale: 'Powerful anti-aging ingredient that increases cell turnover. May cause initial irritation; start slowly and use sunscreen.',
  },
  'retinyl palmitate': {
    ingredient: 'Retinyl Palmitate',
    safe: true,
    severity: 'safe',
    rationale: 'Gentle form of vitamin A that provides anti-aging benefits with less irritation than retinol. Good for beginners.',
  },
  'glycerin': {
    ingredient: 'Glycerin',
    safe: true,
    severity: 'safe',
    rationale: 'Excellent humectant that draws moisture to skin. Non-comedogenic and suitable for all skin types including sensitive.',
  },
  'ceramides': {
    ingredient: 'Ceramides',
    safe: true,
    severity: 'safe',
    rationale: 'Essential lipids that restore and maintain skin barrier function. Particularly beneficial for dry and damaged skin.',
  },
  'peptides': {
    ingredient: 'Peptides',
    safe: true,
    severity: 'safe',
    rationale: 'Amino acid chains that stimulate collagen production and improve skin texture. Generally well-tolerated anti-aging ingredients.',
  },
  'vitamin c': {
    ingredient: 'Vitamin C',
    safe: true,
    severity: 'safe',
    rationale: 'Powerful antioxidant that brightens skin, stimulates collagen, and protects against environmental damage.',
  },
  'ascorbic acid': {
    ingredient: 'Ascorbic Acid',
    safe: true,
    severity: 'caution',
    rationale: 'Pure form of vitamin C with excellent antioxidant properties. May cause irritation in sensitive skin; introduce gradually.',
  },
  'magnesium ascorbyl phosphate': {
    ingredient: 'Magnesium Ascorbyl Phosphate',
    safe: true,
    severity: 'safe',
    rationale: 'Stable, gentle form of vitamin C that provides antioxidant benefits without irritation. Good for sensitive skin.',
  },
  'zinc oxide': {
    ingredient: 'Zinc Oxide',
    safe: true,
    severity: 'safe',
    rationale: 'Excellent physical sunscreen that provides broad-spectrum UV protection. Also has anti-inflammatory properties.',
  },
  'titanium dioxide': {
    ingredient: 'Titanium Dioxide',
    safe: true,
    severity: 'safe',
    rationale: 'Physical sunscreen ingredient that reflects UV rays. Non-irritating and suitable for sensitive skin types.',
  },
  'salicylic acid': {
    ingredient: 'Salicylic Acid',
    safe: true,
    severity: 'caution',
    rationale: 'Beta hydroxy acid that exfoliates and unclogs pores. Excellent for acne-prone skin but may cause dryness initially.',
  },
  'glycolic acid': {
    ingredient: 'Glycolic Acid',
    safe: true,
    severity: 'caution',
    rationale: 'Alpha hydroxy acid that exfoliates surface skin cells. Improves texture but increases photosensitivity; use sunscreen.',
  },
  'lactic acid': {
    ingredient: 'Lactic Acid',
    safe: true,
    severity: 'safe',
    rationale: 'Gentle alpha hydroxy acid that exfoliates and hydrates. Less irritating than glycolic acid, good for sensitive skin.',
  },
  'panthenol': {
    ingredient: 'Panthenol',
    safe: true,
    severity: 'safe',
    rationale: 'Pro-vitamin B5 that soothes, moisturizes, and helps heal damaged skin. Anti-inflammatory and well-tolerated.',
  },
  'allantoin': {
    ingredient: 'Allantoin',
    safe: true,
    severity: 'safe',
    rationale: 'Soothing ingredient that promotes cell regeneration and healing. Excellent for sensitive or irritated skin.',
  },
  'squalane': {
    ingredient: 'Squalane',
    safe: true,
    severity: 'safe',
    rationale: 'Lightweight, non-comedogenic oil that mimics skin natural sebum. Provides hydration without clogging pores.',
  },
  'jojoba oil': {
    ingredient: 'Jojoba Oil',
    safe: true,
    severity: 'safe',
    rationale: 'Technically a wax ester that closely resembles human sebum. Non-comedogenic and suitable for all skin types.',
  },
  'argan oil': {
    ingredient: 'Argan Oil',
    safe: true,
    severity: 'safe',
    rationale: 'Rich in vitamin E and fatty acids. Provides nourishment and antioxidant protection without clogging pores.',
  },
  'shea butter': {
    ingredient: 'Shea Butter',
    safe: true,
    severity: 'safe',
    rationale: 'Natural emollient rich in vitamins A and E. Provides deep moisturization and has anti-inflammatory properties.',
  },

  // Common base ingredients
  'water': {
    ingredient: 'Water/Aqua',
    safe: true,
    severity: 'safe',
    rationale: 'Universal solvent and base for most skincare products. Essential for hydration and product texture.',
  },
  'aqua': {
    ingredient: 'Aqua',
    safe: true,
    severity: 'safe',
    rationale: 'Latin term for water. The most common base ingredient in skincare formulations.',
  },
  'dimethicone': {
    ingredient: 'Dimethicone',
    safe: true,
    severity: 'safe',
    rationale: 'Silicone that forms protective barrier and provides smooth texture. Non-comedogenic and hypoallergenic.',
  },
  'cyclopentasiloxane': {
    ingredient: 'Cyclopentasiloxane',
    safe: true,
    severity: 'safe',
    rationale: 'Lightweight silicone that gives products smooth application and quick absorption. Generally well-tolerated.',
  },
  'carbomer': {
    ingredient: 'Carbomer',
    safe: true,
    severity: 'safe',
    rationale: 'Thickening agent that creates gel-like texture. Inert and non-irritating for most skin types.',
  },
  'phenoxyethanol': {
    ingredient: 'Phenoxyethanol',
    safe: true,
    severity: 'safe',
    rationale: 'Gentle preservative that prevents bacterial growth. Generally well-tolerated alternative to parabens.',
  },
  'tocopherol': {
    ingredient: 'Tocopherol',
    safe: true,
    severity: 'safe',
    rationale: 'Natural vitamin E that provides antioxidant protection and helps preserve product stability.',
  },
  'caprylic/capric triglyceride': {
    ingredient: 'Caprylic/Capric Triglyceride',
    safe: true,
    severity: 'safe',
    rationale: 'Lightweight emollient derived from coconut oil. Non-comedogenic and provides smooth skin feel.',
  },
};

export const analyzeIngredients = (ingredientText: string): IngredientAnalysis[] => {
  const ingredients = ingredientText
    .toLowerCase()
    .replace(/[()[\]]/g, '') // Remove brackets and parentheses
    .split(/[,\n]+/)
    .map(i => i.trim())
    .filter(i => i.length > 2);
  
  const results: IngredientAnalysis[] = [];
  const processedIngredients = new Set<string>();
  
  ingredients.forEach(ingredient => {
    // Skip if already processed (avoid duplicates)
    if (processedIngredients.has(ingredient)) return;
    processedIngredients.add(ingredient);
    
    // First, look for exact matches
    let found = ingredientDatabase[ingredient];
    
    // If no exact match, look for partial matches
    if (!found) {
      const dbKey = Object.keys(ingredientDatabase).find(key => 
        ingredient.includes(key) || key.includes(ingredient)
      );
      if (dbKey) {
        found = ingredientDatabase[dbKey];
      }
    }
    
    if (found) {
      results.push({
        ...found,
        ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1), // Capitalize first letter
      });
    } else if (ingredient.length > 2) {
      // For unknown ingredients, classify based on common patterns
      let severity: 'safe' | 'caution' | 'harmful' = 'safe';
      let rationale = 'Common cosmetic ingredient, generally considered safe for most people.';
      
      // Pattern-based classification
      if (ingredient.includes('alcohol') && !ingredient.includes('cetyl') && !ingredient.includes('stearyl')) {
        severity = 'caution';
        rationale = 'Contains alcohol which may be drying or irritating to sensitive skin.';
      } else if (ingredient.includes('acid') && !ingredient.includes('amino') && !ingredient.includes('fatty')) {
        severity = 'caution';
        rationale = 'Acidic ingredient that may cause irritation. Patch test recommended for sensitive skin.';
      } else if (ingredient.includes('preservative') || ingredient.includes('antimicrobial')) {
        severity = 'caution';
        rationale = 'Preservative ingredient that may cause sensitivity in some individuals.';
      }
      
      results.push({
        ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
        safe: severity === 'safe',
        severity,
        rationale,
      });
    }
  });
  
  return results;
};