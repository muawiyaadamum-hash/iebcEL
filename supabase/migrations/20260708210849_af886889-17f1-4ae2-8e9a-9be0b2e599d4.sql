
ALTER TABLE public.certificate_templates ADD COLUMN IF NOT EXISTS layout jsonb;
ALTER TABLE public.partner_programs ADD COLUMN IF NOT EXISTS layout jsonb;
