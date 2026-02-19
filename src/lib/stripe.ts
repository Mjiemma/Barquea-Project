import Stripe from 'stripe';

// Inicializar Stripe con la clave secreta del entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export default stripe;

/**
 * Crear un PaymentIntent para procesar el pago
 * @param amount - Monto en centavos (ej: 10000 = $100.00)
 * @param currency - Moneda del pago (por defecto 'usd')
 * @param metadata - Metadatos adicionales para el pago
 * @returns PaymentIntent creado
 */
export async function createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Stripe.MetadataParam
): Promise<Stripe.PaymentIntent> {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convertir a centavos
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creando PaymentIntent:', error);
        throw error;
    }
}

/**
 * Procesar reembolso de un pago
 * @param paymentIntentId - ID del PaymentIntent a reembolsar
 * @param amount - Monto opcional a reembolsar (si no se especifica, reembolsa todo)
 * @returns Refund creado
 */
export async function refundPayment(
    paymentIntentId: string,
    amount?: number
): Promise<Stripe.Refund> {
    try {
        const refundData: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId,
        };

        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convertir a centavos
        }

        const refund = await stripe.refunds.create(refundData);

        return refund;
    } catch (error) {
        console.error('Error procesando reembolso:', error);
        throw error;
    }
}

/**
 * Verificar el estado de un PaymentIntent
 * @param paymentIntentId - ID del PaymentIntent a verificar
 * @returns PaymentIntent recuperado
 */
export async function getPaymentIntent(
    paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
    try {
        return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
        console.error('Error obteniendo PaymentIntent:', error);
        throw error;
    }
}