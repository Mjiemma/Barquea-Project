'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapSelectorProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address: string;
        city: string;
        country: string;
    }) => void;
    initialCenter?: { lat: number; lng: number };
}

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

export default function GoogleMapSelector({
    onLocationSelect,
    initialCenter = { lat: 41.3851, lng: 2.1734 }
}: GoogleMapSelectorProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [geocoder, setGeocoder] = useState<any>(null);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;

            window.initMap = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }

        return () => {
            if (window.google) {
                delete window.initMap;
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || !window.google) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 12,
            mapTypeId: 'satellite'
        });

        const geocoderInstance = new window.google.maps.Geocoder();

        setMap(mapInstance);
        setGeocoder(geocoderInstance);

        mapInstance.addListener('click', (event: any) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            if (marker) {
                marker.setMap(null);
            }

            const newMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapInstance,
                title: 'Puerto seleccionado'
            });

            setMarker(newMarker);

            geocoderInstance.geocode(
                { location: { lat, lng } },
                (results: any[], status: string) => {
                    if (status === 'OK' && results[0]) {
                        const result = results[0];
                        const addressComponents = result.address_components;

                        let city = '';
                        let country = '';

                        addressComponents.forEach((component: any) => {
                            if (component.types.includes('locality')) {
                                city = component.long_name;
                            }
                            if (component.types.includes('country')) {
                                country = component.long_name;
                            }
                        });

                        const locationData = {
                            lat,
                            lng,
                            address: result.formatted_address,
                            city: city || 'Ciudad no encontrada',
                            country: country || 'País no encontrado'
                        };

                        setSelectedLocation(locationData);
                        onLocationSelect(locationData);
                    }
                }
            );
        });
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600">
                Haz clic en el mapa para seleccionar la ubicación del puerto
            </div>

            {selectedLocation && (
                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                        <strong>Ubicación seleccionada:</strong> {selectedLocation.address}
                    </p>
                    <p className="text-xs text-blue-700">
                        Coordenadas: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-blue-700">
                        Ciudad: {selectedLocation.city}, País: {selectedLocation.country}
                    </p>
                </div>
            )}

            <div
                ref={mapRef}
                className="w-full h-96 rounded-lg border border-gray-300"
                style={{ minHeight: '400px' }}
            />

            <div className="text-xs text-gray-500">
                💡 Tip: Usa la vista satélite para identificar mejor los puertos y marinas
            </div>
        </div>
    );
}
