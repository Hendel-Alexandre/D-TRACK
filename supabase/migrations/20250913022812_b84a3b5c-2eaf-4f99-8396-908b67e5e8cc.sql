-- Add missing foreign key constraints (avoiding duplicates)

-- Check and add conversations.created_by -> users.id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_created_by_fkey') THEN
        ALTER TABLE public.conversations 
        ADD CONSTRAINT conversations_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check and add conversation_members.user_id -> users.id  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversation_members_user_id_fkey') THEN
        ALTER TABLE public.conversation_members 
        ADD CONSTRAINT conversation_members_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;