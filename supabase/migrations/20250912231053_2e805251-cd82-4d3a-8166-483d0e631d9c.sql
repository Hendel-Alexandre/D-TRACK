-- Create history_logs table
CREATE TABLE public.history_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.history_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own history logs" 
ON public.history_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history logs" 
ON public.history_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_history_logs_user_id ON public.history_logs(user_id);
CREATE INDEX idx_history_logs_category ON public.history_logs(category);
CREATE INDEX idx_history_logs_created_at ON public.history_logs(created_at DESC);