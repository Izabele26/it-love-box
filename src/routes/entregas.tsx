import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { db, type Colaborador, type Equipamento, type Movimentacao } from "@/lib/db";
import { MovimentoWizard } from "@/components/movimento-wizard";
import { MovimentacaoDetalhesDialog } from "@/components/movimentacao-detalhes-dialog";

export const Route = createFileRoute("/entregas")({
  head: () => ({ meta: [{ title: "Entregas" }] }),
  component: Page,
});

function Page() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [rows, setRows] = useState<Movimentacao[]>([]);
  const [detalhes, setDetalhes] = useState<Movimentacao | null>(null);
  const [form, setForm] = useState({ colaborador_id: "", equipamento_id: "", data: new Date().toISOString().slice(0, 10) });

  async function load() {
    const [c, e, m] = await Promise.all([
      db.from("colaboradores").select("*").order("nome"),
      db.from("equipamentos").select("*").order("patrimonio"),
      db.from("movimentacoes").select("*, colaboradores(*), equipamentos(*)").eq("tipo", "entrega").order("data", { ascending: false }),
    ]);
    if (c.error || e.error || m.error) return toast.error("Erro ao carregar dados");
    setColaboradores(c.data ?? []);
    setEquipamentos(e.data ?? []);
    setRows(m.data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.colaborador_id || !form.equipamento_id || !form.data) return toast.error("Preencha todos os campos");
    const { error } = await db.from("movimentacoes").insert({ ...form, tipo: "entrega" });
    if (error) return toast.error(error.message);
    await db.from("equipamentos").update({ status: "em_uso" }).eq("id", form.equipamento_id);
    toast.success("Entrega registrada");
    setForm({ colaborador_id: "", equipamento_id: "", data: new Date().toISOString().slice(0, 10) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir entrega?")) return;
    const { error } = await db.from("movimentacoes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Entregas</h2>

      {/* Mobile wizard */}
      <div className="md:hidden">
        <MovimentoWizard
          colaboradores={colaboradores}
          equipamentos={equipamentos}
          value={form}
          onChange={setForm}
          onSubmit={save}
          submitLabel="Registrar entrega"
          dateLabel="Data de entrega"
        />
      </div>

      {/* Desktop form */}
      <Card className="hidden md:block p-4">
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Colaborador</Label>
            <Select value={form.colaborador_id} onValueChange={(v) => setForm({ ...form, colaborador_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} ({c.matricula})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Equipamento</Label>
            <Select value={form.equipamento_id} onValueChange={(v) => setForm({ ...form, equipamento_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {equipamentos.map((e) => <SelectItem key={e.id} value={e.id}>{e.patrimonio} - {e.tipo} {e.modelo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data de entrega</Label>
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit">Registrar entrega</Button>
          </div>
        </form>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma entrega registrada</p>}
        {rows.map((m) => (
          <Card key={m.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs text-muted-foreground">{new Date(m.data).toLocaleDateString("pt-BR")}</div>
                <div className="font-semibold">{m.colaboradores?.nome ?? "-"}</div>
                <div className="text-sm">{m.equipamentos ? `${m.equipamentos.patrimonio} - ${m.equipamentos.modelo}` : "-"}</div>
              </div>
              <Button size="lg" variant="secondary" className="ml-auto h-11 shrink-0" onClick={() => setDetalhes(m)}>Detalhes</Button>
            </div>
            <Button size="lg" variant="destructive" className="h-11 w-full mt-2" onClick={() => remove(m.id)}>Excluir</Button>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead className="w-56 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma entrega registrada</TableCell></TableRow>
            )}
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{m.colaboradores?.nome ?? "-"}</TableCell>
                <TableCell>{m.equipamentos ? `${m.equipamentos.patrimonio} - ${m.equipamentos.modelo}` : "-"}</TableCell>
                <TableCell className="text-right whitespace-nowrap space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setDetalhes(m)}>Detalhes</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(m.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <MovimentacaoDetalhesDialog
        movimento={detalhes}
        onClose={() => setDetalhes(null)}
        titulo="Detalhes da Entrega"
        colaboradorLabel="Colaborador responsável"
        dataLabel="Data da entrega"
        responsavelLabel="Responsável pela entrega"
        observacoesLabel="Observações"
        acessoriosLabel="Acessórios entregues junto ao equipamento"
      />
    </div>
  );
}
