-- Add delivered_at column to messages table for WhatsApp-style message status indicators
ALTER TABLE public.messages ADD COLUMN delivered_at timestamp with time zone DEFAULT now();

-- Update existing messages to set delivered_at to created_at where delivered_at is null
UPDATE public.messages SET delivered_at = created_at WHERE delivered_at IS NULL;

-- Add indexes for better performance on message status queries
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON public.messages(delivered_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);