-- Fix 1: Create a view for user search that excludes sensitive data
CREATE OR REPLACE VIEW public.user_search AS
SELECT id, first_name, last_name, department, status
FROM public.users;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.user_search TO authenticated;

-- Fix 2: Add INSERT policy for student_conversation_members
-- Only conversation creators can add members
CREATE POLICY "Conversation creators can add members"
ON public.student_conversation_members
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.student_conversations 
    WHERE created_by = auth.uid()
  )
);