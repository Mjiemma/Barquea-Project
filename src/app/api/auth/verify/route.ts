import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'barquea-secret-key') as any;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    const userDoc = user.toObject ? user.toObject() : user;
    const isAdminValue = userDoc.isAdmin !== undefined ? userDoc.isAdmin : (user as any).isAdmin || false;

    // Asegurar que _id se convierta a string
    const userId = user._id ? (typeof user._id === 'string' ? user._id : user._id.toString()) : null;

    if (!userId) {
      console.error('Error: user._id is null or undefined', { user: user.toObject ? user.toObject() : user });
      return NextResponse.json(
        { message: 'User ID not found' },
        { status: 500 }
      );
    }

    const userResponse = {
      _id: userId,
      id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isHost: user.isHost || user.isActiveHost || false,
      isAdmin: isAdminValue,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt) : undefined,
      updatedAt: user.updatedAt ? (user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt) : undefined
    };


    return NextResponse.json({
      user: userResponse
    });

  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'barquea-secret-key') as any;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      );
    }

    const userDoc = user.toObject ? user.toObject() : user;
    const isAdminValue = userDoc.isAdmin !== undefined ? userDoc.isAdmin : (user as any).isAdmin || false;

    // Asegurar que _id se convierta a string
    const userId = user._id ? (typeof user._id === 'string' ? user._id : user._id.toString()) : null;

    if (!userId) {
      console.error('Error: user._id is null or undefined', { user: user.toObject ? user.toObject() : user });
      return NextResponse.json(
        { message: 'User ID not found' },
        { status: 500 }
      );
    }

    const userResponse = {
      _id: userId,
      id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isHost: user.isHost || user.isActiveHost || false,
      isAdmin: isAdminValue,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt) : undefined,
      updatedAt: user.updatedAt ? (user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt) : undefined
    };


    return NextResponse.json({
      user: userResponse
    });

  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}
