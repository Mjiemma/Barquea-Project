import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    onboardingCompleted: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    onboardingCompleted: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.isLoading = false;
        },

        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },

        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
            state.onboardingCompleted = action.payload;
        },
    },
});

export const {
    setCredentials,
    setUser,
    clearCredentials,
    setLoading,
    setOnboardingCompleted,
} = authSlice.actions;

export default authSlice.reducer;
