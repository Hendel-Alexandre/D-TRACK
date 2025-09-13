-- Create a helper to start a direct conversation securely
CREATE OR REPLACE FUNCTION public.start_direct_conversation(recipient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Allow authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.start_direct_conversation(uuid) TO authenticated;