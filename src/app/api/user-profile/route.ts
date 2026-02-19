import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const fullUser = await User.findById(user.id);
        if (!fullUser) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const profileData = {
            id: fullUser._id,
            firstName: fullUser.firstName,
            lastName: fullUser.lastName,
            email: fullUser.email,
            phone: fullUser.phone,
            isHost: fullUser.isHost,
            isEmailVerified: fullUser.isEmailVerified,
            lastLogin: fullUser.lastLogin,
            createdAt: fullUser.createdAt,
            hostProfile: fullUser.hostProfile && fullUser.hostProfile.firstName ? {
                firstName: fullUser.hostProfile.firstName,
                lastName: fullUser.hostProfile.lastName,
                email: fullUser.hostProfile.email,
                phone: fullUser.hostProfile.phone,
                status: fullUser.hostProfile.status,
                responseTime: fullUser.hostProfile.responseTime,
                isSuperHost: fullUser.hostProfile.isSuperHost,
                rating: fullUser.hostProfile.rating,
                reviewCount: fullUser.hostProfile.reviewCount
            } : null
        };

        return NextResponse.json(profileData);

    } catch (error: any) {
        console.error('Error in user-profile:', error);
        return NextResponse.json(
            { message: error?.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { message: 'Token de autenticación requerido' },
                { status: 401 }
            );
        }

        await connectDB();

        const fullUser = await User.findById(user.id);
        if (!fullUser) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { message: 'Error al procesar los datos enviados' },
                { status: 400 }
            );
        }

        const { firstName, lastName, phone } = body;

        if (firstName !== undefined) fullUser.firstName = firstName?.trim() || '';
        if (lastName !== undefined) fullUser.lastName = lastName?.trim() || '';
        if (phone !== undefined) fullUser.phone = phone?.trim() || '';

        await fullUser.save();

        const profileData = {
            id: fullUser._id,
            firstName: fullUser.firstName,
            lastName: fullUser.lastName,
            email: fullUser.email,
            phone: fullUser.phone,
            isHost: fullUser.isHost,
            isEmailVerified: fullUser.isEmailVerified,
            lastLogin: fullUser.lastLogin,
            createdAt: fullUser.createdAt,
        };

        return NextResponse.json(profileData);

    } catch (error: any) {
        console.error('Error in user-profile:', error);
        return NextResponse.json(
            { message: error?.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
