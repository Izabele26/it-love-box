import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { db, type Equipamento } from "@/lib/db";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({ meta: [{ title: "Equipamentos" }] }),
  component: Page,
});

const STATUS = ["disponivel", "em_uso", "manutencao", "baixado"];

function Page() {
  const [rows, setRows] = useState<Equipamento[]>([]);
  const [editing, setEditing] = useState<Equipamento | null>(null);
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
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Equipamentos</h2>
      <Card className="p-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Patrimônio</Label>
            <Input value={form.patrimonio} onChange={(e) => setForm({ ...form, patrimonio: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Notebook, Monitor..." />
          </div>
          <div className="space-y-1">
            <Label>Marca</Label>
            <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Modelo</Label>
            <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            {editing && <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>}
          </div>
        </form>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum equipamento cadastrado</TableCell></TableRow>
            )}
            {rows.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell>{eq.patrimonio}</TableCell>
                <TableCell>{eq.tipo}</TableCell>
                <TableCell>{eq.marca}</TableCell>
                <TableCell>{eq.modelo}</TableCell>
                <TableCell>{eq.status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => edit(eq)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(eq.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
