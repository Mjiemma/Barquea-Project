import { initializeDatabase, mongoDBService } from './mongodb';
import { validateEnvironment } from '../../config/environment';

// Función para inicializar toda la configuración de la base de datos
export const initializeMongoDB = async (): Promise<void> => {
    try {

        // Validar configuración de entorno
        const isEnvValid = validateEnvironment();
        if (!isEnvValid) {
            throw new Error('Configuración de entorno inválida');
        }

        // Conectar a la base de datos
        await initializeDatabase();

        // Verificar salud de la conexión
        const isHealthy = await mongoDBService.healthCheck();
        if (!isHealthy) {
            throw new Error('La conexión a la base de datos no está saludable');
        }

        

    } catch (error) {
        throw error;
    }
};

// Función para cerrar la conexión
export const closeMongoDB = async (): Promise<void> => {
    try {
        
        await mongoDBService.disconnect();
        
    } catch (error) {
        throw error;
    }
};

// Función para verificar el estado de la conexión
export const getMongoDBStatus = () => {
    return {
        isConnected: mongoDBService.getConnectionStatus(),
        timestamp: new Date().toISOString(),
    };
};

export default {
    initializeMongoDB,
    closeMongoDB,
    getMongoDBStatus,
};
