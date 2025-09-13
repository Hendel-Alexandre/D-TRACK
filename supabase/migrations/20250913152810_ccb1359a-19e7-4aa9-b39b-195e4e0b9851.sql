-- Create notifications table for shared notes
CREATE TABLE public.note_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  note_id UUID NOT NULL,
  note_title TEXT NOT NULL,
  note_content TEXT,
  sender_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.note_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for note notifications
CREATE POLICY "Users can view their own notifications" 
ON public.note_notifications 
FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create notifications for others" 
ON public.note_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own notifications" 
ON public.note_notifications 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_note_notifications_updated_at
BEFORE UPDATE ON public.note_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();