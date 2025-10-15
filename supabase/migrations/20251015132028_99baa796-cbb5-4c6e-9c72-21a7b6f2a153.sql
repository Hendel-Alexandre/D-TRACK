-- Enable leaked password protection
-- This is configured at the project level in Supabase Auth settings
-- We'll add a validation function as an additional layer

-- Create a function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Minimum 8 characters
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one number
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Must contain at least one special character
  IF password !~ '[!@#$%^&*()_+\-=\[\]{};:,.<>?]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;