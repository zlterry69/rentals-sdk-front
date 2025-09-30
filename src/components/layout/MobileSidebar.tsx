import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Inquilinos', href: '/debtors', icon: UserGroupIcon },
  { name: 'Pagos', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Unidades', href: '/units', icon: BuildingOfficeIcon },
  { name: 'Contratos', href: '/leases', icon: DocumentTextIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
];

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const { user, logout } = useAuth();

  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Cerrar barra lateral</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">R</span>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-900">Sistema</span>
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
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                  isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                          </span>
                        </div>
                        <span className="sr-only">Tu perfil</span>
                        <span aria-hidden="true">{user?.full_name || 'Usuario'}</span>
                      </div>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-2 py-3 text-sm font-semibold leading-6 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};