
CREATE POLICY "Admins manage lesson videos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'lesson-videos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'lesson-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read lesson videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lesson-videos');
