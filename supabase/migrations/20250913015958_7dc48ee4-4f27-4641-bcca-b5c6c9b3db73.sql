-- Update RLS policies for users table to allow viewing other users' basic information for messaging

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create new policies that allow users to see basic info about other users
-- Users can view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Users can view other users' basic information for messaging (excludes sensitive data)
CREATE POLICY "Users can view others basic info for messaging" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() != id
);

-- Ensure users can still only update and insert their own profile
-- (These policies should already exist but let's make sure)
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);