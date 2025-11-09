-- Allow users to view basic profile info of other users (for displaying seller names)
CREATE POLICY "Users can view basic profile info of others"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);