'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Boat {
    _id: string;
    name: string;
    type: string;
    hostName: string;
    location: string;
    pricePerHour: number;
    pricePerDay: number;
    pricingType?: 'hourly' | 'daily';
    capacity: number;
    rating: number;
    isAvailable: boolean;
    images: string[];
    createdAt: string;
    bookingCount: number;
    description?: string;
    reviews?: Review[];
}

interface Review {
    _id: string;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    createdAt: string;
}

interface Booking {
    _id: string;
    guestName: string;
    guestEmail: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export default function BoatDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [boat, setBoat] = useState<Boat | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNewReviewModal, setShowNewReviewModal] = useState(false);
    const [editBoat, setEditBoat] = useState({
        name: '',
        type: '',
        capacity: '',
        location: '',
        pricePerHour: '',
        description: '',
        isAvailable: true
    });
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        reviewerName: '',
        reviewerEmail: ''
    });

    useEffect(() => {
        const mockBoat: Boat = {
            _id: params.id as string,
            name: 'Catamarán Premium',
            type: 'catamaran',
            hostName: 'Ana Martínez',
            location: 'Ibiza, España',
            pricePerHour: 300,
            capacity: 10,
            rating: 4.9,
            isAvailable: true,
            images: [
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1687182095432-87db07ac1d1a?w=800&h=600&fit=crop&auto=format'
            ],
            createdAt: '2024-01-15',
            bookingCount: 67,
            description: 'Un catamarán de lujo perfecto para grupos grandes. Equipado con todas las comodidades modernas.',
            reviews: [
                {
                    _id: 'r1',
                    rating: 5,
                    comment: 'Experiencia increíble, el barco está en perfecto estado y el capitán muy profesional.',
                    reviewerName: 'María González',
                    reviewerEmail: 'maria@example.com',
                    createdAt: '2024-01-20'
                },
                {
                    _id: 'r2',
                    rating: 4,
                    comment: 'Muy buena experiencia, recomendado para grupos grandes.',
                    reviewerName: 'Carlos Ruiz',
                    reviewerEmail: 'carlos@example.com',
                    createdAt: '2024-01-18'
                }
            ]
        };

        const mockBookings: Booking[] = [
            {
                _id: 'b1',
                guestName: 'Juan Pérez',
                guestEmail: 'juan@example.com',
                startDate: '2024-02-15',
                endDate: '2024-02-17',
                totalPrice: 1800,
                status: 'confirmed'
            },
            {
                _id: 'b2',
                guestName: 'Laura García',
                guestEmail: 'laura@example.com',
                startDate: '2024-02-20',
                endDate: '2024-02-22',
                totalPrice: 1200,
                status: 'pending'
            },
            {
                _id: 'b3',
                guestName: 'Miguel Torres',
                guestEmail: 'miguel@example.com',
                startDate: '2024-02-25',
                endDate: '2024-02-27',
                totalPrice: 1500,
                status: 'confirmed'
            }
        ];

        setTimeout(() => {
            setBoat(mockBoat);
            setBookings(mockBookings);
            setLoading(false);
        }, 1000);
    }, [params.id]);

    const getTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'yacht': 'Yate',
            'sailboat': 'Velero',
            'motorboat': 'Lancha',
            'catamaran': 'Catamarán',
            'fishing_boat': 'Pesca'
        };
        return types[type] || type;
    };

    const handleEditBoat = () => {
        if (!boat) return;
        setEditBoat({
            name: boat.name,
            type: boat.type,
            capacity: boat.capacity.toString(),
            location: boat.location,
            pricePerHour: boat.pricePerHour.toString(),
            description: boat.description || '',
            isAvailable: boat.isAvailable
        });
        setShowEditModal(true);
    };

    const handleUpdateBoat = () => {
        if (!boat) return;

        setBoat(prev => prev ? {
            ...prev,
            name: editBoat.name,
            type: editBoat.type,
            capacity: parseInt(editBoat.capacity),
            location: editBoat.location,
            pricePerHour: parseFloat(editBoat.pricePerHour),
            description: editBoat.description,
            isAvailable: editBoat.isAvailable
        } : null);

        setShowEditModal(false);
    };

    const handleAddReview = () => {
        if (!boat) return;

        const review: Review = {
            _id: Date.now().toString(),
            rating: newReview.rating,
            comment: newReview.comment,
            reviewerName: newReview.reviewerName,
            reviewerEmail: newReview.reviewerEmail,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setBoat(prev => prev ? {
            ...prev,
            reviews: [...(prev.reviews || []), review],
            rating: prev.reviews
                ? (prev.reviews.reduce((acc, r) => acc + r.rating, 0) + review.rating) / (prev.reviews.length + 1)
                : review.rating
        } : null);

        setNewReview({ rating: 5, comment: '', reviewerName: '', reviewerEmail: '' });
        setShowNewReviewModal(false);
    };

    const handleDeleteReview = (reviewId: string) => {
        if (!boat) return;

        setBoat(prev => prev ? {
            ...prev,
            reviews: prev.reviews?.filter(review => review._id !== reviewId) || [],
            rating: prev.reviews && prev.reviews.length > 1
                ? prev.reviews.filter(review => review._id !== reviewId).reduce((acc, review) => acc + review.rating, 0) / (prev.reviews.length - 1)
                : 0
        } : null);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!boat) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Barco no encontrado</h2>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{boat.name}</h1>
                            <p className="text-gray-800">Gestiona la información y reservas del barco</p>
                        </div>
                    </div>
                    <button
                        onClick={handleEditBoat}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Editar Barco
                    </button>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="relative">
                        <img
                            src={boat.images[currentImageIndex]}
                            alt={boat.name}
                            className="w-full h-96 object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMjAwTDMwMCAzMDBINTAwTDQwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMDAgMzAwSDQwMFY0MDBIMzAwVjMwMFoiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iNDAwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OrzwvdGV4dD4KPC9zdmc+';
                            }}
                        />

                        
                        {boat.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : boat.images.length - 1)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex(currentImageIndex < boat.images.length - 1 ? currentImageIndex + 1 : 0)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {boat.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-colors ${currentImageIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
                                                }`}
                                        />
                                    ))}
                                </div>

                                
                                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded">
                                    {currentImageIndex + 1}/{boat.images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Información
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Reviews ({boat.reviews?.length || 0})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Barco</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Nombre:</span>
                                                <span className="font-medium">{boat.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Tipo:</span>
                                                <span className="font-medium">{getTypeLabel(boat.type)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Capacidad:</span>
                                                <span className="font-medium">{boat.capacity} personas</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Precio {boat.pricingType === 'daily' ? 'por día' : 'por hora'}:</span>
                                                <span className="font-medium">
                                                    €{boat.pricingType === 'daily'
                                                        ? Math.round(boat.pricePerDay * 100) / 100
                                                        : Math.round(boat.pricePerHour * 100) / 100}/{boat.pricingType === 'daily' ? 'día' : 'h'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Ubicación:</span>
                                                <span className="font-medium">{boat.location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Estado:</span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${boat.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {boat.isAvailable ? 'Activo' : 'No activo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Host</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Nombre:</span>
                                                <span className="font-medium">{boat.hostName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Rating:</span>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400">⭐</span>
                                                    <span className="ml-1 font-medium">{boat.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-800">Total reservas:</span>
                                                <span className="font-medium">{boat.bookingCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {boat.description && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                                        <p className="text-gray-800">{boat.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        
                        {activeTab === 'calendar' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Reservas del Barco</h3>
                                    <div className="text-sm text-gray-700">
                                        {bookings.length} reservas totales
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                                                    <p className="text-sm text-gray-800">{booking.guestEmail}</p>
                                                    <p className="text-sm text-gray-700">
                                                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {booking.status === 'confirmed' ? 'Confirmada' :
                                                            booking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                                    </span>
                                                    <p className="text-sm font-medium text-gray-900 mt-1">€{booking.totalPrice}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Reviews del Barco</h3>
                                    <button
                                        onClick={() => setShowNewReviewModal(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Agregar Review
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {boat.reviews?.map((review) => (
                                        <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                                                        <div className="flex">
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                    ⭐
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-800 mb-2">{review.comment}</p>
                                                    <p className="text-sm text-gray-700">{review.reviewerEmail}</p>
                                                    <p className="text-sm text-gray-700">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {(!boat.reviews || boat.reviews.length === 0) && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-700">No hay reviews para este barco</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                
                {showEditModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Editar Barco</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del barco
                                    </label>
                                    <input
                                        type="text"
                                        value={editBoat.name}
                                        onChange={(e) => setEditBoat({ ...editBoat, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de barco
                                    </label>
                                    <select
                                        value={editBoat.type}
                                        onChange={(e) => setEditBoat({ ...editBoat, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="yacht">Yate</option>
                                        <option value="sailboat">Velero</option>
                                        <option value="motorboat">Lancha</option>
                                        <option value="catamaran">Catamarán</option>
                                        <option value="fishing_boat">Barco de Pesca</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Capacidad
                                        </label>
                                        <input
                                            type="number"
                                            value={editBoat.capacity}
                                            onChange={(e) => setEditBoat({ ...editBoat, capacity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Precio/hora (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={editBoat.pricePerHour}
                                            onChange={(e) => setEditBoat({ ...editBoat, pricePerHour: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        value={editBoat.location}
                                        onChange={(e) => setEditBoat({ ...editBoat, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={editBoat.description}
                                        onChange={(e) => setEditBoat({ ...editBoat, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        checked={editBoat.isAvailable}
                                        onChange={(e) => setEditBoat({ ...editBoat, isAvailable: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                                        Barco activo
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdateBoat}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Actualizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                
                {showNewReviewModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Agregar Review</h3>
                                <button
                                    onClick={() => setShowNewReviewModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Calificación
                                    </label>
                                    <select
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value={1}>1 estrella</option>
                                        <option value={2}>2 estrellas</option>
                                        <option value={3}>3 estrellas</option>
                                        <option value={4}>4 estrellas</option>
                                        <option value={5}>5 estrellas</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comentario
                                    </label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        rows={3}
                                        placeholder="Escribe tu comentario sobre el barco..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del revisor
                                    </label>
                                    <input
                                        type="text"
                                        value={newReview.reviewerName}
                                        onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Nombre completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email del revisor
                                    </label>
                                    <input
                                        type="email"
                                        value={newReview.reviewerEmail}
                                        onChange={(e) => setNewReview({ ...newReview, reviewerEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowNewReviewModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddReview}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Agregar Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
