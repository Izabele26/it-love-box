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
  { value: "dados", label: "Dados do equipamento" },
  { value: "historico", label: "Histórico" },
  { value: "linha-do-tempo", label: "Linha do tempo" },
  { value: "manutencoes", label: "Manutenções" },
  { value: "arquivos", label: "Arquivos" },
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
                <Card className="p-6 min-h-32" />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

