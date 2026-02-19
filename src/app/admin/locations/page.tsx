'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Country {
    id: string;
    name: string;
    code: string;
}

interface City {
    id: string;
    name: string;
    country: {
        id: string;
        name: string;
        code: string;
    };
}

interface Port {
    id: string;
    name: string;
    city: {
        id: string;
        name: string;
    };
    country: {
        id: string;
        name: string;
    };
}

export default function LocationsPage() {
    const [activeTab, setActiveTab] = useState<'countries' | 'cities' | 'ports'>('countries');

    const [countries, setCountries] = useState<Country[]>([]);
    const [newCountry, setNewCountry] = useState({ name: '', code: '' });
    const [loadingCountries, setLoadingCountries] = useState(false);

    const [cities, setCities] = useState<City[]>([]);
    const [newCity, setNewCity] = useState({ name: '', countryId: '', countryName: '' });
    const [loadingCities, setLoadingCities] = useState(false);

    const [ports, setPorts] = useState<Port[]>([]);
    const [newPort, setNewPort] = useState({ name: '', cityId: '', cityName: '', countryId: '', countryName: '' });
    const [loadingPorts, setLoadingPorts] = useState(false);

    const loadCountries = async () => {
        try {
            setLoadingCountries(true);
            const response = await fetch('/api/countries');
            const data = await response.json();
            if (data.success) {
                setCountries(data.countries);
            }
        } catch (error) {
        } finally {
            setLoadingCountries(false);
        }
    };

    const loadCities = async () => {
        try {
            setLoadingCities(true);
            const response = await fetch('/api/cities');
            const data = await response.json();
            if (data.success) {
                setCities(data.cities);
            }
        } catch (error) {
        } finally {
            setLoadingCities(false);
        }
    };

    const loadPorts = async () => {
        try {
            setLoadingPorts(true);
            const response = await fetch('/api/ports');
            const data = await response.json();
            if (data.success) {
                setPorts(data.ports);
            }
        } catch (error) {
        } finally {
            setLoadingPorts(false);
        }
    };

    const createCountry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/countries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCountry),
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setNewCountry({ name: '', code: '' });
                loadCountries();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error al crear país');
        }
    };

    const createCity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCity),
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setNewCity({ name: '', countryId: '', countryName: '' });
                loadCities();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error al crear ciudad');
        }
    };

    const createPort = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/ports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPort),
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setNewPort({ name: '', cityId: '', cityName: '', countryId: '', countryName: '' });
                loadPorts();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error al crear puerto');
        }
    };

    useEffect(() => {
        loadCountries();
        loadCities();
        loadPorts();
    }, []);

    useEffect(() => {
        if (newPort.countryId) {
            const filteredCities = cities.filter(city => city.country.id === newPort.countryId);
            if (filteredCities.length === 0) {
                loadCities();
            }
        }
    }, [newPort.countryId, cities]);

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Ubicaciones</h1>
                    <p className="text-gray-600">Administra países, ciudades y puertos</p>
                </div>

                
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('countries')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'countries'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Países
                            </button>
                            <button
                                onClick={() => setActiveTab('cities')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'cities'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Ciudades
                            </button>
                            <button
                                onClick={() => setActiveTab('ports')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'ports'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Puertos
                            </button>
                        </nav>
                    </div>
                </div>

                
                {activeTab === 'countries' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear País</h2>
                            <form onSubmit={createCountry} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del País *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCountry.name}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ej: España"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Código (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newCountry.code}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, code: e.target.value }))}
                                            placeholder="Ej: ES"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Crear País
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCountry({ name: '', code: '' })}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Países Existentes</h2>
                            {loadingCountries ? (
                                <div className="text-center py-4">Cargando...</div>
                            ) : (
                                <div className="space-y-2">
                                    {countries.map((country) => (
                                        <div key={country.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{country.name}</h3>
                                                <p className="text-sm text-gray-600">Código: {country.code}</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`¿Estás seguro de eliminar el país "${country.name}"? Los barcos asociados quedarán como "Sin País".`)) return;
                                                    try {
                                                        const res = await fetch(`/api/countries?id=${country.id}`, {
                                                            method: 'DELETE',
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert(data.message);
                                                            loadCountries();
                                                        } else {
                                                            alert('Error: ' + data.error);
                                                        }
                                                    } catch (error) {
                                                        alert('Error al eliminar país');
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Eliminar país"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="#dc2626" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="#dc2626" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                
                {activeTab === 'cities' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Ciudad</h2>
                            <form onSubmit={createCity} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de la Ciudad *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCity.name}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ej: Barcelona"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            País *
                                        </label>
                                        <select
                                            value={newCity.countryId}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, countryId: e.target.value, countryName: '' }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        >
                                            <option value="">Seleccionar país</option>
                                            {countries.map((country) => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name} ({country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>


                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Crear Ciudad
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCity({ name: '', countryId: '', countryName: '' })}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ciudades Existentes</h2>
                            {loadingCities ? (
                                <div className="text-center py-4">Cargando...</div>
                            ) : (
                                <div className="space-y-2">
                                    {cities.map((city) => (
                                        <div key={city.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{city.name}</h3>
                                                <p className="text-sm text-gray-600">{city.country.name}</p>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`¿Estás seguro de eliminar la ciudad "${city.name}"? Los barcos asociados quedarán como "Sin Ciudad".`)) return;
                                                    try {
                                                        const res = await fetch(`/api/cities?id=${city.id}`, {
                                                            method: 'DELETE',
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert(data.message);
                                                            loadCities();
                                                        } else {
                                                            alert('Error: ' + data.error);
                                                        }
                                                    } catch (error) {
                                                        alert('Error al eliminar ciudad');
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Eliminar ciudad"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="#dc2626" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="#dc2626" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                
                {activeTab === 'ports' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Puerto</h2>
                            <form onSubmit={createPort} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Puerto *
                                        </label>
                                        <input
                                            type="text"
                                            value={newPort.name}
                                            onChange={(e) => setNewPort(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ej: Port Vell"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            País *
                                        </label>
                                        <select
                                            value={newPort.countryId}
                                            onChange={(e) => setNewPort(prev => ({ ...prev, countryId: e.target.value, countryName: '', cityId: '' }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        >
                                            <option value="">Seleccionar país</option>
                                            {countries.map((country) => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name} ({country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ciudad *
                                    </label>
                                    <select
                                        value={newPort.cityId}
                                        onChange={(e) => setNewPort(prev => ({ ...prev, cityId: e.target.value, cityName: '' }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                                        required
                                        disabled={!newPort.countryId}
                                    >
                                        <option value="">Seleccionar ciudad</option>
                                        {cities.filter(city => city.country.id === newPort.countryId).map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        onClick={() => setNewPort({ name: '', cityId: '', cityName: '', countryId: '', countryName: '' })}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Puertos Existentes</h2>
                            {loadingPorts ? (
                                <div className="text-center py-4">Cargando...</div>
                            ) : (
                                <div className="space-y-2">
                                    {ports.map((port) => (
                                        <div key={port.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{port.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {port.city?.name || 'Sin Ciudad'}, {port.country?.name || 'Sin País'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
