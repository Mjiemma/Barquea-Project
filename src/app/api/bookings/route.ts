import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import Boat from '@/models/Boat';
import { verifyToken } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const {
            boatId,
            startDate,
            endDate,
            guestCount,
            specialRequests
        } = await request.json();

        // Validar datos requeridos
        if (!boatId || !startDate || !endDate || !guestCount) {
            return NextResponse.json(
                { message: 'Datos incompletos: boatId, startDate, endDate y guestCount son requeridos' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validar fechas
        if (start >= end) {
            return NextResponse.json(
                { message: 'La fecha de inicio debe ser anterior a la fecha de fin' },
                { status: 400 }
            );
        }

        if (start < new Date()) {
            return NextResponse.json(
                { message: 'La fecha de inicio no puede ser en el pasado' },
                { status: 400 }
            );
        }

        // Obtener información del barco
        const boat = await Boat.findById(boatId);
        if (!boat) {
            return NextResponse.json(
                { message: 'Barco no encontrado' },
                { status: 404 }
            );
        }

        if (!boat.isAvailable) {
            return NextResponse.json(
                { message: 'Barco no disponible' },
                { status: 400 }
            );
        }

        if (guestCount > boat.capacity) {
            return NextResponse.json(
                { message: `El barco solo acepta hasta ${boat.capacity} huéspedes` },
                { status: 400 }
            );
        }

        // Verificar disponibilidad - no debe haber reservas que se solapen
        const overlappingBookings = await Booking.find({
            boat: boatId,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    startDate: { $lt: end },
                    endDate: { $gt: start }
                }
            ]
        });

        if (overlappingBookings.length > 0) {
            return NextResponse.json(
                { message: 'El barco no está disponible en las fechas seleccionadas' },
                { status: 400 }
            );
        }

        // Calcular precio
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const durationDays = durationMs / (1000 * 60 * 60 * 24);

        let basePrice = 0;

        // Si es más de 1 día o se especifica como alquiler diario, usar precio por día
        if (durationDays >= 1 || boat.pricingType === 'daily') {
            basePrice = boat.pricePerDay * Math.ceil(durationDays);
        } else {
            // Para medio día (4+ horas) o menos, usar precio por hora * 4 como mínimo
            const hoursToCharge = Math.max(durationHours, 4);
            basePrice = boat.pricePerHour * hoursToCharge;
        }

        // Agregar tarifa de servicio del 10%
        const serviceFee = basePrice * 0.1;
        const finalPrice = basePrice + serviceFee;

        // Crear PaymentIntent en Stripe
        const paymentIntent = await createPaymentIntent(
            finalPrice,
            'usd',
            {
                bookingUserId: user.id,
                boatId: boatId,
                boatName: boat.name,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                guestCount: guestCount.toString()
            }
        );

        // Crear la reserva en la base de datos
        const booking = new Booking({
            user: user.id,
            boat: boatId,
            startDate: start,
            endDate: end,
            totalPrice: basePrice,
            serviceFee: serviceFee,
            finalPrice: finalPrice,
            status: 'pending',
            paymentStatus: 'pending',
            paymentIntentId: paymentIntent.id,
            guestCount,
            specialRequests
        });

        await booking.save();

        // Poblar información del barco para la respuesta
        await booking.populate('boat', 'name images location');

        return NextResponse.json({
            booking,
            clientSecret: paymentIntent.client_secret,
            message: 'Reserva creada exitosamente'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creando reserva:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role'); // 'guest' o 'host'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        let filter: any = {};

        if (role === 'guest') {
            // Reservas donde el usuario es el huésped
            filter.user = user.id;
        } else if (role === 'host') {
            // Reservas para barcos del usuario (cuando es anfitrión)
            const userBoats = await Boat.find({ hostId: user.id }).select('_id');
            const boatIds = userBoats.map(boat => boat._id);
            filter.boat = { $in: boatIds };
        } else {
            // Por defecto, mostrar todas las reservas relacionadas con el usuario
            const userBoats = await Boat.find({ hostId: user.id }).select('_id');
            const boatIds = userBoats.map(boat => boat._id);
            filter.$or = [
                { user: user.id }, // Como huésped
                { boat: { $in: boatIds } } // Como anfitrión
            ];
        }

        const bookings = await Booking.find(filter)
            .populate('boat', 'name images location pricePerHour pricePerDay hostId')
            .populate('user', 'firstName lastName email avatar')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(filter);

        return NextResponse.json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error: any) {
        console.error('Error obteniendo reservas:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}