import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { ProfilePage } from '../pages/ProfilePage';

const profileSearchSchema = z.object({
  tab: z.string().optional(),
});

export const Route = createFileRoute('/profile')({
  validateSearch: (search) => profileSearchSchema.parse(search),
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: ProfilePage,
});
