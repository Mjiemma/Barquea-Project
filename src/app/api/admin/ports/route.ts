import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Country from '@/models/Country';
import City from '@/models/City';
import Port from '@/models/Port';
import { slugify } from '@/utils/slugify';

interface CreatePortRequest {
    country: string;
    city: string;
    port: string;
    status?: 'active' | 'hidden';
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body: CreatePortRequest = await request.json();
        const { country, city, port, status = 'active' } = body;

        if (!country || !city || !port) {
            return NextResponse.json(
                { error: 'Country, city and port are required' },
                { status: 400 }
            );
        }

        const countrySlug = slugify(country);
        let countryDoc = await Country.findOne({ slug: countrySlug });

        if (!countryDoc) {
            countryDoc = await Country.create({
                name: country,
                slug: countrySlug,
                code: country.toUpperCase().substring(0, 2)
            });
        }

        const citySlug = slugify(city);
        let cityDoc = await City.findOne({
            countryId: countryDoc._id,
            slug: citySlug
        });

        if (!cityDoc) {
            cityDoc = await City.create({
                countryId: countryDoc._id,
                name: city,
                slug: citySlug
            });
        }

        const portSlug = slugify(port);
        let portDoc = await Port.findOne({
            cityId: cityDoc._id,
            slug: portSlug
        });

        if (!portDoc) {
            portDoc = await Port.create({
                countryId: countryDoc._id,
                cityId: cityDoc._id,
                name: port,
                slug: portSlug,
                status
            });
        }

        return NextResponse.json({
            success: true,
            port: {
                id: portDoc._id,
                name: portDoc.name,
                slug: portDoc.slug,
                status: portDoc.status,
                city: {
                    id: cityDoc._id,
                    name: cityDoc.name,
                    slug: cityDoc.slug
                },
                country: {
                    id: countryDoc._id,
                    name: countryDoc.name,
                    slug: countryDoc.slug,
                    code: countryDoc.code
                }
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
                city: {
                    id: port.cityId._id,
                    name: port.cityId.name,
                    slug: port.cityId.slug
                },
                country: {
                    id: port.countryId._id,
                    name: port.countryId.name,
                    slug: port.countryId.slug,
                    code: port.countryId.code
                }
            }))
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
