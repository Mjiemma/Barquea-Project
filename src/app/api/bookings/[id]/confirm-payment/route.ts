import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { verifyToken } from '@/lib/auth';
import { getPaymentIntent } from '@/lib/stripe';

export async function POST(
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

        const booking = await Booking.findById(id).populate('boat');

        if (!booking) {
            return NextResponse.json(
                { message: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        // Verificar que el usuario es el dueño de la reserva
        if (booking.user.toString() !== user.id) {
            return NextResponse.json(
                { message: 'No tienes permiso para confirmar el pago de esta reserva' },
                { status: 403 }
            );
        }

        // Verificar que la reserva tiene un PaymentIntent ID
        if (!booking.paymentIntentId) {
            return NextResponse.json(
                { message: 'Esta reserva no tiene un pago asociado' },
                { status: 400 }
            );
        }

        // Verificar que el pago no esté ya confirmado
        if (booking.paymentStatus === 'paid') {
            return NextResponse.json(
                { message: 'El pago de esta reserva ya está confirmado' },
                { status: 400 }
            );
        }

        try {
            // Verificar el estado del pago con Stripe
            const paymentIntent = await getPaymentIntent(booking.paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                // Actualizar el estado de la reserva
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                await booking.save();

                // Poblar información para la respuesta
                await booking.populate([
                    { path: 'boat', select: 'name images location pricePerHour pricePerDay hostId' },
                    { path: 'user', select: 'firstName lastName email avatar' }
                ]);

                return NextResponse.json({
                    booking,
                    paymentIntent: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency
                    },
                    message: 'Pago confirmado exitosamente'
                });

            } else if (paymentIntent.status === 'requires_payment_method' || 
                       paymentIntent.status === 'requires_confirmation') {
                
                return NextResponse.json(
                    { 
                        message: 'El pago aún no se ha completado',
                        paymentStatus: paymentIntent.status
                    },
                    { status: 400 }
                );

            } else if (paymentIntent.status === 'payment_failed') {
                
                // Actualizar el estado del pago como fallido
                booking.paymentStatus = 'failed';
                await booking.save();

                return NextResponse.json(
                    { 
                        message: 'El pago ha fallado',
                        paymentStatus: paymentIntent.status
                    },
                    { status: 400 }
                );

            } else {
                
                return NextResponse.json(
                    { 
                        message: 'El pago está en proceso',
                        paymentStatus: paymentIntent.status
                    },
                    { status: 400 }
                );
            }

        } catch (stripeError: any) {
            console.error('Error verificando pago con Stripe:', stripeError);
            
            return NextResponse.json(
                { message: 'Error verificando el estado del pago' },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Error confirmando pago:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}