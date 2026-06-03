import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Users, Laptop, PackageCheck, Undo2, ClipboardCheck, LayoutGrid } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Página não encontrada.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-3 text-base text-primary-foreground">
          Início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-3 text-base text-primary-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Controle de Equipamentos de TI" },
      { name: "description", content: "Sistema CRUD para controle de equipamentos de TI." },
      { name: "theme-color", content: "#0f172a" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/menu", label: "Menu", icon: LayoutGrid },
  { to: "/", label: "Colab.", icon: Users },
  { to: "/equipamentos", label: "Equip.", icon: Laptop },
  { to: "/entregas", label: "Entrega", icon: PackageCheck },
  { to: "/devolucoes", label: "Devol.", icon: Undo2 },
  { to: "/inspecoes", label: "Inspeç.", icon: ClipboardCheck },
] as const;

function TopNavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
      activeProps={{ className: "px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}

function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-6">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-muted-foreground active:bg-accent"
              activeProps={{ className: "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-primary font-semibold" }}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b bg-card sticky top-0 z-30">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-2">
            <h1 className="text-base md:text-lg font-semibold mr-2 md:mr-4">Controle de TI</h1>
            <nav className="hidden md:flex flex-wrap gap-1">
              <TopNavLink to="/">Colaboradores</TopNavLink>
              <TopNavLink to="/equipamentos">Equipamentos</TopNavLink>
              <TopNavLink to="/entregas">Entregas</TopNavLink>
              <TopNavLink to="/devolucoes">Devoluções</TopNavLink>
              <TopNavLink to="/inspecoes">Inspeções Técnicas</TopNavLink>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-3 md:px-4 py-4 md:py-6">
          <Outlet />
        </main>
        <BottomNav />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
