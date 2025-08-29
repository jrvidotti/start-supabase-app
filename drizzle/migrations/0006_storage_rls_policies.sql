-- Migration: Add RLS policies for storage.objects table
-- This enables file uploads to the post-images bucket with proper access control

DO $$
BEGIN
    -- Check if the bucket already exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'post-images') THEN
        -- Create the bucket with default settings (private)
        INSERT INTO storage.buckets (name, public)
        VALUES ('post-images', FALSE);
    END IF;
    
    -- Insert policy
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'post-images_insert_policy') THEN
          CREATE POLICY "post-images_insert_policy" ON storage.objects
          FOR INSERT TO authenticated
          WITH CHECK (
              bucket_id = 'post-images' AND
              (SELECT auth.uid())::text = (storage.foldername(name))[1]
          );
    END IF;

    -- Select policy
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'post-images_select_policy') THEN
        CREATE POLICY "post-images_select_policy" ON storage.objects
        FOR SELECT USING (bucket_id = 'post-images');
    END IF;

    -- Update policy
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'post-images_update_policy') THEN
        CREATE POLICY "post-images_update_policy" ON storage.objects
        FOR UPDATE TO authenticated
        USING (
            bucket_id = 'post-images' AND
            (SELECT auth.uid())::text = (storage.foldername(name))[1]
            )
        WITH CHECK (
            bucket_id = 'post-images' AND
            (SELECT auth.uid())::text = (storage.foldername(name))[1]
            );
    END IF;

    -- Delete policy
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'post-images_delete_policy') THEN
        CREATE POLICY "post-images_delete_policy" ON storage.objects
        FOR DELETE TO authenticated
        USING (
            bucket_id = 'post-images' AND
            (SELECT auth.uid())::text = (storage.foldername(name))[1]
            );
    END IF;
END $$;