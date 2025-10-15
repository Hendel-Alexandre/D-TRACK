-- Fix infinite recursion in student_conversation_members RLS policy
-- Create a SECURITY DEFINER function to break the recursion

CREATE OR REPLACE FUNCTION public.is_student_conversation_member(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM student_conversation_members
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  );
$$;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view members in their student conversations" 
ON student_conversation_members;

-- Create new policy using the SECURITY DEFINER function
CREATE POLICY "Users can view members in their student conversations"
ON student_conversation_members
FOR SELECT
USING (is_student_conversation_member(conversation_id));