import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { db, type Equipamento, type Inspecao } from "@/lib/db";

export const Route = createFileRoute("/inspecoes")({
  head: () => ({ meta: [{ title: "Inspeções Técnicas" }] }),
  component: Page,
});

// Checklist structure
const CHECKLIST_GROUPS: { key: string; label: string; items: { key: string; label: string }[]; obsKey?: string }[] = [
  {
    key: "estado_fisico", label: "Estado Físico", obsKey: "estado_fisico_obs",
    items: [
      { key: "limpo", label: "Equipamento limpo" },
      { key: "identificado", label: "Equipamento identificado" },
      { key: "patrimonio_legivel", label: "Patrimônio legível" },
      { key: "danos_fisicos", label: "Possui danos físicos" },
      { key: "pecas_faltando", label: "Possui peças faltando" },
      { key: "boas_condicoes", label: "Equipamento em boas condições" },
    ],
  },
  {
    key: "organizacao", label: "Organização", obsKey: "organizacao_obs",
    items: [
      { key: "cabos_organizados", label: "Cabos organizados" },
      { key: "cabos_identificados", label: "Cabos identificados" },
      { key: "tomadas_ok", label: "Tomadas em bom estado" },
      { key: "ambiente_organizado", label: "Ambiente organizado" },
      { key: "temperatura_ok", label: "Temperatura adequada" },
      { key: "ventilacao_ok", label: "Ventilação adequada" },
    ],
  },
  {
    key: "infra", label: "Infraestrutura", obsKey: "infra_obs",
    items: [
      { key: "ap_ligado", label: "Access Point ligado" },
      { key: "ap_funcionando", label: "Access Point funcionando corretamente" },
      { key: "ap_sinal", label: "Access Point sinal adequado" },
      { key: "switch_ligado", label: "Switch ligado" },
      { key: "switch_funcionando", label: "Switch funcionando corretamente" },
      { key: "switch_portas_ok", label: "Switch sem portas com defeito" },
      { key: "rack_limpo", label: "Rack limpo" },
      { key: "rack_organizado", label: "Rack organizado" },
      { key: "rack_cabeamento", label: "Cabeamento identificado" },
      { key: "internet_ok", label: "Internet funcionando" },
      { key: "conectividade_ok", label: "Conectividade estável" },
      { key: "adaptador_rede_ok", label: "Adaptador de rede funcionando" },
      { key: "cabo_rede_ok", label: "Cabo de rede em bom estado" },
    ],
  },
  {
    key: "hardware", label: "Hardware",
    items: [
      { key: "bateria_ok", label: "Bateria funcionando" },
      { key: "carregador_ok", label: "Carregador funcionando" },
      { key: "tela_ok", label: "Tela sem defeitos" },
      { key: "teclado_ok", label: "Teclado funcionando" },
      { key: "mouse_ok", label: "Mouse funcionando" },
      { key: "impressora_ok", label: "Impressora acessível" },
      { key: "cabo_rede_func", label: "Cabo de rede funcionando" },
      { key: "porta_rede_ok", label: "Porta de rede funcionando" },
      { key: "porta_carregador_ok", label: "Porta do carregador funcionando" },
    ],
  },
  {
    key: "so", label: "Sistema Operacional",
    items: [
      { key: "windows_ok", label: "Windows funcionando corretamente" },
      { key: "atualizacoes_pendentes", label: "Atualizações pendentes" },
      { key: "drivers_atualizados", label: "Drivers atualizados" },
      { key: "lentidao", label: "Computador apresenta lentidão" },
    ],
  },
  {
    key: "apps", label: "Aplicativos",
    items: [
      { key: "apps_corp_ok", label: "Aplicativos corporativos funcionando" },
      { key: "antivirus_ok", label: "Antivírus ativo" },
      { key: "senha_ok", label: "Senha configurada" },
      { key: "restauracao_ok", label: "Ponto de restauração ativo" },
    ],
  },
  {
    key: "feedback", label: "Feedback do Usuário", obsKey: "feedback_obs",
    items: [
      { key: "relata_lentidao", label: "Relata lentidão" },
      { key: "relata_travamentos", label: "Relata travamentos" },
      { key: "relata_falhas", label: "Relata falhas" },
      { key: "relata_rede", label: "Relata problemas de rede" },
      { key: "mau_uso", label: "Houve mau uso do equipamento" },
    ],
  },
  {
    key: "smartphone", label: "Smartphone",
    items: [
      { key: "sp_identificado", label: "Equipamento identificado" },
      { key: "sp_patrimonio", label: "Patrimônio presente" },
      { key: "sp_whatsapp", label: "WhatsApp funcionando" },
      { key: "sp_apps_corp", label: "Aplicativos corporativos funcionando" },
      { key: "sp_carregador", label: "Carregador presente" },
      { key: "sp_cabo", label: "Cabo presente" },
      { key: "sp_carregando", label: "Equipamento carregando corretamente" },
      { key: "sp_bateria", label: "Bateria em bom estado" },
      { key: "sp_tela", label: "Tela sem danos" },
      { key: "sp_internet", label: "Internet funcionando" },
    ],
  },
];

function SimNao({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
        <RadioGroupItem value="sim" /> Sim
      </label>
      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
        <RadioGroupItem value="nao" /> Não
      </label>
    </RadioGroup>
  );
}

function emptyChecklist(): Record<string, any> {
  const c: Record<string, any> = {};
  CHECKLIST_GROUPS.forEach((g) => {
    g.items.forEach((i) => (c[i.key] = ""));
    if (g.obsKey) c[g.obsKey] = "";
  });
  c.tempo_boot = "";
  c.cpu = "";
  c.ram = "";
  c.restauracao_criado = false;
  c.feedback_usuario = "";
  return c;
}

function pctBadge(v: string) {
  const n = Number(v);
  if (!v || isNaN(n)) return null;
  const atencao = n > 80;
  return (
    <Badge variant={atencao ? "destructive" : "secondary"}>
      {atencao ? "Atenção" : "Normal"}
    </Badge>
  );
}

function Page() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [rows, setRows] = useState<Inspecao[]>([]);
  const [open, setOpen] = useState(false);
  const [detalhes, setDetalhes] = useState<Inspecao | null>(null);
  const now = new Date();
  const initial = {
    equipamento_id: "",
    setor: "",
    responsavel_setor: "",
    tecnico_responsavel: "",
    data_inspecao: now.toISOString().slice(0, 10),
    hora_inspecao: now.toTimeString().slice(0, 5),
    quantidade_vistoriados: 1,
    patrimonio: "",
    tipo_equipamento: "",
    problema_identificado: "",
    observacoes: "",
  };
  const [form, setForm] = useState(initial);
  const [checklist, setChecklist] = useState<Record<string, any>>(emptyChecklist());

  async function load() {
    const [e, i] = await Promise.all([
      db.from("equipamentos").select("*").order("patrimonio"),
      db.from("inspecoes").select("*").order("data_inspecao", { ascending: false }),
    ]);
    if (e.error || i.error) return toast.error("Erro ao carregar");
    setEquipamentos(e.data ?? []);
    setRows(i.data ?? []);
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setForm(initial);
    setChecklist(emptyChecklist());
    setOpen(false);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.setor || !form.responsavel_setor || !form.tecnico_responsavel) {
      return toast.error("Preencha os campos obrigatórios");
    }
    const payload = {
      ...form,
      equipamento_id: form.equipamento_id || null,
      quantidade_vistoriados: Number(form.quantidade_vistoriados) || 1,
      checklist,
    };
    const { error } = await db.from("inspecoes").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Inspeção registrada");
    reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir inspeção?")) return;
    const { error } = await db.from("inspecoes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluída");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inspeções Técnicas</h2>
        <Button onClick={() => setOpen(true)}>Nova inspeção</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Problema</TableHead>
              <TableHead className="w-44 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma inspeção registrada</TableCell></TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.data_inspecao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{r.hora_inspecao?.slice(0, 5)}</TableCell>
                <TableCell>{r.setor}</TableCell>
                <TableCell>{r.tecnico_responsavel}</TableCell>
                <TableCell>{r.patrimonio ?? "-"}</TableCell>
                <TableCell className="max-w-xs truncate">{r.problema_identificado ?? "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setDetalhes(r)}>Detalhes</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Inspeção Técnica</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1"><Label>Setor *</Label><Input value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} /></div>
              <div className="space-y-1"><Label>Responsável pelo setor *</Label><Input value={form.responsavel_setor} onChange={(e) => setForm({ ...form, responsavel_setor: e.target.value })} /></div>
              <div className="space-y-1"><Label>Técnico responsável *</Label><Input value={form.tecnico_responsavel} onChange={(e) => setForm({ ...form, tecnico_responsavel: e.target.value })} /></div>
              <div className="space-y-1"><Label>Data</Label><Input type="date" value={form.data_inspecao} onChange={(e) => setForm({ ...form, data_inspecao: e.target.value })} /></div>
              <div className="space-y-1"><Label>Hora</Label><Input type="time" value={form.hora_inspecao} onChange={(e) => setForm({ ...form, hora_inspecao: e.target.value })} /></div>
              <div className="space-y-1"><Label>Qtd. equipamentos vistoriados</Label><Input type="number" min={1} value={form.quantidade_vistoriados} onChange={(e) => setForm({ ...form, quantidade_vistoriados: Number(e.target.value) })} /></div>
              <div className="space-y-1 md:col-span-2">
                <Label>Equipamento cadastrado (opcional)</Label>
                <Select
                  value={form.equipamento_id || "none"}
                  onValueChange={(v) => {
                    if (v === "none") {
                      setForm({ ...form, equipamento_id: "", patrimonio: "", tipo_equipamento: "" });
                    } else {
                      const eq = equipamentos.find((e) => e.id === v);
                      setForm({ ...form, equipamento_id: v, patrimonio: eq?.patrimonio ?? "", tipo_equipamento: eq?.tipo ?? "" });
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Não vincular —</SelectItem>
                    {equipamentos.map((eq) => <SelectItem key={eq.id} value={eq.id}>{eq.patrimonio} - {eq.modelo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Patrimônio</Label><Input value={form.patrimonio} onChange={(e) => setForm({ ...form, patrimonio: e.target.value })} /></div>
              <div className="space-y-1 md:col-span-2"><Label>Tipo do equipamento</Label><Input value={form.tipo_equipamento} onChange={(e) => setForm({ ...form, tipo_equipamento: e.target.value })} /></div>
              <div className="space-y-1 md:col-span-3"><Label>Problema identificado</Label><Textarea value={form.problema_identificado} onChange={(e) => setForm({ ...form, problema_identificado: e.target.value })} /></div>
              <div className="space-y-1 md:col-span-3"><Label>Observações gerais</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            </div>

            <Tabs defaultValue="estado_fisico">
              <TabsList className="flex flex-wrap h-auto">
                {CHECKLIST_GROUPS.map((g) => (
                  <TabsTrigger key={g.key} value={g.key}>{g.label}</TabsTrigger>
                ))}
              </TabsList>
              {CHECKLIST_GROUPS.map((g) => (
                <TabsContent key={g.key} value={g.key} className="space-y-3 pt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {g.items.map((i) => (
                      <div key={i.key} className="flex items-center justify-between border rounded-md p-3">
                        <span className="text-sm">{i.label}</span>
                        <SimNao value={checklist[i.key] ?? ""} onChange={(v) => setChecklist({ ...checklist, [i.key]: v })} />
                      </div>
                    ))}
                  </div>

                  {g.key === "so" && (
                    <div className="grid gap-3 md:grid-cols-3 pt-2">
                      <div className="space-y-1">
                        <Label>Tempo de boot (segundos)</Label>
                        <Input type="number" value={checklist.tempo_boot} onChange={(e) => setChecklist({ ...checklist, tempo_boot: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">Uso médio de CPU (%) {pctBadge(checklist.cpu)}</Label>
                        <Input type="number" min={0} max={100} value={checklist.cpu} onChange={(e) => setChecklist({ ...checklist, cpu: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">Uso médio de RAM (%) {pctBadge(checklist.ram)}</Label>
                        <Input type="number" min={0} max={100} value={checklist.ram} onChange={(e) => setChecklist({ ...checklist, ram: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {g.key === "apps" && checklist.restauracao_ok === "nao" && (
                    <label className="flex items-center gap-2 text-sm pt-2">
                      <input
                        type="checkbox"
                        checked={!!checklist.restauracao_criado}
                        onChange={(e) => setChecklist({ ...checklist, restauracao_criado: e.target.checked })}
                      />
                      Ponto de restauração criado durante inspeção
                    </label>
                  )}

                  {g.key === "feedback" && (
                    <div className="space-y-1 pt-2">
                      <Label>Descrição detalhada do usuário</Label>
                      <Textarea value={checklist.feedback_usuario} onChange={(e) => setChecklist({ ...checklist, feedback_usuario: e.target.value })} />
                    </div>
                  )}

                  {g.obsKey && (
                    <div className="space-y-1 pt-2">
                      <Label>Observações</Label>
                      <Textarea value={checklist[g.obsKey] ?? ""} onChange={(e) => setChecklist({ ...checklist, [g.obsKey!]: e.target.value })} />
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={reset}>Cancelar</Button>
              <Button type="submit">Salvar inspeção</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DetalhesDialog inspecao={detalhes} onClose={() => setDetalhes(null)} />
    </div>
  );
}

function DetalhesDialog({ inspecao, onClose }: { inspecao: Inspecao | null; onClose: () => void }) {
  if (!inspecao) return null;
  const c = inspecao.checklist || {};
  return (
    <Dialog open={!!inspecao} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Inspeção — {new Date(inspecao.data_inspecao).toLocaleDateString("pt-BR")} {inspecao.hora_inspecao?.slice(0, 5)}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div><span className="text-muted-foreground">Setor:</span> {inspecao.setor}</div>
            <div><span className="text-muted-foreground">Resp. setor:</span> {inspecao.responsavel_setor}</div>
            <div><span className="text-muted-foreground">Técnico:</span> {inspecao.tecnico_responsavel}</div>
            <div><span className="text-muted-foreground">Patrimônio:</span> {inspecao.patrimonio ?? "-"}</div>
            <div><span className="text-muted-foreground">Tipo:</span> {inspecao.tipo_equipamento ?? "-"}</div>
            <div><span className="text-muted-foreground">Qtd. vistoriados:</span> {inspecao.quantidade_vistoriados}</div>
          </div>
          {inspecao.problema_identificado && <div><strong>Problema:</strong> {inspecao.problema_identificado}</div>}
          {inspecao.observacoes && <div><strong>Observações:</strong> {inspecao.observacoes}</div>}

          {CHECKLIST_GROUPS.map((g) => {
            const filled = g.items.filter((i) => c[i.key]);
            if (filled.length === 0 && !c[g.obsKey ?? ""]) return null;
            return (
              <div key={g.key} className="border rounded-md p-3">
                <div className="font-medium mb-2">{g.label}</div>
                <div className="grid gap-1 md:grid-cols-2">
                  {filled.map((i) => (
                    <div key={i.key} className="flex justify-between">
                      <span>{i.label}</span>
                      <Badge variant={c[i.key] === "sim" ? "default" : "secondary"}>{c[i.key]}</Badge>
                    </div>
                  ))}
                </div>
                {g.obsKey && c[g.obsKey] && <div className="pt-2 text-muted-foreground">{c[g.obsKey]}</div>}
              </div>
            );
          })}

          {(c.tempo_boot || c.cpu || c.ram) && (
            <div className="border rounded-md p-3">
              <div className="font-medium mb-2">Desempenho</div>
              <div className="grid gap-1 md:grid-cols-3">
                <div>Boot: {c.tempo_boot || "-"}s</div>
                <div>CPU: {c.cpu || "-"}% {pctBadge(c.cpu)}</div>
                <div>RAM: {c.ram || "-"}% {pctBadge(c.ram)}</div>
              </div>
            </div>
          )}

          {c.feedback_usuario && <div><strong>Feedback do usuário:</strong> {c.feedback_usuario}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
