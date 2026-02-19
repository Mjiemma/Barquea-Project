import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import { User } from '../../types';

export class AuthService {
    static async storeUserData(user: User, token: string): Promise<void> {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.USER_TOKEN, token],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
            ]);
        } catch (error) {
            throw error;
        }
    }

    static async getUserData(): Promise<{ user: User | null; token: string | null }> {
        try {
            const [token, userData] = await AsyncStorage.multiGet([
                STORAGE_KEYS.USER_TOKEN,
                STORAGE_KEYS.USER_DATA,
            ]);

            return {
                token: token[1],
                user: userData[1] ? JSON.parse(userData[1]) : null,
            };
        } catch (error) {
            return { user: null, token: null };
        }
    }

    static async clearUserData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USER_TOKEN,
                STORAGE_KEYS.USER_DATA,
            ]);
        } catch (error) {
            throw error;
        }
    }

    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
            return !!token;
        } catch (error) {
            return false;
        }
    }

    static async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
        } catch (error) {
            return null;
        }
    }
}
