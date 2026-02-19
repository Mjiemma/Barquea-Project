import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Boat from '@/models/Boat';
import { verifyToken } from '@/lib/auth';

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

        const {
            query,
            filters = {},
            sort = { field: 'rating', order: 'desc' },
            page = 1,
            limit = 20
        } = await request.json();


        const searchFilter: any = {};

        if (query) {
            searchFilter.$or = [
                { name: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') },
                { 'specifications.brand': new RegExp(query, 'i') },
                { 'specifications.model': new RegExp(query, 'i') },
                { 'location.city': new RegExp(query, 'i') },
                { 'location.country': new RegExp(query, 'i') }
            ];
        }

        if (filters.type) searchFilter.type = filters.type;
        if (filters.city) searchFilter['location.city'] = new RegExp(filters.city, 'i');
        if (filters.country) searchFilter['location.country'] = new RegExp(filters.country, 'i');
        if (filters.minPrice || filters.maxPrice) {
            searchFilter.pricePerHour = {};
            if (filters.minPrice) searchFilter.pricePerHour.$gte = filters.minPrice;
            if (filters.maxPrice) searchFilter.pricePerHour.$lte = filters.maxPrice;
        }
        if (filters.minCapacity) searchFilter.capacity = { $gte: filters.minCapacity };
        if (filters.amenities && filters.amenities.length > 0) {
            searchFilter.amenities = { $in: filters.amenities };
        }
        if (filters.rating) searchFilter.rating = { $gte: filters.rating };
        if (filters.isAvailable !== undefined) searchFilter.isAvailable = filters.isAvailable;

        const sortObj: any = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;

        const boats = await Boat.find(searchFilter)
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Boat.countDocuments(searchFilter);

        

        return NextResponse.json({
            boats,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
