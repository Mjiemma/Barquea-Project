import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(
    request: NextRequest,
    { params }: { params: { applicationId: string } }
) {
    try {
        await connectDB();

        const { applicationId } = params;
        const body = await request.json();
        const { action, adminNotes } = body;

        

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { message: 'Acción inválida. Use "approve" o "reject"' },
                { status: 400 }
            );
        }

        const user = await User.findById(applicationId);
        if (!user) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        if (!user.hostProfile || !user.hostProfile.status) {
            return NextResponse.json(
                { message: 'No se encontró aplicación de host' },
                { status: 404 }
            );
        }

        if (user.hostProfile.status !== 'pending') {
            return NextResponse.json(
                { message: 'Esta aplicación ya ha sido procesada' },
                { status: 400 }
            );
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        const isHost = action === 'approve';

        const updatedUser = await User.findByIdAndUpdate(
            applicationId,
            {
                $set: {
                    'hostProfile.status': newStatus,
                    'hostProfile.processedAt': new Date(),
                    'hostProfile.adminNotes': adminNotes || '',
                    isHost,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        

        return NextResponse.json({
            success: true,
            message: `Aplicación de host ${action}da correctamente`,
            user: {
                id: updatedUser._id,
                name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                isHost: updatedUser.isHost,
                hostApplicationStatus: updatedUser.hostProfile.status
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error interno del servidor', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { applicationId: string } }
) {
    try {
        await connectDB();

        const { applicationId } = params;


        const user = await User.findById(applicationId);
        if (!user) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            applicationId,
            {
                $unset: { hostProfile: 1 },
                $set: {
                    isHost: false,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        

        return NextResponse.json({
            success: true,
            message: 'Aplicación de host eliminada correctamente'
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error interno del servidor', error: error.message },
            { status: 500 }
        );
    }
}
