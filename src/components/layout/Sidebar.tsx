import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

// Navigation items based on user roles
const getNavigationItems = (userRole: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['user', 'admin', 'superadmin'] },
  ];

  // Items for regular users (can rent and list properties)
  const userNavigation = [
    { name: 'Explorar Alquileres', href: '/explore', icon: MagnifyingGlassIcon, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Mis Propiedades', href: '/units', icon: BuildingOfficeIcon, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Reservas', href: '/bookings', icon: CalendarIcon, roles: ['user', 'admin', 'superadmin'] },
    { name: 'Pagos', href: '/payments', icon: CurrencyDollarIcon, roles: ['user', 'admin', 'superadmin'] },
  ];

  // Items for admins and superadmins (property management)
  const adminNavigation = [
    { name: 'Inquilinos', href: '/debtors', icon: UserGroupIcon, roles: ['admin', 'superadmin'] },
    { name: 'Contratos', href: '/leases', icon: DocumentTextIcon, roles: ['admin', 'superadmin'] },
    { name: 'Reportes', href: '/reports', icon: ChartBarIcon, roles: ['admin', 'superadmin'] },
    { name: 'Gestión de Usuarios', href: '/users', icon: UsersIcon, roles: ['admin', 'superadmin'] },
  ];

  // Combine navigation based on role
  let navigation = [...baseNavigation];
  
  if (userRole === 'user') {
    navigation = [...navigation, ...userNavigation];
  } else if (userRole === 'admin' || userRole === 'superadmin') {
    navigation = [...navigation, ...userNavigation, ...adminNavigation];
  }

  return navigation.filter(item => item.roles.includes(userRole));
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  // Get navigation items based on user role
  const navigation = useMemo(() => {
    return getNavigationItems(user?.role || 'user');
  }, [user?.role]);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return SunIcon;
      case 'dark':
        return MoonIcon;
      case 'system':
        return ComputerDesktopIcon;
      default:
        return SunIcon;
    }
  };

  const ThemeIcon = getThemeIcon();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col sidebar">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4 shadow-lg">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">R</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Sistema</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800'
                        }`
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="h-10 w-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.full_name 
                        ? user.full_name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()
                        : user?.email?.[0]?.toUpperCase() || 'U'
                      }
                    </span>
                  )}
                </div>
                <span className="sr-only">Tu perfil</span>
                <span aria-hidden="true" className="dark:text-white">
                  {user?.full_name || user?.email || 'Usuario'}
                </span>
              </div>
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                <button
                  onClick={cycleTheme}
                  className={`flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    theme === 'system' 
                      ? 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300' 
                      : theme === 'light'
                      ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
                      : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  }`}
                >
                  <ThemeIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  Tema: {theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};