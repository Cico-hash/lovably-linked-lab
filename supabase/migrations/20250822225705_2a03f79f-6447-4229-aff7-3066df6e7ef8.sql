-- Fix security warning: set search_path for function
CREATE OR REPLACE FUNCTION public.cleanup_old_messages()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.messages 
  WHERE created_at < now() - interval '24 hours';
END;
$$;