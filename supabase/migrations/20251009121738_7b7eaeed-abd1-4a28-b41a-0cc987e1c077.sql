-- Fix 1: Create security definer function to check if user is in same game room
CREATE OR REPLACE FUNCTION public.is_in_same_game_room(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.game_room_members grm1
    JOIN public.game_room_members grm2 ON grm1.room_id = grm2.room_id
    WHERE grm1.user_id = auth.uid()
      AND grm2.user_id = target_user_id
  );
$$;

-- Fix 2: Create security definer function to check if users have friend connection
CREATE OR REPLACE FUNCTION public.has_friend_connection(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.friend_requests
    WHERE (sender_id = auth.uid() AND recipient_id = target_user_id)
       OR (sender_id = target_user_id AND recipient_id = auth.uid())
  );
$$;

-- Fix 3: Create security definer function to check if users share a conversation
CREATE OR REPLACE FUNCTION public.shares_conversation_with(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members cm1
    JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    WHERE cm1.user_id = auth.uid()
      AND cm2.user_id = target_user_id
  );
$$;

-- Fix 4: Drop and recreate users table SELECT policy with proper restrictions
DROP POLICY IF EXISTS "Users can view basic user info for messaging" ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles they have connections with"
ON public.users
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    has_friend_connection(id) 
    OR shares_conversation_with(id)
    OR is_in_same_game_room(id)
  )
);

-- Fix 5: Fix game_room_members infinite recursion with security definer function
CREATE OR REPLACE FUNCTION public.is_room_member(room_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.game_room_members
    WHERE room_id = room_id_param
      AND user_id = auth.uid()
  );
$$;

-- Drop and recreate game_room_members policies
DROP POLICY IF EXISTS "Users can view room members if they are members" ON public.game_room_members;

CREATE POLICY "Users can view room members if they are members"
ON public.game_room_members
FOR SELECT
USING (is_room_member(room_id));

-- Fix 6: Drop and recreate game_rooms SELECT policy
DROP POLICY IF EXISTS "Users can view game rooms they are members of" ON public.game_rooms;

CREATE POLICY "Users can view game rooms they are members of"
ON public.game_rooms
FOR SELECT
USING (is_room_member(id));

-- Fix 7: Add DELETE policy for game_rooms
CREATE POLICY "Room hosts can delete their rooms"
ON public.game_rooms
FOR DELETE
USING (auth.uid() = host_id);

-- Fix 8: Create enterprise_inquiries table for contact form
CREATE TABLE IF NOT EXISTS public.enterprise_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'
);

-- Enable RLS on enterprise_inquiries
ALTER TABLE public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit inquiries (public form)
CREATE POLICY "Anyone can submit enterprise inquiries"
ON public.enterprise_inquiries
FOR INSERT
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view enterprise inquiries"
ON public.enterprise_inquiries
FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

-- Only admins can update inquiry status
CREATE POLICY "Admins can update enterprise inquiries"
ON public.enterprise_inquiries
FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');