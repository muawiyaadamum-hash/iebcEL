GRANT SELECT ON public.partner_programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_programs TO authenticated;
GRANT ALL ON public.partner_programs TO service_role;

GRANT SELECT ON public.partner_certificates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_certificates TO authenticated;
GRANT ALL ON public.partner_certificates TO service_role;