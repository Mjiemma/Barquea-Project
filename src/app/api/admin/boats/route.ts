import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Boat from '@/models/Boat';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const boats = await Boat.find({})
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: boats
        });
    } catch (error) {
        console.error('Error fetching boats:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener barcos' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const boat = new Boat(body);
        await boat.save();

        return NextResponse.json({
            success: true,
            data: boat
        });
    } catch (error) {
        console.error('Error creating boat:', error);
        return NextResponse.json(
            { success: false, error: 'Error al crear barco' },
            { status: 500 }
        );
    }
}
