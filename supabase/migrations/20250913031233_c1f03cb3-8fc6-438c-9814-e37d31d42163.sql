-- Fix search_path for existing functions to prevent SQL injection
ALTER FUNCTION public.get_user_hour_bank_balance() SET search_path = public;
ALTER FUNCTION public.is_conversation_member(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.is_conversation_creator(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.start_direct_conversation(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;