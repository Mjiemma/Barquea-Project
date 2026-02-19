'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface DashboardStats {
  users: number;
  boats: number;
  bookings: number;
  payments: number;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    boats: 0,
    bookings: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, boatsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/boats'),
          fetch('/api/admin/bookings'),
        ]);

        const [usersData, boatsData, bookingsData] = await Promise.all([
          usersRes.json(),
          boatsRes.json(),
          bookingsRes.json(),
        ]);

        const usersCount = usersData?.success
          ? (Array.isArray(usersData.data) ? usersData.data.length : 0)
          : usersData?.total ?? 0;

        const boatsCount = boatsData?.success
          ? (Array.isArray(boatsData.data) ? boatsData.data.length : 0)
          : boatsData?.total ?? 0;

        const bookingsCount = bookingsData?.success
          ? (Array.isArray(bookingsData.data) ? bookingsData.data.length : 0)
          : bookingsData?.total ?? 0;

        setStats({
          users: usersCount,
          boats: boatsCount,
          bookings: bookingsCount,
          payments: 0,
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de administración de Barquea</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
              <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-blue-900">Usuarios</h3>
              <p className="text-3xl font-bold text-black mt-2">{stats.users}</p>
            </div>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
              <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-blue-900">Barcos</h3>
              <p className="text-3xl font-bold text-black mt-2">{stats.boats}</p>
            </div>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
              <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-blue-900">Reservas</h3>
              <p className="text-3xl font-bold text-black mt-2">{stats.bookings}</p>
            </div>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
              <svg className="w-full h-full text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-blue-900">Cobros</h3>
              <p className="text-3xl font-bold text-black mt-2">€{stats.payments}</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}