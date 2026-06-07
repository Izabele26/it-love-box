CREATE TABLE public.equipamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id uuid NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL,
  marca text,
  modelo text,
  status text NOT NULL DEFAULT 'ativo',
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipamento_itens_equipamento_id
  ON public.equipamento_itens(equipamento_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_equipamento_itens_updated_at
BEFORE UPDATE ON public.equipamento_itens
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipamento_itens TO anon, authenticated;
GRANT ALL ON public.equipamento_itens TO service_role;

ALTER TABLE public.equipamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all equipamento_itens" ON public.equipamento_itens FOR ALL USING (true) WITH CHECK (true);
