import { createFileRoute, redirect } from '@tanstack/react-router';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';

export const Route = createFileRoute('/order/$id/confirmation')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: OrderConfirmationPage,
});
