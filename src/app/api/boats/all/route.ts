import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Boat from '@/models/Boat';
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


    const boats = await Boat.find({})
      .sort({ rating: -1, createdAt: -1 });

    const total = boats.length;

    

    return NextResponse.json({
      boats,
      total,
      message: `${total} barcos encontrados`
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    );
  }
}
