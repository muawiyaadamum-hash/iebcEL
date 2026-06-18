
-- ---------- POLES ----------
CREATE TABLE public.poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.poles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poles TO authenticated;
GRANT ALL ON public.poles TO service_role;
ALTER TABLE public.poles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poles publiés visibles" ON public.poles FOR SELECT
  USING (published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE POLICY "Admin gère pôles" ON public.poles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE TRIGGER trg_poles_updated BEFORE UPDATE ON public.poles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- CURSUS ----------
CREATE TABLE public.cursus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pole_id UUID NOT NULL REFERENCES public.poles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  objectives TEXT,
  level TEXT,
  duration_hours INT NOT NULL DEFAULT 0,
  duration_label TEXT,
  price_xaf INT NOT NULL DEFAULT 0,
  registration_fee_xaf INT NOT NULL DEFAULT 10000,
  modality TEXT DEFAULT 'en_ligne',
  certification BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cursus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursus TO authenticated;
GRANT ALL ON public.cursus TO service_role;
ALTER TABLE public.cursus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cursus publiés visibles" ON public.cursus FOR SELECT
  USING (published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE POLICY "Admin gère cursus" ON public.cursus FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE TRIGGER trg_cursus_updated BEFORE UPDATE ON public.cursus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cursus_pole ON public.cursus(pole_id);

-- ---------- MODULES ----------
CREATE TABLE public.cursus_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cursus_id UUID NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours INT NOT NULL DEFAULT 0,
  formateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_order INT NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cursus_modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursus_modules TO authenticated;
GRANT ALL ON public.cursus_modules TO service_role;
ALTER TABLE public.cursus_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules publiés visibles" ON public.cursus_modules FOR SELECT
  USING (published = true OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique') OR formateur_id = auth.uid());
CREATE POLICY "Admin gère modules" ON public.cursus_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE POLICY "Formateur édite ses modules" ON public.cursus_modules FOR UPDATE TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON public.cursus_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_modules_cursus ON public.cursus_modules(cursus_id);

-- ---------- ENROLLMENTS ----------
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursus_id UUID NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cursus_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO service_role;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apprenant voit ses inscriptions" ON public.course_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comptable') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE POLICY "Apprenant crée son inscription" ON public.course_enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Apprenant annule pending" ON public.course_enrollments FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Staff gère inscriptions" ON public.course_enrollments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comptable') OR public.has_role(auth.uid(),'responsable_pedagogique'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'comptable') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE TRIGGER trg_course_enrollments_updated BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_enroll_user ON public.course_enrollments(user_id);
CREATE INDEX idx_enroll_cursus ON public.course_enrollments(cursus_id);

-- ---------- HELPER FUNCTION (after course_enrollments exists) ----------
CREATE OR REPLACE FUNCTION public.is_enrolled_validated(_user_id uuid, _cursus_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE user_id = _user_id AND cursus_id = _cursus_id AND status = 'validated'
  )
$$;

-- ---------- LESSONS ----------
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.cursus_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  file_path TEXT,
  external_url TEXT,
  duration_minutes INT DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leçons visibles inscrits/staff" ON public.lessons FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR public.has_role(auth.uid(),'responsable_pedagogique')
  OR EXISTS (SELECT 1 FROM public.cursus_modules m WHERE m.id = lessons.module_id AND m.formateur_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.cursus_modules m WHERE m.id = lessons.module_id AND public.is_enrolled_validated(auth.uid(), m.cursus_id))
);
CREATE POLICY "Admin gère leçons" ON public.lessons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'responsable_pedagogique'));
CREATE POLICY "Formateur gère leçons de ses modules" ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cursus_modules m WHERE m.id = lessons.module_id AND m.formateur_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cursus_modules m WHERE m.id = lessons.module_id AND m.formateur_id = auth.uid()));
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
