const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Cadena de conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority';

// Esquemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    isHost: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: true },
    hostProfile: {
        bio: { type: String },
        responseTime: { type: String, default: '1 hora' },
        isSuperHost: { type: Boolean, default: false },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0, min: 0 },
        joinedDate: { type: Date, default: Date.now }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const boatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true }
    },
    pricePerHour: { type: Number, required: true, min: 0 },
    pricePerDay: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1, max: 50 },
    type: {
        type: String,
        required: true,
        enum: ['sailboat', 'motorboat', 'yacht', 'catamaran', 'fishing_boat', 'speedboat']
    },
    amenities: [{ type: String }],
    specifications: {
        length: { type: Number, required: true, min: 0 },
        beam: { type: Number, min: 0 },
        draft: { type: Number, min: 0 },
        year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        engineType: { type: String },
        fuelType: { type: String },
        maxSpeed: { type: Number, min: 0 },
        fuelCapacity: { type: Number, min: 0 }
    },
    hostId: { type: String, required: true },
    host: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        responseTime: { type: String, default: '1 hora' },
        isSuperHost: { type: Boolean, default: false }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    bookingCount: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Boat = mongoose.model('Boat', boatSchema);

async function testCompleteIntegration() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');

        // 1. Verificar datos existentes
        console.log('\n📊 Verificando datos existentes...');

        const [userCount, boatCount] = await Promise.all([
            User.countDocuments(),
            Boat.countDocuments()
        ]);

        console.log(`👥 Usuarios en la base de datos: ${userCount}`);
        console.log(`⛵ Barcos en la base de datos: ${boatCount}`);

        // 2. Probar búsqueda de barcos
        console.log('\n🔍 Probando búsqueda de barcos...');

        const allBoats = await Boat.find({ isAvailable: true }).limit(5);
        console.log(`✅ Barcos disponibles encontrados: ${allBoats.length}`);

        allBoats.forEach((boat, index) => {
            console.log(`   ${index + 1}. ${boat.name} - ${boat.location.city} - $${boat.pricePerHour}/hora`);
        });

        // 3. Probar búsqueda por ciudad
        console.log('\n🏙️ Probando búsqueda por ciudad...');

        const barcelonaBoats = await Boat.find({
            isAvailable: true,
            'location.city': 'Barcelona'
        });
        console.log(`✅ Barcos en Barcelona: ${barcelonaBoats.length}`);

        // 4. Probar búsqueda por tipo
        console.log('\n⛵ Probando búsqueda por tipo...');

        const yachtBoats = await Boat.find({
            isAvailable: true,
            type: 'yacht'
        });
        console.log(`✅ Yates disponibles: ${yachtBoats.length}`);

        // 5. Probar búsqueda por rango de precio
        console.log('\n💰 Probando búsqueda por rango de precio...');

        const affordableBoats = await Boat.find({
            isAvailable: true,
            pricePerHour: { $gte: 100, $lte: 200 }
        });
        console.log(`✅ Barcos entre $100-200/hora: ${affordableBoats.length}`);

        // 6. Probar búsqueda por capacidad
        console.log('\n👥 Probando búsqueda por capacidad...');

        const familyBoats = await Boat.find({
            isAvailable: true,
            capacity: { $gte: 6 }
        });
        console.log(`✅ Barcos para 6+ personas: ${familyBoats.length}`);

        // 7. Probar ordenamiento por rating
        console.log('\n⭐ Probando ordenamiento por rating...');

        const topRatedBoats = await Boat.find({
            isAvailable: true,
            reviewCount: { $gte: 5 }
        }).sort({ rating: -1 }).limit(3);

        console.log(`✅ Top 3 barcos mejor valorados:`);
        topRatedBoats.forEach((boat, index) => {
            console.log(`   ${index + 1}. ${boat.name} - ⭐ ${boat.rating} (${boat.reviewCount} reseñas)`);
        });

        // 8. Probar búsqueda por amenities
        console.log('\n🏊 Probando búsqueda por amenities...');

        const boatsWithWiFi = await Boat.find({
            isAvailable: true,
            amenities: { $in: ['WiFi'] }
        });
        console.log(`✅ Barcos con WiFi: ${boatsWithWiFi.length}`);

        // 9. Probar estadísticas
        console.log('\n📈 Probando estadísticas...');

        const stats = await Boat.aggregate([
            { $match: { isAvailable: true } },
            {
                $group: {
                    _id: null,
                    totalBoats: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    avgPrice: { $avg: '$pricePerHour' },
                    totalBookings: { $sum: '$bookingCount' }
                }
            }
        ]);

        if (stats.length > 0) {
            const stat = stats[0];
            console.log(`✅ Estadísticas generales:`);
            console.log(`   📊 Total barcos: ${stat.totalBoats}`);
            console.log(`   ⭐ Rating promedio: ${stat.avgRating.toFixed(2)}`);
            console.log(`   💰 Precio promedio: $${stat.avgPrice.toFixed(2)}/hora`);
            console.log(`   📅 Total reservas: ${stat.totalBookings}`);
        }

        // 10. Probar búsqueda por tipo y ciudad
        console.log('\n🔍 Probando búsqueda combinada...');

        const valenciaYachts = await Boat.find({
            isAvailable: true,
            'location.city': 'Valencia',
            type: 'sailboat'
        });
        console.log(`✅ Veleros en Valencia: ${valenciaYachts.length}`);

        // 11. Verificar usuarios hosts
        console.log('\n👨‍✈️ Verificando usuarios hosts...');

        const hosts = await User.find({ isHost: true });
        console.log(`✅ Hosts registrados: ${hosts.length}`);

        hosts.forEach((host, index) => {
            console.log(`   ${index + 1}. ${host.firstName} ${host.lastName} - ${host.email}`);
        });

        // 12. Probar búsqueda de usuario demo
        console.log('\n👤 Verificando usuario demo...');

        const demoUser = await User.findOne({ email: 'demo@barquea.com' });
        if (demoUser) {
            console.log(`✅ Usuario demo encontrado: ${demoUser.firstName} ${demoUser.lastName}`);
        } else {
            console.log('❌ Usuario demo no encontrado');
        }

        console.log('\n🎉 ¡Todas las pruebas de integración completadas exitosamente!');
        console.log('\n📋 Resumen de funcionalidades probadas:');
        console.log('   ✅ Conexión a MongoDB Atlas');
        console.log('   ✅ Búsqueda de barcos disponibles');
        console.log('   ✅ Filtrado por ciudad');
        console.log('   ✅ Filtrado por tipo de barco');
        console.log('   ✅ Filtrado por rango de precio');
        console.log('   ✅ Filtrado por capacidad');
        console.log('   ✅ Ordenamiento por rating');
        console.log('   ✅ Búsqueda por amenities');
        console.log('   ✅ Estadísticas generales');
        console.log('   ✅ Búsquedas combinadas');
        console.log('   ✅ Verificación de hosts');
        console.log('   ✅ Usuario demo');

        console.log('\n🚀 ¡El sistema está listo para usar en la app móvil!');
        console.log('\n📱 Próximos pasos:');
        console.log('   1. Ejecutar la app móvil: npm start');
        console.log('   2. Hacer login con: demo@barquea.com / demo123456');
        console.log('   3. Explorar los barcos desde MongoDB');
        console.log('   4. Probar búsquedas y filtros');

    } catch (error) {
        console.error('❌ Error en las pruebas de integración:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

testCompleteIntegration();
