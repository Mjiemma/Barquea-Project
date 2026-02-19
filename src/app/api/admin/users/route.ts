import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Boat from '@/models/Boat';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Filtrar usuarios admin y del sistema (no deben aparecer en la lista)
        const users = await User.find({
            $and: [
                { isAdmin: { $ne: true } }, // Excluir admins
                { email: { $nin: ['admin@barquea.com', 'system@barquea.com'] } } // Excluir emails del sistema
            ]
        })
            .sort({ createdAt: -1 });

        // Contar barcos para cada usuario
        const usersWithBoatsCount = await Promise.all(
            users.map(async (user) => {
                const userObj = user.toObject ? user.toObject() : user;
                const userId = user._id.toString();
                
                // Contar barcos del usuario
                const boatsCount = await Boat.countDocuments({ 
                    hostId: userId 
                });

                // Obtener los barcos del usuario
                const boats = await Boat.find({ hostId: userId })
                    .select('_id name type capacity status')
                    .limit(10); // Limitar a 10 barcos para no sobrecargar la respuesta

                return {
                    ...userObj,
                    boatsCount,
                    boats: boats.map(boat => ({
                        _id: boat._id.toString(),
                        name: boat.name,
                        type: boat.type,
                        capacity: boat.capacity,
                        status: boat.status || 'available'
                    }))
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: usersWithBoatsCount
        });
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const user = new User(body);
        await user.save();

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al crear usuario' },
            { status: 500 }
        );
    }
}
