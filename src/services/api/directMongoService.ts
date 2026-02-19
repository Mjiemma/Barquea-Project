// Servicio para conectar directamente a MongoDB Atlas desde React Native
// Usando la REST API nativa de MongoDB Atlas

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

// Configuración para MongoDB Atlas REST API
// Usa las mismas credenciales que ya funcionan
const MONGODB_CONFIG = {
    // Usar la REST API de MongoDB Atlas directamente
    API_URL: 'https://cloud.mongodb.com/api/atlas/v1.0',
    // Tu API Key de MongoDB Atlas (no la Data API)
    API_KEY: 'tu-api-key-de-mongodb-atlas',
    // Tu Project ID
    PROJECT_ID: 'tu-project-id',
    // Cluster name
    CLUSTER_NAME: 'cluster0',
    // Database y collection
    DATABASE_NAME: 'barquea_db',
    COLLECTION_NAME: 'users',

    getHeaders: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MONGODB_CONFIG.API_KEY}`,
    }),
};

export class DirectMongoService {

    // Registrar nuevo usuario
    static async register(data: RegisterData): Promise<{ user: User; token: string }> {
        try {
            

            // Verificar si el usuario ya existe
            const existingUser = await this.findUserByEmail(data.email);
            if (existingUser) {
                throw new Error('Ya existe un usuario con este email');
            }

            // Crear nuevo usuario
            const newUser: User = {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                isHost: data.isHost || false,
                isEmailVerified: true,
                hostProfile: {
                    responseTime: '1 hora',
                    isSuperHost: false,
                    rating: 0,
                    reviewCount: 0,
                    joinedDate: new Date().toISOString()
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Insertar usando MongoDB Atlas REST API
            const insertResponse = await fetch(
                `${MONGODB_CONFIG.API_URL}/groups/${MONGODB_CONFIG.PROJECT_ID}/clusters/${MONGODB_CONFIG.CLUSTER_NAME}/database/${MONGODB_CONFIG.DATABASE_NAME}/collections/${MONGODB_CONFIG.COLLECTION_NAME}/documents`,
                {
                    method: 'POST',
                    headers: MONGODB_CONFIG.getHeaders(),
                    body: JSON.stringify({
                        document: {
                            ...newUser,
                            password: data.password
                        }
                    })
                }
            );

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Error al crear usuario: ${errorText}`);
            }

            const insertResult = await insertResponse.json();
            newUser._id = insertResult._id;

            // Generar token simple
            const token = Buffer.from(JSON.stringify({
                userId: newUser._id,
                email: newUser.email,
                timestamp: Date.now()
            })).toString('base64');

            

            return { user: newUser, token };

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
            const response = await fetch(
                `${MONGODB_CONFIG.API_URL}/groups/${MONGODB_CONFIG.PROJECT_ID}/clusters/${MONGODB_CONFIG.CLUSTER_NAME}/database/${MONGODB_CONFIG.DATABASE_NAME}/collections/${MONGODB_CONFIG.COLLECTION_NAME}/documents`,
                {
                    method: 'GET',
                    headers: MONGODB_CONFIG.getHeaders(),
                }
            );

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            // Buscar el usuario con el email específico
            const user = result.documents?.find((doc: any) => doc.email === email);
            return user || null;

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

            // Buscar usuario por ID
            const response = await fetch(
                `${MONGODB_CONFIG.API_URL}/groups/${MONGODB_CONFIG.PROJECT_ID}/clusters/${MONGODB_CONFIG.CLUSTER_NAME}/database/${MONGODB_CONFIG.DATABASE_NAME}/collections/${MONGODB_CONFIG.COLLECTION_NAME}/documents/${payload.userId}`,
                {
                    method: 'GET',
                    headers: MONGODB_CONFIG.getHeaders(),
                }
            );

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            return result.document || null;

        } catch (error) {
            return null;
        }
    }

    // Logout
    static logout(): void {
        
    }
}

export default DirectMongoService;
