'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Booking {
    _id: string;
    boatName: string;
    hostName: string;
    guestName: string;
    guestEmail: string;
    startDate: string;
    endDate: string;
    duration: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    createdAt: string;
    guests: number;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const [filterPayment, setFilterPayment] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');

    useEffect(() => {
        const mockBookings: Booking[] = [
            {
                _id: '1',
                boatName: 'Catamarán Premium',
                hostName: 'Ana Martínez',
                guestName: 'Carlos Ruiz',
                guestEmail: 'carlos.ruiz@example.com',
                startDate: '2024-01-25',
                endDate: '2024-01-25',
                duration: 6,
                totalPrice: 1800,
                status: 'confirmed',
                paymentStatus: 'paid',
                createdAt: '2024-01-20',
                guests: 8
            },
            {
                _id: '2',
                boatName: 'Yate de Lujo Mediterráneo',
                hostName: 'María García',
                guestName: 'Laura Martín',
                guestEmail: 'laura.martin@example.com',
                startDate: '2024-01-28',
                endDate: '2024-01-28',
                duration: 4,
                totalPrice: 1000,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: '2024-01-22',
                guests: 6
            },
            {
                _id: '3',
                boatName: 'Velero Clásico Beneteau',
                hostName: 'Carlos López',
                guestName: 'Miguel Torres',
                guestEmail: 'miguel.torres@example.com',
                startDate: '2024-01-15',
                endDate: '2024-01-15',
                duration: 8,
                totalPrice: 1440,
                status: 'completed',
                paymentStatus: 'paid',
                createdAt: '2024-01-10',
                guests: 4
            },
            {
                _id: '4',
                boatName: 'Lancha de Pesca Rápida',
                hostName: 'Juan Pérez',
                guestName: 'Roberto Silva',
                guestEmail: 'roberto.silva@example.com',
                startDate: '2024-01-30',
                endDate: '2024-01-30',
                duration: 4,
                totalPrice: 480,
                status: 'cancelled',
                paymentStatus: 'refunded',
                createdAt: '2024-01-25',
                guests: 3
            },
            {
                _id: '5',
                boatName: 'Yate Ejecutivo',
                hostName: 'Roberto Silva',
                guestName: 'Elena Vázquez',
                guestEmail: 'elena.vazquez@example.com',
                startDate: '2024-02-05',
                endDate: '2024-02-05',
                duration: 6,
                totalPrice: 1200,
                status: 'confirmed',
                paymentStatus: 'paid',
                createdAt: '2024-01-28',
                guests: 5
            }
        ];

        setTimeout(() => {
            setBookings(mockBookings);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.boatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.hostName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
        const matchesPayment = filterPayment === 'all' || booking.paymentStatus === filterPayment;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'refunded': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmada',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        };
        return labels[status] || status;
    };

    const getPaymentLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'refunded': 'Reembolsado'
        };
        return labels[status] || status;
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
                        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
                        <p className="text-gray-600">Gestiona todas las reservas de la plataforma</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Exportar
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            Nueva Reserva
                        </button>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Reservas</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completadas</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {bookings.filter(booking => booking.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {bookings.filter(booking => booking.status === 'pending').length}
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
                                <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    €{bookings.reduce((acc, booking) => acc + booking.totalPrice, 0).toLocaleString()}
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
                                placeholder="Buscar por barco, huésped o host..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmada</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                            <select
                                value={filterPayment}
                                onChange={(e) => setFilterPayment(e.target.value as any)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos los pagos</option>
                                <option value="pending">Pendiente</option>
                                <option value="paid">Pagado</option>
                                <option value="refunded">Reembolsado</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reserva
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Barco / Host
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duración
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pago
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                                                <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                                                <div className="text-xs text-gray-400">{booking.guests} personas</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{booking.boatName}</div>
                                                <div className="text-sm text-gray-500">Host: {booking.hostName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(booking.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(booking.startDate).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.duration} horas
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                €{booking.totalPrice.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(booking.paymentStatus)}`}>
                                                {getPaymentLabel(booking.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    Ver
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    Editar
                                                </button>
                                                {booking.status === 'pending' && (
                                                    <button className="text-green-600 hover:text-green-900">
                                                        Confirmar
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Mostrando {filteredBookings.length} de {bookings.length} reservas
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
            </div>
        </AdminLayout>
    );
}
