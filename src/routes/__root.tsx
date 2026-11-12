import { createRootRouteWithContext, Link, Outlet, useRouter } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useSocketReconciliation } from '../realtime';
import { DevToolsPanel } from '../components/DevToolsPanel';
import Header from '@/components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';

export interface MyRouterContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        O recurso solicitado não existe ou a rota informada está incorreta.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        Voltar para o Início
      </Link>
    </div>
  ),
});

function RootComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const { isConnected } = useSocketReconciliation();

  return (
    <div className="w-full overflow-x-hidden">
      <Header/>
      <main className="w-full overflow-x-hidden">
        <Outlet />
      </main>
      <FooterComponent />
      <DevToolsPanel isSocketConnected={isConnected} />
    </div>
  );
}
