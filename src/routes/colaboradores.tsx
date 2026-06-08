import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { db, type Colaborador } from "@/lib/db";

export const Route = createFileRoute("/colaboradores")({
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Colaboradores</h2>
      <Card className="p-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input className="h-12 md:h-10 text-base" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Matrícula</Label>
            <Input className="h-12 md:h-10 text-base" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Setor</Label>
            <Input className="h-12 md:h-10 text-base" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-2">
            <Button type="submit" className="h-12 md:h-10 w-full md:w-auto text-base">{editing ? "Salvar" : "Cadastrar"}</Button>
            {editing && <Button type="button" variant="outline" className="h-12 md:h-10 w-full md:w-auto" onClick={reset}>Cancelar</Button>}
          </div>
        </form>
      </Card>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {rows.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum colaborador cadastrado</p>}
        {rows.map((c) => (
          <Card key={c.id} className="p-4 space-y-2">
            <div className="font-semibold text-base">{c.nome}</div>
            <div className="text-sm text-muted-foreground">Matrícula: {c.matricula}</div>
            <div className="text-sm text-muted-foreground">Setor: {c.setor}</div>
            <div className="flex gap-2 pt-1">
              <Button size="lg" variant="outline" className="flex-1 h-11" onClick={() => edit(c)}>Editar</Button>
              <Button size="lg" variant="destructive" className="flex-1 h-11" onClick={() => remove(c.id)}>Excluir</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
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
