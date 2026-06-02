import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { db, type Colaborador } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Colaboradores" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<Colaborador[]>([]);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [form, setForm] = useState({ nome: "", matricula: "", setor: "" });

  async function load() {
    const { data, error } = await db.from("colaboradores").select("*").order("nome");
    if (error) return toast.error(error.message);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setEditing(null);
    setForm({ nome: "", matricula: "", setor: "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.matricula || !form.setor) return toast.error("Preencha todos os campos");
    if (editing) {
      const { error } = await db.from("colaboradores").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Colaborador atualizado");
    } else {
      const { error } = await db.from("colaboradores").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Colaborador cadastrado");
    }
    reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir colaborador?")) return;
    const { error } = await db.from("colaboradores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  }

  function edit(c: Colaborador) {
    setEditing(c);
    setForm({ nome: c.nome, matricula: c.matricula, setor: c.setor });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Colaboradores</h2>
      <Card className="p-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Matrícula</Label>
            <Input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Setor</Label>
            <Input value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
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
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="w-40 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum colaborador cadastrado</TableCell></TableRow>
            )}
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.nome}</TableCell>
                <TableCell>{c.matricula}</TableCell>
                <TableCell>{c.setor}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => edit(c)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
