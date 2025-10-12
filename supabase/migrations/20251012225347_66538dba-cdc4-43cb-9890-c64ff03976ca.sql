-- Fix friend request vulnerability: prevent arbitrary user enumeration
-- Drop the existing overly permissive friend request policy
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friend_requests;

-- Create a more restrictive policy: users can only send friend requests to users in their department
-- This prevents attackers from enumerating all user IDs by sending random friend requests
CREATE POLICY "Users can send friend requests to same department"
ON public.friend_requests
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  recipient_id IN (
    SELECT u2.id 
    FROM public.users u1
    JOIN public.users u2 ON u1.department = u2.department
    WHERE u1.id = auth.uid() AND u2.id = recipient_id
  ) AND
  sender_id != recipient_id
);

-- Add validation trigger for user input on the users table
-- This prevents injection attacks and enforces data quality at the database level
CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate first_name: max 50 chars, only letters, spaces, hyphens, apostrophes
  IF length(NEW.first_name) > 50 OR NEW.first_name !~ '^[a-zA-Z\s\-'']+$' THEN
    RAISE EXCEPTION 'Invalid first name format';
  END IF;
  
  -- Validate last_name: max 50 chars, only letters, spaces, hyphens, apostrophes
  IF length(NEW.last_name) > 50 OR NEW.last_name !~ '^[a-zA-Z\s\-'']+$' THEN
    RAISE EXCEPTION 'Invalid last name format';
  END IF;
  
  -- Validate email: max 255 chars
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email address too long';
  END IF;
  
  -- Trim whitespace from text fields
  NEW.first_name := trim(NEW.first_name);
  NEW.last_name := trim(NEW.last_name);
  NEW.email := trim(lower(NEW.email));
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate user input on insert and update
DROP TRIGGER IF EXISTS validate_user_before_insert ON public.users;
CREATE TRIGGER validate_user_before_insert
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_input();