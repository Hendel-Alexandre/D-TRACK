-- Add read_at timestamp to messages table for read receipts
ALTER TABLE public.messages 
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance on read_at queries
CREATE INDEX idx_messages_read_at ON public.messages(read_at);

-- Create index for sender queries (for read receipts)
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);