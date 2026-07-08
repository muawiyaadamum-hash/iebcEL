
ALTER TABLE public.live_sessions DROP CONSTRAINT IF EXISTS live_sessions_provider_check;
ALTER TABLE public.live_sessions
  ADD CONSTRAINT live_sessions_provider_check
  CHECK (provider IN ('platform','external','jitsi'));

UPDATE public.live_sessions SET provider = 'platform' WHERE provider = 'jitsi';

ALTER TABLE public.live_sessions DROP CONSTRAINT IF EXISTS live_sessions_provider_check;
ALTER TABLE public.live_sessions
  ADD CONSTRAINT live_sessions_provider_check
  CHECK (provider IN ('platform','external'));

ALTER TABLE public.live_sessions
  ADD COLUMN IF NOT EXISTS broadcaster_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS started_at timestamptz;
