import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {

        await connectDB();

        const { userId } = params;

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const hasApplication = user.hostProfile && user.hostProfile.status;

        if (!hasApplication) {
            return NextResponse.json({
                success: true,
                hasApplication: false
            });
        }

        return NextResponse.json({
            success: true,
            hasApplication: true,
            status: user.hostProfile.status,
            applicationDate: user.hostProfile.applicationDate,
            rejectionReason: user.hostProfile.rejectionReason
        });

    } catch (error: any) {
        console.error('Error in host-applications status-new:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
