'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Boat {
    _id: string;
    name: string;
    description: string;
    images: string[];
    location: {
        latitude: number;
        longitude: number;
        address: string;
        city: string;
        state: string;
        country: string;
    };
    pricePerHour: number;
    pricePerDay: number;
    capacity: number;
    type: 'sailboat' | 'motorboat' | 'yacht' | 'catamaran' | 'fishing_boat' | 'speedboat';
    amenities: string[];
    specifications: {
        length: number;
        beam: number;
        draft: number;
        year: number;
        brand: string;
        model: string;
        engineType: string;
        fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    };
    hostId: string;
    host: {
        id: string;
        name: string;
        rating: number;
        responseTime: string;
        isSuperHost: boolean;
    };
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    availability: {
        startDate: string;
        endDate: string;
        blockedDates: string[];
    };
    rules: {
        smoking: boolean;
        pets: boolean;
        children: boolean;
        music: boolean;
        alcohol: boolean;
        fishing: boolean;
        swimming: boolean;
        diving: boolean;
        maxGuests: number;
        minAge: number;
        checkInTime: string;
        checkOutTime: string;
    };
    safety: {
        lifeJackets: number;
        firstAidKit: boolean;
        fireExtinguisher: boolean;
        radio: boolean;
        gps: boolean;
        anchor: boolean;
        rope: boolean;
        emergencyContact: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Host {
    _id: string;
    name: string;
    email: string;
    isHost: boolean;
}

interface Review {
    _id: string;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    createdAt: string;
}

export default function BoatsPage() {
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'yacht' | 'sailboat' | 'motorboat' | 'catamaran' | 'fishing_boat'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('available');
    const [filterCity, setFilterCity] = useState<string>('all');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNewBoatModal, setShowNewBoatModal] = useState(false);
    const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
    const [editBoat, setEditBoat] = useState({
        name: '',
        type: '',
        capacity: '',
        location: '',
        pricePerHour: '',
        description: ''
    });
    const [newBoat, setNewBoat] = useState({
        name: '',
        type: '',
        capacity: '',
        location: '',
        pricePerHour: '',
        description: '',
        hostEmail: '',
        hostName: '',
        hostId: ''
    });
    const [hostSearchResults, setHostSearchResults] = useState<Host[]>([]);
    const [showHostSearch, setShowHostSearch] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedBoatForReviews, setSelectedBoatForReviews] = useState<Boat | null>(null);
    const [showNewReviewModal, setShowNewReviewModal] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        reviewerName: '',
        reviewerEmail: ''
    });
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
    const [currentMonth, setCurrentMonth] = useState<{ [key: string]: Date }>({});

    useEffect(() => {
        const fetchBoats = async () => {
            try {
                const response = await fetch('/api/admin/boats');
                const result = await response.json();

                if (result.success) {
                    setBoats(result.data);
                    const initialMonths: { [key: string]: Date } = {};
                    result.data.forEach((boat: Boat) => {
                        initialMonths[boat._id] = new Date();
                    });
                    setCurrentMonth(initialMonths);
                } else {
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchBoats();
    }, []);

    const filteredBoats = boats.filter(boat => {
        const matchesSearch = boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boat.host?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boat.location.city.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || boat.type === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'available' && boat.isAvailable) ||
            (filterStatus === 'unavailable' && !boat.isAvailable);
        const matchesCity = filterCity === 'all' || boat.location.city.toLowerCase().includes(filterCity.toLowerCase());

        return matchesSearch && matchesType && matchesStatus && matchesCity;
    });

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

    const handleEditBoat = (boat: Boat) => {
        setSelectedBoat(boat);
        setEditBoat({
            name: boat.name,
            type: boat.type,
            capacity: boat.capacity.toString(),
            location: boat.location,
            pricePerHour: boat.pricePerHour.toString(),
            description: boat.description || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateBoat = () => {
        if (!selectedBoat) return;

        setBoats(prev => prev.map(boat =>
            boat._id === selectedBoat._id
                ? {
                    ...boat,
                    name: editBoat.name,
                    type: editBoat.type,
                    capacity: parseInt(editBoat.capacity),
                    location: editBoat.location,
                    pricePerHour: parseFloat(editBoat.pricePerHour),
                    description: editBoat.description
                }
                : boat
        ));

        setShowEditModal(false);
        setSelectedBoat(null);
        setEditBoat({ name: '', type: '', capacity: '', location: '', pricePerHour: '', description: '' });
    };

    const handleDeleteBoat = (boat: Boat) => {
        setSelectedBoat(boat);
        setShowDeleteModal(true);
    };

    const confirmDeleteBoat = async () => {
        if (!selectedBoat) return;

        try {
            const response = await fetch(`/api/boats/${selectedBoat._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setBoats(prev => prev.filter(boat => boat._id !== selectedBoat._id));
                setShowDeleteModal(false);
                setSelectedBoat(null);
            } else {
                const error = await response.json();
                alert(error.message || 'Error al eliminar el barco');
            }
        } catch (error) {
            alert('Error al eliminar el barco');
        }
    };

    const handleSearchHost = async (email: string) => {
        if (!email.trim()) {
            setHostSearchResults([]);
            setShowHostSearch(false);
            return;
        }

        const mockHosts: Host[] = [
            { _id: '1', name: 'Ana Martínez', email: 'ana@example.com', isHost: true },
            { _id: '2', name: 'Carlos López', email: 'carlos@example.com', isHost: true },
            { _id: '3', name: 'Miguel Torres', email: 'miguel@example.com', isHost: true }
        ];

        const results = mockHosts.filter(host =>
            host.email.toLowerCase().includes(email.toLowerCase()) && host.isHost
        );

        setHostSearchResults(results);
        setShowHostSearch(results.length > 0);
    };

    const handleSelectHost = (host: Host) => {
        setNewBoat({
            ...newBoat,
            hostEmail: host.email,
            hostName: host.name,
            hostId: host._id
        });
        setShowHostSearch(false);
        setHostSearchResults([]);
    };

    const handleAddNewBoat = () => {
        const boat: Boat = {
            _id: Date.now().toString(),
            name: newBoat.name,
            type: newBoat.type,
            hostName: newBoat.hostName,
            location: newBoat.location,
            pricePerHour: parseFloat(newBoat.pricePerHour),
            capacity: parseInt(newBoat.capacity),
            rating: 0,
            isAvailable: true,
            images: [],
            createdAt: new Date().toISOString().split('T')[0],
            bookingCount: 0
        };
        setBoats([...boats, boat]);
        setNewBoat({
            name: '',
            type: '',
            capacity: '',
            location: '',
            pricePerHour: '',
            description: '',
            hostEmail: '',
            hostName: '',
            hostId: ''
        });
        setShowNewBoatModal(false);
    };

    const handleViewReviews = (boat: Boat) => {
        setSelectedBoatForReviews(boat);
        setShowReviewsModal(true);
    };

    const handleDeleteReview = (boatId: string, reviewId: string) => {
        setBoats(prev => prev.map(boat =>
            boat._id === boatId
                ? {
                    ...boat,
                    reviews: boat.reviews?.filter(review => review._id !== reviewId) || [],
                    rating: boat.reviews && boat.reviews.length > 1
                        ? boat.reviews.filter(review => review._id !== reviewId).reduce((acc, review) => acc + review.rating, 0) / (boat.reviews.length - 1)
                        : 0
                }
                : boat
        ));
    };

    const handleAddReview = () => {
        if (!selectedBoatForReviews) return;

        const review: Review = {
            _id: Date.now().toString(),
            rating: newReview.rating,
            comment: newReview.comment,
            reviewerName: newReview.reviewerName,
            reviewerEmail: newReview.reviewerEmail,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setBoats(prev => prev.map(boat =>
            boat._id === selectedBoatForReviews._id
                ? {
                    ...boat,
                    reviews: [...(boat.reviews || []), review],
                    rating: boat.reviews
                        ? (boat.reviews.reduce((acc, r) => acc + r.rating, 0) + review.rating) / (boat.reviews.length + 1)
                        : review.rating
                }
                : boat
        ));

        setNewReview({ rating: 5, comment: '', reviewerName: '', reviewerEmail: '' });
        setShowNewReviewModal(false);
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Barcos</h1>
                        <p className="text-gray-800">Gestiona la flota de barcos de la plataforma</p>
                    </div>
                    <button
                        onClick={() => setShowNewBoatModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Nuevo Barco
                    </button>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">⛵</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Total Barcos</p>
                                <p className="text-2xl font-bold text-gray-900">{boats.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Activos</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {boats.filter(boat => boat.isAvailable).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Rating Promedio</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {(boats.reduce((acc, boat) => acc + boat.rating, 0) / boats.length).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-700">Precio Promedio</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    €{Math.round(boats.reduce((acc, boat) => {
                                        const price = boat.pricingType === 'daily' ? boat.pricePerDay : boat.pricePerHour;
                                        return acc + price;
                                    }, 0) / boats.length)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar barcos, hosts o ubicaciones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-600"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            >
                                <option value="all">Todos los tipos</option>
                                <option value="yacht">Yate</option>
                                <option value="sailboat">Velero</option>
                                <option value="motorboat">Lancha</option>
                                <option value="catamaran">Catamarán</option>
                                <option value="fishing_boat">Pesca</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="available">Activos</option>
                                <option value="unavailable">No activos</option>
                            </select>

                            <select
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            >
                                <option value="all">Todas las ciudades</option>
                                <option value="barcelona">Barcelona</option>
                                <option value="ibiza">Ibiza</option>
                                <option value="valencia">Valencia</option>
                                <option value="malaga">Málaga</option>
                                <option value="caracas">Caracas</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBoats.map((boat) => (
                        <div key={boat._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="flex">
                                
                                <div className="w-1/2 relative">
                                    <img
                                        src={boat.images[0]}
                                        alt={boat.name}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMjAwTDMwMCAzMDBINTAwTDQwMCAyMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMDAgMzAwSDQwMFY0MDBIMzAwVjMwMFoiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iNDAwIiB5PSI0MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OrzwvdGV4dD4KPC9zdmc+';
                                        }}
                                    />
                                </div>

                                
                                <div className="w-1/2 p-3">
                                    <div className="text-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-900">Disponibilidad</h4>
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentBoatMonth = currentMonth[boat._id] || new Date();
                                                    const newMonth = new Date(currentBoatMonth);
                                                    newMonth.setMonth(newMonth.getMonth() - 1);
                                                    setCurrentMonth(prev => ({ ...prev, [boat._id]: newMonth }));
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <p className="text-xs text-gray-700">
                                                {(currentMonth[boat._id] || new Date()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const currentBoatMonth = currentMonth[boat._id] || new Date();
                                                    const newMonth = new Date(currentBoatMonth);
                                                    newMonth.setMonth(newMonth.getMonth() + 1);
                                                    setCurrentMonth(prev => ({ ...prev, [boat._id]: newMonth }));
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    
                                    <div className="grid grid-cols-7 gap-1 text-xs">
                                        
                                        <div className="text-center text-gray-700 font-medium">L</div>
                                        <div className="text-center text-gray-700 font-medium">M</div>
                                        <div className="text-center text-gray-700 font-medium">X</div>
                                        <div className="text-center text-gray-700 font-medium">J</div>
                                        <div className="text-center text-gray-700 font-medium">V</div>
                                        <div className="text-center text-gray-700 font-medium">S</div>
                                        <div className="text-center text-gray-700 font-medium">D</div>

                                        
                                        {Array.from({ length: 28 }, (_, i) => {
                                            const day = i + 1;
                                            const isBooked = Math.random() > 0.7;
                                            const isToday = day === 15;

                                            return (
                                                <div
                                                    key={day}
                                                    className={`text-center p-1 rounded text-xs ${isToday
                                                        ? 'bg-blue-100 text-blue-800 font-medium'
                                                        : isBooked
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-green-100 text-green-600'
                                                        }`}
                                                >
                                                    {day}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-xs">
                                            <div className="w-2 h-2 bg-green-100 rounded mr-1"></div>
                                            <span className="text-gray-800">Disponible</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <div className="w-2 h-2 bg-red-100 rounded mr-1"></div>
                                            <span className="text-gray-800">Ocupado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{boat.name}</h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${boat.isAvailable
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {boat.isAvailable ? 'Activo' : 'No activo'}
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-800 mb-2">
                                    <span className="mr-4">👤 {boat.host?.name || 'Host no disponible'}</span>
                                    <span className="mr-4">📍 {boat.location.city}, {boat.location.state}</span>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <span className="text-yellow-400">⭐</span>
                                        <span className="ml-1 text-sm font-medium">{boat.rating}</span>
                                        <button
                                            onClick={() => handleViewReviews(boat)}
                                            className="text-sm text-blue-600 hover:text-blue-800 ml-1 underline"
                                        >
                                            ({boat.reviews?.length || 0} reviews)
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600">
                                            €{boat.pricingType === 'daily'
                                                ? Math.round(boat.pricePerDay * 100) / 100
                                                : Math.round(boat.pricePerHour * 100) / 100}/{boat.pricingType === 'daily' ? 'día' : 'h'}
                                        </div>
                                        <div className="text-sm text-gray-700">{boat.capacity} personas</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                        {getTypeLabel(boat.type)}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => handleEditBoat(boat)}
                                            className="text-green-600 hover:text-green-800 text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBoat(boat)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Mostrando {filteredBoats.length} de {boats.length} barcos
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                            Anterior
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                            Siguiente
                        </button>
                    </div>
                </div>

                
                {showEditModal && selectedBoat && (
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
                                        placeholder="Nombre del barco"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={editBoat.type}
                                        onChange={(e) => setEditBoat({ ...editBoat, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="yacht">Yate</option>
                                        <option value="sailboat">Velero</option>
                                        <option value="motorboat">Lancha</option>
                                        <option value="catamaran">Catamarán</option>
                                        <option value="fishing_boat">Pesca</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacidad
                                    </label>
                                    <input
                                        type="number"
                                        value={editBoat.capacity}
                                        onChange={(e) => setEditBoat({ ...editBoat, capacity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Número de personas"
                                    />
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
                                        placeholder="Puerto o ubicación"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio por hora (€)
                                    </label>
                                    <input
                                        type="number"
                                        value={editBoat.pricePerHour}
                                        onChange={(e) => setEditBoat({ ...editBoat, pricePerHour: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Precio en euros"
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
                                        placeholder="Descripción del barco"
                                    />
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

                
                {showDeleteModal && selectedBoat && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-800 mb-4">
                                    ¿Estás seguro de que quieres eliminar el barco <strong>{selectedBoat.name}</strong>?
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Esta acción no se puede deshacer
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>Se eliminarán todos los datos del barco, incluyendo:</p>
                                                <ul className="list-disc list-inside mt-1">
                                                    <li>Información del barco</li>
                                                    <li>Reservas futuras</li>
                                                    <li>Historial de reservas</li>
                                                    <li>Imágenes y documentos</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteBoat}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar Barco
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                
                {showNewBoatModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Nuevo Barco</h3>
                                <button
                                    onClick={() => setShowNewBoatModal(false)}
                                    className="text-gray-400 hover:text-gray-800"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información del Barco</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del barco *
                                            </label>
                                            <input
                                                type="text"
                                                value={newBoat.name}
                                                onChange={(e) => setNewBoat({ ...newBoat, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                placeholder="Ej: Velero Mediterráneo"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de barco *
                                            </label>
                                            <select
                                                value={newBoat.type}
                                                onChange={(e) => setNewBoat({ ...newBoat, type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            >
                                                <option value="">Seleccionar tipo</option>
                                                <option value="yacht">Yate</option>
                                                <option value="sailboat">Velero</option>
                                                <option value="motorboat">Lancha</option>
                                                <option value="catamaran">Catamarán</option>
                                                <option value="fishing_boat">Barco de Pesca</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Capacidad (personas) *
                                            </label>
                                            <input
                                                type="number"
                                                value={newBoat.capacity}
                                                onChange={(e) => setNewBoat({ ...newBoat, capacity: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                placeholder="Ej: 8"
                                                min="1"
                                                max="50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio por hora (€) *
                                            </label>
                                            <input
                                                type="number"
                                                value={newBoat.pricePerHour}
                                                onChange={(e) => setNewBoat({ ...newBoat, pricePerHour: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                placeholder="Ej: 150"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ubicación *
                                            </label>
                                            <input
                                                type="text"
                                                value={newBoat.location}
                                                onChange={(e) => setNewBoat({ ...newBoat, location: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                placeholder="Ej: Puerto de Barcelona, España"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={newBoat.description}
                                                onChange={(e) => setNewBoat({ ...newBoat, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                rows={3}
                                                placeholder="Describe las características del barco, servicios incluidos, etc."
                                            />
                                        </div>
                                    </div>
                                </div>

                                
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Asignar a Host</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Buscar host por email *
                                            </label>
                                            <input
                                                type="email"
                                                value={newBoat.hostEmail}
                                                onChange={(e) => {
                                                    setNewBoat({ ...newBoat, hostEmail: e.target.value });
                                                    handleSearchHost(e.target.value);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                                placeholder="ejemplo@email.com"
                                            />

                                            
                                            {showHostSearch && hostSearchResults.length > 0 && (
                                                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                                                    {hostSearchResults.map((host) => (
                                                        <button
                                                            key={host._id}
                                                            onClick={() => handleSelectHost(host)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-blue-600 font-medium text-sm">
                                                                        {host.name.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{host.name}</div>
                                                                    <div className="text-sm text-gray-700">{host.email}</div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {showHostSearch && hostSearchResults.length === 0 && newBoat.hostEmail && (
                                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-sm text-yellow-800">No se encontraron hosts con ese email</p>
                                                </div>
                                            )}
                                        </div>

                                        
                                        {newBoat.hostName && (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <span className="text-green-600 font-medium">
                                                            {newBoat.hostName.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-green-900">{newBoat.hostName}</div>
                                                        <div className="text-sm text-green-700">{newBoat.hostEmail}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => setNewBoat({ ...newBoat, hostEmail: '', hostName: '', hostId: '' })}
                                                        className="ml-auto text-green-600 hover:text-green-800"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowNewBoatModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleAddNewBoat}
                                        disabled={!newBoat.name || !newBoat.type || !newBoat.capacity || !newBoat.location || !newBoat.pricePerHour || !newBoat.hostName}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Crear Barco
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
