
-- Partner (conjoint) certificate programs
CREATE TABLE public.partner_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  description TEXT,
  template_bg_url TEXT,
  template_prompt TEXT,
  primary_color TEXT DEFAULT '#0F4C81',
  signatory_name TEXT DEFAULT 'Direction Pédagogique',
  signatory_title TEXT DEFAULT 'Directeur Pédagogique',
  header_title TEXT DEFAULT 'CERTIFICAT CONJOINT',
  footer_text TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE partner_cert_status AS ENUM ('pending','issued','revoked','expired');

CREATE TABLE public.partner_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.partner_programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  status partner_cert_status NOT NULL DEFAULT 'pending',
  score INTEGER,
  total INTEGER,
  notes TEXT,
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_certificates_program ON public.partner_certificates(program_id);
CREATE INDEX idx_partner_certificates_status ON public.partner_certificates(status);

GRANT SELECT ON public.partner_programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_programs TO authenticated;
GRANT ALL ON public.partner_programs TO service_role;

GRANT SELECT ON public.partner_certificates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_certificates TO authenticated;
GRANT ALL ON public.partner_certificates TO service_role;

ALTER TABLE public.partner_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_certificates ENABLE ROW LEVEL SECURITY;

-- Programs: public read active ones, admins manage
CREATE POLICY "Public can view active programs"
  ON public.partner_programs FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage programs"
  ON public.partner_programs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Certificates: public can read issued ones (for verification page), admins manage
CREATE POLICY "Public can view issued certificates"
  ON public.partner_certificates FOR SELECT
  USING (status IN ('issued','expired','revoked') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage certificates"
  ON public.partner_certificates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_partner_programs_updated_at BEFORE UPDATE ON public.partner_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partner_certificates_updated_at BEFORE UPDATE ON public.partner_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
