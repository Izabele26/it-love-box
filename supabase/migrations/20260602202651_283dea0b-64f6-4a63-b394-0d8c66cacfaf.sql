
CREATE TABLE public.inspecoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id uuid REFERENCES public.equipamentos(id) ON DELETE SET NULL,
  setor text NOT NULL,
  responsavel_setor text NOT NULL,
  tecnico_responsavel text NOT NULL,
  data_inspecao date NOT NULL,
  hora_inspecao time NOT NULL,
  quantidade_vistoriados integer NOT NULL DEFAULT 1,
  patrimonio text,
  tipo_equipamento text,
  problema_identificado text,
  observacoes text,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspecoes TO anon, authenticated;
GRANT ALL ON public.inspecoes TO service_role;

ALTER TABLE public.inspecoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all inspecoes" ON public.inspecoes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.historico_equipamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id uuid NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  tipo_evento text NOT NULL,
  descricao text,
  responsavel text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_historico_equipamento ON public.historico_equipamentos(equipamento_id, criado_em DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico_equipamentos TO anon, authenticated;
GRANT ALL ON public.historico_equipamentos TO service_role;

ALTER TABLE public.historico_equipamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all historico" ON public.historico_equipamentos FOR ALL USING (true) WITH CHECK (true);

-- Trigger: cadastro de equipamento
CREATE OR REPLACE FUNCTION public.log_equipamento_cadastro()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao)
  VALUES (NEW.id, 'cadastro', 'Equipamento cadastrado: ' || NEW.patrimonio || ' - ' || NEW.modelo);
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_equipamento_cadastro
AFTER INSERT ON public.equipamentos
FOR EACH ROW EXECUTE FUNCTION public.log_equipamento_cadastro();

-- Trigger: movimentações (entrega/devolução)
CREATE OR REPLACE FUNCTION public.log_movimentacao()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_nome text;
BEGIN
  SELECT nome INTO v_nome FROM public.colaboradores WHERE id = NEW.colaborador_id;
  INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao, responsavel)
  VALUES (
    NEW.equipamento_id,
    NEW.tipo,
    CASE WHEN NEW.tipo = 'entrega' THEN 'Entregue para ' ELSE 'Devolvido por ' END || COALESCE(v_nome, '—'),
    v_nome
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_movimentacao
AFTER INSERT ON public.movimentacoes
FOR EACH ROW EXECUTE FUNCTION public.log_movimentacao();

-- Trigger: inspeção
CREATE OR REPLACE FUNCTION public.log_inspecao()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.equipamento_id IS NOT NULL THEN
    INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao, responsavel)
    VALUES (NEW.equipamento_id, 'inspecao', COALESCE('Inspeção realizada. ' || NULLIF(NEW.problema_identificado, ''), 'Inspeção técnica realizada'), NEW.tecnico_responsavel);

    IF NEW.problema_identificado IS NOT NULL AND length(trim(NEW.problema_identificado)) > 0 THEN
      INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao, responsavel)
      VALUES (NEW.equipamento_id, 'problema_identificado', NEW.problema_identificado, NEW.tecnico_responsavel);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_inspecao
AFTER INSERT ON public.inspecoes
FOR EACH ROW EXECUTE FUNCTION public.log_inspecao();

-- Backfill
INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao, criado_em)
SELECT id, 'cadastro', 'Equipamento cadastrado: ' || patrimonio || ' - ' || modelo, created_at
FROM public.equipamentos;

INSERT INTO public.historico_equipamentos(equipamento_id, tipo_evento, descricao, responsavel, criado_em)
SELECT m.equipamento_id, m.tipo,
  CASE WHEN m.tipo = 'entrega' THEN 'Entregue para ' ELSE 'Devolvido por ' END || COALESCE(c.nome, '—'),
  c.nome, m.created_at
FROM public.movimentacoes m
LEFT JOIN public.colaboradores c ON c.id = m.colaborador_id;
