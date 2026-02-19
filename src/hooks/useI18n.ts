import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useI18n = () => {
    const { t, i18n } = useTranslation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initializeI18n = async () => {
            try {
                // Verificar si i18n ya está inicializado
                if (i18n.isInitialized) {
                    setIsReady(true);
                    return;
                }

                // Esperar a que i18n esté listo
                await i18n.loadLanguages(['es', 'en']);

                // Obtener idioma guardado
                const storedLanguage = await AsyncStorage.getItem('app_language');
                const language = storedLanguage || 'es';

                

                // Cambiar idioma si es necesario
                if (i18n.language !== language) {
                    await i18n.changeLanguage(language);
                }

                
                setIsReady(true);
            } catch (error) {
                // Fallback a español
                await i18n.changeLanguage('es');
                setIsReady(true);
            }
        };

        initializeI18n();
    }, [i18n]);

    return {
        t,
        i18n,
        isReady,
        changeLanguage: async (language: string) => {
            try {
                await i18n.changeLanguage(language);
                await AsyncStorage.setItem('app_language', language);
                
            } catch (error) {
            }
        }
    };
};
