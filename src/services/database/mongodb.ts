// Servicio simplificado para React Native
// En React Native, no podemos usar mongoose directamente
// Este servicio simula la conexión para desarrollo

export class mongoDBService {
    private static isConnected = false;

    static async connect(): Promise<void> {
        // En React Native, simulamos la conexión
        if (!this.isConnected) {
            
            this.isConnected = true;
            
        }
    }

    static async disconnect(): Promise<void> {
        
        this.isConnected = false;
    }

    static getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Función para inicializar MongoDB (simulada)
export async function connectDB(): Promise<void> {
    await mongoDBService.connect();
}

export async function disconnectDB(): Promise<void> {
    await mongoDBService.disconnect();
}