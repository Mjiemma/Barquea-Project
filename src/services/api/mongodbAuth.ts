import { User, IUser } from '../../models/User';
import { mongoDBService } from '../database/mongodb';

// Interfaz para credenciales de login
export interface LoginCredentials {
    email: string;
    password: string;
}

// Interfaz para datos de registro
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isHost?: boolean;
}

// Función para verificar token (simplificada para React Native)
function verifyToken(token: string): { userId: string; email: string; isHost: boolean } | null {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());

        // Verificar que el token no sea muy antiguo (7 días)
        const tokenAge = Date.now() - payload.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

        if (tokenAge > maxAge) {
            return null;
        }

        return {
            userId: payload.userId,
            email: payload.email,
            isHost: payload.isHost
        };
    } catch (error) {
        return null;
    }
}

export class MongoDBAuthService {

    // Registrar nuevo usuario
    static async register(data: RegisterData): Promise<{ user: IUser; token: string }> {
        try {
            await mongoDBService.connect();

            const { email, password, firstName, lastName, phone, isHost = false } = data;

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists.');
            }

            // Crear nuevo usuario
            const newUser = new User({
                firstName,
                lastName,
                email,
                password,
                phone,
                isHost,
                isEmailVerified: true, // Para simplificar, asumimos que todos están verificados
            });

            await newUser.save();
            const token = newUser.generateAuthToken();

            return { user: newUser, token };

        } catch (error) {
            throw error;
        }
    }

    // Login de usuario
    static async login(credentials: LoginCredentials): Promise<{ user: IUser; token: string }> {
        try {
            await mongoDBService.connect();

            const { email, password } = credentials;

            // Buscar usuario con contraseña
            const user = await User.findOne({ email }).select('+password');
            if (!user || !user.password) {
                throw new Error('Invalid credentials');
            }

            // Verificar contraseña
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generar token
            const token = user.generateAuthToken();

            // Remover contraseña antes de devolver
            user.password = undefined;

            return { user, token };

        } catch (error) {
            throw error;
        }
    }

    // Verificar token
    static async verifyToken(token: string): Promise<IUser | null> {
        try {
            await mongoDBService.connect();

            const decoded = verifyToken(token);
            if (!decoded) {
                return null;
            }

            const user = await User.findById(decoded.userId);
            return user;

        } catch (error) {
            return null;
        }
    }

    // Obtener usuario por ID
    static async getUserById(userId: string): Promise<IUser | null> {
        try {
            await mongoDBService.connect();

            const user = await User.findById(userId);
            return user;

        } catch (error) {
            return null;
        }
    }

    // Actualizar perfil de usuario
    static async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
        try {
            await mongoDBService.connect();

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            return user;

        } catch (error) {
            throw error;
        }
    }

    // Cambiar contraseña
    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            await mongoDBService.connect();

            const user = await User.findById(userId).select('+password');
            if (!user || !user.password) {
                throw new Error('User not found');
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Actualizar contraseña
            user.password = newPassword;
            await user.save();

            return true;

        } catch (error) {
            throw error;
        }
    }

    // Eliminar usuario
    static async deleteUser(userId: string): Promise<boolean> {
        try {
            await mongoDBService.connect();

            const result = await User.findByIdAndDelete(userId);
            return !!result;

        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los hosts
    static async getAllHosts(): Promise<IUser[]> {
        try {
            await mongoDBService.connect();

            const hosts = await User.find({ isHost: true }).sort({ 'hostProfile.rating': -1 });
            return hosts;

        } catch (error) {
            throw error;
        }
    }

    // Obtener hosts super
    static async getSuperHosts(): Promise<IUser[]> {
        try {
            await mongoDBService.connect();

            const superHosts = await User.find({
                isHost: true,
                'hostProfile.isSuperHost': true
            }).sort({ 'hostProfile.rating': -1 });

            return superHosts;

        } catch (error) {
            throw error;
        }
    }
}

export default MongoDBAuthService;