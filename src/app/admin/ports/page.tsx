'use client';

import { useState, useEffect } from 'react';
import GoogleMapSelector from '@/components/GoogleMapSelector';
import AdminLayout from '@/components/AdminLayout';

export default function PortsPage() {
    const [showPortForm, setShowPortForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
        city: string;
        country: string;
    } | null>(null);

    const [portForm, setPortForm] = useState({
        country: '',
        city: '',
        port: '',
        status: 'active' as 'active' | 'hidden'
    });

    const [ports, setPorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPorts();
    }, []);

    const fetchPorts = async () => {
        try {
            const response = await fetch('/api/ports');
            const data = await response.json();
            if (data.success) {
                setPorts(data.ports);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePort = async (portId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este puerto?')) {
            return;
        }

        try {
            const response = await fetch(`/api/ports/${portId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                alert('Puerto eliminado exitosamente');
                fetchPorts();
            } else {
                alert('Error al eliminar puerto: ' + data.error);
            }
        } catch (error) {
            alert('Error al eliminar puerto');
        }
    };

    const handleCreatePort = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/admin/ports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portForm),
            });

            const data = await response.json();

            if (data.success) {
                alert('Puerto creado exitosamente');
                setPortForm({ country: '', city: '', port: '', status: 'active' });
                setShowPortForm(false);
                setShowMap(false);
                setSelectedLocation(null);
                fetchPorts();
            } else {
                alert('Error al crear puerto: ' + data.error);
            }
        } catch (error) {
            alert('Error al crear puerto');
        }
    };

    const handleLocationSelect = (location: {
        lat: number;
        lng: number;
        address: string;
        city: string;
        country: string;
    }) => {
        setSelectedLocation(location);

        setPortForm(prev => ({
            ...prev,
            country: location.country,
            city: location.city,
            port: `Puerto ${location.city} ${Math.floor(Math.random() * 100)}`
        }));
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Puertos</h1>
                    <p className="text-gray-600">Administra países, ciudades y puertos con Google Maps</p>
                </div>

                
                <div className="mb-6 flex space-x-4">
                    <button
                        onClick={() => setShowPortForm(!showPortForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showPortForm ? 'Cancelar' : '+ Crear Puerto'}
                    </button>

                    <button
                        onClick={() => setShowMap(!showMap)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showMap ? 'Ocultar Mapa' : '🗺️ Seleccionar en Mapa'}
                    </button>
                </div>

                
                {showMap && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Ubicación en Google Maps</h3>

                        <GoogleMapSelector
                            onLocationSelect={handleLocationSelect}
                            initialCenter={{ lat: 41.3851, lng: 2.1734 }}
                        />

                        <div className="mt-4 flex space-x-3">
                            <button
                                onClick={() => setShowMap(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cerrar Mapa
                            </button>
                            {selectedLocation && (
                                <button
                                    onClick={() => setShowPortForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Usar Ubicación
                                </button>
                            )}
                        </div>
                    </div>
                )}

                
                {showPortForm && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Puerto</h3>

                        {selectedLocation && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>📍 Ubicación seleccionada:</strong> {selectedLocation.address}
                                </p>
                                <p className="text-xs text-green-600">
                                    Coordenadas: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleCreatePort} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        País
                                    </label>
                                    <input
                                        type="text"
                                        value={portForm.country}
                                        onChange={(e) => setPortForm(prev => ({ ...prev, country: e.target.value }))}
                                        placeholder="Ej: España"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        value={portForm.city}
                                        onChange={(e) => setPortForm(prev => ({ ...prev, city: e.target.value }))}
                                        placeholder="Ej: Barcelona"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Puerto
                                    </label>
                                    <input
                                        type="text"
                                        value={portForm.port}
                                        onChange={(e) => setPortForm(prev => ({ ...prev, port: e.target.value }))}
                                        placeholder="Ej: Port Olímpic"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={portForm.status === 'active'}
                                        onChange={(e) => setPortForm(prev => ({ ...prev, status: e.target.value as 'active' | 'hidden' }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Activo</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="hidden"
                                        checked={portForm.status === 'hidden'}
                                        onChange={(e) => setPortForm(prev => ({ ...prev, status: e.target.value as 'active' | 'hidden' }))}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Oculto</span>
                                </label>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Crear Puerto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPortForm(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Puertos Existentes</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Cargando puertos...</span>
                        </div>
                    ) : ports.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No hay puertos registrados</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {ports.map((port) => (
                                <div key={port.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{port.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {port.city.name}, {port.country.name}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${port.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {port.status === 'active' ? 'Activo' : 'Oculto'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePort(port.id)}
                                        className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}