import { mockProperties } from './mockProperties';
import { additionalProperties } from './additionalProperties';
import { moreProperties } from './moreProperties';

// Combinar todas las propiedades
export const allProperties = [
  ...mockProperties,
  ...additionalProperties,
  ...moreProperties
];

// Función para obtener propiedades aleatorias
export const getRandomProperties = (count: number = 25) => {
  const shuffled = [...allProperties].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Función para buscar propiedades por ciudad
export const getPropertiesByCity = (city: string) => {
  return allProperties.filter(property => 
    property.location.city.toLowerCase().includes(city.toLowerCase())
  );
};

// Función para filtrar por tipo de propiedad
export const getPropertiesByType = (type: string) => {
  return allProperties.filter(property => 
    property.property_type === type
  );
};

// Función para filtrar por rango de precio
export const getPropertiesByPriceRange = (min: number, max: number) => {
  return allProperties.filter(property => 
    property.price_per_night >= min && property.price_per_night <= max
  );
};
