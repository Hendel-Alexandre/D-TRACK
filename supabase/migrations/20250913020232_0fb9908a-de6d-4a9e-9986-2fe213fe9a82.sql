-- First drop the existing restrictive policies to replace them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.users;
DROP POLICY IF EXISTS "Users can view others basic info for messaging" ON public.users;

-- Create a comprehensive policy that allows authenticated users to view all users
-- This enables the messaging system to work properly while maintaining security
CREATE POLICY "Authenticated users can view all users for messaging"
ON public.users
FOR SELECT
TO authenticated
USING (true);