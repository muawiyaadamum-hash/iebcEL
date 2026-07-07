
-- 1. project_submissions: link to cursus
ALTER TABLE public.project_submissions
  ADD COLUMN IF NOT EXISTS cursus_id uuid REFERENCES public.cursus(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_project_submissions_cursus ON public.project_submissions(cursus_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user ON public.project_submissions(user_id);

-- 2. certificates: breakdown fields
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS qcm_score integer,
  ADD COLUMN IF NOT EXISTS qcm_total integer,
  ADD COLUMN IF NOT EXISTS project_grade integer,
  ADD COLUMN IF NOT EXISTS combined_percent integer,
  ADD COLUMN IF NOT EXISTS template_id uuid,
  ADD COLUMN IF NOT EXISTS signature_hash text;

-- 3. certificate_templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  header_title text NOT NULL DEFAULT 'CERTIFICAT DE RÉUSSITE',
  institution_name text NOT NULL DEFAULT 'Centre de Formation IEBC',
  institution_subtitle text DEFAULT 'Institut d''Excellence pour le Business et les Compétences',
  signatory_name text NOT NULL DEFAULT 'Direction Pédagogique',
  signatory_title text DEFAULT 'Directeur Pédagogique',
  footer_text text,
  primary_color text NOT NULL DEFAULT '#0F4C81',
  active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificate_templates TO authenticated;
GRANT ALL ON public.certificate_templates TO service_role;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read active templates"
  ON public.certificate_templates FOR SELECT
  TO authenticated
  USING (active = true OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin manages templates"
  ON public.certificate_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_certificate_templates_updated
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seed default template
INSERT INTO public.certificate_templates (name, is_default, active, footer_text)
SELECT 'Modèle officiel IEBC', true, true, 'Ce certificat est vérifiable en ligne via son code unique et son QR code.'
WHERE NOT EXISTS (SELECT 1 FROM public.certificate_templates WHERE is_default = true);

-- 5. RPC to compute combined 40/60 score
CREATE OR REPLACE FUNCTION public.compute_final_grade(_user_id uuid, _cursus_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qcm_score int;
  v_qcm_total int;
  v_qcm_pct numeric := 0;
  v_project_grade int;
  v_project_status text;
  v_combined numeric := 0;
BEGIN
  SELECT score, total INTO v_qcm_score, v_qcm_total
  FROM public.exam_attempts
  WHERE user_id = _user_id AND cursus_id = _cursus_id AND status = 'submitted'
  ORDER BY submitted_at DESC NULLS LAST LIMIT 1;

  IF v_qcm_total IS NOT NULL AND v_qcm_total > 0 THEN
    v_qcm_pct := (v_qcm_score::numeric / v_qcm_total) * 100;
  END IF;

  SELECT grade, status INTO v_project_grade, v_project_status
  FROM public.project_submissions
  WHERE user_id = _user_id AND cursus_id = _cursus_id AND status = 'graded'
  ORDER BY reviewed_at DESC NULLS LAST LIMIT 1;

  v_combined := (COALESCE(v_project_grade,0) * 0.4) + (v_qcm_pct * 0.6);

  RETURN jsonb_build_object(
    'qcm_score', v_qcm_score,
    'qcm_total', v_qcm_total,
    'qcm_percent', ROUND(v_qcm_pct)::int,
    'project_grade', v_project_grade,
    'project_status', v_project_status,
    'combined_percent', ROUND(v_combined)::int,
    'passed', (v_qcm_pct >= 60 AND v_project_grade IS NOT NULL AND v_combined >= 60)
  );
END;
$$;
