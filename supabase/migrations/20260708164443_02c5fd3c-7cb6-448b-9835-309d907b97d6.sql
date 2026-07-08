
ALTER TABLE public.partner_programs
  ADD COLUMN IF NOT EXISTS template_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS template_source text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS template_updated_at timestamptz;
