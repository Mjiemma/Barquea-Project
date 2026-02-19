import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';

// Función para obtener el idioma guardado
const getStoredLanguage = async (): Promise<string> => {
    try {
        const storedLanguage = await AsyncStorage.getItem('app_language');
        return storedLanguage || 'es';
    } catch (error) {
        return 'es';
    }
};

// Función para guardar el idioma
export const saveLanguage = async (language: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('app_language', language);
    } catch (error) {
    }
};

// Configuración de i18n
i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources: {
            es: { translation: es },
            en: { translation: en },
        },
        fallbackLng: 'es',
        lng: 'es',
        debug: false, // Desactivar debug para evitar warnings
        returnObjects: true, // Permitir acceso a objetos de traducción
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

// Inicializar con el idioma guardado de forma síncrona
const initializeLanguage = () => {
    getStoredLanguage().then(language => {
        
        i18n.changeLanguage(language).then(() => {
            
        }).catch(error => {
        });
    }).catch(error => {
        i18n.changeLanguage('es');
    });
};

// Inicializar inmediatamente
initializeLanguage();

export default i18n;