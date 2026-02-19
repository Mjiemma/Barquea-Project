import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = user.generateAuthToken();

    const userDoc = user.toObject ? user.toObject() : user;
    
    // Helper para convertir fechas a string de forma segura
    const formatDate = (date: any): string => {
      if (!date) return new Date().toISOString();
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') return date;
      return new Date().toISOString();
    };
    
    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isHost: user.isActiveHost || user.isHost || false,
      isAdmin: userDoc.isAdmin !== undefined ? userDoc.isAdmin : (user as any).isAdmin || false,
      isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : true,
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt)
    };

    return NextResponse.json({
      user: userResponse,
      token
    });

  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
