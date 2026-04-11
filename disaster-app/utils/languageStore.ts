import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Language = 'en' | 'ja';

type LanguageState = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

export const useLanguageStore = create(
  persist<LanguageState>(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);