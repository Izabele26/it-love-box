import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { ClipboardCheck, LayoutDashboard, Laptop, Menu, PackageCheck, PanelLeftClose, PanelLeftOpen, Undo2, Users } from "lucide-react";

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
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/colaboradores", label: "Colaboradores", icon: Users },
  { to: "/equipamentos", label: "Equipamentos", icon: Laptop },
  { to: "/entregas", label: "Entregas", icon: PackageCheck },
  { to: "/devolucoes", label: "Devoluções", icon: Undo2 },
  { to: "/inspecoes", label: "Inspeções Técnicas", icon: ClipboardCheck },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  collapsed = false,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
      activeProps={{ className: `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium bg-white/15 text-white ${collapsed ? "justify-center" : ""}` }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className={`flex h-16 items-center border-b border-white/10 px-4 ${collapsed ? "justify-center" : "justify-start"}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
          <Laptop className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <div className="truncate text-sm font-semibold">Controle de TI</div>
            <div className="truncate text-xs text-slate-400">Inventário e service desk</div>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} onClick={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        <aside className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 md:block ${collapsed ? "w-20" : "w-64"}`}>
          <SidebarContent collapsed={collapsed} />
        </aside>

        <header className={`sticky top-0 z-20 border-b bg-white/95 backdrop-blur transition-[left] duration-300 md:left-auto ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-0 bg-slate-950 p-0 text-white">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu principal</SheetTitle>
                  </SheetHeader>
                  <SidebarContent onNavigate={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Controle de TI</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">Dashboard de inventário e operações</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              <span className="ml-2">{collapsed ? "Expandir" : "Recolher"}</span>
            </Button>
          </div>
        </header>

        <main className={`px-3 py-4 transition-[margin] duration-300 md:px-6 md:py-6 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
