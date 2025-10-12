-- Remove any overly permissive user viewing policies
DROP POLICY IF EXISTS "Users can view basic user info for messaging" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Ensure the restrictive policies are in place
-- These policies already exist but we're making sure they're the ONLY SELECT policies

-- Policy 1: Users can view their own profile (keep this)
-- Policy 2: Users can view profiles they have connections with (keep this)

-- These policies should already exist from previous setup:
-- CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can view profiles they have connections with" ON public.users FOR SELECT 
--   USING ((auth.uid() IS NOT NULL) AND (has_friend_connection(id) OR shares_conversation_with(id) OR is_in_same_game_room(id)));