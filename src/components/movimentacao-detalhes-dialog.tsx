import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { criarAcessorioEntrega, db, listarAcessoriosPorEntrega, type EntregaAcessorio, type HistoricoEvento, type Movimentacao } from "@/lib/db";
import { toast } from "sonner";

type MovimentacaoDetalhesDialogProps = {
  movimento: Movimentacao | null;
  onClose: () => void;
  titulo: string;
  colaboradorLabel: string;
  dataLabel: string;
  responsavelLabel: string;
  observacoesLabel: string;
  acessoriosLabel: string;
  condicaoLabel?: string;
};

const STATUS_ACESSORIO = ["Entregue", "Devolvido", "Danificado", "Extraviado", "Em manutenção"];
const ACESSORIO_FORM_INICIAL = { nome: "", tipo: "", marca: "", modelo: "", status: "Entregue", observacao: "" };

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value || "-"}</div>
    </div>
  );
}

function eventoLabel(tipo: string) {
  const map: Record<string, string> = {
    cadastro: "Cadastro",
    entrega: "Entrega",
    devolucao: "Devolução",
    inspecao: "Inspeção técnica",
    problema_identificado: "Problema identificado",
    problema_resolvido: "Problema resolvido",
    mudanca_responsavel: "Mudança de responsável",
    mudanca_setor: "Mudança de setor",
    manutencao_entrada: "Entrada em manutenção",
    manutencao_retorno: "Retorno de manutenção",
    baixa: "Baixa patrimonial",
    descarte: "Descarte",
  };
  return map[tipo] ?? tipo;
}

export function MovimentacaoDetalhesDialog({
  movimento,
  onClose,
  titulo,
  colaboradorLabel,
  dataLabel,
  responsavelLabel,
  observacoesLabel,
  acessoriosLabel,
  condicaoLabel,
}: MovimentacaoDetalhesDialogProps) {
  const [hist, setHist] = useState<HistoricoEvento[]>([]);
  const [acessorios, setAcessorios] = useState<EntregaAcessorio[]>([]);
  const [formAcessorio, setFormAcessorio] = useState(ACESSORIO_FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [loadingAcessorios, setLoadingAcessorios] = useState(false);
  const [showAcessorioForm, setShowAcessorioForm] = useState(false);
  const [savingAcessorio, setSavingAcessorio] = useState(false);

  useEffect(() => {
    if (!movimento?.equipamento_id) return;
    setFormAcessorio(ACESSORIO_FORM_INICIAL);
    setShowAcessorioForm(false);
    setLoading(true);
    db.from("historico_equipamentos")
      .select("*")
      .eq("equipamento_id", movimento.equipamento_id)
      .order("criado_em", { ascending: true })
      .then(({ data, error }: any) => {
        if (error) toast.error(error.message);
        setHist(data ?? []);
        setLoading(false);
      });
    if (movimento.tipo === "entrega") {
      loadAcessorios(movimento.id);
    }
  }, [movimento?.equipamento_id, movimento?.id, movimento?.tipo]);

  async function loadAcessorios(entregaId: string) {
    setLoadingAcessorios(true);
    try {
      setAcessorios(await listarAcessoriosPorEntrega(entregaId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingAcessorios(false);
    }
  }

  async function saveAcessorio(e: React.FormEvent) {
    e.preventDefault();
    if (!movimento?.id) return;
    if (!formAcessorio.nome || !formAcessorio.tipo || !formAcessorio.status) {
      return toast.error("Preencha nome, tipo e status");
    }

    setSavingAcessorio(true);
    try {
      await criarAcessorioEntrega({
        entrega_id: movimento.id,
        nome: formAcessorio.nome,
        tipo: formAcessorio.tipo,
        marca: formAcessorio.marca || null,
        modelo: formAcessorio.modelo || null,
        status: formAcessorio.status,
        observacao: formAcessorio.observacao || null,
      });
      toast.success("Acessório cadastrado");
      setFormAcessorio(ACESSORIO_FORM_INICIAL);
      setShowAcessorioForm(false);
      await loadAcessorios(movimento.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingAcessorio(false);
    }
  }

  const equipamento = movimento?.equipamentos;
  const colaborador = movimento?.colaboradores;
  const equipamentoNome = equipamento ? `${equipamento.tipo} ${equipamento.modelo}` : "-";
  const dialogTitle = movimento
    ? `${titulo} - ${equipamento?.patrimonio ?? "-"}`
    : titulo;
  const showAcessorios = movimento?.tipo === "entrega";

  return (
    <Dialog open={!!movimento} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg pr-6">{dialogTitle}</DialogTitle>
        </DialogHeader>
        {movimento && (
          <Tabs defaultValue="dados">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max justify-start">
                <TabsTrigger value="dados" className="h-9">Dados</TabsTrigger>
                <TabsTrigger value="historico" className="h-9">Histórico</TabsTrigger>
                <TabsTrigger value="timeline" className="h-9">Linha do tempo</TabsTrigger>
                {showAcessorios && <TabsTrigger value="acessorios" className="h-9">Acessórios</TabsTrigger>}
              </TabsList>
            </div>

            <TabsContent value="dados" className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Equipamento" value={equipamentoNome} />
                <InfoItem label="Patrimônio" value={equipamento?.patrimonio} />
                <InfoItem label={colaboradorLabel} value={colaborador?.nome} />
                <InfoItem label="Setor" value={colaborador?.setor} />
                <InfoItem label={dataLabel} value={new Date(movimento.data).toLocaleDateString("pt-BR")} />
                <InfoItem label={responsavelLabel} />
                {condicaoLabel && <InfoItem label={condicaoLabel} />}
                <InfoItem label={observacoesLabel} />
              </div>
            </TabsContent>

            <TabsContent value="historico" className="pt-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-6">Carregando...</p>
              ) : hist.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Sem eventos registrados</p>
              ) : (
                <ol className="relative border-l-2 border-border ml-3 space-y-4">
                  {hist.map((h) => (
                    <li key={h.id} className="ml-4">
                      <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary" />
                      <div className="text-xs text-muted-foreground">
                        {new Date(h.criado_em).toLocaleString("pt-BR")}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge variant="secondary">{eventoLabel(h.tipo_evento)}</Badge>
                        {h.responsavel && <span className="text-sm text-muted-foreground">{h.responsavel}</span>}
                      </div>
                      {h.descricao && <div className="text-sm mt-1">{h.descricao}</div>}
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="pt-4">
              <Card className="p-6 text-center text-muted-foreground">Sem eventos de timeline específicos para este registro</Card>
            </TabsContent>

            {showAcessorios && (
              <TabsContent value="acessorios" className="space-y-4 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold">{acessoriosLabel}</h3>
                  <Button type="button" onClick={() => setShowAcessorioForm((current) => !current)}>
                    + Acessório
                  </Button>
                </div>

                {showAcessorioForm && (
                  <Card className="p-4">
                    <form onSubmit={saveAcessorio} className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Nome</Label>
                        <Input value={formAcessorio.nome} onChange={(e) => setFormAcessorio({ ...formAcessorio, nome: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Tipo</Label>
                        <Input value={formAcessorio.tipo} onChange={(e) => setFormAcessorio({ ...formAcessorio, tipo: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Marca</Label>
                        <Input value={formAcessorio.marca} onChange={(e) => setFormAcessorio({ ...formAcessorio, marca: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Modelo</Label>
                        <Input value={formAcessorio.modelo} onChange={(e) => setFormAcessorio({ ...formAcessorio, modelo: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={formAcessorio.status} onValueChange={(status) => setFormAcessorio({ ...formAcessorio, status })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_ACESSORIO.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Observação</Label>
                        <Textarea value={formAcessorio.observacao} onChange={(e) => setFormAcessorio({ ...formAcessorio, observacao: e.target.value })} />
                      </div>
                      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormAcessorio(ACESSORIO_FORM_INICIAL);
                            setShowAcessorioForm(false);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={savingAcessorio}>
                          {savingAcessorio ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {loadingAcessorios ? (
                  <Card className="p-6 text-center text-muted-foreground">Carregando...</Card>
                ) : acessorios.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">Nenhum acessório cadastrado.</Card>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {acessorios.map((item) => (
                      <Card key={item.id} className="p-4 space-y-3">
                        <div>
                          <div className="font-semibold">{item.nome}</div>
                          <div className="text-sm text-muted-foreground">{item.tipo}</div>
                        </div>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <InfoItem label="Marca" value={item.marca} />
                          <InfoItem label="Modelo" value={item.modelo} />
                          <InfoItem label="Status" value={item.status} />
                        </div>
                        {item.observacao && (
                          <div className="text-sm text-muted-foreground">{item.observacao}</div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
