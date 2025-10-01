import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { api } from '@/app/api';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'processing'>('processing');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Obtener parámetros de la URL
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const status = searchParams.get('status');

        console.log('🔍 Parámetros de pago recibidos:', { orderId, amount, status });
        console.log('🔍 URL completa:', window.location.href);

        if (!orderId || !amount) {
          console.error('❌ Faltan parámetros requeridos');
          setPaymentStatus('error');
          setIsProcessing(false);
          return;
        }

        // Verificar que el status sea SUCCEEDED
        if (status !== 'SUCCEEDED') {
          console.error('❌ Status no es SUCCEEDED:', status);
          setPaymentStatus('error');
          setIsProcessing(false);
          return;
        }

        console.log('✅ Status SUCCEEDED confirmado');

        // Crear datos del pago para enviar al backend usando los parámetros de la URL
        const paymentData = {
          order_id: orderId,
          payment_id: orderId, // Usar orderId como payment_id
          payment_status: 'finished',
          amount: parseFloat(amount),
          currency: 'PEN',
          provider_tx: orderId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: status,
          sdk_response: {
            orderId: orderId,
            amount: parseFloat(amount),
            currency: 'PEN',
            status: status,
            // Simular datos adicionales que vendrían de iZIPay
            provider_tx: orderId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };

        setPaymentData(paymentData);

        // Enviar al webhook del backend
        try {
          console.log('📤 Enviando datos al webhook:', paymentData);
          const webhookResponse = await api.post('/webhooks/izipay', paymentData);
          console.log('✅ Webhook procesado:', webhookResponse.data);
          console.log('📊 Status del webhook:', webhookResponse.status);
          
          setPaymentStatus('success');
          toast.success('¡Pago procesado exitosamente!');
        } catch (webhookError: any) {
          console.error('❌ Error en webhook:', webhookError);
          console.error('❌ Detalles del error:', webhookError.response?.data || webhookError.message);
          console.error('❌ Status del error:', webhookError.response?.status || 'N/A');
          // Aún así marcar como éxito si el pago fue exitoso
          setPaymentStatus('success');
          toast.success('¡Pago completado! (Nota: Error al actualizar el estado)');
        }
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          // Intentar volver a la página anterior o a bookings
          const returnUrl = localStorage.getItem('izipay_return_url') || '/bookings';
          localStorage.removeItem('izipay_return_url');
          navigate(returnUrl);
        }, 2000);

      } catch (error) {
        console.error('❌ Error procesando pago:', error);
        setPaymentStatus('error');
        toast.error('Error procesando el pago');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    const returnUrl = localStorage.getItem('izipay_return_url') || '/bookings';
    localStorage.removeItem('izipay_return_url');
    navigate(returnUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isProcessing && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Procesando pago...
              </h2>
              <p className="text-gray-600">
                Verificando el estado de tu pago con iZIPay
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Pago Exitoso!
              </h2>
              <p className="text-gray-600 mb-6">
                Tu pago ha sido procesado correctamente
              </p>
              {paymentData && (
                <div className="bg-gray-100 p-4 rounded-lg mb-6 w-full">
                  <h3 className="font-medium text-gray-900 mb-2">Detalles del pago:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Orden:</span> {paymentData.order_id}</p>
                    <p><span className="font-medium">Monto:</span> S/ {paymentData.amount.toFixed(2)}</p>
                    <p><span className="font-medium">Estado:</span> {paymentData.status}</p>
                    {paymentData.provider_tx && (
                      <p><span className="font-medium">Transacción:</span> {paymentData.provider_tx}</p>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={handleGoBack}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="flex flex-col items-center">
              <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error en el pago
              </h2>
              <p className="text-gray-600 mb-6">
                No se pudo procesar tu pago correctamente
              </p>
              <div className="space-y-3 w-full">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Volver
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;