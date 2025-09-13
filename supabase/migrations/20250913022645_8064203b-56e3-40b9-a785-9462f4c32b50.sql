-- Add foreign key constraint between messages.sender_id and users.id (this was missing)
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraint between conversations.created_by and users.id (this was missing)
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraint between conversation_members.user_id and users.id (this was missing)
ALTER TABLE public.conversation_members 
ADD CONSTRAINT conversation_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;