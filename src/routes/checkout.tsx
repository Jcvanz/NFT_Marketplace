import { createFileRoute, redirect } from '@tanstack/react-router';
import { CheckoutPage } from '../pages/CheckoutPage';

export const Route = createFileRoute('/checkout')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: CheckoutPage,
});
