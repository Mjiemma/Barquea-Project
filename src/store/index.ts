import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authSlice } from './slices/authSlice';
import { boatsSlice } from './slices/boatsSlice';
import { bookingsSlice } from './slices/bookingsSlice';
import { uiSlice } from './slices/uiSlice';
import { api } from './api';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        boats: boatsSlice.reducer,
        bookings: bookingsSlice.reducer,
        ui: uiSlice.reducer,
        api: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }).concat(api.middleware),
    devTools: false,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './slices/authSlice';
export * from './slices/boatsSlice';
export * from './slices/bookingsSlice';
export * from './slices/uiSlice';
export * from './api';
