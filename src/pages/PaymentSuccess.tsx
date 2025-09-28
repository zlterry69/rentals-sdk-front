import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const invoiceId = searchParams.get('invoice_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoice?.invoice_number || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600">
              Tu pago ha sido procesado correctamente
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-6">
            {invoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de Factura
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoice.invoice_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto Pagado
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {invoice.currency_code} {invoice.amount}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Método de Pago
                    </label>
                    <p className="text-gray-900 capitalize">
                      {invoice.payment_method_name || invoice.origin}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Pago
                    </label>
                    <p className="text-gray-900">
                      {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : 'Procesando...'}
                    </p>
                  </div>
                </div>

                {invoice.debtor_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Inquilino
                    </label>
                    <p className="text-gray-900">{invoice.debtor_name}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadReceipt}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Descargar Comprobante
              </button>
              
              <Link
                to="/properties"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver a Propiedades
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="px-6 py-4 bg-blue-50 border-t">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">i</span>
                </div>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recibirás un email de confirmación en los próximos minutos</li>
                  <li>Guarda tu comprobante de pago para futuras referencias</li>
                  <li>Si tienes alguna duda, contacta a nuestro soporte</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
