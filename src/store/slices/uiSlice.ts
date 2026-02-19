import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    theme: 'light' | 'dark';
    language: string;
    isLoading: boolean;
    activeModal: string | null;
    notifications: Notification[];
    bottomSheetVisible: boolean;
    searchQuery: string;
    selectedLocation: {
        latitude: number;
        longitude: number;
        address?: string;
    } | null;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

const initialState: UIState = {
    theme: 'light',
    language: 'es',
    isLoading: false,
    activeModal: null,
    notifications: [],
    bottomSheetVisible: false,
    searchQuery: '',
    selectedLocation: null,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },

        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setActiveModal: (state, action: PayloadAction<string | null>) => {
            state.activeModal = action.payload;
        },

        addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString(),
            };
            state.notifications.push(notification);
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },

        clearNotifications: (state) => {
            state.notifications = [];
        },

        setBottomSheetVisible: (state, action: PayloadAction<boolean>) => {
            state.bottomSheetVisible = action.payload;
        },

        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },

        setSelectedLocation: (state, action: PayloadAction<UIState['selectedLocation']>) => {
            state.selectedLocation = action.payload;
        },
    },
});

export const {
    setTheme,
    setLanguage,
    setLoading,
    setActiveModal,
    addNotification,
    removeNotification,
    clearNotifications,
    setBottomSheetVisible,
    setSearchQuery,
    setSelectedLocation,
} = uiSlice.actions;

export default uiSlice.reducer;
