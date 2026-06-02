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

export const db = supabase as any;
