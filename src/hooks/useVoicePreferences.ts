import { useState, useEffect, useCallback } from 'react';

export interface VoicePreferences {
  voice: string;
  inputMode: 'push-to-talk' | 'continuous';
  speechRate: number;
  autoConnect: boolean;
  showTranscript: boolean;
  enableNotifications: boolean;
}

const DEFAULT_PREFERENCES: VoicePreferences = {
  voice: 'alloy',
  inputMode: 'continuous',
  speechRate: 1.0,
  autoConnect: false,
  showTranscript: true,
  enableNotifications: true
};

const STORAGE_KEY = 'accountantai-voice-preferences';

export const useVoicePreferences = () => {
  const [preferences, setPreferences] = useState<VoicePreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Error loading voice preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: Partial<VoicePreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving voice preferences:', error);
      }
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting voice preferences:', error);
    }
  }, []);

  return {
    preferences,
    isLoaded,
    savePreferences,
    resetPreferences,
    AVAILABLE_VOICES: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
      { id: 'ash', name: 'Ash', description: 'Warm and conversational' },
      { id: 'ballad', name: 'Ballad', description: 'Melodic and expressive' },
      { id: 'coral', name: 'Coral', description: 'Clear and articulate' },
      { id: 'echo', name: 'Echo', description: 'Calm and measured' },
      { id: 'sage', name: 'Sage', description: 'Wise and thoughtful' },
      { id: 'shimmer', name: 'Shimmer', description: 'Bright and energetic' },
      { id: 'verse', name: 'Verse', description: 'Dynamic and engaging' }
    ]
  };
};
