-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'project_manager', 'developer', 'designer', 'team_member');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = $1 
  LIMIT 1;
$$;

-- RLS policy for user_roles
CREATE POLICY "Users can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

-- Insert some default roles for existing users
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'team_member' 
FROM public.users 
ON CONFLICT (user_id, role) DO NOTHING;