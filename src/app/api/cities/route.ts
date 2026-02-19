import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import City from '@/models/City';
import Country from '@/models/Country';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const countryId = searchParams.get('countryId');

        let query: any = {};

        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        if (countryId) {
            query.countryId = countryId;
        }

        const cities = await City.find(query)
            .populate('countryId', 'name slug code')
            .sort({ name: 1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            cities: cities.map(city => ({
                id: city._id,
                name: city.name,
                slug: city.slug,
                country: city.countryId ? {
                    id: city.countryId._id,
                    name: city.countryId.name,
                    slug: city.countryId.slug,
                    code: city.countryId.code
                } : null
            }))
        });

    } catch (error) {
        console.error('Error in cities route:', error);
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
        const { name, countryId, countryName } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Nombre de la ciudad es requerido' },
                { status: 400 }
            );
        }

        let finalCountryId = countryId;

        if (!countryId && countryName) {
            let country = await Country.findOne({
                name: { $regex: new RegExp(`^${countryName}$`, 'i') }
            });

            if (!country) {
                country = new Country({
                    name: countryName,
                    slug: countryName.toLowerCase().replace(/\s+/g, '-'),
                    code: countryName.substring(0, 2).toUpperCase()
                });
                await country.save();
            }
            finalCountryId = country._id;
        }

        if (!finalCountryId) {
            return NextResponse.json(
                { success: false, error: 'ID del país o nombre del país es requerido' },
                { status: 400 }
            );
        }

        const existingCity = await City.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            countryId: finalCountryId
        });

        if (existingCity) {
            return NextResponse.json({
                success: true,
                message: 'Ciudad ya existe',
                city: {
                    id: existingCity._id,
                    name: existingCity.name,
                    slug: existingCity.slug,
                    countryId: existingCity.countryId
                }
            });
        }

        const newCity = new City({
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            countryId: finalCountryId
        });

        const savedCity = await newCity.save();

        const country = await Country.findById(finalCountryId);
        if (country) {
            const countryName = country.name;
            const Boat = (await import('@/models/Boat')).default;
            await Boat.updateMany(
                { 'location.city': 'Sin Ciudad', 'location.country': countryName },
                { $set: { 'location.city': savedCity.name } }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Ciudad creada exitosamente',
            city: {
                id: savedCity._id,
                name: savedCity.name,
                slug: savedCity.slug,
                countryId: savedCity.countryId
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
        const cityId = searchParams.get('id');

        if (!cityId) {
            return NextResponse.json(
                { success: false, error: 'ID de ciudad requerido' },
                { status: 400 }
            );
        }

        const city = await City.findById(cityId).populate('countryId');
        if (!city) {
            return NextResponse.json(
                { success: false, error: 'Ciudad no encontrada' },
                { status: 404 }
            );
        }

        const cityName = city.name;
        const countryName = (city.countryId as any)?.name;

        const Boat = (await import('@/models/Boat')).default;
        await Boat.updateMany(
            { 'location.city': cityName },
            { $set: { 'location.city': 'Sin Ciudad' } }
        );

        await City.findByIdAndDelete(cityId);

        return NextResponse.json({
            success: true,
            message: 'Ciudad eliminada exitosamente. Los barcos asociados ahora muestran "Sin Ciudad".'
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}