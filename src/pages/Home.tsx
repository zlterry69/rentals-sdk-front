import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UsersIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      name: 'Propiedades Únicas',
      description: 'Descubre casas, departamentos y villas increíbles en todo el Perú.',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Pagos Flexibles',
      description: 'Acepta pagos tradicionales (Yape, Plin) y criptomonedas como Bitcoin.',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Reservas Flexibles',
      description: 'Reserva por días, semanas o meses según tus necesidades.',
      icon: UsersIcon,
    },
    {
      name: 'Anfitriones Verificados',
      description: 'Todos nuestros anfitriones están verificados y tienen excelentes reseñas.',
      icon: ChartBarIcon,
    },
  ];

  const benefits = [
    'Pagos tradicionales y criptomonedas',
    'Propiedades verificadas y seguras',
    'Soporte técnico 24/7',
    'Reservas flexibles por días',
    'Anfitriones confiables',
    'Precios transparentes',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                      <span className="ml-2 text-xl font-bold text-gray-900">HogarPerú</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contacto
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                      Encuentra tu hogar perfecto
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                      Reserva propiedades únicas en todo el Perú
                    </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explorar Propiedades
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Más Información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir HogarPerú?
            </h2>
            <p className="text-xl text-gray-600">
              La mejor plataforma para tus alquileres en el Perú
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white p-6 rounded-lg shadow-md">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir nuestro sistema?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Ofrecemos la solución más completa para la gestión de propiedades 
                con pagos tradicionales y criptomonedas, garantizando seguridad, rapidez y 
                transparencia en todas las transacciones.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-center">
                <ShieldCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  100% Seguro
                </h3>
                <p className="text-gray-600 mb-6">
                  Utilizamos las mejores prácticas de seguridad y encriptación 
                  para proteger todos tus datos y transacciones.
                </p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Soporte disponible 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Propiedades Destacadas
            </h2>
            <p className="text-xl text-gray-600">
              Las propiedades más populares entre nuestros huéspedes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Property 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
                alt="Casa Moderna en Miraflores"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Casa Moderna en Miraflores
                </h3>
                <p className="text-gray-600 mb-4">
                  Hermosa casa moderna con vista al mar, perfecta para vacaciones familiares.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8 (24 reseñas)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">$120</div>
                    <div className="text-sm text-gray-500">por noche</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Property 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1652064132636-d0bea258cc85?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Villa con Vista al Mar"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Villa con Vista al Mar
                </h3>
                <p className="text-gray-600 mb-4">
                  Espectacular villa frente al mar, ideal para escapadas de fin de semana.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8 (60 reseñas)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">$250</div>
                    <div className="text-sm text-gray-500">por noche</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Property 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
                alt="Penthouse en La Molina"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Penthouse en La Molina
                </h3>
                <p className="text-gray-600 mb-4">
                  Lujoso penthouse con vista panorámica de la ciudad, perfecto para eventos especiales.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.9 (42 reseñas)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">$300</div>
                    <div className="text-sm text-gray-500">por noche</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Todas las Propiedades
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Host Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Tienes una propiedad para alquilar?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Únete a nuestra plataforma y comienza a ganar dinero con tu propiedad. 
                Ofrecemos pagos seguros en criptomonedas y herramientas para gestionar tus reservas.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Gana hasta $3,000 USD por mes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Pagos seguros en criptomonedas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte 24/7 para anfitriones</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Herramientas de gestión incluidas</span>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Convertirse en Anfitrión
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-center">
                <BuildingOfficeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Gana Dinero Extra
                </h3>
                <p className="text-gray-600 mb-6">
                  Lista tu propiedad y comienza a recibir huéspedes. 
                  Nosotros nos encargamos del resto.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$2,500</div>
                    <p className="text-sm text-gray-600">Ingreso promedio mensual</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-gray-600">Tasa de ocupación</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a la mejor plataforma de alquileres en el Perú
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Crear Cuenta Gratis
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explorar Propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
                        <span className="ml-2 text-lg font-semibold">HogarPerú</span>
              </div>
              <p className="text-gray-400">
                Plataforma de alquiler de propiedades en todo el Perú.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contacto</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">Registrarse</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="text-gray-400 space-y-2">
                        <p>Email: contacto@hogarperu.com</p>
                <p>Teléfono: +51 999 888 777</p>
                <p>Dirección: Lima, Perú</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 HogarPerú. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
