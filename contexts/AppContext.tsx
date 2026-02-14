import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, SkinHistory } from '@/types';

interface AppContextType {
  userProfile: UserProfile | null;
  isDetailedMode: boolean;
  skinHistory: SkinHistory[];
  isFirstTime: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  toggleDetailedMode: () => void;
  addSkinHistory: (history: SkinHistory) => void;
  clearHistory: () => void;
  setFirstTime: (isFirst: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [skinHistory, setSkinHistory] = useState<SkinHistory[]>([]);
  const [isFirstTime, setIsFirstTimeState] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const historyData = await AsyncStorage.getItem('skinHistory');
      const modeData = await AsyncStorage.getItem('isDetailedMode');
      const firstTimeData = await AsyncStorage.getItem('isFirstTime');
      
      if (profileData) {
        setUserProfileState(JSON.parse(profileData));
      }
      if (historyData) {
        setSkinHistory(JSON.parse(historyData));
      }
      if (modeData) {
        setIsDetailedMode(JSON.parse(modeData));
      }
      if (firstTimeData !== null) {
        setIsFirstTimeState(JSON.parse(firstTimeData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setUserProfile = async (profile: UserProfile | null) => {
    try {
      setUserProfileState(profile);
      if (profile) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem('userProfile');
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const toggleDetailedMode = async () => {
    try {
      const newMode = !isDetailedMode;
      setIsDetailedMode(newMode);
      await AsyncStorage.setItem('isDetailedMode', JSON.stringify(newMode));
    } catch (error) {
      console.error('Error saving mode preference:', error);
    }
  };

  const addSkinHistory = async (history: SkinHistory) => {
    try {
      const newHistory = [history, ...skinHistory].slice(0, 50); // Keep last 50 records
      setSkinHistory(newHistory);
      await AsyncStorage.setItem('skinHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving skin history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setSkinHistory([]);
      await AsyncStorage.removeItem('skinHistory');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const setFirstTime = async (isFirst: boolean) => {
    try {
      setIsFirstTimeState(isFirst);
      await AsyncStorage.setItem('isFirstTime', JSON.stringify(isFirst));
    } catch (error) {
      console.error('Error saving first time flag:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        isDetailedMode,
        skinHistory,
        isFirstTime,
        setUserProfile,
        toggleDetailedMode,
        addSkinHistory,
        clearHistory,
        setFirstTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}