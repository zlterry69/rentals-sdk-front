import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { api } from '@/app/api';
import { toast } from 'react-hot-toast';
import RegisterPaymentModal from '@/components/modals/RegisterPaymentModal';

interface Payment {
  id: string;
  public_id: string;
  invoice_id?: string;
  debtor_name: string;
  property_name?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_origin: string;
  status: 'pending' | 'paid' | 'rejected' | 'approved';
  description?: string;
  comments?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<string>('');
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper functions for payment status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'confirmed':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
      case 'failed':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'yape':
        return '💳';
      case 'plin':
        return '📱';
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'cash':
      case 'efectivo':
        return '💵';
      case 'bitcoin':
        return '₿';
      case 'ethereum':
        return 'Ξ';
      default:
        return '💰';
    }
  };

  // Fetch payments from backend
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/payments');
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error al cargar pagos');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.debtor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.property_name && payment.property_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Since we don't have status in the new interface, we'll show all payments
    return matchesSearch;
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = payments.length;

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!payment.receipt_url) {
      toast.error('No hay recibo disponible para descargar');
      return;
    }

    try {
      // Usar el endpoint del backend para descarga segura
      const response = await api.get(`/payments/${payment.id}/receipt`, {
        responseType: 'blob'
      });
      
      if (response.data) {
        // Crear blob y descargar
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo_${payment.invoice_id || payment.public_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Recibo descargado exitosamente');
      } else {
        toast.error('Error al descargar el recibo');
      }
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      
      // Si el endpoint falla, intentar descarga directa como fallback
      if (payment.receipt_url.startsWith('http')) {
        const link = document.createElement('a');
        link.href = payment.receipt_url;
        link.download = `recibo_${payment.invoice_id || payment.public_id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Descargando recibo...');
      } else {
        toast.error('Error al descargar el recibo');
      }
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await api.patch(`/payments/${paymentId}/approve`);
      toast.success('Pago aprobado exitosamente');
      fetchPayments();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast.error(error.response?.data?.detail || 'Error al aprobar el pago');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await api.patch(`/payments/${paymentId}/reject`);
      toast.success('Pago rechazado exitosamente');
      fetchPayments();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.detail || 'Error al rechazar el pago');
    }
  };

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description);
    setShowDescriptionModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (paymentId: string, updateData: any) => {
    try {
      const formData = new FormData();
      
      if (updateData.amount !== undefined) formData.append('amount', updateData.amount.toString());
      if (updateData.payment_method) formData.append('payment_method', updateData.payment_method);
      if (updateData.payment_origin) formData.append('payment_origin', updateData.payment_origin);
      if (updateData.description) formData.append('description', updateData.description);
      if (updateData.comments) formData.append('comments', updateData.comments);
      if (updateData.invoice_id) formData.append('invoice_id', updateData.invoice_id);
      if (updateData.receipt_file) formData.append('receipt_file', updateData.receipt_file);

      await api.patch(`/payments/${paymentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Pago actualizado exitosamente');
      fetchPayments();
      setShowEditModal(false);
      setEditingPayment(null);
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar el pago');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Controla todos los pagos de tus propiedades y genera recibos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Pagos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPayments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monto Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {totalAmount.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Promedio por Pago
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    S/ {totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : '0.00'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pagos por inquilino o propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID de Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.invoice_id || `inv_${payment.public_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2 text-lg">{getPaymentMethodIcon(payment.payment_method)}</span>
                      <span className="capitalize">{payment.payment_origin || payment.payment_method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      S/ {payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDescription(payment.description || 'Sin descripción')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      Ver descripción
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {payment.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprovePayment(payment.public_id)}
                            className="text-green-600 hover:text-green-800"
                            title="Aprobar pago"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleRejectPayment(payment.public_id)}
                            className="text-red-600 hover:text-red-800"
                            title="Rechazar pago"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleEditPayment(payment)}
                        className="text-gray-400 hover:text-yellow-500"
                        title="Editar pago"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleViewDetails(payment)}
                        className="text-gray-400 hover:text-blue-500"
                        title="Ver detalles del pago"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {payment.receipt_url && (
                        <button 
                          onClick={() => handleDownloadReceipt(payment)}
                          className="text-gray-400 hover:text-green-500"
                          title="Descargar recibo"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'No se encontraron pagos con los filtros aplicados.'
              : 'Los pagos aparecerán aquí cuando se registren.'
            }
          </p>
        </div>
      )}

      {/* Register Payment Modal */}
      <RegisterPaymentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onPaymentRegistered={fetchPayments}
      />

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Descripción del Pago
                </h3>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedDescription}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Pago
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Información del Pago</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Inquilino:</span>
                      <p className="text-gray-900">{selectedPayment.debtor_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Propiedad:</span>
                      <p className="text-gray-900">{selectedPayment.property_name || 'No asignada'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Monto:</span>
                      <p className="text-gray-900 font-semibold">S/ {selectedPayment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusText(selectedPayment.status)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Método de Pago:</span>
                      <p className="text-gray-900 flex items-center">
                        <span className="mr-2">{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                        {selectedPayment.payment_method}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Fecha de Pago:</span>
                      <p className="text-gray-900">
                        {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString('es-PE') : 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SDK Response */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Respuesta del SDK</h4>
                  <div className="bg-white p-3 rounded border">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify({
                        status: selectedPayment.status,
                        method: selectedPayment.payment_method,
                        amount: selectedPayment.amount,
                        date: selectedPayment.payment_date,
                        reference: selectedPayment.public_id,
                        comments: selectedPayment.comments || 'Sin comentarios'
                      }, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Comments */}
                {selectedPayment.comments && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Comentarios</h4>
                    <p className="text-sm text-gray-600">{selectedPayment.comments}</p>
                  </div>
                )}

                {/* Receipt */}
                {selectedPayment.receipt_url && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Recibo</h4>
                    <button
                      onClick={() => handleDownloadReceipt(selectedPayment)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Descargar Recibo
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Editar Pago
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <EditPaymentForm
                payment={editingPayment}
                onUpdate={handleUpdatePayment}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingPayment(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple edit form component
const EditPaymentForm: React.FC<{
  payment: Payment;
  onUpdate: (paymentId: string, data: any) => void;
  onCancel: () => void;
}> = ({ payment, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    payment_method: payment.payment_method,
    payment_origin: payment.payment_origin || '',
    description: payment.description || '',
    comments: payment.comments || '',
    invoice_id: payment.invoice_id || '',
    receipt_file: null as File | null
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Fetch payment methods on component mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingMethods(true);
      try {
        const response = await api.get('/invoices/payment-methods');
        console.log('Payment methods response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Extract method names from the response
          const methods = response.data.map((method: any) => {
            // Use the 'name' field from PaymentMethod schema
            return method.name || method.code || method.toString();
          });
          
          setPaymentMethods(methods);
        } else {
          console.warn('No payment methods found in response');
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        // Only use fallback if the endpoint completely fails
        setPaymentMethods(['cash', 'transfer', 'credit_card', 'debit_card']);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(payment.public_id, {
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, receipt_file: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto (S/)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            step="0.01"
            min="0"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID de Factura
          </label>
          <input
            type="text"
            value={formData.invoice_id}
            readOnly
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Origen del Pago
        </label>
        <select
          value={formData.payment_origin}
          onChange={(e) => setFormData(prev => ({ ...prev, payment_origin: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loadingMethods}
        >
          <option value="">Seleccionar método de pago</option>
          {paymentMethods.map((method) => {
            // Format method names for better display
            const formatMethodName = (name: string) => {
              const formatted = name
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              // Special cases for Peruvian payment methods
              if (name.toLowerCase() === 'yape') return 'Yape';
              if (name.toLowerCase() === 'plin') return 'Plin';
              if (name.toLowerCase() === 'bim') return 'BIM';
              if (name.toLowerCase() === 'bbva') return 'BBVA';
              
              return formatted;
            };

            return (
              <option key={method} value={method}>
                {formatMethodName(method)}
              </option>
            );
          })}
        </select>
        {loadingMethods && (
          <p className="mt-1 text-sm text-gray-500">Cargando métodos de pago...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nueva Factura/Boleta (Opcional)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Actualizar Pago
        </button>
      </div>
    </form>
  );
};

export default Payments;
