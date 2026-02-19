import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Buscar el usuario admin
        const adminUser = await User.findOne({ 
            $or: [
                { email: 'admin@barquea.com' },
                { isAdmin: true }
            ]
        }).select('firstName lastName email avatar');

        if (!adminUser) {
            return NextResponse.json(
                { success: false, error: 'Admin no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                _id: adminUser._id.toString(),
                id: adminUser._id.toString(),
                firstName: adminUser.firstName || 'Admin',
                lastName: adminUser.lastName || 'Barquea',
                email: adminUser.email,
                avatar: adminUser.avatar
            }
        });
    } catch (error: any) {
        console.error('Error obteniendo admin:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener admin' },
            { status: 500 }
        );
    }
}
