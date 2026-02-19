import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Country from '@/models/Country';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');

        let query: any = {};

        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        const countries = await Country.find(query)
            .sort({ name: 1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            countries: countries.map(country => ({
                id: country._id,
                name: country.name,
                slug: country.slug,
                code: country.code
            }))
        });

    } catch (error) {
        console.error('Error in countries route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, code } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Nombre del país es requerido' },
                { status: 400 }
            );
        }

        const existingCountry = await Country.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                { code: code?.toUpperCase() }
            ]
        });

        if (existingCountry) {
            return NextResponse.json({
                success: true,
                message: 'País ya existe',
                country: {
                    id: existingCountry._id,
                    name: existingCountry.name,
                    slug: existingCountry.slug,
                    code: existingCountry.code
                }
            });
        }

        const newCountry = new Country({
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            code: code || name.substring(0, 2).toUpperCase()
        });

        const savedCountry = await newCountry.save();

        const Boat = (await import('@/models/Boat')).default;
        await Boat.updateMany(
            { 'location.country': 'Sin País' },
            { $set: { 'location.country': savedCountry.name } }
        );

        return NextResponse.json({
            success: true,
            message: 'País creado exitosamente',
            country: {
                id: savedCountry._id,
                name: savedCountry.name,
                slug: savedCountry.slug,
                code: savedCountry.code
            }
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const countryId = searchParams.get('id');

        if (!countryId) {
            return NextResponse.json(
                { success: false, error: 'ID de país requerido' },
                { status: 400 }
            );
        }

        const country = await Country.findById(countryId);
        if (!country) {
            return NextResponse.json(
                { success: false, error: 'País no encontrado' },
                { status: 404 }
            );
        }

        const Boat = (await import('@/models/Boat')).default;
        await Boat.updateMany(
            { 'location.country': country.name },
            { $set: { 'location.country': 'Sin País' } }
        );

        await Country.findByIdAndDelete(countryId);

        return NextResponse.json({
            success: true,
            message: 'País eliminado exitosamente. Los barcos asociados ahora muestran "Sin País".'
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}