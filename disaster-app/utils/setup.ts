import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SetupState = {
  isSetuped: boolean;

  adults: number;
  location: string;

  setIsSetuped: () => void;
  Exit: () => void;

  setAdults: (val: number) => void;
  setLocation: (value: string) => void;
};

export const useSetupStore = create(
  persist<SetupState>(
    (set) => ({
      isSetuped: false,

      // ✅ flat state (safe for JSON)
      adults: 1,
      location: "",

      setIsSetuped: () => set({ isSetuped: true }),
      Exit: () => set({ isSetuped: false }),

      setAdults: (val) => set({ adults: val }),
      setLocation: (value) => set({ location: value }),
    }),
    {
      name: 'setup-storage',

      storage: createJSONStorage(() => ({
        setItem: setItemAsync,
        getItem: getItemAsync,
        removeItem: deleteItemAsync,
      })),

      // 🔥 EXTRA SAFETY (prevents future bugs)
      partialize: (state): Pick<SetupState, 'isSetuped' | 'adults' | 'location'> => ({
        isSetuped: state.isSetuped,
        adults: state.adults,
        location: state.location,
      }),
    }
  )
);