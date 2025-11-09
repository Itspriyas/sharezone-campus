-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload chat images
CREATE POLICY "Users can upload chat images" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-images');

-- Allow anyone to view chat images (since they're public)
CREATE POLICY "Anyone can view chat images" ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-images');

-- Allow users to delete their own chat images
CREATE POLICY "Users can delete their own chat images" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to delete user account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user's data
  DELETE FROM public.seller_ratings WHERE buyer_id = auth.uid() OR seller_id = auth.uid();
  DELETE FROM public.messages WHERE sender_id = auth.uid();
  DELETE FROM public.conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid();
  DELETE FROM public.products WHERE seller_id = auth.uid();
  DELETE FROM public.feedback WHERE user_id = auth.uid();
  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Delete auth user (this will cascade)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;