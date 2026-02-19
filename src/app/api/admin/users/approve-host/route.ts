import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { userId, hostProfile } = body;

        if (!userId) {
            
            return NextResponse.json(
                { success: false, error: 'ID de usuario requerido' },
                { status: 400 }
            );
        }

        const updatePayload: any = {
            isHost: true,
            'hostProfile.status': 'approved',
            'hostProfile.processedAt': new Date(),
            'hostProfile.joinedDate': new Date(),
        };

        if (hostProfile) {
            const { documents, dniFront, dniBack, ...restProfile } = hostProfile;
            const docFront = documents?.dniFront || dniFront;
            const docBack = documents?.dniBack || dniBack;

            updatePayload.hostProfile = {
                ...restProfile,
                status: 'approved',
                processedAt: new Date(),
                joinedDate: new Date(),
                documents: {
                    dniFront: docFront,
                    dniBack: docBack,
                },
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatePayload,
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
            message: 'Usuario aprobado como host exitosamente',
            data: updatedUser
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al aprobar host' },
            { status: 500 }
        );
    }
}
