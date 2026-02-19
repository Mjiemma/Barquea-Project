import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import Boat from '@/models/Boat';
import { verifyToken } from '@/lib/auth';
import { refundPayment } from '@/lib/stripe';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const { id } = await params;

        const booking = await Booking.findById(id)
            .populate('boat', 'name images location pricePerHour pricePerDay hostId')
            .populate('user', 'firstName lastName email avatar');

        if (!booking) {
            return NextResponse.json(
                { message: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        // Verificar que el usuario tiene acceso a esta reserva
        const boat = booking.boat as any;
        const isGuest = booking.user._id.toString() === user.id;
        const isHost = boat.hostId === user.id;

        if (!isGuest && !isHost) {
            return NextResponse.json(
                { message: 'No tienes permiso para ver esta reserva' },
                { status: 403 }
            );
        }

        return NextResponse.json(booking);

    } catch (error: any) {
        console.error('Error obteniendo reserva:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const { id } = await params;
        const { status } = await request.json();

        if (!status || !['confirmed', 'cancelled'].includes(status)) {
            return NextResponse.json(
                { message: 'Estado inválido. Debe ser "confirmed" o "cancelled"' },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(id).populate('boat');

        if (!booking) {
            return NextResponse.json(
                { message: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        const boat = booking.boat as any;
        const isGuest = booking.user.toString() === user.id;
        const isHost = boat.hostId === user.id;

        // Verificar permisos
        if (!isGuest && !isHost) {
            return NextResponse.json(
                { message: 'No tienes permiso para modificar esta reserva' },
                { status: 403 }
            );
        }

        // Lógica de negocio para cambios de estado
        if (status === 'confirmed') {
            // Solo el anfitrión puede confirmar
            if (!isHost) {
                return NextResponse.json(
                    { message: 'Solo el anfitrión puede confirmar la reserva' },
                    { status: 403 }
                );
            }

            // Solo se puede confirmar si está pendiente y pagada
            if (booking.status !== 'pending') {
                return NextResponse.json(
                    { message: 'Solo se pueden confirmar reservas pendientes' },
                    { status: 400 }
                );
            }

            if (booking.paymentStatus !== 'paid') {
                return NextResponse.json(
                    { message: 'Solo se pueden confirmar reservas pagadas' },
                    { status: 400 }
                );
            }
        }

        if (status === 'cancelled') {
            // Tanto huésped como anfitrión pueden cancelar
            if (booking.status === 'cancelled') {
                return NextResponse.json(
                    { message: 'La reserva ya está cancelada' },
                    { status: 400 }
                );
            }

            // Si la reserva está pagada, procesar reembolso
            if (booking.paymentStatus === 'paid' && booking.paymentIntentId) {
                try {
                    await refundPayment(booking.paymentIntentId);
                    booking.paymentStatus = 'refunded';
                } catch (refundError) {
                    console.error('Error procesando reembolso:', refundError);
                    return NextResponse.json(
                        { message: 'Error procesando el reembolso. Contacta con soporte.' },
                        { status: 500 }
                    );
                }
            }
        }

        // Actualizar el estado
        booking.status = status;
        await booking.save();

        // Poblar información para la respuesta
        await booking.populate([
            { path: 'boat', select: 'name images location pricePerHour pricePerDay hostId' },
            { path: 'user', select: 'firstName lastName email avatar' }
        ]);

        return NextResponse.json({
            booking,
            message: `Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'} exitosamente`
        });

    } catch (error: any) {
        console.error('Error actualizando reserva:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}