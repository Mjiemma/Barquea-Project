import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { boatsSlice } from './slices/boatsSlice';
import { bookingsSlice } from './slices/bookingsSlice';
import { uiSlice } from './slices/uiSlice';

// Store simplificado sin RTK Query para compatibilidad con Hermes
export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        boats: boatsSlice.reducer,
        bookings: bookingsSlice.reducer,
        ui: uiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
    devTools: false, // Deshabilitado para evitar problemas con Hermes
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './slices/authSlice';
export * from './slices/boatsSlice';
export * from './slices/bookingsSlice';
export * from './slices/uiSlice';
