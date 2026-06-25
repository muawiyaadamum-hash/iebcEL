
-- Extend question bank
ALTER TABLE public.exam_question_bank
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'qcm',
  ADD COLUMN IF NOT EXISTS correct_options TEXT[] NOT NULL DEFAULT '{}';

-- Module resources table
CREATE TABLE IF NOT EXISTS public.module_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.cursus_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_type TEXT,
  external_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_resources TO authenticated;
GRANT ALL ON public.module_resources TO service_role;

ALTER TABLE public.module_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage module resources"
ON public.module_resources FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'responsable_pedagogique'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'responsable_pedagogique'));

CREATE POLICY "Enrolled users read published resources"
ON public.module_resources FOR SELECT
TO authenticated
USING (
  published = true AND EXISTS (
    SELECT 1 FROM public.cursus_modules m
    JOIN public.course_enrollments e ON e.cursus_id = m.cursus_id
    WHERE m.id = module_resources.module_id
      AND e.user_id = auth.uid() AND e.status = 'validated'
  )
);

CREATE TRIGGER update_module_resources_updated_at
BEFORE UPDATE ON public.module_resources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_module_resources_module ON public.module_resources(module_id, display_order);
