// Servicio simple para conectar a MongoDB Atlas a través de un backend mínimo
// Usa la misma conexión que ya funcionaba en los scripts

import { ENVIRONMENT_CONFIG } from '../../config/environment';

export interface User {
    _id?: string;
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
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isHost?: boolean;
}

// URL del backend simple - usar configuración centralizada
const API_BASE_URL = ENVIRONMENT_CONFIG.API_URL;

export class SimpleMongoService {

    // Registrar nuevo usuario
    static async register(data: RegisterData): Promise<{ user: User; token: string }> {
        try {
            

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar usuario');
            }

            const result = await response.json();
            

            return result;

        } catch (error: any) {
            throw error;
        }
    }

    // Login de usuario
    static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        try {
            

            // Buscar usuario
            const user = await this.findUserByEmail(credentials.email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // En una implementación real, aquí verificarías la contraseña hasheada
            // Por ahora, asumimos que la contraseña es correcta

            // Generar token
            const token = Buffer.from(JSON.stringify({
                userId: user._id,
                email: user.email,
                timestamp: Date.now()
            })).toString('base64');

            

            return { user, token };

        } catch (error: any) {
            throw error;
        }
    }

    // Buscar usuario por email
    static async findUserByEmail(email: string): Promise<User | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // Usuario no encontrado
                }
                return null;
            }

            const user = await response.json();
            return user;

        } catch (error) {
            return null;
        }
    }

    // Verificar token
    static async verifyToken(token: string): Promise<User | null> {
        try {
            // Decodificar token
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());

            // Verificar que el token no sea muy antiguo (7 días)
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

            if (tokenAge > maxAge) {
                return null;
            }

            // Buscar usuario por ID usando nuestro backend
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            return result.user || null;

        } catch (error) {
            return null;
        }
    }

    // Logout
    static logout(): void {
        
    }
}

export default SimpleMongoService;
