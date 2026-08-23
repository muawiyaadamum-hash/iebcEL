
-- 1. Scope policies to authenticated role
DROP POLICY IF EXISTS "Admins can update any enrollment" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
CREATE POLICY "Admins can update any enrollment" ON public.enrollments FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can insert their own enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can update their own module progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can view their own module progress" ON public.module_progress;
CREATE POLICY "Users can insert their own module progress" ON public.module_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own module progress" ON public.module_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own module progress" ON public.module_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view global notifications or their own" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view global notifications or their own" ON public.notifications FOR SELECT TO authenticated USING (is_global = true OR target_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage live sessions" ON public.live_sessions;
CREATE POLICY "Admins manage live sessions" ON public.live_sessions FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 2. Partner certificates: no open public read
DROP POLICY IF EXISTS "Public can view issued certificates" ON public.partner_certificates;
REVOKE SELECT ON public.partner_certificates FROM anon;

CREATE OR REPLACE FUNCTION public.list_partner_laureates(_program_id uuid)
RETURNS TABLE(id uuid, code text, student_name text, status partner_cert_status, score integer, total integer, issued_at timestamptz, expires_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, code, student_name, status, score, total, issued_at, expires_at
  FROM public.partner_certificates
  WHERE program_id = _program_id AND status IN ('issued','expired','revoked')
  ORDER BY student_name
$$;

CREATE OR REPLACE FUNCTION public.verify_partner_certificate(_code text)
RETURNS TABLE(id uuid, program_id uuid, code text, student_name text, status partner_cert_status, score integer, total integer, notes text, issued_at timestamptz, expires_at timestamptz, revoked_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, program_id, code, student_name, status, score, total, notes, issued_at, expires_at, revoked_at
  FROM public.partner_certificates
  WHERE code = _code AND status IN ('issued','expired','revoked')
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.list_partner_laureates(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_partner_certificate(text) TO anon, authenticated;

-- 3. Revoke anon read on private tables
REVOKE SELECT ON public.audit_log, public.certificates, public.course_enrollments,
  public.enrollments, public.exam_attempts, public.exam_question_bank,
  public.module_progress, public.notifications, public.profiles,
  public.project_submissions, public.quiz_attempts, public.quiz_questions,
  public.user_roles, public.certificate_templates FROM anon;

-- 4. Restrict internal function execution
REVOKE ALL ON FUNCTION public.create_admin_user(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_admin_check() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.draw_exam_questions(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_take_final_exam(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.compute_final_grade(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_take_final_exam(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_final_grade(uuid, uuid) TO authenticated;
