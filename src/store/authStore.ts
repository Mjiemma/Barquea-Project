import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { RealAuthService } from '../services/api/realAuthService';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isOnboardingCompleted: boolean;
    isLoading: boolean;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logout: () => void;
    completeOnboarding: () => void;
    verifyToken: () => Promise<boolean>;
    initializeAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isOnboardingCompleted: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: true }),
            setToken: (token) => set({ token }),

            logout: () => {
                // Limpiar AsyncStorage
                AsyncStorage.multiRemove(['user_token', 'user_data']);
                set({ user: null, token: null, isAuthenticated: false, isOnboardingCompleted: false });
            },

            completeOnboarding: () => set({ isOnboardingCompleted: true }),

            verifyToken: async () => {
                const { token } = get();
                if (!token) return false;

                try {
                    set({ isLoading: true });
                    const user = await RealAuthService.verifyToken(token);
                    if (user) {
                        set({ user, isAuthenticated: true });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Error verifying token:', error);
                    get().logout();
                    return false;
                } finally {
                    set({ isLoading: false });
                }
            },

            refreshUser: async () => {
                const { token } = get();
                if (!token) return;
                try {
                    const user = await RealAuthService.verifyToken(token);
                    if (user) {
                        set({ user, isAuthenticated: true });
                    }
                } catch (error) {
                    console.error('Error refreshing user:', error);
                }
            },

            initializeAuth: async () => {
                try {

                    set({ isLoading: true });
                    const { token, isAuthenticated } = get();

                    if (token) {
                        const isValid = await get().verifyToken();
                        if (!isValid) {
                            get().logout();
                        }
                    }
                } catch (error) {
                    get().logout();
                } finally {
                    set({ isLoading: false });

                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isOnboardingCompleted: state.isOnboardingCompleted,
            }),
        }
    )
);
