const getApiUrl = (): string => {
    // Prioridad 1: Variable de entorno (siempre tiene prioridad)
    // Si está configurada, la usamos (funciona en ambos casos)
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Por defecto: localhost:3000 (funciona en simuladores/emuladores)
    // Para dispositivos físicos, el usuario debe crear .env con su IP local
    return 'http://localhost:3000/api';
};

export const ENVIRONMENT_CONFIG = {
    MONGODB_URI: process.env.EXPO_PUBLIC_MONGODB_URI ||
        'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority',
    API_URL: getApiUrl(),
    ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    DEBUG: process.env.EXPO_PUBLIC_DEBUG === 'true',
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDUhQH3Kw36FBM76U8HS3GLtOo-gIXxJPs',
    STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    DATABASE: {
        NAME: 'barquea_db',
        USER: 'esuarezgcc_db_user',
    },
} as const;

export const validateEnvironment = (): boolean => {
    const required = [
        'MONGODB_URI',
        'API_URL',
    ];

    const missing = required.filter(key => !ENVIRONMENT_CONFIG[key as keyof typeof ENVIRONMENT_CONFIG]);

    if (missing.length > 0) {
        return false;
    }

    return true;
};

export const getDatabaseInfo = () => {
    const uri = ENVIRONMENT_CONFIG.MONGODB_URI;
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);

    if (match) {
        return {
            user: match[1],
            host: match[3],
            database: match[4],
        };
    }

    return null;
};

export default ENVIRONMENT_CONFIG;
