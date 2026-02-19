import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { userId, reason } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'ID de usuario requerido' },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                isHost: false,
                'hostProfile.status': 'denied',
                'hostProfile.processedAt': new Date(),
                'hostProfile.rejectionReason': reason || 'Host desactivado por administrador'
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Aplicación de host rechazada exitosamente',
            data: updatedUser
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al rechazar host' },
            { status: 500 }
        );
    }
}
