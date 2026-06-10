
CREATE TABLE public.setores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.setores TO anon, authenticated;
GRANT ALL ON public.setores TO service_role;

ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public all setores" ON public.setores FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_setores_updated_at
BEFORE UPDATE ON public.setores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.setores (nome) VALUES
  ('TI'),
  ('Administrativo'),
  ('Financeiro'),
  ('Comercial'),
  ('RH'),
  ('Operacional'),
  ('Diretoria'),
  ('Almoxarifado')
ON CONFLICT (nome) DO NOTHING;

ALTER TABLE public.equipamentos
  ADD COLUMN setor_id uuid REFERENCES public.setores(id) ON DELETE SET NULL;

CREATE INDEX idx_equipamentos_setor_id ON public.equipamentos(setor_id);
