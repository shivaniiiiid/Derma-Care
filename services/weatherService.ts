import { UVData } from '@/types';

// Mock weather service - replace with real OpenWeatherMap API
export const fetchUVIndex = async (lat: number, lon: number): Promise<UVData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockUVIndex = Math.floor(Math.random() * 11) + 1;
  
  const getUVLevel = (index: number): string => {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
  };
  
  const getRecommendation = (index: number): string => {
    if (index <= 2) return 'No protection needed. You can safely enjoy being outside.';
    if (index <= 5) return 'Some protection required. Wear sunscreen and a hat.';
    if (index <= 7) return 'Protection essential. Avoid sun during midday hours.';
    if (index <= 10) return 'Extra protection needed. Minimize sun exposure.';
    return 'Avoid sun exposure. Stay indoors if possible.';
  };
  
  return {
    index: mockUVIndex,
    level: getUVLevel(mockUVIndex),
    recommendation: getRecommendation(mockUVIndex),
    timestamp: Date.now(),
  };
};