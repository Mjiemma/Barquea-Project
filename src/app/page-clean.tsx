'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface DashboardStats {
    users: {
        total: number;
        today: number;
        last7days: number;
        last30days: number;
    };
    hostApplications: {
        total: number;
        today: number;
        last7days: number;
        last30days: number;
        pending: number;
    };
    boats: {
        total: number;
        today: number;
        last7days: number;
        last30days: number;
        available: number;
    };
    scheduledTrips: {
        total: number;
        today: number;
        last7days: number;
        last30days: number;
        upcoming: number;
    };
    payments: {
        total: number;
        today: number;
        last7days: number;
        last30days: number;
        pending: number;
    };
}

export default function Home() {
    const [stats, setStats] = useState<DashboardStats>({
        users: { total: 0, today: 0, last7days: 0, last30days: 0 },
        hostApplications: { total: 0, today: 0, last7days: 0, last30days: 0, pending: 0 },
        boats: { total: 0, today: 0, last7days: 0, last30days: 0, available: 0 },
        scheduledTrips: { total: 0, today: 0, last7days: 0, last30days: 0, upcoming: 0 },
        payments: { total: 0, today: 0, last7days: 0, last30days: 0, pending: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();
            setStats(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    const StatCard = ({
        title,
        total,
        today,
        last7days,
        last30days,
        icon,
        color
    }: {
        title: string;
        total: number;
        today: number;
        last7days: number;
        last30days: number;
        icon: React.ReactNode;
        color: string;
    }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                    {icon}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{today}</p>
                        <p className="text-xs text-gray-500">Hoy</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{last7days}</p>
                        <p className="text-xs text-gray-500">7 días</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{last30days}</p>
                        <p className="text-xs text-gray-500">30 días</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Resumen general de la plataforma Barquea</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <StatCard
                        title="Usuarios"
                        total={stats.users.total}
                        today={stats.users.today}
                        last7days={stats.users.last7days}
                        last30days={stats.users.last30days}
                        color="#3B82F6"
                        icon={
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Solicitudes Host"
                        total={stats.hostApplications.total}
                        today={stats.hostApplications.today}
                        last7days={stats.hostApplications.last7days}
                        last30days={stats.hostApplications.last30days}
                        color="#10B981"
                        icon={
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Barcos"
                        total={stats.boats.total}
                        today={stats.boats.today}
                        last7days={stats.boats.last7days}
                        last30days={stats.boats.last30days}
                        color="#8B5CF6"
                        icon={
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Viajes Programados"
                        total={stats.scheduledTrips.total}
                        today={stats.scheduledTrips.today}
                        last7days={stats.scheduledTrips.last7days}
                        last30days={stats.scheduledTrips.last30days}
                        color="#F59E0B"
                        icon={
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Pagos"
                        total={stats.payments.total}
                        today={stats.payments.today}
                        last7days={stats.payments.last7days}
                        last30days={stats.payments.last30days}
                        color="#EF4444"
                        icon={
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </AdminLayout>
    );
}