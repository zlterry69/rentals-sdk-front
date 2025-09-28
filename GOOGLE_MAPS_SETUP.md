# Configuración de Google Maps

Para usar la funcionalidad de mapas en la aplicación, necesitas configurar una API key de Google Maps.

## Pasos para configurar Google Maps:

1. **Obtener una API key de Google Maps:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita las siguientes APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Crea credenciales (API Key)
   - Restringe la API key a tu dominio para mayor seguridad

2. **Configurar la variable de entorno:**
   - Crea un archivo `.env` en la raíz del proyecto frontend
   - Agrega la siguiente línea:
   ```
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

3. **Reiniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## Funcionalidades disponibles:

- **Visualización de mapas:** Muestra la ubicación de la propiedad en un mapa interactivo
- **Selección de ubicación:** En modo de edición, permite seleccionar una nueva ubicación haciendo clic en el mapa
- **Geocoding:** Convierte coordenadas en direcciones legibles automáticamente
- **Marcador arrastrable:** Permite ajustar la ubicación arrastrando el marcador

## Notas importantes:

- La API key debe estar configurada correctamente para que los mapas funcionen
- Sin la API key, se mostrará un mensaje de error en lugar del mapa
- Las coordenadas se guardan en la base de datos junto con la dirección
