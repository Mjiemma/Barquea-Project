export const APP_CONFIG = {
    name: 'Barquea',
    version: '1.0.0',
    description: 'Tu plataforma de alquiler de barcos',
} as const;

export const API_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
} as const;

export const DATABASE_CONFIG = {
    mongodb: {
        uri: process.env.EXPO_PUBLIC_MONGODB_URI || 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority',
        name: 'barquea_db',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    }
} as const;

export const STORAGE_KEYS = {
    USER_TOKEN: 'user_token',
    USER_DATA: 'user_data',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    LANGUAGE: 'language',
    THEME: 'theme',
} as const;

export const BOAT_AMENITIES = [
    'WiFi',
    'Aire Acondicionado',
    'Cocina',
    'Baño',
    'Ducha',
    'Toallas',
    'Equipo de Pesca',
    'Equipo de Snorkel',
    'Altavoces',
    'GPS',
    'Refrigerador',
    'Parrilla',
    'Sombrilla',
    'Chalecos Salvavidas',
    'Botiquín',
] as const;

export const BOAT_TYPES = [
    { id: 'sailboat', label: 'Velero', icon: '⛵' },
    { id: 'motorboat', label: 'Lancha', icon: '🚤' },
    { id: 'yacht', label: 'Yate', icon: '🛥️' },
    { id: 'catamaran', label: 'Catamarán', icon: '⛵' },
    { id: 'fishing_boat', label: 'Barco de Pesca', icon: '🎣' },
    { id: 'speedboat', label: 'Lancha Rápida', icon: '🚤' },
] as const;

export const SEARCH_RADIUS_OPTIONS = [
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100 km' },
] as const;

export const BOOKING_DURATIONS = [
    { id: 'hourly', label: 'Por Hora', minHours: 2 },
    { id: 'daily', label: 'Por Día', minHours: 24 },
    { id: 'weekly', label: 'Por Semana', minHours: 168 },
] as const;

export const PAYMENT_METHODS = [
    { id: 'card', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'google_pay', label: 'Google Pay', icon: '🔵' },
] as const;

export const LANGUAGES = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]{10,}$/,
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
    },
} as const;

export * from './colors';
