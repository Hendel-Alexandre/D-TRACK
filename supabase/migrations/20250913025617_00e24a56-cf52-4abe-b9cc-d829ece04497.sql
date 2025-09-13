-- Drop and recreate the conversations INSERT policy to be more explicit
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a more robust policy for conversation creation
CREATE POLICY "Users can create conversations they own" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = created_by
);

-- Ensure the policy for viewing conversations is also robust
DROP POLICY IF EXISTS "Users can view conversations they are members of" ON public.conversations;

CREATE POLICY "Users can view conversations they are members of"
ON public.conversations
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND id IN (
    SELECT conversation_id 
    FROM public.conversation_members 
    WHERE user_id = auth.uid()
  )
);

-- Update the conversations UPDATE policy to be more explicit  
DROP POLICY IF EXISTS "Users can update conversations they created" ON public.conversations;

CREATE POLICY "Users can update conversations they created"
ON public.conversations
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = created_by
);