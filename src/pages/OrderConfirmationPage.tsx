import React from 'react';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { useOrder } from '../hooks/useOrders';
import { OrderConfirmationModal } from '../components/OrderConfirmationModal';
import { AlertCircle } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams({ from: '/order/$id/confirmation' });
  const { data, isLoading, isError } = useOrder(id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#140D0A]/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-[#241612] border border-[#3F2319] rounded-2xl p-8 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-[#180E0C] animate-shimmer" />
          <div className="h-6 w-48 mx-auto rounded bg-[#180E0C] animate-shimmer" />
        </div>
      </div>
    );
  }

  const order = data?.order;

  if (isError || !order || order.status !== 'confirmed') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-[#241612] border border-[#3F2319] p-8 rounded-2xl max-w-md text-center space-y-4 shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-xl font-bold text-[#F5F1EB]">Pedido não confirmado</h1>
          <p className="text-[#CFB28C] text-xs sm:text-sm">
            Este pedido não foi concluído com sucesso ou o identificador é inválido.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] transition-all"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] relative">
      <OrderConfirmationModal
        isOpen={true}
        onClose={() => navigate({ to: '/' })}
        order={order}
        walletLabel="MetaMask"
      />
    </div>
  );
};

export default OrderConfirmationPage;
