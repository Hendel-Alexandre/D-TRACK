-- Insert a profile for the existing user
INSERT INTO public.users (id, first_name, last_name, email, department, status)
VALUES (
  'ee4ce9df-2426-49ee-a64d-99cbca09f14f',
  'Alexandre',
  'Hendel', 
  'alexandre.hendel07@gmail.com',
  'Engineering',
  'Available'
)
ON CONFLICT (id) DO NOTHING;