import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Boat from '@/models/Boat';

export async function POST(request: NextRequest) {
    try {

        await connectDB();

        await User.deleteMany({});

        await Boat.deleteMany({});

        const users = [
            {
                firstName: 'Eli',
                lastName: 'Suárez',
                email: 'esuarez.gcc@gmail.com',
                password: 'password123',
                phone: '+34 666 111 222',
                isEmailVerified: true,
                hostProfile: {
                    responseTime: '1 hora',
                    isSuperHost: true,
                    rating: 5.0,
                    reviewCount: 150,
                    joinedDate: new Date(),
                    status: 'approved',
                    submittedAt: new Date()
                }
            },
            {
                firstName: 'Roberto',
                lastName: 'Silva',
                email: 'roberto.silva@example.com',
                password: 'password123',
                phone: '+34 666 333 444',
                isEmailVerified: true,
                hostProfile: {
                    responseTime: '2 horas',
                    isSuperHost: false,
                    rating: 4.4,
                    reviewCount: 89,
                    joinedDate: new Date(),
                    status: 'approved',
                    submittedAt: new Date()
                }
            },
            {
                firstName: 'María',
                lastName: 'García',
                email: 'maria.garcia@example.com',
                password: 'password123',
                phone: '+34 666 555 666',
                isEmailVerified: true,
                hostProfile: {
                    responseTime: '3 horas',
                    isSuperHost: false,
                    rating: 0,
                    reviewCount: 0,
                    joinedDate: new Date(),
                    status: 'denied',
                    submittedAt: new Date()
                }
            }
        ];

        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            
        }

        const robertoUser = createdUsers.find(u => u.email === 'roberto.silva@example.com');

        const boats = [
            {
                name: 'Yate Ejecutivo Premium',
                description: 'Yate ejecutivo perfecto para reuniones de negocios o paseos corporativos. Equipado con WiFi de alta velocidad, zona de trabajo y todas las comodidades necesarias para una experiencia profesional.',
                images: [
                    'https://images.unsplash.com/photo-1725974498175-448e2ae355b7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format'
                ],
                location: {
                    latitude: 10.4806,
                    longitude: -66.9036,
                    address: 'Puerto La Guaira',
                    city: 'Caracas',
                    state: 'Vargas',
                    country: 'Venezuela'
                },
                specifications: {
                    length: 10,
                    beam: 3.5,
                    draft: 1.2,
                    year: 2018,
                    brand: 'Catalina',
                    model: '34 MkII',
                    engineType: 'Diesel',
                    fuelType: 'diesel',
                    maxSpeed: 30,
                    fuelCapacity: 300
                },
                pricePerHour: 200,
                pricePerDay: 1600,
                capacity: 6,
                type: 'yacht',
                amenities: ['WiFi', 'Cocina', 'Zona de trabajo', 'GPS'],
                hostId: robertoUser._id,
                host: {
                    id: robertoUser._id,
                    name: `${robertoUser.firstName} ${robertoUser.lastName}`,
                    rating: 4.4,
                    responseTime: '4 horas',
                    isSuperHost: false
                },
                rating: 4.3,
                reviewCount: 78,
                isAvailable: true,
                cancellationPolicy: 'strict',
                minimumRentalHours: 4,
                maximumRentalHours: 12,
                bookingCount: 23,
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
                availability: {
                    blockedDates: [],
                    startDate: new Date('2025-09-19T15:02:25.337Z'),
                    endDate: new Date('2026-10-10T14:59:50.615Z')
                }
            },
            {
                name: 'Catamarán de Lujo',
                description: 'Catamarán de lujo perfecto para eventos especiales y grupos grandes. Amplio espacio interior y exterior, ideal para celebraciones. Equipado con todas las comodidades: WiFi, aire acondicionado, cocina completa, ducha y zona de descanso.',
                images: [
                    'https://images.unsplash.com/photo-1534656769622-1b8cf5f1ef5a?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format'
                ],
                location: {
                    latitude: 38.9072,
                    longitude: 1.4206,
                    address: 'Marina Ibiza',
                    city: 'Ibiza',
                    state: 'Islas Baleares',
                    country: 'España'
                },
                specifications: {
                    length: 9,
                    beam: 5,
                    draft: 1.2,
                    year: 2022,
                    brand: 'Jeanneau',
                    model: 'Cap Camarat 9.0',
                    engineType: 'Diesel',
                    fuelType: 'diesel',
                    maxSpeed: 25,
                    fuelCapacity: 400
                },
                pricePerHour: 300,
                pricePerDay: 2400,
                capacity: 10,
                type: 'catamaran',
                amenities: ['WiFi', 'Aire acondicionado', 'Cocina', 'Ducha', 'Altavoces', 'GPS', 'Refrigerador', 'Parrilla'],
                hostId: robertoUser._id,
                host: {
                    id: robertoUser._id,
                    name: `${robertoUser.firstName} ${robertoUser.lastName}`,
                    rating: 4.4,
                    responseTime: '4 horas',
                    isSuperHost: false
                },
                rating: 4.9,
                reviewCount: 203,
                isAvailable: true,
                cancellationPolicy: 'moderate',
                minimumRentalHours: 6,
                maximumRentalHours: 24,
                bookingCount: 67,
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
                availability: {
                    blockedDates: [],
                    startDate: new Date('2025-09-19T15:02:25.277Z'),
                    endDate: new Date('2026-10-10T14:59:50.614Z')
                }
            },
            {
                name: 'Velero Clásico',
                description: 'Velero clásico perfecto para navegantes experimentados. Ideal para paseos tranquilos y disfrutar del viento. Equipado con cocina básica y equipo de pesca. Perfecto para una experiencia de navegación auténtica.',
                images: [
                    'https://images.unsplash.com/photo-1687182095432-87db07ac1d1a?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format'
                ],
                location: {
                    latitude: 39.4699,
                    longitude: -0.3763,
                    address: 'Puerto de Valencia',
                    city: 'Valencia',
                    state: 'Comunidad Valenciana',
                    country: 'España'
                },
                specifications: {
                    length: 14,
                    beam: 4.5,
                    draft: 2,
                    year: 2019,
                    brand: 'Beneteau',
                    model: 'Oceanis 45',
                    engineType: 'Diesel auxiliar',
                    fuelType: 'diesel',
                    maxSpeed: 8,
                    fuelCapacity: 200
                },
                pricePerHour: 180,
                pricePerDay: 1400,
                capacity: 6,
                type: 'sailboat',
                amenities: ['WiFi', 'Cocina básica', 'Equipo de pesca'],
                hostId: robertoUser._id,
                host: {
                    id: robertoUser._id,
                    name: `${robertoUser.firstName} ${robertoUser.lastName}`,
                    rating: 4.4,
                    responseTime: '4 horas',
                    isSuperHost: false
                },
                rating: 4.6,
                reviewCount: 89,
                isAvailable: true,
                cancellationPolicy: 'flexible',
                minimumRentalHours: 6,
                maximumRentalHours: 48,
                bookingCount: 32,
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
                availability: {
                    blockedDates: [],
                    startDate: new Date('2025-09-19T15:02:25.161Z'),
                    endDate: new Date('2026-10-10T14:59:50.615Z')
                }
            }
        ];

        for (const boatData of boats) {
            const boat = new Boat(boatData);
            await boat.save();
            
        }

        

        return NextResponse.json({
            success: true,
            message: 'Base de datos limpiada y configurada exitosamente',
            summary: {
                users: 3,
                boats: 3,
                details: {
                    admin: 'esuarez.gcc@gmail.com',
                    host: 'roberto.silva@example.com (3 barcos)',
                    user: 'maria.garcia@example.com'
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
