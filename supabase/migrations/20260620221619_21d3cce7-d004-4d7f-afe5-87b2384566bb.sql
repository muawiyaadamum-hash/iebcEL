-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursus_id UUID NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  cursus_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own certificates"
  ON public.certificates FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own certificates"
  ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public verification RPC (no auth required, returns minimal info)
CREATE OR REPLACE FUNCTION public.verify_certificate(_code TEXT)
RETURNS TABLE (
  code TEXT,
  student_name TEXT,
  cursus_title TEXT,
  score INTEGER,
  total INTEGER,
  issued_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT code, student_name, cursus_title, score, total, issued_at
  FROM public.certificates
  WHERE code = _code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;

-- Update admin promotion trigger to use new email
CREATE OR REPLACE FUNCTION public.handle_new_user_admin_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@iebc.cm' THEN
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
