
CREATE POLICY "course-content read for authenticated" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'course-content');

CREATE POLICY "course-content write staff" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'course-content' AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'responsable_pedagogique')
      OR public.has_role(auth.uid(),'formateur')
    )
  );

CREATE POLICY "course-content update staff" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'course-content' AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'responsable_pedagogique')
      OR public.has_role(auth.uid(),'formateur')
    )
  );

CREATE POLICY "course-content delete staff" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'course-content' AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'responsable_pedagogique')
    )
  );
