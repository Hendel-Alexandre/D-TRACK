-- Fix the security definer view issue by dropping and recreating without security definer
DROP VIEW IF EXISTS public.user_search;

-- Create a simple view for user search (not security definer by default)
CREATE VIEW public.user_search 
WITH (security_invoker = true)
AS
SELECT id, first_name, last_name, department, status
FROM public.users;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.user_search TO authenticated;

-- Additional fix: Ensure student conversation members table has proper DELETE policy
-- Users should be able to leave conversations
CREATE POLICY "Users can leave student conversations"
ON public.student_conversation_members
FOR DELETE
USING (user_id = auth.uid());

-- Fix: Add DELETE policy to conversation_members (work conversations)
-- Users should be able to leave conversations
CREATE POLICY "Users can leave conversations"
ON public.conversation_members
FOR DELETE
USING (user_id = auth.uid());