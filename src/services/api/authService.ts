import { ENVIRONMENT_CONFIG } from '../../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isHost: boolean;
        isAdmin: boolean;
    };
    token: string;
}

export class AuthService {
    private static get API_URL(): string {
        return ENVIRONMENT_CONFIG.API_URL;
    }

    // Login público
    static async login(loginData: LoginData): Promise<AuthResponse> {
        try {
            

            const response = await fetch(`${this.API_URL}/auth/public-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el login');
            }

            const authData = await response.json();

            // Guardar token en AsyncStorage
            await AsyncStorage.setItem('auth_token', authData.token);
            await AsyncStorage.setItem('user_data', JSON.stringify(authData.user));

            
            return authData;

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener token del storage
    static async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch (error) {
            return null;
        }
    }

    // Obtener datos del usuario del storage
    static async getUser(): Promise<any | null> {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    // Logout
    static async logout(): Promise<void> {
        try {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
            
        } catch (error) {
        }
    }

    // Verificar si está autenticado
    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken();
            return !!token;
        } catch (error) {
            return false;
        }
    }
}

export default AuthService;