import { useState } from 'react';
import { Platform } from 'react-native';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.warn('TTS: Empty text provided');
      return;
    }

    if (isSpeaking) {
      stop();
    }

    setIsSpeaking(true);
    
    try {
      if (Platform.OS === 'web') {
        // Use Web Speech API for web platform
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.pitch = 1.0;
          utterance.lang = 'en-US';
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            setIsSpeaking(false);
          };
          utterance.onstart = () => {
            // Speech started
          };
          
          // Small delay to ensure previous speech is cancelled
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        } else {
          // TTS not supported on this browser
          setIsSpeaking(false);
        }
      } else {
        // For mobile platforms, simulate TTS (replace with expo-speech in production)
        setTimeout(() => setIsSpeaking(false), Math.min(text.length * 50, 5000));
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };
  const stop = () => {
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch (error) {
      console.error('TTS stop error:', error);
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
  };
}