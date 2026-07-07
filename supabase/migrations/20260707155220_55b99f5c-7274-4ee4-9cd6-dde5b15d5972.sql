-- Fix: quiz_questions leak (SUPA_lov critical). Restrict SELECT to admins only.
-- Client-side quiz play must go through the exam-start / quiz edge functions which use service_role.

DROP POLICY IF EXISTS "Authenticated can view questions" ON public.quiz_questions;

CREATE POLICY "Admins can view quiz questions"
  ON public.quiz_questions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure service_role (used by edge functions) keeps full access for quiz delivery.
GRANT ALL ON public.quiz_questions TO service_role;