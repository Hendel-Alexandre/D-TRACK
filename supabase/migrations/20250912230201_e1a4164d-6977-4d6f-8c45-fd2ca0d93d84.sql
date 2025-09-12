-- Create hour_adjustments table for tracking time adjustments
CREATE TABLE public.hour_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  hours DECIMAL NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hour_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own hour adjustments" 
ON public.hour_adjustments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hour adjustments" 
ON public.hour_adjustments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hour adjustments" 
ON public.hour_adjustments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hour adjustments" 
ON public.hour_adjustments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hour_adjustments_updated_at
BEFORE UPDATE ON public.hour_adjustments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for Hour Bank balance
CREATE VIEW public.hour_bank_view AS
SELECT 
  user_id,
  COALESCE(SUM(hours), 0) AS total_balance
FROM public.hour_adjustments
GROUP BY user_id;