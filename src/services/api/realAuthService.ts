import { User, LoginCredentials, RegisterData } from '../../types';
import { ENVIRONMENT_CONFIG } from '../../config/environment';

interface BackendUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    isHost: boolean;
    isEmailVerified: boolean;
    hostProfile?: {
        bio?: string;
        responseTime?: string;
        isSuperHost?: boolean;
        rating?: number;
        reviewCount?: number;
        joinedDate?: string;
    };
    createdAt: string;
    updatedAt: string;
}

const convertBackendUser = (backendUser: any): User => {
    // El backend puede devolver _id o id, necesitamos manejar ambos casos
    const userId = backendUser._id || backendUser.id || (backendUser._id?.toString ? backendUser._id.toString() : undefined);
    
    if (!userId) {
        console.error('Error: Usuario sin ID', backendUser);
        throw new Error('Usuario sin ID válido');
    }
    
    return {
        id: String(userId),
        email: backendUser.email || '',
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        phone: backendUser.phone,
        avatar: backendUser.avatar,
        isHost: backendUser.isHost || false,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        updatedAt: backendUser.updatedAt || new Date().toISOString(),
    };
};

const API_BASE_URL = ENVIRONMENT_CONFIG.API_URL;

export class RealAuthService {
    static async register(data: RegisterData): Promise<{ user: User; token: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al registrar usuario');
            }

            return {
                user: convertBackendUser(result.user),
                token: result.token
            };

        } catch (error: any) {
            console.error('Error in RealAuthService:', error);
            throw error;
        }
    }

    static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Credenciales inválidas');
            }

            return {
                user: convertBackendUser(result.user),
                token: result.token
            };

        } catch (error: any) {
            console.error('Error in RealAuthService:', error);
            throw error;
        }
    }

    static async verifyToken(token: string): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                return null;
            }

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            const convertedUser = convertBackendUser(result.user);
            return convertedUser;

        } catch (error) {
            return null;
        }
    }

    static async getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al obtener usuarios');
            }

            return result.users.map(convertBackendUser);

        } catch (error: any) {
            console.error('Error in RealAuthService:', error);
            throw error;
        }
    }

    static logout(): void {
    }
}

export default RealAuthService;
