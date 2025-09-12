-- Drop the existing view and recreate it properly with RLS
DROP VIEW IF EXISTS public.hour_bank_view;

-- Create a function to get hour bank balance for the current user
CREATE OR REPLACE FUNCTION public.get_user_hour_bank_balance()
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  balance DECIMAL;
BEGIN
  SELECT COALESCE(SUM(hours), 0) 
  INTO balance
  FROM public.hour_adjustments 
  WHERE user_id = auth.uid();
  
  RETURN balance;
END;
$$;