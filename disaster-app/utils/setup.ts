import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SupplyItem = {
  id: string;
  name: string;
  location: string;
  exp: string;
  stock: boolean;
  category: string;
  isMust: boolean;
};

type LocationInfo = {
  street?: string;
  district?: string;
  city?: string;
  region?: string;
};

type SetupState = {
  isSetuped: boolean;
  adults: number;
  location: LocationInfo;
  coords: { lat: number; lon: number } | null;
  items: SupplyItem[];
  setIsSetuped: () => void;
  Exit: () => void;
  setAdults: (val: number) => void;
  setLocation: (value: LocationInfo) => void;
  setCoords: (lat: number, lon: number) => void;
  addItem: (item: SupplyItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
};

export const useSetupStore = create(
  persist<SetupState>(
    (set) => ({
      isSetuped: false,
      adults: 1,
      location: {},
      coords: null,
      items: [],
      setIsSetuped: () => set({ isSetuped: true }),
      Exit: () => set({ isSetuped: false }),
      setAdults: (val) => set({ adults: val }),
      setLocation: (value) => set({ location: value }),
      setCoords: (lat: number, lon: number) => set({ coords: { lat, lon } }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggleItem: (id) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, stock: !i.stock } : i)
      })),
    }),
    {
      name: 'setup-storage',
      storage: createJSONStorage(() => AsyncStorage),  // ✅ use AsyncStorage
      partialize: (state) => ({
        isSetuped: state.isSetuped,
        adults: state.adults,
        location: state.location,
        coords: state.coords,
        items: state.items,
      }),
    }
  )
);