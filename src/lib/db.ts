import { supabase } from "@/integrations/supabase/client";

export type Colaborador = {
  id: string;
  nome: string;
  matricula: string;
  setor: string;
};

export type Equipamento = {
  id: string;
  patrimonio: string;
  tipo: string;
  marca: string;
  modelo: string;
  status: string;
};

export type EquipamentoItem = {
  id: string;
  equipamento_id: string;
  nome: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  status: string;
  observacao: string | null;
  created_at: string;
};

export type CriarEquipamentoItem = {
  equipamento_id: string;
  nome: string;
  tipo: string;
  marca?: string | null;
  modelo?: string | null;
  status?: string;
  observacao?: string | null;
};

export type EditarEquipamentoItem = Partial<Omit<CriarEquipamentoItem, "equipamento_id">> & {
  equipamento_id?: string;
};

export type EntregaAcessorio = {
  id: string;
  entrega_id: string;
  nome: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  status: string;
  observacao: string | null;
  created_at: string;
};

export type CriarEntregaAcessorio = {
  entrega_id: string;
  nome: string;
  tipo: string;
  marca?: string | null;
  modelo?: string | null;
  status?: string;
  observacao?: string | null;
};

export type Movimentacao = {
  id: string;
  colaborador_id: string;
  equipamento_id: string;
  tipo: "entrega" | "devolucao";
  data: string;
  colaboradores?: Colaborador;
  equipamentos?: Equipamento;
};

export type HistoricoEvento = {
  id: string;
  equipamento_id: string;
  tipo_evento: string;
  descricao: string | null;
  responsavel: string | null;
  criado_em: string;
};

export type Inspecao = {
  id: string;
  equipamento_id: string | null;
  setor: string;
  responsavel_setor: string;
  tecnico_responsavel: string;
  data_inspecao: string;
  hora_inspecao: string;
  quantidade_vistoriados: number;
  patrimonio: string | null;
  tipo_equipamento: string | null;
  problema_identificado: string | null;
  observacoes: string | null;
  checklist: Record<string, any>;
  criado_em: string;
};

export const db = supabase as any;

export async function listarItensPorEquipamento(equipamentoId: string): Promise<EquipamentoItem[]> {
  const { data, error } = await db
    .from("equipamento_itens")
    .select("*")
    .eq("equipamento_id", equipamentoId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function criarItem(dados: CriarEquipamentoItem): Promise<EquipamentoItem> {
  const { data, error } = await db
    .from("equipamento_itens")
    .insert(dados)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function editarItem(id: string, dados: EditarEquipamentoItem): Promise<EquipamentoItem> {
  const { data, error } = await db
    .from("equipamento_itens")
    .update(dados)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function excluirItem(id: string): Promise<void> {
  const { error } = await db.from("equipamento_itens").delete().eq("id", id);

  if (error) throw error;
}

export async function listarAcessoriosPorEntrega(entregaId: string): Promise<EntregaAcessorio[]> {
  const { data, error } = await db
    .schema("public")
    .from("entrega_acessorios")
    .select("*")
    .eq("entrega_id", entregaId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function criarAcessorioEntrega(dados: CriarEntregaAcessorio): Promise<EntregaAcessorio> {
  const { data, error } = await db
    .schema("public")
    .from("entrega_acessorios")
    .insert(dados)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
