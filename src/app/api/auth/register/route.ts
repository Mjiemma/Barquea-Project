import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, firstName, lastName, phone, isHost = false } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      isHost,
      isEmailVerified: true
    });

    await newUser.save();
    const token = newUser.generateAuthToken();

    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      isHost: newUser.isActiveHost,
      isAdmin: newUser.isAdmin,
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      user: userResponse,
      token
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
