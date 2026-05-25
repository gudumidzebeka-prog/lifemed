ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DROP POLICY IF EXISTS "Users update own documents" ON storage.objects;

CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'health-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
