-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view members of conversations they belong to" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can add members to conversations they created" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can view messages in conversations they belong to" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to conversations they belong to" ON public.messages;

-- Create a security definer function to check if user is member of conversation
CREATE OR REPLACE FUNCTION public.is_conversation_member(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_members.conversation_id = $1
      AND conversation_members.user_id = $2
  );
$$;

-- Create a security definer function to check if user created conversation
CREATE OR REPLACE FUNCTION public.is_conversation_creator(conversation_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = $1
      AND conversations.created_by = $2
  );
$$;

-- New policies for conversation_members using security definer functions
CREATE POLICY "Users can view conversation members if they are members" 
ON public.conversation_members 
FOR SELECT 
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Conversation creators can add members" 
ON public.conversation_members 
FOR INSERT 
WITH CHECK (public.is_conversation_creator(conversation_id, auth.uid()));

-- New policies for messages using security definer functions
CREATE POLICY "Users can view messages if they are conversation members" 
ON public.messages 
FOR SELECT 
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages if they are conversation members" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_conversation_member(conversation_id, auth.uid())
);