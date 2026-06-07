import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { db, type Equipamento, type HistoricoEvento } from "@/lib/db";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({ meta: [{ title: "Equipamentos" }] }),
  component: Page,
});

const STATUS = ["disponivel", "em_uso", "manutencao", "baixado"];

function DetalhesDialog({ equipamento, onClose }: { equipamento: Equipamento | null; onClose: () => void }) {
  const [hist, setHist] = useState<HistoricoEvento[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!equipamento) return;
    setLoading(true);
    db.from("historico_equipamentos")
      .select("*")
      .eq("equipamento_id", equipamento.id)
      .order("criado_em", { ascending: true })
      .then(({ data, error }: any) => {
        if (error) toast.error(error.message);
        setHist(data ?? []);
        setLoading(false);
      });
  }, [equipamento]);

  const eventoLabel = (t: string) => {
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
    return map[t] ?? t;
  };

  return (
    <Dialog open={!!equipamento} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg pr-6">{equipamento ? `${equipamento.patrimonio} — ${equipamento.modelo}` : ""}</DialogTitle>
        </DialogHeader>
        {equipamento && (
          <Tabs defaultValue="dados">
            <TabsList className="w-full">
              <TabsTrigger value="dados" className="flex-1">Dados</TabsTrigger>
              <TabsTrigger value="historico" className="flex-1">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="dados" className="space-y-2 pt-4 text-sm">
              <div><span className="text-muted-foreground">Patrimônio:</span> {equipamento.patrimonio}</div>
              <div><span className="text-muted-foreground">Tipo:</span> {equipamento.tipo}</div>
              <div><span className="text-muted-foreground">Marca:</span> {equipamento.marca}</div>
              <div><span className="text-muted-foreground">Modelo:</span> {equipamento.modelo}</div>
              <div><span className="text-muted-foreground">Status:</span> {equipamento.status}</div>
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
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Page() {
  const [rows, setRows] = useState<Equipamento[]>([]);
  const [editing, setEditing] = useState<Equipamento | null>(null);
  const [detalhes, setDetalhes] = useState<Equipamento | null>(null);
  const [form, setForm] = useState({ patrimonio: "", tipo: "", marca: "", modelo: "", status: "disponivel" });

  async function load() {
    const { data, error } = await db.from("equipamentos").select("*").order("patrimonio");
    if (error) return toast.error(error.message);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setEditing(null);
    setForm({ patrimonio: "", tipo: "", marca: "", modelo: "", status: "disponivel" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patrimonio || !form.tipo || !form.marca || !form.modelo) return toast.error("Preencha todos os campos");
    if (editing) {
      const { error } = await db.from("equipamentos").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Equipamento atualizado");
    } else {
      const { error } = await db.from("equipamentos").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Equipamento cadastrado");
    }
    reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir equipamento?")) return;
    const { error } = await db.from("equipamentos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  function edit(e: Equipamento) {
    setEditing(e);
    setForm({ patrimonio: e.patrimonio, tipo: e.tipo, marca: e.marca, modelo: e.modelo, status: e.status });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "em_uso") return "default";
    if (s === "manutencao") return "destructive";
    if (s === "baixado") return "outline";
    return "secondary";
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Equipamentos</h2>
      <Card className="p-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Patrimônio</Label>
            <Input className="h-12 md:h-10 text-base" value={form.patrimonio} onChange={(e) => setForm({ ...form, patrimonio: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Input className="h-12 md:h-10 text-base" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Notebook, Monitor..." />
          </div>
          <div className="space-y-1.5">
            <Label>Marca</Label>
            <Input className="h-12 md:h-10 text-base" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Input className="h-12 md:h-10 text-base" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="h-12 md:h-10 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-2">
            <Button type="submit" className="h-12 md:h-10 w-full md:w-auto text-base">{editing ? "Salvar" : "Cadastrar"}</Button>
            {editing && <Button type="button" variant="outline" className="h-12 md:h-10 w-full md:w-auto" onClick={reset}>Cancelar</Button>}
          </div>
        </form>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum equipamento cadastrado</p>}
        {rows.map((eq) => (
          <Card key={eq.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <Link
                    to="/equipamentos/$equipamentoId"
                    params={{ equipamentoId: eq.id }}
                    className="min-w-0 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {eq.patrimonio}
                  </Link>
                  <Badge variant={statusVariant(eq.status)} className="shrink-0">{eq.status}</Badge>
                </div>
                <div className="text-sm">{eq.tipo} - {eq.marca}</div>
                <div className="text-sm text-muted-foreground">{eq.modelo}</div>
              </div>
              <Button size="lg" variant="secondary" className="ml-auto h-11 shrink-0" onClick={() => setDetalhes(eq)}>Detalhes</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button size="lg" variant="outline" className="h-11" onClick={() => edit(eq)}>Editar</Button>
              <Button size="lg" variant="destructive" className="h-11" onClick={() => remove(eq.id)}>Excluir</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-56 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum equipamento cadastrado</TableCell></TableRow>
            )}
            {rows.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell>
                  <Link
                    to="/equipamentos/$equipamentoId"
                    params={{ equipamentoId: eq.id }}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {eq.patrimonio}
                  </Link>
                </TableCell>
                <TableCell>{eq.tipo}</TableCell>
                <TableCell>{eq.marca}</TableCell>
                <TableCell>{eq.modelo}</TableCell>
                <TableCell>{eq.status}</TableCell>
                <TableCell className="text-right whitespace-nowrap space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setDetalhes(eq)}>Detalhes</Button>
                  <Button size="sm" variant="outline" onClick={() => edit(eq)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(eq.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DetalhesDialog equipamento={detalhes} onClose={() => setDetalhes(null)} />
    </div>
  );
}
