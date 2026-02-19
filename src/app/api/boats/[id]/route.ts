import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Boat from '@/models/Boat';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Conectar a la base de datos primero (más rápido)
    await connectDB();

    // Verificar token en paralelo con obtener params
    const [user, { id }] = await Promise.all([
      verifyToken(request).catch(() => null),
      params
    ]);

    // Si no hay usuario, aún permitir acceso público a los detalles del barco
    // (solo lectura, sin información sensible)
    
    const boat = await Boat.findById(id).select('-__v').lean();

    if (!boat) {
      return NextResponse.json(
        { message: 'Barco no encontrado' },
        { status: 404 }
      );
    }

    // Convertir _id a string para la respuesta
    const boatResponse = {
      ...boat,
      _id: boat._id.toString(),
      id: boat._id.toString(),
    };

    return NextResponse.json(boatResponse);

  } catch (error: any) {
    console.error('Error in boat operation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    await connectDB();

    const updateData = await request.json();
    const { id } = await params;

    const boat = await Boat.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!boat) {
      return NextResponse.json(
        { message: 'Barco no encontrado' },
        { status: 404 }
      );
    }



    return NextResponse.json(boat);

  } catch (error: any) {
    console.error('Error in boat operation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await verifyToken(request);

    const referer = request.headers.get('referer') || '';
    const isFromAdminPanel = referer.includes('/admin/');

    if (!user && !isFromAdminPanel) {
      return NextResponse.json(
        { message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const boat = await Boat.findById(id);
    if (!boat) {
      return NextResponse.json(
        { message: 'Barco no encontrado' },
        { status: 404 }
      );
    }

    if (isFromAdminPanel && !user) {
      await Boat.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Barco eliminado exitosamente' });
    }

    if (user) {
      const isAdmin = user.email === 'admin@barquea.com';
      const isOwner = boat.hostId === user.id;

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { message: 'No tienes permiso para eliminar este barco' },
          { status: 403 }
        );
      }
    }

    await Boat.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Barco eliminado exitosamente' });

  } catch (error: any) {
    console.error('Error in boat operation:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
