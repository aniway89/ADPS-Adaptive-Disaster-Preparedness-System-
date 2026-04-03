import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SetupState = {
  isSetuped: boolean;

  // ✅ separate variables (no object = no conflict)
  adults: number;

  // existing functions (UNCHANGED behavior)
  setIsSetuped: () => void;
  Exit: () => void;

  // new setters
  setAdults: (val: number) => void;
};

export const useSetupStore = create(
  persist<SetupState>(
    (set) => ({
      isSetuped: false,

      // ✅ flat state (safe for JSON)
      adults: 1,

      // ✅ KEEP AS YOU WANTED
      setIsSetuped: () => set({ isSetuped: true }),
      Exit: () => set({ isSetuped: false }),

      // ✅ simple setters (no spreading, no nesting)
      setAdults: (val) => set({ adults: val }),
    }),
    {
      name: 'setup-storage',

      storage: createJSONStorage(() => ({
        setItem: setItemAsync,
        getItem: getItemAsync,
        removeItem: deleteItemAsync,
      })),

      // 🔥 EXTRA SAFETY (prevents future bugs)
      partialize: (state) => ({
        isSetuped: state.isSetuped,
        adults: state.adults,
      }),
    }
  )
);