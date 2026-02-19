import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interfaz para el documento de usuario
export interface IUser extends Document {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    password?: string;
    isHost: boolean;
    isEmailVerified: boolean;
    hostProfile?: {
        bio?: string;
        responseTime?: string;
        isSuperHost?: boolean;
        rating?: number;
        reviewCount?: number;
        joinedDate?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAuthToken(): string;
}

// Esquema del usuario
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return this.isHost || this.email !== 'demo@barquea.com';
        },
        select: false // No incluir por defecto en las consultas
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    isHost: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: true // Para simplificar, asumimos que todos están verificados
    },
    hostProfile: {
        bio: {
            type: String,
            maxlength: 500
        },
        responseTime: {
            type: String,
            default: '1 hora'
        },
        isSuperHost: {
            type: Boolean,
            default: false
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        reviewCount: {
            type: Number,
            min: 0,
            default: 0
        },
        joinedDate: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre<IUser>('save', async function (next) {
    // Solo encriptar si la contraseña fue modificada
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        // Generar salt y encriptar contraseña
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }

    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Método para generar token de autenticación (simplificado para React Native)
UserSchema.methods.generateAuthToken = function (): string {
    // Para React Native, usamos un token simple basado en el ID y timestamp
    const payload = {
        userId: this._id,
        email: this.email,
        isHost: this.isHost,
        timestamp: Date.now()
    };

    // Convertir a string base64 (método simple para React Native)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Índices para mejorar rendimiento
UserSchema.index({ email: 1 });
UserSchema.index({ isHost: 1 });
UserSchema.index({ 'hostProfile.isSuperHost': 1 });

// Crear y exportar el modelo
const User = mongoose.model<IUser>('User', UserSchema);

export default User;