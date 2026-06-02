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

export const Route = createFileRoute("/devolucoes")({
  head: () => ({ meta: [{ title: "Devoluções" }] }),
  component: Page,
});

function Page() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [rows, setRows] = useState<Movimentacao[]>([]);
  const [form, setForm] = useState({ colaborador_id: "", equipamento_id: "", data: new Date().toISOString().slice(0, 10) });

  async function load() {
    const [c, e, m] = await Promise.all([
      db.from("colaboradores").select("*").order("nome"),
      db.from("equipamentos").select("*").order("patrimonio"),
      db.from("movimentacoes").select("*, colaboradores(*), equipamentos(*)").eq("tipo", "devolucao").order("data", { ascending: false }),
    ]);
    if (c.error || e.error || m.error) return toast.error("Erro ao carregar dados");
    setColaboradores(c.data ?? []);
    setEquipamentos(e.data ?? []);
    setRows(m.data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.colaborador_id || !form.equipamento_id || !form.data) return toast.error("Preencha todos os campos");
    const { error } = await db.from("movimentacoes").insert({ ...form, tipo: "devolucao" });
    if (error) return toast.error(error.message);
    await db.from("equipamentos").update({ status: "disponivel" }).eq("id", form.equipamento_id);
    toast.success("Devolução registrada");
    setForm({ colaborador_id: "", equipamento_id: "", data: new Date().toISOString().slice(0, 10) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir devolução?")) return;
    const { error } = await db.from("movimentacoes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Devoluções</h2>
      <Card className="p-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Colaborador</Label>
            <Select value={form.colaborador_id} onValueChange={(v) => setForm({ ...form, colaborador_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} ({c.matricula})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Equipamento</Label>
            <Select value={form.equipamento_id} onValueChange={(v) => setForm({ ...form, equipamento_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {equipamentos.map((e) => <SelectItem key={e.id} value={e.id}>{e.patrimonio} - {e.tipo} {e.modelo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Data de devolução</Label>
            <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit">Registrar devolução</Button>
          </div>
        </form>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma devolução registrada</TableCell></TableRow>
            )}
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{m.colaboradores?.nome ?? "-"}</TableCell>
                <TableCell>{m.equipamentos ? `${m.equipamentos.patrimonio} - ${m.equipamentos.modelo}` : "-"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="destructive" onClick={() => remove(m.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
