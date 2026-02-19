import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Boat } from '../../types';

// Query Keys
export const boatKeys = {
    all: ['boats'] as const,
    lists: () => [...boatKeys.all, 'list'] as const,
    list: (filters: string) => [...boatKeys.lists(), { filters }] as const,
    details: () => [...boatKeys.all, 'detail'] as const,
    detail: (id: string) => [...boatKeys.details(), id] as const,
};

// API Functions
const boatsAPI = {
    getAll: (): Promise<Boat[]> => apiClient.get('/boats'),
    getById: (id: string): Promise<Boat> => apiClient.get(`/boats/${id}`),
    create: (data: Partial<Boat>): Promise<Boat> => apiClient.post('/boats', data),
    update: (id: string, data: Partial<Boat>): Promise<Boat> =>
        apiClient.put(`/boats/${id}`, data),
    delete: (id: string): Promise<void> => apiClient.delete(`/boats/${id}`),
};

// Hooks
export const useBoats = () => {
    return useQuery({
        queryKey: boatKeys.lists(),
        queryFn: boatsAPI.getAll,
    });
};

export const useBoat = (id: string) => {
    return useQuery({
        queryKey: boatKeys.detail(id),
        queryFn: () => boatsAPI.getById(id),
        enabled: !!id,
    });
};

export const useCreateBoat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: boatsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
};

export const useUpdateBoat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Boat> }) =>
            boatsAPI.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: boatKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
};

export const useDeleteBoat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: boatsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boatKeys.lists() });
        },
    });
};
