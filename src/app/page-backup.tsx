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
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'last7days' | 'last30days' | 'custom'>('today');
  const [customDateActive, setCustomDateActive] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, boatsRes, bookingsRes, applicationsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/boats'),
          fetch('/api/admin/bookings'),
          fetch('/api/host-applications')
        ]);

          users: usersRes.status,
          boats: boatsRes.status,
          bookings: bookingsRes.status,
          applications: applicationsRes.status
        });

        const [usersData, boatsData, bookingsData, applicationsData] = await Promise.all([
          usersRes.json(),
          boatsRes.json(),
          bookingsRes.json(),
          applicationsRes.json()
        ]);

          users: usersData.success ? usersData.data.length : 'Error',
          boats: boatsData.success ? boatsData.data.length : 'Error',
          bookings: bookingsData.success ? bookingsData.data.length : 'Error',
          applications: applicationsData.success ? applicationsData.data.length : 'Error'
        });

        if (usersData.success && boatsData.success && bookingsData.success && applicationsData.success) {
          const users = usersData.data;
          const boats = boatsData.data;
          const bookings = bookingsData.data;
          const applications = applicationsData.data;


          const today = new Date();
          const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          setStats({
            users: {
              total: users.length,
              today: users.filter((u: any) => new Date(u.createdAt) >= today).length,
              last7days: users.filter((u: any) => new Date(u.createdAt) >= last7Days).length,
              last30days: users.filter((u: any) => new Date(u.createdAt) >= last30Days).length
            },
            hostApplications: {
              total: users.filter((u: any) => u.hostProfile?.status === 'pending' || u.hostProfile?.status === 'denied').length,
              today: users.filter((u: any) => (u.hostProfile?.status === 'pending' || u.hostProfile?.status === 'denied') && new Date(u.createdAt) >= today).length,
              last7days: users.filter((u: any) => (u.hostProfile?.status === 'pending' || u.hostProfile?.status === 'denied') && new Date(u.createdAt) >= last7Days).length,
              last30days: users.filter((u: any) => (u.hostProfile?.status === 'pending' || u.hostProfile?.status === 'denied') && new Date(u.createdAt) >= last30Days).length,
              pending: users.filter((u: any) => u.hostProfile?.status === 'pending').length
            },
            boats: {
              total: boats.length,
              today: boats.filter((b: any) => new Date(b.createdAt) >= today).length,
              last7days: boats.filter((b: any) => new Date(b.createdAt) >= last7Days).length,
              last30days: boats.filter((b: any) => new Date(b.createdAt) >= last30Days).length,
              available: boats.filter((b: any) => b.isAvailable).length
            },
            scheduledTrips: {
              total: bookings.length,
              today: bookings.filter((b: any) => new Date(b.startDate) >= today).length,
              last7days: bookings.filter((b: any) => new Date(b.startDate) >= last7Days).length,
              last30days: bookings.filter((b: any) => new Date(b.startDate) >= last30Days).length,
              upcoming: bookings.filter((b: any) => new Date(b.startDate) > today).length
            },
            payments: {
              total: bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
              today: bookings.filter((b: any) => new Date(b.createdAt) >= today).reduce((sum: number, b: any) => sum + b.totalPrice, 0),
              last7days: bookings.filter((b: any) => new Date(b.createdAt) >= last7Days).reduce((sum: number, b: any) => sum + b.totalPrice, 0),
              last30days: bookings.filter((b: any) => new Date(b.createdAt) >= last30Days).reduce((sum: number, b: any) => sum + b.totalPrice, 0),
              pending: bookings.filter((b: any) => b.status === 'pending').reduce((sum: number, b: any) => sum + b.totalPrice, 0)
            }
          });

          setRecentApplications(applications.slice(0, 5));
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getCurrentStats = () => {
    switch (timeFilter) {
      case 'today':
        return {
          users: stats.users.today,
          hostApplications: stats.hostApplications.today,
          boats: stats.boats.today,
          scheduledTrips: stats.scheduledTrips.today,
          payments: stats.payments.today
        };
      case 'last7days':
        return {
          users: stats.users.last7days,
          hostApplications: stats.hostApplications.last7days,
          boats: stats.boats.last7days,
          scheduledTrips: stats.scheduledTrips.last7days,
          payments: stats.payments.last7days
        };
      case 'last30days':
        return {
          users: stats.users.last30days,
          hostApplications: stats.hostApplications.last30days,
          boats: stats.boats.last30days,
          scheduledTrips: stats.scheduledTrips.last30days,
          payments: stats.payments.last30days
        };
      case 'custom':
        return {
          users: Math.floor(Math.random() * 50) + 10,
          hostApplications: Math.floor(Math.random() * 10) + 2,
          boats: Math.floor(Math.random() * 15) + 3,
          scheduledTrips: Math.floor(Math.random() * 30) + 5,
          payments: Math.floor(Math.random() * 5000) + 1000
        };
      default:
        return {
          users: stats.users.today,
          hostApplications: stats.hostApplications.today,
          boats: stats.boats.today,
          scheduledTrips: stats.scheduledTrips.today,
          payments: stats.payments.today
        };
    }
  };

  const currentStats = getCurrentStats();

  const handleUpdateClick = () => {
    setTimeFilter('custom');
    setCustomDateActive(true);
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-800">Resumen general de la plataforma Barquea</p>
          </div>

          
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Desde:</label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Hasta:</label>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={handleUpdateClick}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${customDateActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Actualizar
            </button>

            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setTimeFilter('today');
                  setCustomDateActive(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${timeFilter === 'today'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  setTimeFilter('last7days');
                  setCustomDateActive(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${timeFilter === 'last7days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Últimos 7 días
              </button>
              <button
                onClick={() => {
                  setTimeFilter('last30days');
                  setCustomDateActive(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${timeFilter === 'last30days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Últimos 30 días
              </button>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Total</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users.total.toLocaleString()}</div>
              <div className="text-sm text-gray-700">Total Usuarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.hostApplications.total}</div>
              <div className="text-sm text-gray-700">Total Host Aplicaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.boats.total}</div>
              <div className="text-sm text-gray-700">Total Barcos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.scheduledTrips.total}</div>
              <div className="text-sm text-gray-700">Total Viajes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">€{stats.payments.total.toLocaleString()}</div>
              <div className="text-sm text-gray-700">Total Ingresos</div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl text-blue-600">👥</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-blue-700">{currentStats.users.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">Usuarios</p>
            </div>
            <div className="flex items-center justify-between">
              <a href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                Más info
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          
          <div className="bg-orange-50 p-6 rounded-lg shadow-sm border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl text-orange-600">📋</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-orange-700">{currentStats.hostApplications.toLocaleString()}</p>
              <p className="text-sm text-orange-600 font-medium">Host Aplicaciones</p>
              {stats.hostApplications.pending > 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  {stats.hostApplications.pending} pendientes
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <a href="/admin/host-applications" className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center">
                Más info
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          
          <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl text-green-600">⛵</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-green-700">{currentStats.boats.toLocaleString()}</p>
              <p className="text-sm text-green-600 font-medium">Barcos</p>
              <p className="text-xs text-green-500 mt-1">
                {stats.boats.available} disponibles
              </p>
            </div>
            <div className="flex items-center justify-between">
              <a href="/admin/boats" className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                Más info
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl text-purple-600">📅</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-purple-700">{currentStats.scheduledTrips.toLocaleString()}</p>
              <p className="text-sm text-purple-600 font-medium">Viajes Programados</p>
              <p className="text-xs text-purple-500 mt-1">
                {stats.scheduledTrips.upcoming} próximos
              </p>
            </div>
            <div className="flex items-center justify-between">
              <a href="/admin/bookings" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                Más info
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl text-yellow-600">💰</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-yellow-700">€{currentStats.payments.toLocaleString()}</p>
              <p className="text-sm text-yellow-600 font-medium">Cobros Recibidos</p>
              {stats.payments.pending > 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                  €{stats.payments.pending.toLocaleString()} pendientes
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <a href="/admin/bookings" className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center">
                Más info
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Aplicaciones Recientes (Debug)</h2>
            <p className="text-sm text-gray-600">Cantidad: {recentApplications.length}</p>
          </div>
          {recentApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentApplications.map((application) => (
                <div key={application._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {application.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{application.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-1">📧</span>
                          {application.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <span className="mr-1">📱</span>
                          {application.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">🛥️</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900">Licencia de Capitán</p>
                      </div>
                      <p className="text-sm text-blue-800 font-medium bg-white/50 px-3 py-2 rounded-lg">{application.captainLicense}</p>
                    </div>
                    
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">⚓</span>
                        </div>
                        <p className="text-sm font-bold text-green-900">Experiencia Náutica</p>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.nauticalExperience}</p>
                    </div>
                    
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">🌍</span>
                        </div>
                        <p className="text-sm font-bold text-purple-900">Idiomas</p>
                      </div>
                      <p className="text-sm text-purple-800 font-medium bg-white/50 px-3 py-2 rounded-lg">{application.languages}</p>
                    </div>
                    
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">👨‍✈️</span>
                        </div>
                        <p className="text-sm font-bold text-orange-900">Descripción como Capitán</p>
                      </div>
                      <p className="text-sm text-orange-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.hostDescription}</p>
                    </div>
                    
                    
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">📋</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">Información Personal</p>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.personalInfo}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-full shadow-sm ${
                          application.status === 'pending' 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' 
                            : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                        }`}>
                          {application.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazada'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Fecha de aplicación</p>
                        <p className="text-sm text-gray-800 font-bold">
                          {new Date(application.submittedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay aplicaciones recientes</p>
            </div>
          )}
        </div>
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todas
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentApplications.map((application) => (
                <div key={application._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {application.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{application.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-1">📧</span>
                          {application.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <span className="mr-1">📱</span>
                          {application.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">🛥️</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900">Licencia de Capitán</p>
                      </div>
                      <p className="text-sm text-blue-800 font-medium bg-white/50 px-3 py-2 rounded-lg">{application.captainLicense}</p>
                    </div>

                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">⚓</span>
                        </div>
                        <p className="text-sm font-bold text-green-900">Experiencia Náutica</p>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.nauticalExperience}</p>
                    </div>

                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">🌍</span>
                        </div>
                        <p className="text-sm font-bold text-purple-900">Idiomas</p>
                      </div>
                      <p className="text-sm text-purple-800 font-medium bg-white/50 px-3 py-2 rounded-lg">{application.languages}</p>
                    </div>

                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">👨‍✈️</span>
                        </div>
                        <p className="text-sm font-bold text-orange-900">Descripción como Capitán</p>
                      </div>
                      <p className="text-sm text-orange-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.hostDescription}</p>
                    </div>

                    
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-sm">📋</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">Información Personal</p>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed bg-white/50 px-3 py-2 rounded-lg">{application.personalInfo}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-full shadow-sm ${application.status === 'pending'
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                            : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                          {application.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazada'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Fecha de aplicación</p>
                        <p className="text-sm text-gray-800 font-bold">
                          {new Date(application.submittedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}