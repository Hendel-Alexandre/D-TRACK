-- Add foreign key constraint between messages.sender_id and users.id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraint between messages.conversation_id and conversations.id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Add foreign key constraint between conversation_members.user_id and users.id
ALTER TABLE public.conversation_members 
ADD CONSTRAINT conversation_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraint between conversation_members.conversation_id and conversations.id
ALTER TABLE public.conversation_members 
ADD CONSTRAINT conversation_members_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Add foreign key constraint between conversations.created_by and users.id
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;