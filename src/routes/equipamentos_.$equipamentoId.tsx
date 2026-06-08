import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, type Equipamento } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/equipamentos_/$equipamentoId")({
  head: () => ({ meta: [{ title: "Detalhes do Equipamento" }] }),
  component: Page,
});

const TABS = [
  { value: "dados", label: "Dados" },
  { value: "historico", label: "Histórico" },
  { value: "linha-do-tempo", label: "Linha do Tempo" },
  { value: "acessorios", label: "Acessórios" },
];

const eventosMock = [
  {
    tipo: "Registro do Ativo",
    icone: "📦",
    data: "10/01/2026",
    hora: "08:30",
    responsavel: "Sistema",
    descricao: "Equipamento cadastrado no inventário.",
  },
  {
    tipo: "Entrega",
    icone: "👤",
    data: "12/01/2026",
    hora: "10:00",
    responsavel: "Ana Souza",
    descricao: "Equipamento entregue ao colaborador.",
  },
  {
    tipo: "Transferência",
    icone: "🔄",
    data: "25/01/2026",
    hora: "15:30",
    responsavel: "Equipe de TI",
    descricao: "Equipamento transferido para outro setor.",
  },
  {
    tipo: "Inspeção",
    icone: "🔍",
    data: "20/02/2026",
    hora: "09:15",
    responsavel: "Carlos Silva",
    descricao: "Equipamento vistoriado sem não conformidades.",
  },
  {
    tipo: "Manutenção",
    icone: "🛠",
    data: "10/03/2026",
    hora: "14:00",
    responsavel: "Suporte TI",
    descricao: "Troca preventiva de SSD realizada.",
  },
  {
    tipo: "Incidente",
    icone: "🚨",
    data: "28/03/2026",
    hora: "11:20",
    responsavel: "Usuário final",
    descricao: "Relato de falha intermitente no carregamento.",
  },
  {
    tipo: "Devolução",
    icone: "📥",
    data: "30/04/2026",
    hora: "16:10",
    responsavel: "João Lima",
    descricao: "Equipamento devolvido ao setor de TI.",
  },
  {
    tipo: "Baixa Patrimonial",
    icone: "♻",
    data: "20/07/2026",
    hora: "10:45",
    responsavel: "Gestão de Ativos",
    descricao: "Equipamento marcado como obsoleto para baixa patrimonial.",
  },
];

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "em_uso") return "default";
  if (status === "manutencao") return "destructive";
  if (status === "baixado") return "outline";
  return "secondary";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value || "-"}</div>
    </div>
  );
}

function DadosTab({ equipamento, nomeEquipamento }: { equipamento: Equipamento; nomeEquipamento: string }) {
  return (
    <Card className="p-4 md:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label="Nome do equipamento" value={nomeEquipamento} />
        <InfoItem label="Patrimônio" value={equipamento.patrimonio} />
        <InfoItem label="Tipo" value={equipamento.tipo} />
        <InfoItem label="Marca" value={equipamento.marca} />
        <InfoItem label="Modelo" value={equipamento.modelo} />
        <InfoItem label="Status atual" value={equipamento.status} />
      </div>
    </Card>
  );
}

function TimelineTab() {
  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Linha do Tempo do Ativo</h3>
        <p className="text-sm text-muted-foreground">
          Visualização conceitual do ciclo de vida do equipamento. Nas próximas sprints, estes cards poderão receber eventos reais por tipo_evento.
        </p>
      </div>

      <div className="relative mt-6 md:overflow-x-auto md:pb-4">
        <div className="absolute left-5 top-0 h-full w-px bg-border md:left-0 md:right-0 md:top-1/2 md:h-px md:w-full" />
        <div className="relative space-y-4 md:grid md:min-w-[1120px] md:grid-cols-8 md:gap-4 md:space-y-0">
          {eventosMock.map((evento, index) => (
            <div
              key={`${evento.tipo}-${evento.data}`}
              className={`relative pl-14 md:flex md:min-h-72 md:pl-0 ${index % 2 === 0 ? "md:items-start" : "md:items-end"}`}
            >
              <div className="absolute left-2 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-card text-sm shadow-sm md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                {evento.icone}
              </div>
              <Card className="w-full p-4 shadow-sm md:min-h-40">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-lg">
                    {evento.icone}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div>
                      <div className="font-semibold">{evento.tipo}</div>
                      <div className="text-xs text-muted-foreground">
                        {evento.data} às {evento.hora}
                      </div>
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Responsável</div>
                    <div className="text-sm font-medium">{evento.responsavel}</div>
                    <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TabContent({
  tabValue,
  equipamento,
  nomeEquipamento,
}: {
  tabValue: string;
  equipamento: Equipamento;
  nomeEquipamento: string;
}) {
  if (tabValue === "dados") return <DadosTab equipamento={equipamento} nomeEquipamento={nomeEquipamento} />;
  if (tabValue === "linha-do-tempo") return <TimelineTab />;
  if (tabValue === "historico") return <Card className="p-6 min-h-32 text-sm text-muted-foreground">Histórico do ativo será consolidado a partir dos eventos registrados.</Card>;
  if (tabValue === "acessorios") return <Card className="p-6 min-h-32 text-sm text-muted-foreground">Nenhum acessório vinculado a este equipamento.</Card>;
  return <Card className="p-6 min-h-32" />;
}

function Page() {
  const { equipamentoId } = Route.useParams();
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [loading, setLoading] = useState(true);
  const nomeEquipamento = equipamento
    ? [equipamento.tipo, equipamento.marca, equipamento.modelo].filter(Boolean).join(" ")
    : "";

  useEffect(() => {
    setLoading(true);
    db.from("equipamentos")
      .select("*")
      .eq("id", equipamentoId)
      .single()
      .then(({ data, error }: any) => {
        if (error) {
          toast.error(error.message);
          setEquipamento(null);
        } else {
          setEquipamento(data);
        }
        setLoading(false);
      });
  }, [equipamentoId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
            <Link to="/equipamentos">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">Detalhes do Equipamento</h2>
        </div>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted-foreground">Carregando...</Card>
      ) : !equipamento ? (
        <Card className="p-6 text-center text-muted-foreground">Equipamento não encontrado</Card>
      ) : (
        <>
          <Card className="p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{nomeEquipamento}</h3>
                <p className="text-sm text-muted-foreground">{equipamento.patrimonio}</p>
              </div>
              <Badge variant={statusVariant(equipamento.status)} className="w-fit">
                {equipamento.status}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Nome do equipamento" value={nomeEquipamento} />
              <InfoItem label="Patrimônio" value={equipamento.patrimonio} />
              <InfoItem label="Tipo" value={equipamento.tipo} />
              <InfoItem label="Marca" value={equipamento.marca} />
              <InfoItem label="Modelo" value={equipamento.modelo} />
              <InfoItem label="Status atual" value={equipamento.status} />
            </div>
          </Card>

          <Tabs defaultValue="dados" className="space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max justify-start">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="h-9">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <TabContent tabValue={tab.value} equipamento={equipamento} nomeEquipamento={nomeEquipamento} />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

