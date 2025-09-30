import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, CheckIcon, XCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

interface EditBookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
  bookingTitle?: string;
}

const EditBookingStatusModal: React.FC<EditBookingStatusModalProps> = ({
  isOpen,
  onClose,
  onUpdateStatus,
  bookingTitle
}) => {
  const handleStatusChange = (status: string) => {
    onUpdateStatus(status);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                      <PencilIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cambiar Estado
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {bookingTitle}
                    </p>
                  </div>
                  
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusChange('CONFIRMED')}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Confirmar</span>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 border border-orange-200 dark:border-orange-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <XCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Cancelar</span>
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 border border-green-200 dark:border-green-800 col-span-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CheckBadgeIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Marcar como Completado</span>
                  </button>
                </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-3xl">
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditBookingStatusModal;
