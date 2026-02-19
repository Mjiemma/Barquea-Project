// Script para probar la MongoDB Atlas Data API
// Ejecutar con: node scripts/testDataAPI.js

const fs = require('fs');
const path = require('path');

console.log('🧪 Probando MongoDB Atlas Data API...\n');

// Leer la configuración del archivo
const configPath = path.join(__dirname, '../src/services/api/simpleMongoService.ts');
let configContent = '';

if (fs.existsSync(configPath)) {
    configContent = fs.readFileSync(configPath, 'utf8');
} else {
    console.log('❌ Archivo de configuración no encontrado');
    process.exit(1);
}

// Extraer la configuración usando regex
const apiUrlMatch = configContent.match(/API_URL:\s*['"`]([^'"`]+)['"`]/);
const apiKeyMatch = configContent.match(/API_KEY:\s*['"`]([^'"`]+)['"`]/);

if (!apiUrlMatch || !apiKeyMatch) {
    console.log('❌ No se pudo extraer la configuración del archivo');
    process.exit(1);
}

const API_URL = apiUrlMatch[1];
const API_KEY = apiKeyMatch[1];

console.log('📡 API URL:', API_URL);
console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');

// Verificar si la configuración está actualizada
if (API_URL.includes('xxxxx') || API_KEY.includes('tu-api-key')) {
    console.log('\n❌ CONFIGURACIÓN INCOMPLETA');
    console.log('   La configuración aún tiene valores por defecto.');
    console.log('   Necesitas actualizar simpleMongoService.ts con tus credenciales reales.');
    console.log('\n📖 Lee SETUP_MONGODB_DATA_API.md para instrucciones detalladas');
    process.exit(1);
}

// Función para hacer peticiones a la Data API
async function makeDataAPIRequest(action, data) {
    try {
        const response = await fetch(`${API_URL}/action/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify({
                collection: 'users',
                database: 'barquea_db',
                ...data
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

// Función principal de prueba
async function testDataAPI() {
    try {
        console.log('\n1️⃣ Probando conexión...');

        // Test 1: Buscar usuarios existentes
        console.log('\n2️⃣ Buscando usuarios existentes...');
        const findResult = await makeDataAPIRequest('find', { limit: 5 });
        console.log(`✅ Encontrados ${findResult.documents.length} usuarios`);

        if (findResult.documents.length > 0) {
            console.log('👥 Usuarios existentes:');
            findResult.documents.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
            });
        }

        // Test 2: Insertar usuario de prueba
        console.log('\n3️⃣ Probando inserción de usuario...');
        const testUser = {
            email: `test-${Date.now()}@barquea.com`,
            firstName: 'Usuario',
            lastName: 'Prueba',
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
            updatedAt: new Date().toISOString(),
            password: 'test123'
        };

        const insertResult = await makeDataAPIRequest('insertOne', { document: testUser });
        console.log('✅ Usuario de prueba insertado con ID:', insertResult.insertedId);

        // Test 3: Buscar el usuario recién insertado
        console.log('\n4️⃣ Verificando usuario insertado...');
        const findOneResult = await makeDataAPIRequest('findOne', {
            filter: { email: testUser.email }
        });

        if (findOneResult.document) {
            console.log('✅ Usuario encontrado:', findOneResult.document.email);
        } else {
            console.log('❌ Usuario no encontrado');
        }

        console.log('\n🎉 ¡Todas las pruebas pasaron!');
        console.log('📱 La app móvil puede conectarse directamente a MongoDB Atlas');
        console.log('🚀 Puedes registrar usuarios desde la app móvil');

    } catch (error) {
        console.error('\n❌ Error en las pruebas:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('1. Verifica que la API Key sea correcta');
        console.log('2. Verifica que el Endpoint URL sea correcto');
        console.log('3. Verifica que la Data API esté habilitada en MongoDB Atlas');
        console.log('4. Verifica que tengas permisos de Read and Write');
        console.log('5. Lee SETUP_MONGODB_DATA_API.md para instrucciones detalladas');
    }
}

// Ejecutar las pruebas
testDataAPI();
