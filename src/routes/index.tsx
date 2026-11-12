import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { HomePage } from '../pages/HomePage';

const catalogSearchSchema = z.object({
  search: z.string().optional().catch(''),
  category: z.string().optional().catch('all'),
  network: z.string().optional().catch('all'),
  quickFilter: z.enum(['all', 'new', 'releases', 'trending']).optional().catch('all'),
  minPrice: z.string().optional().catch(''),
  maxPrice: z.string().optional().catch(''),
  sortBy: z
    .enum(['recently_listed', 'price_asc', 'price_desc', 'most_viewed', 'highest_edition'])
    .optional()
    .catch('recently_listed'),
  page: z.number().int().positive().optional().catch(1),
});

export const Route = createFileRoute('/')({
  validateSearch: (search) => catalogSearchSchema.parse(search),
  component: HomePage,
});
