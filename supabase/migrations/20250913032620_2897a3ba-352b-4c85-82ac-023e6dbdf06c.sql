-- Allow creators to read their newly created conversations immediately
DROP POLICY IF EXISTS "Users can view conversations they are members of" ON public.conversations;

CREATE POLICY "Users can view conversations they are members of or created"
ON public.conversations
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    id IN (
      SELECT conversation_members.conversation_id
      FROM public.conversation_members
      WHERE conversation_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  )
);