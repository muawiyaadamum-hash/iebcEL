-- Phase 3: QCM bank (500), exam draws (50), scored attempts

-- 1. Question bank
CREATE TABLE public.exam_question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cursus_id uuid NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option char(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation text,
  topic text,
  difficulty text DEFAULT 'medium',
  published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exam_qbank_cursus ON public.exam_question_bank(cursus_id) WHERE published = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_question_bank TO authenticated;
GRANT ALL ON public.exam_question_bank TO service_role;

ALTER TABLE public.exam_question_bank ENABLE ROW LEVEL SECURITY;

-- Only admins / formateurs / responsable_pedagogique manage the bank.
-- Learners must NEVER read correct_option, so no SELECT for plain authenticated.
CREATE POLICY "Staff can view bank"
  ON public.exam_question_bank FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'formateur')
    OR public.has_role(auth.uid(), 'responsable_pedagogique')
  );

CREATE POLICY "Staff can insert bank"
  ON public.exam_question_bank FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'formateur')
    OR public.has_role(auth.uid(), 'responsable_pedagogique')
  );

CREATE POLICY "Staff can update bank"
  ON public.exam_question_bank FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'formateur')
    OR public.has_role(auth.uid(), 'responsable_pedagogique')
  );

CREATE POLICY "Staff can delete bank"
  ON public.exam_question_bank FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'formateur')
    OR public.has_role(auth.uid(), 'responsable_pedagogique')
  );

CREATE TRIGGER trg_exam_qbank_updated
  BEFORE UPDATE ON public.exam_question_bank
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Exam attempts
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursus_id uuid NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','expired')),
  question_ids jsonb NOT NULL DEFAULT '[]'::jsonb, -- ordered array of 50 question ids
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,      -- { question_id: 'A' }
  score integer,                                    -- /50
  total integer NOT NULL DEFAULT 50,
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exam_attempts_user ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_cursus ON public.exam_attempts(cursus_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own attempts"
  ON public.exam_attempts FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'formateur')
    OR public.has_role(auth.uid(), 'responsable_pedagogique')
  );

-- Inserts and updates go through edge functions (service role), so block direct writes.
CREATE POLICY "No direct insert"
  ON public.exam_attempts FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update"
  ON public.exam_attempts FOR UPDATE TO authenticated
  USING (false);

-- 3. Helper: secure random draw of N question ids for a cursus
CREATE OR REPLACE FUNCTION public.draw_exam_questions(_cursus_id uuid, _n integer DEFAULT 50)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(id)
  FROM (
    SELECT id
    FROM public.exam_question_bank
    WHERE cursus_id = _cursus_id AND published = true
    ORDER BY random()
    LIMIT _n
  ) s;
$$;
