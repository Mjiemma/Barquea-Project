import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingStatus } from '../../types';

interface BookingsState {
    bookings: Booking[];
    selectedBooking: Booking | null;
    currentBookingDraft: Partial<Booking> | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BookingsState = {
    bookings: [],
    selectedBooking: null,
    currentBookingDraft: null,
    isLoading: false,
    error: null,
};

export const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setBookings: (state, action: PayloadAction<Booking[]>) => {
            state.bookings = action.payload;
        },

        addBookings: (state, action: PayloadAction<Booking[]>) => {
            state.bookings.push(...action.payload);
        },

        addBooking: (state, action: PayloadAction<Booking>) => {
            state.bookings.unshift(action.payload);
        },

        updateBooking: (state, action: PayloadAction<Booking>) => {
            const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
            if (index !== -1) {
                state.bookings[index] = action.payload;
            }
            if (state.selectedBooking?.id === action.payload.id) {
                state.selectedBooking = action.payload;
            }
        },

        removeBooking: (state, action: PayloadAction<string>) => {
            state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
            if (state.selectedBooking?.id === action.payload) {
                state.selectedBooking = null;
            }
        },

        setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
            state.selectedBooking = action.payload;
        },

        setBookingStatus: (state, action: PayloadAction<{ id: string; status: BookingStatus }>) => {
            const { id, status } = action.payload;
            const booking = state.bookings.find(b => b.id === id);
            if (booking) {
                booking.status = status;
            }
            if (state.selectedBooking?.id === id) {
                state.selectedBooking.status = status;
            }
        },

        setCurrentBookingDraft: (state, action: PayloadAction<Partial<Booking> | null>) => {
            state.currentBookingDraft = action.payload;
        },

        updateCurrentBookingDraft: (state, action: PayloadAction<Partial<Booking>>) => {
            state.currentBookingDraft = {
                ...state.currentBookingDraft,
                ...action.payload,
            };
        },

        clearCurrentBookingDraft: (state) => {
            state.currentBookingDraft = null;
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
    setBookings,
    addBookings,
    addBooking,
    updateBooking,
    removeBooking,
    setSelectedBooking,
    setBookingStatus,
    setCurrentBookingDraft,
    updateCurrentBookingDraft,
    clearCurrentBookingDraft,
    setLoading,
    setError,
    clearError,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
