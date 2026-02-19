import mongoose from 'mongoose';
import { ENVIRONMENT_CONFIG } from './environment';

// Configuración de MongoDB Atlas
const MONGODB_URI = ENVIRONMENT_CONFIG.MONGODB_URI;

// Opciones de conexión
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Mantener hasta 10 conexiones socket
    serverSelectionTimeoutMS: 5000, // Mantener intentando enviar operaciones por 5 segundos
    socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
    bufferMaxEntries: 0, // Deshabilitar mongoose buffering
    bufferCommands: false, // Deshabilitar mongoose buffering
};

// Función para conectar a MongoDB
export const connectToDatabase = async (): Promise<void> => {
    try {
        if (mongoose.connection.readyState === 1) {
            
            return;
        }

        
        await mongoose.connect(MONGODB_URI, mongooseOptions);

        

    } catch (error) {
        throw error;
    }
};

// Función para desconectar de MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
    try {
        if (mongoose.connection.readyState === 0) {
            return;
        }

        await mongoose.disconnect();
        
    } catch (error) {
        throw error;
    }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
    
});

mongoose.connection.on('error', (err) => {
});

mongoose.connection.on('disconnected', () => {
});

// Manejo de cierre de aplicación
process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
});

export default mongoose;
