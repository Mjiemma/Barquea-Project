import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Booking } from '@/models/Booking';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const bookings = await Booking.find({})
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al obtener reservas' },
            { status: 500 }
        );
    }
}
