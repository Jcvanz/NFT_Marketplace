import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { RegisterPage } from '../pages/RegisterPage';

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/register')({
  validateSearch: (search) => registerSearchSchema.parse(search),
  component: RegisterPage,
});
