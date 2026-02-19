import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Boat, SearchFilters } from '../../types';

interface BoatsState {
    boats: Boat[];
    selectedBoat: Boat | null;
    searchFilters: SearchFilters;
    favorites: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: BoatsState = {
    boats: [],
    selectedBoat: null,
    searchFilters: {},
    favorites: [],
    isLoading: false,
    error: null,
};

export const boatsSlice = createSlice({
    name: 'boats',
    initialState,
    reducers: {
        setBoats: (state, action: PayloadAction<Boat[]>) => {
            state.boats = action.payload;
        },

        addBoats: (state, action: PayloadAction<Boat[]>) => {
            state.boats.push(...action.payload);
        },

        setSelectedBoat: (state, action: PayloadAction<Boat | null>) => {
            state.selectedBoat = action.payload;
        },

        updateBoat: (state, action: PayloadAction<Boat>) => {
            const index = state.boats.findIndex(boat => boat.id === action.payload.id);
            if (index !== -1) {
                state.boats[index] = action.payload;
            }
            if (state.selectedBoat?.id === action.payload.id) {
                state.selectedBoat = action.payload;
            }
        },

        removeBoat: (state, action: PayloadAction<string>) => {
            state.boats = state.boats.filter(boat => boat.id !== action.payload);
            if (state.selectedBoat?.id === action.payload) {
                state.selectedBoat = null;
            }
        },

        setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
            state.searchFilters = action.payload;
        },

        updateSearchFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
            state.searchFilters = { ...state.searchFilters, ...action.payload };
        },

        clearSearchFilters: (state) => {
            state.searchFilters = {};
        },

        addToFavorites: (state, action: PayloadAction<string>) => {
            if (!state.favorites.includes(action.payload)) {
                state.favorites.push(action.payload);
            }
        },

        removeFromFavorites: (state, action: PayloadAction<string>) => {
            state.favorites = state.favorites.filter(id => id !== action.payload);
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setBoats,
    addBoats,
    setSelectedBoat,
    updateBoat,
    removeBoat,
    setSearchFilters,
    updateSearchFilters,
    clearSearchFilters,
    addToFavorites,
    removeFromFavorites,
    setLoading,
    setError,
    clearError,
} = boatsSlice.actions;

export default boatsSlice.reducer;
