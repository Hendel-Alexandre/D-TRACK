-- Add Stripe-related columns to user_mode_settings table
ALTER TABLE public.user_mode_settings
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mode_settings_stripe_customer 
ON public.user_mode_settings(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_mode_settings_stripe_subscription 
ON public.user_mode_settings(stripe_subscription_id);