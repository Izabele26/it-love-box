import { createFileRoute } from "@tanstack/react-router";
import { Activity, ClipboardCheck, Laptop, PackageCheck, RotateCcw, Users, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db, type Inspecao, type Movimentacao } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard" }] }),
  component: DashboardPage,
});

type DashboardStats = {
  totalEquipamentos: number;
  emUso: number;
  disponiveis: number;
  manutencao: number;
  colaboradores: number;
  inspecoesPendentes: number;
};

type TimelineItem = {
  id: string;
  type: "entrega" | "devolucao" | "inspecao";
  date: string;
  title: string;
  description: string;
};

const EMPTY_STATS: DashboardStats = {
  totalEquipamentos: 0,
  emUso: 0,
  disponiveis: 0,
  manutencao: 0,
  colaboradores: 0,
  inspecoesPendentes: 0,
};

function numberOrZero(value: number | null | undefined) {
  return value ?? 0;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [
        totalEquipamentos,
        emUso,
        disponiveis,
        manutencao,
        colaboradores,
        inspecoesPendentes,
        ultimasMovimentacoes,
        ultimasInspecoes,
      ] = await Promise.all([
        db.from("equipamentos").select("id", { count: "exact", head: true }),
        db.from("equipamentos").select("id", { count: "exact", head: true }).eq("status", "em_uso"),
        db.from("equipamentos").select("id", { count: "exact", head: true }).eq("status", "disponivel"),
        db.from("equipamentos").select("id", { count: "exact", head: true }).eq("status", "manutencao"),
        db.from("colaboradores").select("id", { count: "exact", head: true }),
        db.from("inspecoes").select("id", { count: "exact", head: true }).not("problema_identificado", "is", null),
        db.from("movimentacoes").select("*, colaboradores(*), equipamentos(*)").order("data", { ascending: false }).limit(6),
        db.from("inspecoes").select("*").order("data_inspecao", { ascending: false }).limit(4),
      ]);

      const firstError = [
        totalEquipamentos,
        emUso,
        disponiveis,
        manutencao,
        colaboradores,
        inspecoesPendentes,
        ultimasMovimentacoes,
        ultimasInspecoes,
      ].find((result) => result.error)?.error;
      if (firstError) throw firstError;

      setStats({
        totalEquipamentos: numberOrZero(totalEquipamentos.count),
        emUso: numberOrZero(emUso.count),
        disponiveis: numberOrZero(disponiveis.count),
        manutencao: numberOrZero(manutencao.count),
        colaboradores: numberOrZero(colaboradores.count),
        inspecoesPendentes: numberOrZero(inspecoesPendentes.count),
      });
      setMovimentacoes(ultimasMovimentacoes.data ?? []);
      setInspecoes(ultimasInspecoes.data ?? []);
    } catch (error: any) {
      toast.error(error.message ?? "Erro ao carregar dashboard");
      setStats(EMPTY_STATS);
      setMovimentacoes([]);
      setInspecoes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const latestItems = useMemo<TimelineItem[]>(() => {
    const movimentoItems = movimentacoes.map((movimento) => {
      const patrimonio = movimento.equipamentos?.patrimonio ?? "Equipamento";
      const modelo = movimento.equipamentos?.modelo ?? "";
      const colaborador = movimento.colaboradores?.nome ?? "colaborador";
      const isEntrega = movimento.tipo === "entrega";
      return {
        id: movimento.id,
        type: movimento.tipo,
        date: movimento.data,
        title: isEntrega ? "Entrega" : "Devolução",
        description: isEntrega
          ? `${modelo || "Equipamento"} ${patrimonio} entregue para ${colaborador}`
          : `${modelo || "Equipamento"} ${patrimonio} devolvido`,
      };
    });

    const inspecaoItems = inspecoes.map((inspecao) => ({
      id: inspecao.id,
      type: "inspecao" as const,
      date: inspecao.data_inspecao,
      title: "Inspeção",
      description: `Inspeção realizada no setor ${inspecao.setor}`,
    }));

    return [...movimentoItems, ...inspecaoItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [movimentacoes, inspecoes]);

  const cards = [
    { label: "Total de Equipamentos", value: stats.totalEquipamentos, icon: Laptop },
    { label: "Equipamentos em Uso", value: stats.emUso, icon: PackageCheck },
    { label: "Equipamentos Disponíveis", value: stats.disponiveis, icon: Activity },
    { label: "Equipamentos em Manutenção", value: stats.manutencao, icon: Wrench },
    { label: "Colaboradores Ativos", value: stats.colaboradores, icon: Users },
    { label: "Inspeções Pendentes", value: stats.inspecoesPendentes, icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Visão geral do controle de equipamentos e movimentações de TI.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-3xl font-bold tracking-tight">{loading ? "-" : value}</div>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Últimas Movimentações</h3>
            <p className="text-sm text-muted-foreground">Entregas, devoluções e inspeções mais recentes.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : latestItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            latestItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.type === "entrega" ? "default" : item.type === "devolucao" ? "secondary" : "outline"}>
                      {item.title}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.description}</p>
                </div>
                {item.type === "devolucao" && <RotateCcw className="hidden h-4 w-4 text-muted-foreground sm:block" />}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
