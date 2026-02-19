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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : null;
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minCapacity = searchParams.get('minCapacity');
    const hostId = searchParams.get('hostId');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filter: any = {};

    if (hostId) filter.hostId = hostId;
    if (type) filter.type = type;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = parseFloat(maxPrice);
    }
    if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity) };

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let query = Boat.find(filter).sort(sort);

    if (limit) {
      query = query.limit(limit * 1).skip((page - 1) * limit);
    }

    const boats = await query;

    const total = await Boat.countDocuments(filter);

    return NextResponse.json({
      boats,
      totalPages: limit ? Math.ceil(total / limit) : 1,
      currentPage: page,
      total
    });

  } catch (error: any) {
    console.error('Error fetching boats:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    await connectDB();

    const boatData = await request.json();

    const boatPayload: any = {
      ...boatData,
      rating: boatData.rating || 0,
      reviewCount: boatData.reviewCount || 0,
      isAvailable: boatData.isAvailable !== undefined ? boatData.isAvailable : true,
      availability: boatData.availability || {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        blockedDates: [],
      },
      safety: boatData.safety || {
        lifeJackets: 0,
        firstAidKit: false,
        fireExtinguisher: false,
        radio: false,
        gps: false,
      },
      minimumRentalHours: boatData.minimumRentalHours || 2,
      maximumRentalHours: boatData.maximumRentalHours || 24,
      bookingCount: boatData.bookingCount || 0,
    };

    const newBoat = new Boat(boatPayload);
    await newBoat.save();

    return NextResponse.json(newBoat, { status: 201 });

  } catch (error: any) {
    console.error('Error creating boat:', error);
    return NextResponse.json(
      { message: error.message || 'Error interno del servidor', details: error.errors || error },
      { status: 500 }
    );
  }
}
