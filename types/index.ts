export interface SkinAnalysisResult {
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  medicalName?: string;
  description?: string;
  affectedArea?: number;
}

export interface IngredientAnalysis {
  ingredient: string;
  safe: boolean;
  severity: 'safe' | 'caution' | 'harmful';
  rationale: string;
}

export interface UVData {
  index: number;
  level: string;
  recommendation: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  allergies: string[];
  isDetailedMode: boolean;
}

export interface SkinHistory {
  id: string;
  imageUri: string;
  result: SkinAnalysisResult;
  timestamp: number;
  notes?: string;
}