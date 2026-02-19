import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const sig = headersList.get('stripe-signature');

        if (!sig) {
            console.error('Falta la firma de Stripe');
            return NextResponse.json(
                { message: 'Falta la firma de Stripe' },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            // Verificar la firma del webhook
            event = stripe.webhooks.constructEvent(
                body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error('Error verificando la firma del webhook:', err.message);
            return NextResponse.json(
                { message: `Error de webhook: ${err.message}` },
                { status: 400 }
            );
        }

        await connectDB();

        // Manejar diferentes tipos de eventos de Stripe
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.canceled':
                await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
                break;

            default:
                console.log(`Tipo de evento no manejado: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Error procesando webhook de Stripe:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * Manejar evento de pago exitoso
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
        const booking = await Booking.findOne({ 
            paymentIntentId: paymentIntent.id 
        });

        if (!booking) {
            console.error(`No se encontró reserva para PaymentIntent: ${paymentIntent.id}`);
            return;
        }

        // Actualizar estado del pago y la reserva
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        console.log(`Pago confirmado para reserva: ${booking._id}`);

        // Aquí podrías agregar lógica adicional como:
        // - Enviar email de confirmación
        // - Notificar al anfitrión
        // - Actualizar estadísticas

    } catch (error) {
        console.error('Error manejando payment_intent.succeeded:', error);
    }
}

/**
 * Manejar evento de pago fallido
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
        const booking = await Booking.findOne({ 
            paymentIntentId: paymentIntent.id 
        });

        if (!booking) {
            console.error(`No se encontró reserva para PaymentIntent: ${paymentIntent.id}`);
            return;
        }

        // Actualizar estado del pago
        booking.paymentStatus = 'failed';
        await booking.save();

        console.log(`Pago fallido para reserva: ${booking._id}`);

        // Aquí podrías agregar lógica adicional como:
        // - Enviar email notificando el fallo
        // - Liberar las fechas reservadas
        // - Notificar al usuario

    } catch (error) {
        console.error('Error manejando payment_intent.payment_failed:', error);
    }
}

/**
 * Manejar evento de pago cancelado
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
        const booking = await Booking.findOne({ 
            paymentIntentId: paymentIntent.id 
        });

        if (!booking) {
            console.error(`No se encontró reserva para PaymentIntent: ${paymentIntent.id}`);
            return;
        }

        // Actualizar estado de la reserva
        booking.status = 'cancelled';
        booking.paymentStatus = 'failed';
        await booking.save();

        console.log(`Pago cancelado para reserva: ${booking._id}`);

        // Aquí podrías agregar lógica adicional como:
        // - Enviar email de cancelación
        // - Liberar las fechas reservadas

    } catch (error) {
        console.error('Error manejando payment_intent.canceled:', error);
    }
}