// Servicio mock que simula la conexión a MongoDB Atlas
// Para desarrollo y pruebas mientras configuras la conexión real

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

// Simular base de datos en memoria
const mockUsers: (User & { password: string })[] = [
    {
        _id: '1',
        email: 'demo@barquea.com',
        firstName: 'Usuario',
        lastName: 'Demo',
        password: 'demo123456',
        phone: '+58 414 123 4567',
        isHost: false,
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
    }
];

export class MockMongoService {

    // Registrar nuevo usuario
    static async register(data: RegisterData): Promise<{ user: User; token: string }> {
        try {
            

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Verificar si el usuario ya existe
            const existingUser = mockUsers.find(user => user.email === data.email);
            if (existingUser) {
                throw new Error('Ya existe un usuario con este email');
            }

            // Crear nuevo usuario
            const newUser: User & { password: string } = {
                _id: Date.now().toString(),
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                password: data.password,
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

            // Agregar a la base de datos mock
            mockUsers.push(newUser);

            // Generar token simple
            const token = Buffer.from(JSON.stringify({
                userId: newUser._id,
                email: newUser.email,
                timestamp: Date.now()
            })).toString('base64');

            // Remover password del objeto de respuesta
            const { password, ...userWithoutPassword } = newUser;

            

            return { user: userWithoutPassword, token };

        } catch (error: any) {
            throw error;
        }
    }

    // Login de usuario
    static async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        try {
            

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Buscar usuario
            const user = mockUsers.find(u => u.email === credentials.email);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // Verificar contraseña
            if (user.password !== credentials.password) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token
            const token = Buffer.from(JSON.stringify({
                userId: user._id,
                email: user.email,
                timestamp: Date.now()
            })).toString('base64');

            // Remover password del objeto de respuesta
            const { password, ...userWithoutPassword } = user;

            

            return { user: userWithoutPassword, token };

        } catch (error: any) {
            throw error;
        }
    }

    // Verificar token
    static async verifyToken(token: string): Promise<User | null> {
        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 500));

            // Decodificar token
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());

            // Verificar que el token no sea muy antiguo (7 días)
            const tokenAge = Date.now() - payload.timestamp;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

            if (tokenAge > maxAge) {
                return null;
            }

            // Buscar usuario por ID
            const user = mockUsers.find(u => u._id === payload.userId);
            if (!user) {
                return null;
            }

            // Remover password del objeto de respuesta
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;

        } catch (error) {
            return null;
        }
    }

    // Logout
    static logout(): void {
        
    }

    // Función para obtener todos los usuarios (para debugging)
    static getAllUsers(): User[] {
        return mockUsers.map(({ password, ...user }) => user);
    }
}

export default MockMongoService;
