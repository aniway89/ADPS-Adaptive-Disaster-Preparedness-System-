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
  hasExp?: boolean;
  isCustom?: boolean;
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
  emergencyContact: string;
  country: string;                     // NEW: ISO country code (e.g., "IN", "US")
  setIsSetuped: () => void;
  Exit: () => void;
  setAdults: (val: number) => void;
  setLocation: (value: LocationInfo) => void;
  setCoords: (lat: number, lon: number) => void;
  addItem: (item: SupplyItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  setEmergencyContact: (num: string) => void;
  setCountry: (code: string) => void;  // NEW
};

export const useSetupStore = create(
  persist<SetupState>(
    (set) => ({
      isSetuped: false,
      adults: 1,
      location: {},
      coords: null,
      items: [],
      emergencyContact: "",
      country: "IN",                   // default to India (change as needed)
      setIsSetuped: () => set({ isSetuped: true }),
      Exit: () => set({ isSetuped: false }),
      setAdults: (val) => set({ adults: val }),
      setLocation: (value) => set({ location: value }),
      setCoords: (lat, lon) => set({ coords: { lat, lon } }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggleItem: (id) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, stock: !i.stock } : i)
      })),
      setEmergencyContact: (num) => set({ emergencyContact: num }),
      setCountry: (code) => set({ country: code.toUpperCase() }),
    }),
    {
      name: 'setup-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isSetuped: state.isSetuped,
        adults: state.adults,
        location: state.location,
        coords: state.coords,
        items: state.items,
        emergencyContact: state.emergencyContact,
        country: state.country,
      }),
    }
  )
);