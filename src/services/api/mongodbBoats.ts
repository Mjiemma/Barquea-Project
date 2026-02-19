import { Boat, IBoat } from '../../models/Boat';
import { User, IUser } from '../../models/User';
import { mongoDBService } from '../database/mongodb';

// Interfaz para filtros de búsqueda
export interface BoatSearchFilters {
    city?: string;
    country?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    maxCapacity?: number;
    amenities?: string[];
    rating?: number;
    isAvailable?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number; // en kilómetros
}

// Interfaz para opciones de ordenamiento
export interface SortOptions {
    field: 'pricePerHour' | 'rating' | 'createdAt' | 'bookingCount';
    order: 'asc' | 'desc';
}

// Clase para manejar operaciones de barcos con MongoDB
export class MongoDBBoatService {

    // Crear nuevo barco
    static async createBoat(boatData: Partial<IBoat>, hostId: string): Promise<IBoat> {
        try {
            await mongoDBService.connect();

            // Verificar que el host existe
            const host = await User.findById(hostId);
            if (!host) {
                throw new Error('Host no encontrado');
            }

            // Crear nuevo barco
            const newBoat = new Boat({
                ...boatData,
                hostId,
                host: {
                    id: host._id,
                    name: `${host.firstName} ${host.lastName}`,
                    avatar: host.avatar,
                    rating: host.hostProfile?.rating || 0,
                    responseTime: host.hostProfile?.responseTime || '1 hora',
                    isSuperHost: host.hostProfile?.isSuperHost || false,
                },
                isAvailable: true,
                rating: 0,
                reviewCount: 0,
                bookingCount: 0,
            });

            const savedBoat = await newBoat.save();

            // Actualizar el usuario para marcarlo como host si no lo era
            if (!host.isHost) {
                await User.findByIdAndUpdate(hostId, { isHost: true });
            }

            return savedBoat;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barco por ID
    static async getBoatById(boatId: string): Promise<IBoat | null> {
        try {
            await mongoDBService.connect();

            const boat = await Boat.findById(boatId);
            return boat;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos por host
    static async getBoatsByHost(hostId: string, page: number = 1, limit: number = 10): Promise<{ boats: IBoat[]; total: number }> {
        try {
            await mongoDBService.connect();

            const skip = (page - 1) * limit;

            const [boats, total] = await Promise.all([
                Boat.find({ hostId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Boat.countDocuments({ hostId })
            ]);

            return { boats, total };

        } catch (error) {
            throw error;
        }
    }

    // Buscar barcos con filtros
    static async searchBoats(
        filters: BoatSearchFilters = {},
        sort: SortOptions = { field: 'rating', order: 'desc' },
        page: number = 1,
        limit: number = 20
    ): Promise<{ boats: IBoat[]; total: number }> {
        try {
            await mongoDBService.connect();

            const skip = (page - 1) * limit;
            const query: any = {};

            // Aplicar filtros
            if (filters.city) {
                query['location.city'] = new RegExp(filters.city, 'i');
            }

            if (filters.country) {
                query['location.country'] = new RegExp(filters.country, 'i');
            }

            if (filters.type) {
                query.type = filters.type;
            }

            if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
                query.pricePerHour = {};
                if (filters.minPrice !== undefined) {
                    query.pricePerHour.$gte = filters.minPrice;
                }
                if (filters.maxPrice !== undefined) {
                    query.pricePerHour.$lte = filters.maxPrice;
                }
            }

            if (filters.minCapacity !== undefined || filters.maxCapacity !== undefined) {
                query.capacity = {};
                if (filters.minCapacity !== undefined) {
                    query.capacity.$gte = filters.minCapacity;
                }
                if (filters.maxCapacity !== undefined) {
                    query.capacity.$lte = filters.maxCapacity;
                }
            }

            if (filters.amenities && filters.amenities.length > 0) {
                query.amenities = { $all: filters.amenities };
            }

            if (filters.rating !== undefined) {
                query.rating = { $gte: filters.rating };
            }

            if (filters.isAvailable !== undefined) {
                query.isAvailable = filters.isAvailable;
            }

            // Filtro geoespacial si se proporcionan coordenadas
            if (filters.latitude && filters.longitude && filters.radius) {
                const radiusInMeters = filters.radius * 1000; // Convertir km a metros
                query['location.latitude'] = {
                    $gte: filters.latitude - (filters.radius / 111), // Aproximación simple
                    $lte: filters.latitude + (filters.radius / 111)
                };
                query['location.longitude'] = {
                    $gte: filters.longitude - (filters.radius / (111 * Math.cos(filters.latitude * Math.PI / 180))),
                    $lte: filters.longitude + (filters.radius / (111 * Math.cos(filters.latitude * Math.PI / 180)))
                };
            }

            // Configurar ordenamiento
            const sortObj: any = {};
            sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;

            const [boats, total] = await Promise.all([
                Boat.find(query)
                    .sort(sortObj)
                    .skip(skip)
                    .limit(limit),
                Boat.countDocuments(query)
            ]);

            return { boats, total };

        } catch (error) {
            throw error;
        }
    }

    // Actualizar barco
    static async updateBoat(boatId: string, hostId: string, updateData: Partial<IBoat>): Promise<IBoat | null> {
        try {
            await mongoDBService.connect();

            // Verificar que el barco pertenece al host
            const boat = await Boat.findOne({ _id: boatId, hostId });
            if (!boat) {
                throw new Error('Barco no encontrado o no tienes permisos para editarlo');
            }

            // Remover campos que no se pueden actualizar directamente
            const { _id, hostId: _, host, createdAt, updatedAt, ...allowedUpdates } = updateData;

            const updatedBoat = await Boat.findByIdAndUpdate(
                boatId,
                allowedUpdates,
                { new: true, runValidators: true }
            );

            return updatedBoat;

        } catch (error) {
            throw error;
        }
    }

    // Eliminar barco
    static async deleteBoat(boatId: string, hostId: string): Promise<void> {
        try {
            await mongoDBService.connect();

            // Verificar que el barco pertenece al host
            const boat = await Boat.findOne({ _id: boatId, hostId });
            if (!boat) {
                throw new Error('Barco no encontrado o no tienes permisos para eliminarlo');
            }

            await Boat.findByIdAndDelete(boatId);

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos populares
    static async getPopularBoats(limit: number = 10): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({ isAvailable: true })
                .sort({ bookingCount: -1, rating: -1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos recientes
    static async getRecentBoats(limit: number = 10): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({ isAvailable: true })
                .sort({ createdAt: -1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos mejor valorados
    static async getTopRatedBoats(limit: number = 10): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({
                isAvailable: true,
                reviewCount: { $gte: 5 } // Al menos 5 reseñas
            })
                .sort({ rating: -1, reviewCount: -1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Actualizar disponibilidad del barco
    static async updateAvailability(boatId: string, hostId: string, availability: Partial<IBoat['availability']>): Promise<IBoat | null> {
        try {
            await mongoDBService.connect();

            // Verificar que el barco pertenece al host
            const boat = await Boat.findOne({ _id: boatId, hostId });
            if (!boat) {
                throw new Error('Barco no encontrado o no tienes permisos para editarlo');
            }

            const updatedBoat = await Boat.findByIdAndUpdate(
                boatId,
                {
                    $set: {
                        'availability.startDate': availability.startDate,
                        'availability.endDate': availability.endDate,
                        'availability.blockedDates': availability.blockedDates || []
                    }
                },
                { new: true }
            );

            return updatedBoat;

        } catch (error) {
            throw error;
        }
    }

    // Bloquear fechas del barco
    static async blockDates(boatId: string, hostId: string, dates: Date[]): Promise<IBoat | null> {
        try {
            await mongoDBService.connect();

            // Verificar que el barco pertenece al host
            const boat = await Boat.findOne({ _id: boatId, hostId });
            if (!boat) {
                throw new Error('Barco no encontrado o no tienes permisos para editarlo');
            }

            const updatedBoat = await Boat.findByIdAndUpdate(
                boatId,
                {
                    $addToSet: {
                        'availability.blockedDates': { $each: dates }
                    }
                },
                { new: true }
            );

            return updatedBoat;

        } catch (error) {
            throw error;
        }
    }
}

export default MongoDBBoatService;
