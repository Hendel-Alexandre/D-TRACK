-- Add trial and plan tracking to user_mode_settings
ALTER TABLE public.user_mode_settings
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create onboarding_profiles table to store additional onboarding data
CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  selected_mode text NOT NULL, -- 'student', 'professional', 'both'
  selected_plan text NOT NULL, -- 'student', 'professional', 'combined'
  completed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on onboarding_profiles
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_profiles
CREATE POLICY "Users can manage their own onboarding profile"
ON public.onboarding_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user_id ON public.onboarding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mode_settings_trial_end ON public.user_mode_settings(trial_end_date);

-- Add trigger to update updated_at on onboarding_profiles
CREATE TRIGGER update_onboarding_profiles_updated_at
BEFORE UPDATE ON public.onboarding_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();