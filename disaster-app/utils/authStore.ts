import { create } from "zustand";

type UserState = {
    isSetuped: boolean;
    Login: () => void;
    Logout: () => void;

};


export const UseAuthStore = create<UserState>((set) => ({
    isSetuped: false, // Initial state, replace with actual logic to determine if onboarding is completed
    shouldShowOnboarding: false,

    Login: () => set({ isSetuped: true }),
    Logout: () => set({ isSetuped: false }),

}));