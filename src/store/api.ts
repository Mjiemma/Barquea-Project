import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';
import { API_CONFIG } from '../constants';
import type {
    User,
    Boat,
    Booking,
    ChatMessage,
    ChatConversation,
    Review,
    SearchFilters,
    ApiResponse,
    PaginatedResponse
} from '../types';

// Base query con configuración de autenticación
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

export const api = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['User', 'Boat', 'Booking', 'Chat', 'Review'],
    endpoints: (builder) => ({
        // Auth endpoints
        login: builder.mutation<ApiResponse<{ user: User; token: string }>, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        register: builder.mutation<ApiResponse<{ user: User; token: string }>, Partial<User> & { password: string }>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        logout: builder.mutation<ApiResponse<null>, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        // User endpoints
        getProfile: builder.query<ApiResponse<User>, void>({
            query: () => '/users/profile',
            providesTags: ['User'],
        }),

        updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
            query: (userData) => ({
                url: '/users/profile',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Boats endpoints
        getBoats: builder.query<PaginatedResponse<Boat>, { filters?: SearchFilters; page?: number; limit?: number }>({
            query: ({ filters = {}, page = 1, limit = 10 }) => ({
                url: '/boats',
                params: { ...filters, page, limit },
            }),
            providesTags: ['Boat'],
        }),

        getBoat: builder.query<ApiResponse<Boat>, string>({
            query: (id) => `/boats/${id}`,
            providesTags: (result, error, id) => [{ type: 'Boat', id }],
        }),

        createBoat: builder.mutation<ApiResponse<Boat>, Partial<Boat>>({
            query: (boatData) => ({
                url: '/boats',
                method: 'POST',
                body: boatData,
            }),
            invalidatesTags: ['Boat'],
        }),

        updateBoat: builder.mutation<ApiResponse<Boat>, { id: string; data: Partial<Boat> }>({
            query: ({ id, data }) => ({
                url: `/boats/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Boat', id }],
        }),

        deleteBoat: builder.mutation<ApiResponse<null>, string>({
            query: (id) => ({
                url: `/boats/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Boat'],
        }),

        getMyBoats: builder.query<PaginatedResponse<Boat>, { page?: number; limit?: number }>({
            query: ({ page = 1, limit = 10 }) => ({
                url: '/boats/my-boats',
                params: { page, limit },
            }),
            providesTags: ['Boat'],
        }),

        // Bookings endpoints
        getBookings: builder.query<PaginatedResponse<Booking>, { page?: number; limit?: number; status?: string }>({
            query: ({ page = 1, limit = 10, status }) => ({
                url: '/bookings',
                params: { page, limit, ...(status && { status }) },
            }),
            providesTags: ['Booking'],
        }),

        getBooking: builder.query<ApiResponse<Booking>, string>({
            query: (id) => `/bookings/${id}`,
            providesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),

        createBooking: builder.mutation<ApiResponse<Booking>, Partial<Booking>>({
            query: (bookingData) => ({
                url: '/bookings',
                method: 'POST',
                body: bookingData,
            }),
            invalidatesTags: ['Booking'],
        }),

        updateBooking: builder.mutation<ApiResponse<Booking>, { id: string; data: Partial<Booking> }>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
        }),

        cancelBooking: builder.mutation<ApiResponse<Booking>, string>({
            query: (id) => ({
                url: `/bookings/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
        }),

        // Chat endpoints
        getConversations: builder.query<PaginatedResponse<ChatConversation>, { page?: number; limit?: number }>({
            query: ({ page = 1, limit = 20 }) => ({
                url: '/chat/conversations',
                params: { page, limit },
            }),
            providesTags: ['Chat'],
        }),

        getMessages: builder.query<PaginatedResponse<ChatMessage>, { conversationId: string; page?: number; limit?: number }>({
            query: ({ conversationId, page = 1, limit = 50 }) => ({
                url: `/chat/conversations/${conversationId}/messages`,
                params: { page, limit },
            }),
            providesTags: ['Chat'],
        }),

        sendMessage: builder.mutation<ApiResponse<ChatMessage>, { conversationId: string; message: string }>({
            query: ({ conversationId, message }) => ({
                url: `/chat/conversations/${conversationId}/messages`,
                method: 'POST',
                body: { message },
            }),
            invalidatesTags: ['Chat'],
        }),

        // Reviews endpoints
        getBoatReviews: builder.query<PaginatedResponse<Review>, { boatId: string; page?: number; limit?: number }>({
            query: ({ boatId, page = 1, limit = 10 }) => ({
                url: `/reviews/boats/${boatId}`,
                params: { page, limit },
            }),
            providesTags: ['Review'],
        }),

        createReview: builder.mutation<ApiResponse<Review>, Partial<Review>>({
            query: (reviewData) => ({
                url: '/reviews',
                method: 'POST',
                body: reviewData,
            }),
            invalidatesTags: ['Review', 'Boat'],
        }),
    }),
});

export const {
    // Auth
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,

    // User
    useGetProfileQuery,
    useUpdateProfileMutation,

    // Boats
    useGetBoatsQuery,
    useGetBoatQuery,
    useCreateBoatMutation,
    useUpdateBoatMutation,
    useDeleteBoatMutation,
    useGetMyBoatsQuery,

    // Bookings
    useGetBookingsQuery,
    useGetBookingQuery,
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useCancelBookingMutation,

    // Chat
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,

    // Reviews
    useGetBoatReviewsQuery,
    useCreateReviewMutation,
} = api;
