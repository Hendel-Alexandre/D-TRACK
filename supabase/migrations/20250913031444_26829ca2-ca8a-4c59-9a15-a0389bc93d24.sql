-- Fix search_path for the password validation function
ALTER FUNCTION public.validate_password(text) SET search_path = public;