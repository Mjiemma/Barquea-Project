import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { User, LoginCredentials, RegisterData } from '../../types';

// API Functions
const authAPI = {
    login: (credentials: LoginCredentials): Promise<{ user: User; token: string }> =>
        apiClient.post('/auth/login', credentials),
    register: (data: RegisterData): Promise<{ user: User; token: string }> =>
        apiClient.post('/auth/register', data),
    logout: (): Promise<void> => apiClient.post('/auth/logout'),
    refreshToken: (): Promise<{ token: string }> => apiClient.post('/auth/refresh'),
    forgotPassword: (email: string): Promise<void> =>
        apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string): Promise<void> =>
        apiClient.post('/auth/reset-password', { token, password }),
};

// Hooks
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authAPI.login,
        onSuccess: (data) => {
            // Invalidate and refetch any cached data
            queryClient.clear();
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authAPI.register,
        onSuccess: (data) => {
            queryClient.clear();
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authAPI.forgotPassword,
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            authAPI.resetPassword(token, password),
    });
};
