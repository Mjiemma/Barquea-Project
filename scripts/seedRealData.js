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
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
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
    availability: {
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        blockedDates: [{ type: Date }]
    },
    rules: {
        smoking: { type: Boolean, default: false },
        pets: { type: Boolean, default: false },
        children: { type: Boolean, default: true },
        parties: { type: Boolean, default: false },
        additionalRules: [{ type: String }]
    },
    safety: {
        lifeJackets: { type: Number, default: 0, min: 0 },
        firstAidKit: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },
        radio: { type: Boolean, default: false },
        gps: { type: Boolean, default: false }
    },
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'moderate'
    },
    minimumRentalHours: { type: Number, default: 2, min: 1 },
    maximumRentalHours: { type: Number, default: 24, min: 1 },
    bookingCount: { type: Number, default: 0, min: 0 },
    lastBookedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

const User = mongoose.model('User', userSchema);
const Boat = mongoose.model('Boat', boatSchema);

async function seedRealData() {
    try {
        console.log('🔄 Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');

        // Limpiar datos existentes
        console.log('🧹 Limpiando datos existentes...');
        await User.deleteMany({});
        await Boat.deleteMany({});
        console.log('✅ Datos limpiados');

        // Crear usuarios hosts
        console.log('\n👥 Creando usuarios hosts...');

        const hosts = [
            {
                email: 'maria.garcia@barquea.com',
                firstName: 'María',
                lastName: 'García',
                password: 'password123',
                phone: '+34 600 123 456',
                isHost: true,
                hostProfile: {
                    bio: 'Capitana con más de 10 años de experiencia navegando por el Mediterráneo. Especializada en yates de lujo.',
                    responseTime: '1 hora',
                    isSuperHost: true,
                    rating: 4.9,
                    reviewCount: 127
                }
            },
            {
                email: 'carlos.lopez@barquea.com',
                firstName: 'Carlos',
                lastName: 'López',
                password: 'password123',
                phone: '+34 600 234 567',
                isHost: true,
                hostProfile: {
                    bio: 'Experto en veleros clásicos. Amante de la navegación tradicional y las regatas.',
                    responseTime: '2 horas',
                    isSuperHost: false,
                    rating: 4.7,
                    reviewCount: 89
                }
            },
            {
                email: 'juan.perez@barquea.com',
                firstName: 'Juan',
                lastName: 'Pérez',
                password: 'password123',
                phone: '+34 600 345 678',
                isHost: true,
                hostProfile: {
                    bio: 'Especialista en pesca deportiva. Conoce los mejores caladeros de la costa.',
                    responseTime: '3 horas',
                    isSuperHost: false,
                    rating: 4.5,
                    reviewCount: 56
                }
            },
            {
                email: 'ana.martinez@barquea.com',
                firstName: 'Ana',
                lastName: 'Martínez',
                password: 'password123',
                phone: '+34 600 456 789',
                isHost: true,
                hostProfile: {
                    bio: 'Host premium especializada en catamaranes de lujo. Experiencia en eventos corporativos.',
                    responseTime: '1 hora',
                    isSuperHost: true,
                    rating: 4.9,
                    reviewCount: 203
                }
            },
            {
                email: 'roberto.silva@barquea.com',
                firstName: 'Roberto',
                lastName: 'Silva',
                password: 'password123',
                phone: '+58 414 123 4567',
                isHost: true,
                hostProfile: {
                    bio: 'Capitán venezolano con amplia experiencia en el Caribe. Especialista en yates ejecutivos.',
                    responseTime: '4 horas',
                    isSuperHost: false,
                    rating: 4.4,
                    reviewCount: 78
                }
            }
        ];

        const createdHosts = [];
        for (const hostData of hosts) {
            const hashedPassword = await bcrypt.hash(hostData.password, 12);
            const host = new User({
                ...hostData,
                password: hashedPassword
            });
            const savedHost = await host.save();
            createdHosts.push(savedHost);
            console.log(`✅ Host creado: ${savedHost.firstName} ${savedHost.lastName}`);
        }

        // Crear barcos
        console.log('\n⛵ Creando barcos...');

        const boats = [
            {
                name: 'Yate de Lujo Mediterráneo',
                description: 'Hermoso yate de lujo perfecto para paseos románticos o celebraciones especiales. Equipado con todas las comodidades modernas, incluyendo WiFi, aire acondicionado, cocina completa y zona de descanso. Ideal para grupos de hasta 8 personas.',
                images: [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
                ],
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
                amenities: ['WiFi', 'Aire acondicionado', 'Cocina', 'Ducha', 'Altavoces', 'GPS', 'Refrigerador'],
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
                hostId: createdHosts[0]._id,
                host: {
                    id: createdHosts[0]._id,
                    name: `${createdHosts[0].firstName} ${createdHosts[0].lastName}`,
                    avatar: createdHosts[0].avatar,
                    rating: createdHosts[0].hostProfile.rating,
                    responseTime: createdHosts[0].hostProfile.responseTime,
                    isSuperHost: createdHosts[0].hostProfile.isSuperHost
                },
                rating: 4.8,
                reviewCount: 127,
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
                maximumRentalHours: 24,
                bookingCount: 45
            },
            {
                name: 'Velero Clásico Beneteau',
                description: 'Velero clásico perfecto para navegantes experimentados. Ideal para paseos tranquilos y disfrutar del viento. Equipado con cocina básica y equipo de pesca. Perfecto para una experiencia de navegación auténtica.',
                images: [
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
                ],
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
                hostId: createdHosts[1]._id,
                host: {
                    id: createdHosts[1]._id,
                    name: `${createdHosts[1].firstName} ${createdHosts[1].lastName}`,
                    avatar: createdHosts[1].avatar,
                    rating: createdHosts[1].hostProfile.rating,
                    responseTime: createdHosts[1].hostProfile.responseTime,
                    isSuperHost: createdHosts[1].hostProfile.isSuperHost
                },
                rating: 4.6,
                reviewCount: 89,
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
                maximumRentalHours: 48,
                bookingCount: 32
            },
            {
                name: 'Lancha de Pesca Rápida',
                description: 'Lancha perfecta para pesca deportiva y paseos rápidos. Equipada con todo lo necesario para una gran experiencia de pesca. Incluye equipo completo de pesca, refrigerador para las capturas y chalecos salvavidas.',
                images: [
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
                ],
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
                hostId: createdHosts[2]._id,
                host: {
                    id: createdHosts[2]._id,
                    name: `${createdHosts[2].firstName} ${createdHosts[2].lastName}`,
                    avatar: createdHosts[2].avatar,
                    rating: createdHosts[2].hostProfile.rating,
                    responseTime: createdHosts[2].hostProfile.responseTime,
                    isSuperHost: createdHosts[2].hostProfile.isSuperHost
                },
                rating: 4.4,
                reviewCount: 56,
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
                maximumRentalHours: 12,
                bookingCount: 28
            },
            {
                name: 'Catamarán Premium',
                description: 'Catamarán de lujo perfecto para eventos especiales y grupos grandes. Amplio espacio interior y exterior, ideal para celebraciones. Equipado con todas las comodidades: WiFi, aire acondicionado, cocina completa, ducha y zona de descanso.',
                images: [
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
                ],
                location: {
                    latitude: 38.9072,
                    longitude: 1.4206,
                    address: 'Marina Ibiza',
                    city: 'Ibiza',
                    state: 'Islas Baleares',
                    country: 'España'
                },
                pricePerHour: 300,
                pricePerDay: 2400,
                capacity: 10,
                type: 'catamaran',
                amenities: ['WiFi', 'Aire acondicionado', 'Cocina', 'Ducha', 'Altavoces', 'GPS', 'Refrigerador', 'Parrilla'],
                specifications: {
                    length: 9,
                    beam: 5,
                    draft: 1.2,
                    year: 2022,
                    brand: 'Jeanneau',
                    model: 'Cap Camarat 9.0',
                    engineType: 'Diesel',
                    fuelType: 'Diesel',
                    maxSpeed: 25,
                    fuelCapacity: 400
                },
                hostId: createdHosts[3]._id,
                host: {
                    id: createdHosts[3]._id,
                    name: `${createdHosts[3].firstName} ${createdHosts[3].lastName}`,
                    avatar: createdHosts[3].avatar,
                    rating: createdHosts[3].hostProfile.rating,
                    responseTime: createdHosts[3].hostProfile.responseTime,
                    isSuperHost: createdHosts[3].hostProfile.isSuperHost
                },
                rating: 4.9,
                reviewCount: 203,
                rules: {
                    smoking: false,
                    pets: true,
                    children: true,
                    parties: true,
                    additionalRules: ['Eventos corporativos bienvenidos']
                },
                safety: {
                    lifeJackets: 12,
                    firstAidKit: true,
                    fireExtinguisher: true,
                    radio: true,
                    gps: true
                },
                cancellationPolicy: 'moderate',
                minimumRentalHours: 6,
                maximumRentalHours: 24,
                bookingCount: 67
            },
            {
                name: 'Yate Ejecutivo',
                description: 'Yate ejecutivo perfecto para reuniones de negocios o paseos corporativos. Equipado con WiFi de alta velocidad, zona de trabajo y todas las comodidades necesarias para una experiencia profesional.',
                images: [
                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
                ],
                location: {
                    latitude: 10.4806,
                    longitude: -66.9036,
                    address: 'Puerto La Guaira',
                    city: 'Caracas',
                    state: 'Vargas',
                    country: 'Venezuela'
                },
                pricePerHour: 200,
                pricePerDay: 1600,
                capacity: 6,
                type: 'yacht',
                amenities: ['WiFi', 'Cocina', 'Zona de trabajo', 'GPS'],
                specifications: {
                    length: 10,
                    beam: 3.5,
                    draft: 1.2,
                    year: 2018,
                    brand: 'Catalina',
                    model: '34 MkII',
                    engineType: 'Diesel',
                    fuelType: 'Diesel',
                    maxSpeed: 30,
                    fuelCapacity: 300
                },
                hostId: createdHosts[4]._id,
                host: {
                    id: createdHosts[4]._id,
                    name: `${createdHosts[4].firstName} ${createdHosts[4].lastName}`,
                    avatar: createdHosts[4].avatar,
                    rating: createdHosts[4].hostProfile.rating,
                    responseTime: createdHosts[4].hostProfile.responseTime,
                    isSuperHost: createdHosts[4].hostProfile.isSuperHost
                },
                rating: 4.3,
                reviewCount: 78,
                rules: {
                    smoking: false,
                    pets: false,
                    children: true,
                    parties: false,
                    additionalRules: ['Ideal para reuniones de negocios']
                },
                safety: {
                    lifeJackets: 8,
                    firstAidKit: true,
                    fireExtinguisher: true,
                    radio: true,
                    gps: true
                },
                cancellationPolicy: 'strict',
                minimumRentalHours: 4,
                maximumRentalHours: 12,
                bookingCount: 23
            }
        ];

        for (const boatData of boats) {
            const boat = new Boat(boatData);
            const savedBoat = await boat.save();
            console.log(`✅ Barco creado: ${savedBoat.name}`);
        }

        // Crear usuario de prueba para login
        console.log('\n👤 Creando usuario de prueba...');
        const testUser = new User({
            email: 'demo@barquea.com',
            firstName: 'Usuario',
            lastName: 'Demo',
            password: await bcrypt.hash('demo123456', 12),
            phone: '+58 414 123 4567',
            isHost: false
        });
        await testUser.save();
        console.log('✅ Usuario demo creado: demo@barquea.com / demo123456');

        console.log('\n🎉 ¡Datos reales creados exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`   👥 ${createdHosts.length} hosts creados`);
        console.log(`   ⛵ ${boats.length} barcos creados`);
        console.log(`   👤 1 usuario demo creado`);
        console.log('\n🔑 Credenciales de prueba:');
        console.log('   Email: demo@barquea.com');
        console.log('   Contraseña: demo123456');
        console.log('\n📋 Hosts creados:');
        hosts.forEach((host, index) => {
            console.log(`   ${index + 1}. ${host.firstName} ${host.lastName} - ${host.email}`);
        });

    } catch (error) {
        console.error('❌ Error creando datos:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
    }
}

seedRealData();
