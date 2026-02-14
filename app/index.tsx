import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useApp } from '@/hooks/useApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function IndexScreen() {
  const { isFirstTime } = useApp();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Small delay to ensure context is loaded
        setTimeout(() => {
          if (isFirstTime) {
            router.replace('/onboarding');
          } else {
            router.replace('/(tabs)');
          }
        }, 100);
      } catch (error) {
        console.error('Onboarding check error:', error);
        router.replace('/(tabs)');
      }
    };

    checkOnboarding();
  }, [isFirstTime]);

  return <LoadingSpinner message="Loading Derma Care..." />;
}