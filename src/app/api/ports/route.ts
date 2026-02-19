import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Port from '@/models/Port';
import Country from '@/models/Country';
import City from '@/models/City';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const cityId = searchParams.get('cityId');
        const status = searchParams.get('status') || 'active';

        let query: any = { status };

        if (cityId) {
            query.cityId = cityId;
        }

        const ports = await Port.find(query)
            .populate('cityId', 'name slug')
            .populate('countryId', 'name slug code')
            .sort({ name: 1 });

        return NextResponse.json({
            success: true,
            ports: ports.map(port => ({
                id: port._id,
                name: port.name,
                slug: port.slug,
                status: port.status,
                city: port.cityId ? {
                    id: port.cityId._id,
                    name: port.cityId.name,
                    slug: port.cityId.slug
                } : null,
                country: port.countryId ? {
                    id: port.countryId._id,
                    name: port.countryId.name,
                    slug: port.countryId.slug,
                    code: port.countryId.code
                } : null
            }))
        });

    } catch (error) {
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
        const { name, cityId, cityName, countryId, countryName, status } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Nombre del puerto es requerido' },
                { status: 400 }
            );
        }

        let finalCityId = cityId;
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

        if (!cityId && cityName && finalCountryId) {
            let city = await City.findOne({
                name: { $regex: new RegExp(`^${cityName}$`, 'i') },
                countryId: finalCountryId
            });

            if (!city) {
                city = new City({
                    name: cityName,
                    slug: cityName.toLowerCase().replace(/\s+/g, '-'),
                    countryId: finalCountryId
                });
                await city.save();
            }
            finalCityId = city._id;
        }

        if (!finalCityId) {
            return NextResponse.json(
                { success: false, error: 'ID de la ciudad o nombre de la ciudad es requerido' },
                { status: 400 }
            );
        }

        const existingPort = await Port.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            cityId: finalCityId
        });

        if (existingPort) {
            return NextResponse.json({
                success: true,
                message: 'Puerto ya existe',
                port: {
                    id: existingPort._id,
                    name: existingPort.name,
                    slug: existingPort.slug,
                    status: existingPort.status,
                    cityId: existingPort.cityId,
                    countryId: existingPort.countryId
                }
            });
        }

        const newPort = new Port({
            name: name,
            slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim(),
            status: status || 'active',
            countryId: finalCountryId,
            cityId: finalCityId
        });

        const savedPort = await newPort.save();

        return NextResponse.json({
            success: true,
            message: 'Puerto creado exitosamente',
            port: {
                id: savedPort._id,
                name: savedPort.name,
                slug: savedPort.slug,
                status: savedPort.status,
                cityId: savedPort.cityId,
                countryId: savedPort.countryId
            }
        });

    } catch (error) {
        console.error('Error in ports route:', error);
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
        const portId = searchParams.get('id');

        if (!portId) {
            return NextResponse.json(
                { success: false, error: 'ID de puerto requerido' },
                { status: 400 }
            );
        }

        const deletedPort = await Port.findByIdAndDelete(portId);

        if (!deletedPort) {
            return NextResponse.json(
                { success: false, error: 'Puerto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Puerto eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error in ports route:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
