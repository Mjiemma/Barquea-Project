import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Port from '@/models/Port';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID de puerto requerido' },
                { status: 400 }
            );
        }

        const deletedPort = await Port.findByIdAndDelete(id);

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
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID de puerto requerido' },
                { status: 400 }
            );
        }

        const port = await Port.findById(id)
            .populate('cityId', 'name slug')
            .populate('countryId', 'name slug code');

        if (!port) {
            return NextResponse.json(
                { success: false, error: 'Puerto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            port: {
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
            }
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID de puerto requerido' },
                { status: 400 }
            );
        }

        const updatedPort = await Port.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        ).populate('cityId', 'name slug')
            .populate('countryId', 'name slug code');

        if (!updatedPort) {
            return NextResponse.json(
                { success: false, error: 'Puerto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Puerto actualizado exitosamente',
            port: {
                id: updatedPort._id,
                name: updatedPort.name,
                slug: updatedPort.slug,
                status: updatedPort.status,
                city: {
                    id: updatedPort.cityId._id,
                    name: updatedPort.cityId.name,
                    slug: updatedPort.cityId.slug
                },
                country: {
                    id: updatedPort.countryId._id,
                    name: updatedPort.countryId.name,
                    slug: updatedPort.countryId.slug,
                    code: updatedPort.countryId.code
                }
            }
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
