import { initializeMongoDB } from '../src/services/database/init.js';
import { MongoDBAuthService } from '../src/services/api/mongodbAuth.js';
import { MongoDBBoatService } from '../src/services/api/mongodbBoats.js';

// Script para agregar datos de prueba a MongoDB
async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed de datos...');

        // Inicializar conexión
        await initializeMongoDB();

        // Crear usuario de prueba
        console.log('👤 Creando usuario de prueba...');
        const userResult = await MongoDBAuthService.register({
            email: 'demo@barquea.com',
            password: 'demo123456',
            firstName: 'Usuario',
            lastName: 'Demo',
            phone: '+58 414 123 4567',
            isHost: true
        });

        console.log('✅ Usuario creado:', userResult.user.email);

        // Crear barcos de prueba
        console.log('⛵ Creando barcos de prueba...');

        const boat1 = await MongoDBBoatService.createBoat({
            name: 'Yate de Lujo Mediterráneo',
            description: 'Hermoso yate de lujo perfecto para paseos románticos o celebraciones especiales. Equipado con todas las comodidades modernas.',
            images: ['https://example.com/yate1.jpg'],
            location: {
                latitude: 41.3851,
                longitude: 2.1734,
                address: 'Port Vell, Barcelona',
                city: 'Barcelona',
                state: 'Cataluña',
                country: 'España'
            },
            pricePerHour: 250,
            pricePerDay: 2000,
            capacity: 8,
            type: 'yacht',
            amenities: ['WiFi', 'Aire acondicionado', 'Cocina', 'Ducha', 'Altavoces'],
            specifications: {
                length: 12,
                beam: 4,
                draft: 1.5,
                year: 2020,
                brand: 'Sea Ray',
                model: 'Sundancer 350',
                engineType: 'Diesel',
                fuelType: 'Diesel',
                maxSpeed: 35,
                fuelCapacity: 500
            },
            rules: {
                smoking: false,
                pets: true,
                children: true,
                parties: false,
                additionalRules: ['No fumar a bordo', 'Respetar el horario de salida']
            },
            safety: {
                lifeJackets: 10,
                firstAidKit: true,
                fireExtinguisher: true,
                radio: true,
                gps: true
            },
            cancellationPolicy: 'moderate',
            minimumRentalHours: 4,
            maximumRentalHours: 24
        }, userResult.user.id);

        console.log('✅ Barco 1 creado:', boat1.name);

        const boat2 = await MongoDBBoatService.createBoat({
            name: 'Velero Clásico Beneteau',
            description: 'Velero clásico perfecto para navegantes experimentados. Ideal para paseos tranquilos y disfrutar del viento.',
            images: ['https://example.com/velero1.jpg'],
            location: {
                latitude: 39.4699,
                longitude: -0.3763,
                address: 'Puerto de Valencia',
                city: 'Valencia',
                state: 'Comunidad Valenciana',
                country: 'España'
            },
            pricePerHour: 180,
            pricePerDay: 1400,
            capacity: 6,
            type: 'sailboat',
            amenities: ['WiFi', 'Cocina básica', 'Equipo de pesca'],
            specifications: {
                length: 14,
                beam: 4.5,
                draft: 2,
                year: 2019,
                brand: 'Beneteau',
                model: 'Oceanis 45',
                engineType: 'Diesel auxiliar',
                fuelType: 'Diesel',
                maxSpeed: 8,
                fuelCapacity: 200
            },
            rules: {
                smoking: false,
                pets: false,
                children: true,
                parties: false,
                additionalRules: ['Experiencia en navegación recomendada']
            },
            safety: {
                lifeJackets: 8,
                firstAidKit: true,
                fireExtinguisher: true,
                radio: true,
                gps: true
            },
            cancellationPolicy: 'flexible',
            minimumRentalHours: 6,
            maximumRentalHours: 48
        }, userResult.user.id);

        console.log('✅ Barco 2 creado:', boat2.name);

        const boat3 = await MongoDBBoatService.createBoat({
            name: 'Lancha de Pesca Rápida',
            description: 'Lancha perfecta para pesca deportiva y paseos rápidos. Equipada con todo lo necesario para una gran experiencia de pesca.',
            images: ['https://example.com/lancha1.jpg'],
            location: {
                latitude: 36.7213,
                longitude: -4.4214,
                address: 'Puerto de Málaga',
                city: 'Málaga',
                state: 'Andalucía',
                country: 'España'
            },
            pricePerHour: 120,
            pricePerDay: 900,
            capacity: 4,
            type: 'fishing_boat',
            amenities: ['Equipo de pesca completo', 'Chalecos salvavidas', 'Refrigerador'],
            specifications: {
                length: 7,
                beam: 2.5,
                draft: 0.8,
                year: 2021,
                brand: 'Bayliner',
                model: 'Element 7',
                engineType: 'Gasolina',
                fuelType: 'Gasolina',
                maxSpeed: 45,
                fuelCapacity: 150
            },
            rules: {
                smoking: false,
                pets: false,
                children: true,
                parties: false,
                additionalRules: ['Licencia de navegación requerida']
            },
            safety: {
                lifeJackets: 6,
                firstAidKit: true,
                fireExtinguisher: true,
                radio: false,
                gps: true
            },
            cancellationPolicy: 'strict',
            minimumRentalHours: 4,
            maximumRentalHours: 12
        }, userResult.user.id);

        console.log('✅ Barco 3 creado:', boat3.name);

        console.log('🎉 ¡Datos de prueba creados exitosamente!');
        console.log('📊 Ahora puedes ver los datos en MongoDB Compass:');
        console.log('   - 1 usuario demo');
        console.log('   - 3 barcos de diferentes tipos');
        console.log('   - Datos completos con especificaciones');

    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error);
    }
}

// Ejecutar el script
seedDatabase().then(() => {
    console.log('✅ Script completado');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Error en script:', error);
    process.exit(1);
});
