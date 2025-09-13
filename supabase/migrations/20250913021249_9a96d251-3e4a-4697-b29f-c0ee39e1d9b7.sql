-- Create a function to handle new user registration
-- This ensures every authenticated user gets a profile in the users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, email, department, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'department' IN ('Marketing', 'IT', 'Support', 'Finance', 'HR') 
      THEN NEW.raw_user_meta_data->>'department'
      ELSE 'IT'
    END,
    'Available'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create missing user profiles for existing authenticated users
INSERT INTO public.users (id, first_name, last_name, email, department, status)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', SPLIT_PART(au.email, '@', 1)),
  au.email,
  CASE 
    WHEN au.raw_user_meta_data->>'department' IN ('Marketing', 'IT', 'Support', 'Finance', 'HR') 
    THEN au.raw_user_meta_data->>'department'
    ELSE 'IT'
  END,
  'Available'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;