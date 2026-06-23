
CREATE TABLE public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cursus_id UUID NOT NULL REFERENCES public.cursus(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.cursus_modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL DEFAULT 'jitsi' CHECK (provider IN ('jitsi','external')),
  room_name TEXT,
  external_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','ended','cancelled')),
  host_id UUID,
  recording_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_sessions TO authenticated;
GRANT ALL ON public.live_sessions TO service_role;

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published live sessions"
  ON public.live_sessions FOR SELECT
  USING (published = true);

CREATE POLICY "Admins manage live sessions"
  ON public.live_sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_live_sessions_cursus ON public.live_sessions(cursus_id, scheduled_at DESC);
