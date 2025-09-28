import React from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Contacto - HogarPerú
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Plataforma de alquiler de propiedades en todo el Perú
                  </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información de Contacto
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                          <h3 className="font-semibold text-gray-900">Empresa</h3>
                          <p className="text-gray-600">HogarPerú</p>
                          <p className="text-gray-600">Plataforma de Alquiler de Propiedades</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                          <h3 className="font-semibold text-gray-900">Email</h3>
                          <p className="text-gray-600">contacto@hogarperu.com</p>
                          <p className="text-gray-600">soporte@hogarperu.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <PhoneIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Teléfono</h3>
                  <p className="text-gray-600">+51 999 888 777</p>
                  <p className="text-gray-600">+51 1 234 5678</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPinIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dirección</h3>
                  <p className="text-gray-600">Av. Principal 123, Oficina 456</p>
                  <p className="text-gray-600">Lima, Perú</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <GlobeAltIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                          <h3 className="font-semibold text-gray-900">Sitio Web</h3>
                          <p className="text-gray-600">www.hogarperu.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nuestros Servicios
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Gestión de Propiedades</h3>
                <p className="text-gray-600">Administración completa de propiedades en alquiler</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Pagos en Criptomonedas</h3>
                <p className="text-gray-600">Aceptamos Bitcoin, Ethereum, USDT y más</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Control de Arrendatarios</h3>
                <p className="text-gray-600">Seguimiento de pagos y estados de cuenta</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900">Reportes y Analytics</h3>
                <p className="text-gray-600">Reportes detallados de ingresos y pagos</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900">Soporte 24/7</h3>
                <p className="text-gray-600">Atención al cliente disponible las 24 horas</p>
              </div>
            </div>

            {/* Horarios de atención */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Horarios de Atención</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                <p>Sábados: 9:00 AM - 2:00 PM</p>
                <p>Domingos: Cerrado</p>
                <p className="text-blue-600 font-medium">Soporte de emergencia: 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            ¿Por qué elegir nuestro sistema?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-600">Seguro y confiable</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-gray-600">Disponibilidad</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">Crypto</div>
              <p className="text-gray-600">Pagos modernos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
