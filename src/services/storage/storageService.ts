import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
    static async setItem(key: string, value: string): Promise<void> {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            throw error;
        }
    }

    static async getItem(key: string): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    static async setObject(key: string, value: object): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            throw error;
        }
    }

    static async getObject<T = any>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            return null;
        }
    }

    static async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            throw error;
        }
    }

    static async removeItems(keys: string[]): Promise<void> {
        try {
            await AsyncStorage.multiRemove(keys);
        } catch (error) {
            throw error;
        }
    }

    static async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            throw error;
        }
    }

    static async getAllKeys(): Promise<string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            return [];
        }
    }
}
