import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Favorite } from '@/models/Favorite';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectDB();

        if (!user.id) {
            console.error('Error: user.id is missing', { user });
            return NextResponse.json(
                { success: false, error: 'Error de autenticación' },
                { status: 401 }
            );
        }

        // Validar que el ID es válido antes de convertirlo
        if (!mongoose.Types.ObjectId.isValid(user.id)) {
            console.error('Error: user.id is not a valid ObjectId', { userId: user.id });
            return NextResponse.json(
                { success: false, error: 'ID de usuario inválido' },
                { status: 400 }
            );
        }

        const userIdObjectId = new mongoose.Types.ObjectId(user.id);
        const favorites = await Favorite.find({ userId: userIdObjectId })
            .populate('boatId')
            .sort({ createdAt: -1 });

        const boats = favorites
            .map(fav => {
                const boat = fav.boatId;
                if (!boat) return null;
                if (typeof boat === 'object' && boat._id) {
                    return boat;
                }
                return boat;
            })
            .filter(Boolean);

        return NextResponse.json({
            success: true,
            data: boats,
        });
    } catch (error: any) {
        console.error('Error fetching favorites:', error);
        console.error('Error stack:', error?.stack);
        return NextResponse.json(
            { success: false, error: error?.message || 'Error interno' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectDB();

        const { boatId } = await request.json();

        if (!boatId) {
            return NextResponse.json(
                { success: false, error: 'boatId es requerido' },
                { status: 400 }
            );
        }

        const userIdObjectId = new mongoose.Types.ObjectId(user.id);
        const boatIdObjectId = new mongoose.Types.ObjectId(boatId);

        const existing = await Favorite.findOne({
            userId: userIdObjectId,
            boatId: boatIdObjectId,
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                data: { isFavorite: true },
            });
        }

        await Favorite.create({
            userId: userIdObjectId,
            boatId: boatIdObjectId,
        });

        return NextResponse.json({
            success: true,
            data: { isFavorite: true },
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const boatId = searchParams.get('boatId');

        if (!boatId) {
            return NextResponse.json(
                { success: false, error: 'boatId es requerido' },
                { status: 400 }
            );
        }

        const userIdObjectId = new mongoose.Types.ObjectId(user.id);
        const boatIdObjectId = new mongoose.Types.ObjectId(boatId);

        await Favorite.deleteOne({
            userId: userIdObjectId,
            boatId: boatIdObjectId,
        });

        return NextResponse.json({
            success: true,
            data: { isFavorite: false },
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno' },
            { status: 500 }
        );
    }
}
