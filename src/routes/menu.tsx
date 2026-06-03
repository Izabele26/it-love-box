import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Users, Laptop, PackageCheck, Undo2, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [{ title: "Menu" }] }),
  component: Page,
});

const ITEMS = [
  { to: "/", label: "Colaboradores", icon: Users, desc: "Cadastros da equipe" },
  { to: "/equipamentos", label: "Equipamentos", icon: Laptop, desc: "Patrimônio e status" },
  { to: "/entregas", label: "Entregas", icon: PackageCheck, desc: "Registrar entrega" },
  { to: "/devolucoes", label: "Devoluções", icon: Undo2, desc: "Registrar devolução" },
  { to: "/inspecoes", label: "Inspeções", icon: ClipboardCheck, desc: "Checklist técnico" },
] as const;

function Page() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Menu</h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {ITEMS.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="block">
            <Card className="p-4 h-full flex flex-col gap-2 active:scale-[0.98] transition hover:bg-accent">
              <Icon className="h-8 w-8 text-primary" />
              <div className="font-semibold leading-tight">{label}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
