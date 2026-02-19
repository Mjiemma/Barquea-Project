import { Boat, IBoat } from '../../models/Boat';
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

// Interfaz para respuesta paginada
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Clase para manejar operaciones de barcos
export class BoatsService {

    // Obtener todos los barcos disponibles
    static async getAllBoats(page: number = 1, limit: number = 20): Promise<PaginatedResponse<IBoat>> {
        try {
            await mongoDBService.connect();

            const skip = (page - 1) * limit;

            const [boats, total] = await Promise.all([
                Boat.find({ isAvailable: true })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Boat.countDocuments({ isAvailable: true })
            ]);

            return {
                data: boats,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };

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

    // Buscar barcos con filtros
    static async searchBoats(
        filters: BoatSearchFilters = {},
        sort: SortOptions = { field: 'rating', order: 'desc' },
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<IBoat>> {
        try {
            await mongoDBService.connect();

            const skip = (page - 1) * limit;
            const query: any = { isAvailable: true };

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

            return {
                data: boats,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };

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

    // Obtener barcos por ciudad
    static async getBoatsByCity(city: string, limit: number = 20): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({
                isAvailable: true,
                'location.city': new RegExp(city, 'i')
            })
                .sort({ rating: -1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos por tipo
    static async getBoatsByType(type: string, limit: number = 20): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({
                isAvailable: true,
                type: type
            })
                .sort({ rating: -1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Obtener barcos por rango de precio
    static async getBoatsByPriceRange(minPrice: number, maxPrice: number, limit: number = 20): Promise<IBoat[]> {
        try {
            await mongoDBService.connect();

            const boats = await Boat.find({
                isAvailable: true,
                pricePerHour: { $gte: minPrice, $lte: maxPrice }
            })
                .sort({ pricePerHour: 1 })
                .limit(limit);

            return boats;

        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de barcos
    static async getBoatStats(): Promise<{
        totalBoats: number;
        availableBoats: number;
        averageRating: number;
        totalBookings: number;
        boatsByType: { [key: string]: number };
        boatsByCity: { [key: string]: number };
    }> {
        try {
            await mongoDBService.connect();

            const [
                totalBoats,
                availableBoats,
                avgRatingResult,
                totalBookingsResult,
                boatsByTypeResult,
                boatsByCityResult
            ] = await Promise.all([
                Boat.countDocuments(),
                Boat.countDocuments({ isAvailable: true }),
                Boat.aggregate([
                    { $match: { isAvailable: true } },
                    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
                ]),
                Boat.aggregate([
                    { $match: { isAvailable: true } },
                    { $group: { _id: null, totalBookings: { $sum: '$bookingCount' } } }
                ]),
                Boat.aggregate([
                    { $match: { isAvailable: true } },
                    { $group: { _id: '$type', count: { $sum: 1 } } }
                ]),
                Boat.aggregate([
                    { $match: { isAvailable: true } },
                    { $group: { _id: '$location.city', count: { $sum: 1 } } }
                ])
            ]);

            const boatsByType: { [key: string]: number } = {};
            boatsByTypeResult.forEach(item => {
                boatsByType[item._id] = item.count;
            });

            const boatsByCity: { [key: string]: number } = {};
            boatsByCityResult.forEach(item => {
                boatsByCity[item._id] = item.count;
            });

            return {
                totalBoats,
                availableBoats,
                averageRating: avgRatingResult[0]?.avgRating || 0,
                totalBookings: totalBookingsResult[0]?.totalBookings || 0,
                boatsByType,
                boatsByCity
            };

        } catch (error) {
            throw error;
        }
    }
}

export default BoatsService;
