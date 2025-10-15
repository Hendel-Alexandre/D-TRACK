-- Fix 1: Add CHECK constraint for user status validation
ALTER TABLE public.users 
ADD CONSTRAINT valid_status 
CHECK (status IN ('Available', 'Away', 'Busy'));

-- Fix 2: Create rate limiting table for AI usage tracking
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ai_usage_log
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert (via edge function with service role)
-- Users can view their own usage
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage_log FOR SELECT
USING (auth.uid() = user_id);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_created 
ON public.ai_usage_log(user_id, created_at DESC);

-- Fix 3: Improve start_direct_conversation function with validation
CREATE OR REPLACE FUNCTION public.start_direct_conversation(recipient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Validate input
  IF recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient is required';
  END IF;
  IF recipient_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot start a conversation with yourself';
  END IF;

  -- Verify recipient exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = recipient_id) THEN
    RAISE EXCEPTION 'Invalid recipient';
  END IF;

  -- Return existing direct conversation if it already exists (exactly 2 members)
  SELECT c.id INTO conv_id
  FROM public.conversations c
  JOIN public.conversation_members cm ON cm.conversation_id = c.id
  WHERE c.is_group = false
    AND cm.user_id IN (auth.uid(), recipient_id)
  GROUP BY c.id
  HAVING COUNT(*) = 2
  LIMIT 1;

  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  -- Create the conversation
  INSERT INTO public.conversations (created_by, is_group, name)
  VALUES (auth.uid(), false, NULL)
  RETURNING id INTO conv_id;

  -- Add both participants as members
  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES (conv_id, auth.uid()), (conv_id, recipient_id);

  RETURN conv_id;
END;
$$;

-- Fix 4: Verify game_rooms DELETE policy exists (it should according to schema)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_rooms' 
    AND policyname = 'Room hosts can delete their rooms'
  ) THEN
    EXECUTE 'CREATE POLICY "Room hosts can delete their rooms"
    ON public.game_rooms
    FOR DELETE
    USING (auth.uid() = host_id)';
  END IF;
END $$;