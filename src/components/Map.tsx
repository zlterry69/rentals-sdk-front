import React, { useEffect, useRef } from 'react';

interface MapProps {
  center?: { lat: number; lng: number };
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  isEditable?: boolean;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center = { lat: -12.0464, lng: -77.0428 },
  onLocationSelect,
  isEditable = false,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: google.maps.Map | null = null;
    let marker: google.maps.Marker | null = null;
    let isInitialized = false;

    const initMap = async () => {
      if (isInitialized) return; // Evitar múltiples inicializaciones
      
      try {
        console.log('🚀 Iniciando Google Maps...');
        
        if (!mapRef.current) {
          console.log('❌ No se encontró el contenedor del mapa');
          return;
        }

        // Cargar Google Maps
        const { Loader } = await import('@googlemaps/js-api-loader');
        
        const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDAU7cm0QUc15Ncsh1vENiDUjtIESXO-qQ';
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'geocoding']
        });

        console.log('📚 Cargando librerías...');
        const { Map: GoogleMap } = await loader.importLibrary('maps');
        const { Marker } = await loader.importLibrary('marker');
        
        console.log('🗺️ Creando mapa...');
        map = new GoogleMap(mapRef.current, {
          center,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        console.log('📍 Creando marcador...');
        marker = new Marker({
          position: center,
          map: map,
          draggable: isEditable,
          title: isEditable ? 'Arrastra para cambiar la ubicación' : 'Ubicación de la propiedad'
        });

        console.log('✅ Mapa inicializado correctamente');
        isInitialized = true;

        // Hacer geocoding inverso para obtener la dirección inicial (solo una vez)
        if (onLocationSelect && marker) {
          try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: center });
            if (result.results[0]) {
              const address = result.results[0].formatted_address;
              console.log('🗺️ Dirección inicial obtenida:', address);
              onLocationSelect({ lat: center.lat, lng: center.lng, address });
            }
          } catch (err) {
            console.error('Error en geocoding inicial:', err);
          }
        }

        // Eventos
        if (onLocationSelect && marker) {
          map.addListener('click', async (event: google.maps.MapMouseEvent) => {
            if (event.latLng && marker) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              marker.setPosition({ lat, lng });
              map?.panTo({ lat, lng });

              try {
                const geocoder = new google.maps.Geocoder();
                const result = await geocoder.geocode({ location: { lat, lng } });
                if (result.results[0]) {
                  const address = result.results[0].formatted_address;
                  onLocationSelect({ lat, lng, address });
                } else {
                  onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
                }
              } catch (err) {
                console.error('Error getting address:', err);
                onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
              }
            }
          });

          marker.addListener('dragend', async () => {
            const position = marker?.getPosition();
            if (position) {
              const lat = position.lat();
              const lng = position.lng();
              map?.panTo({ lat, lng });

              try {
                const geocoder = new google.maps.Geocoder();
                const result = await geocoder.geocode({ location: { lat, lng } });
                if (result.results[0]) {
                  const address = result.results[0].formatted_address;
                  onLocationSelect({ lat, lng, address });
                } else {
                  onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
                }
              } catch (err) {
                console.error('Error getting address:', err);
                onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
              }
            }
          });
        }

      } catch (err) {
        console.error('❌ Error cargando Google Maps:', err);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(initMap, 100);
    
    return () => {
      clearTimeout(timer);
      isInitialized = false;
    };
  }, []); // Solo ejecutar una vez al montar el componente

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef}
        className="w-full h-full rounded-lg border-2 border-gray-300 bg-gray-100" 
      />
      <div className="absolute top-2 left-2 bg-blue-500 text-white p-3 rounded shadow-md text-sm">
        <p className="font-medium">📍 Mapa interactivo</p>
        <p className="text-xs mt-1">Arrastra el marcador rojo para explorar la ubicación</p>
      </div>
    </div>
  );
};

export default Map;
