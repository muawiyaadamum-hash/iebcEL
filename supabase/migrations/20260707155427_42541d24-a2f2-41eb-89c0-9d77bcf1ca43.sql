-- Fix critical findings: paid content accessible to any authenticated user.
DROP POLICY IF EXISTS "course-content read for authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read lesson videos" ON storage.objects;

CREATE POLICY "course-content read enrolled or staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-content'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'responsable_pedagogique'::app_role)
      OR public.has_role(auth.uid(), 'formateur'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.user_id = auth.uid() AND ce.status = 'validated'
      )
    )
  );

CREATE POLICY "lesson-videos read enrolled or staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lesson-videos'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'responsable_pedagogique'::app_role)
      OR public.has_role(auth.uid(), 'formateur'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        WHERE ce.user_id = auth.uid() AND ce.status = 'validated'
      )
    )
  );