-- Allow authenticated users to view users for messaging (read-only)
-- This enables listing other users' basic info (name, department, status)
CREATE POLICY IF NOT EXISTS "Authenticated users can view users for messaging"
ON public.users
FOR SELECT
TO authenticated
USING (true);