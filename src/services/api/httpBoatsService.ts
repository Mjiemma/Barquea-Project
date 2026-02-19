import { IBoat } from '../../models/Boat';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import AuthService from './authService';

export interface BoatSearchFilters {
    city?: string;
    country?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    maxCapacity?: number;
    amenities?: string[];
    rating?: number;
    isAvailable?: boolean;
}

export interface SortOptions {
    field: 'pricePerHour' | 'rating' | 'createdAt' | 'bookingCount';
    order: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    boats: T[];
    total: number;
    currentPage: number;
    totalPages: number;
}

// Clase para manejar operaciones de barcos via HTTP
export class HttpBoatsService {

    // Base URL del API
    private static get API_URL(): string {
        return ENVIRONMENT_CONFIG.API_URL;
    }

    // Headers por defecto
    private static getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }

    // Headers con autenticación
    private static async getAuthHeaders(): Promise<HeadersInit> {
        // Obtener token del AsyncStorage
        const token = await AuthService.getToken();

        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Headers con autenticación desde Zustand store
    private static getAuthHeadersFromStore(): HeadersInit {
        // Importar dinámicamente para evitar problemas de dependencias circulares
        const { useAuthStore } = require('../../store/authStore');
        const token = useAuthStore.getState().token;

        

        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Obtener todos los barcos disponibles
    static async getAllBoats(): Promise<{ boats: IBoat[]; total: number }> {
        try {




            const response = await fetch(`${this.API_URL}/boats/all`, {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            return {
                boats: result.boats || [],
                total: result.total || 0
            };

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener barcos con paginación
    static async getBoatsWithPagination(page: number = 1, limit: number = 20): Promise<PaginatedResponse<IBoat>> {
        try {


            const url = new URL(`${this.API_URL}/boats`);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', limit.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            return result;

        } catch (error: any) {
            throw error;
        }
    }

    // Buscar barcos con filtros
    static async searchBoats(
        query: string = '',
        filters: BoatSearchFilters = {},
        sort: SortOptions = { field: 'rating', order: 'desc' },
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<IBoat>> {
        try {


            const response = await fetch(`${this.API_URL}/boats/search`, {
                method: 'POST',
                headers: this.getAuthHeadersFromStore(),
                body: JSON.stringify({
                    query,
                    filters,
                    sort,
                    page,
                    limit
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            return result;

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener barco por ID
    static async getBoatById(boatId: string): Promise<IBoat | null> {
        try {


            const response = await fetch(`${this.API_URL}/boats/${boatId}`, {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                if (response.status === 404) {

                    return null;
                }
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const boat = await response.json();


            return boat;

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener barcos populares
    static async getPopularBoats(limit: number = 10): Promise<IBoat[]> {
        try {


            const response = await fetch(`${this.API_URL}/boats/popular?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const boats = await response.json();


            return boats;

        } catch (error: any) {
            return []; // Devolver array vacío en caso de error
        }
    }

    // Obtener barcos mejor valorados
    static async getTopRatedBoats(limit: number = 10): Promise<IBoat[]> {
        try {


            const url = new URL(`${this.API_URL}/boats`);
            url.searchParams.append('sortBy', 'rating');
            url.searchParams.append('sortOrder', 'desc');
            url.searchParams.append('limit', limit.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            const boats = result.boats || [];


            return boats;

        } catch (error: any) {
            return []; // Devolver array vacío en caso de error
        }
    }

    // Obtener barcos por tipo
    static async getBoatsByType(type: string, limit: number = 20): Promise<IBoat[]> {
        try {


            const url = new URL(`${this.API_URL}/boats`);
            url.searchParams.append('type', type);
            url.searchParams.append('limit', limit.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            const boats = result.boats || [];


            return boats;

        } catch (error: any) {
            return []; // Devolver array vacío en caso de error
        }
    }
}

export default HttpBoatsService;
