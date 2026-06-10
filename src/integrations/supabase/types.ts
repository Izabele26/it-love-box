export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      colaboradores: {
        Row: {
          created_at: string
          id: string
          matricula: string
          nome: string
          setor: string
        }
        Insert: {
          created_at?: string
          id?: string
          matricula: string
          nome: string
          setor: string
        }
        Update: {
          created_at?: string
          id?: string
          matricula?: string
          nome?: string
          setor?: string
        }
        Relationships: []
      }
      equipamentos: {
        Row: {
          created_at: string
          id: string
          marca: string
          modelo: string
          patrimonio: string
          setor_id: string | null
          status: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          marca: string
          modelo: string
          patrimonio: string
          setor_id?: string | null
          status?: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          marca?: string
          modelo?: string
          patrimonio?: string
          setor_id?: string | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipamentos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_equipamentos: {
        Row: {
          criado_em: string
          descricao: string | null
          equipamento_id: string
          id: string
          responsavel: string | null
          tipo_evento: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          equipamento_id: string
          id?: string
          responsavel?: string | null
          tipo_evento: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          equipamento_id?: string
          id?: string
          responsavel?: string | null
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_equipamentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      inspecoes: {
        Row: {
          checklist: Json
          criado_em: string
          data_inspecao: string
          equipamento_id: string | null
          hora_inspecao: string
          id: string
          observacoes: string | null
          patrimonio: string | null
          problema_identificado: string | null
          quantidade_vistoriados: number
          responsavel_setor: string
          setor: string
          tecnico_responsavel: string
          tipo_equipamento: string | null
        }
        Insert: {
          checklist?: Json
          criado_em?: string
          data_inspecao: string
          equipamento_id?: string | null
          hora_inspecao: string
          id?: string
          observacoes?: string | null
          patrimonio?: string | null
          problema_identificado?: string | null
          quantidade_vistoriados?: number
          responsavel_setor: string
          setor: string
          tecnico_responsavel: string
          tipo_equipamento?: string | null
        }
        Update: {
          checklist?: Json
          criado_em?: string
          data_inspecao?: string
          equipamento_id?: string | null
          hora_inspecao?: string
          id?: string
          observacoes?: string | null
          patrimonio?: string | null
          problema_identificado?: string | null
          quantidade_vistoriados?: number
          responsavel_setor?: string
          setor?: string
          tecnico_responsavel?: string
          tipo_equipamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspecoes_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes: {
        Row: {
          colaborador_id: string
          created_at: string
          data: string
          equipamento_id: string
          id: string
          tipo: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          data: string
          equipamento_id: string
          id?: string
          tipo: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          data?: string
          equipamento_id?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
