import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SetupState = {
  isSetuped: boolean;
  setIsSetuped: () => void;
  Exit: () => void;
};

export const useSetupStore = create(
    persist<SetupState>((set) => ({
    isSetuped: false,
    setIsSetuped: () => set({ isSetuped: true }),
    Exit: () => set({ isSetuped: false }),
  
}),{
    name: 'setup-storage',
    storage: createJSONStorage(() => ({
    setItem: setItemAsync,
    getItem: getItemAsync,
    removeItem: deleteItemAsync,
  })),
}));




