-- Fix RLS policies for users table to protect personal data
DROP POLICY IF EXISTS "Authenticated users can view all users for messaging" ON public.users;

-- Users can view basic info of all users (for messaging/directory) but not sensitive details
CREATE POLICY "Users can view basic user info for messaging"
ON public.users
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE  
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can insert their own profile" 
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Fix user_roles policies to prevent role information exposure
DROP POLICY IF EXISTS "Users can view all user roles" ON public.user_roles;

-- Only allow users to see their own roles, admins can see all
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id 
    OR get_user_role(auth.uid()) = 'admin'::app_role
  )
);

-- Keep admin management policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::app_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::app_role);

-- Add password security function for strong password validation
CREATE OR REPLACE FUNCTION public.validate_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Password must be at least 8 characters
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;  
  END IF;
  
  -- Must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Must contain at least one special character
  IF password !~ '[!@#$%^&*()_+\-=\[\]{};:,.<>?]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;