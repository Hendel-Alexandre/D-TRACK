-- Fix search_path for password validation function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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