CREATE TABLE public.entrega_acessorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id uuid NOT NULL REFERENCES public.movimentacoes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL,
  marca text,
  modelo text,
  status text NOT NULL DEFAULT 'Entregue',
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entrega_acessorios_entrega_id
  ON public.entrega_acessorios(entrega_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.entrega_acessorios TO anon, authenticated;
GRANT ALL ON public.entrega_acessorios TO service_role;

ALTER TABLE public.entrega_acessorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all entrega_acessorios" ON public.entrega_acessorios FOR ALL USING (true) WITH CHECK (true);
