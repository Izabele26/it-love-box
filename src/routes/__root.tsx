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
import { Users, Laptop, PackageCheck, Undo2, ClipboardCheck, History } from "lucide-react";

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
  { to: "/", label: "Colaboradores", icon: Users },
  { to: "/equipamentos", label: "Equipamentos", icon: Laptop },
  { to: "/entregas", label: "Entregas", icon: PackageCheck },
  { to: "/devolucoes", label: "Devoluções", icon: Undo2 },
  { to: "/inspecoes", label: "Inspeções Técnicas", icon: ClipboardCheck },
] as const;

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      activeProps={{ className: "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-primary text-primary-foreground" }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-muted-foreground active:bg-accent"
              activeProps={{ className: "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-primary font-semibold" }}
            >
              <Icon className="h-5 w-5" />
              <span>{label.split(" ")[0]}</span>
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
          <div className="mx-auto max-w-6xl px-4 py-4">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">Controle de TI</h1>
            <nav className="mt-3 flex flex-wrap gap-1.5">
              {NAV.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
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
