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
