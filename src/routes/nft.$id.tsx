import { createFileRoute } from '@tanstack/react-router';
import { NFTDetailPage } from '../pages/NFTDetailPage';

export const Route = createFileRoute('/nft/$id')({
  component: NFTDetailPage,
});
