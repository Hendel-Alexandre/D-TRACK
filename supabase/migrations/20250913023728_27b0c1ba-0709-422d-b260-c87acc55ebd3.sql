-- Update conversation_members table to support read tracking
-- The last_read_at column already exists with a default value of now()
-- Just ensure it's properly configured

-- Update existing records to have a proper last_read_at timestamp if they're null
UPDATE public.conversation_members 
SET last_read_at = now() 
WHERE last_read_at IS NULL;