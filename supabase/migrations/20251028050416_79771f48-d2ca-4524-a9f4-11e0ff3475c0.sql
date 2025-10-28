-- Fix log_client_activity to avoid NULL description and skip when called without auth context
CREATE OR REPLACE FUNCTION public.log_client_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  activity_description TEXT;
  current_user_name TEXT;
  current_user_id UUID := auth.uid();
BEGIN
  -- Skip logging when invoked by service role (no user context)
  IF current_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO current_user_name
  FROM public.profiles
  WHERE id = current_user_id;

  IF TG_OP = 'INSERT' THEN
    activity_description := COALESCE(current_user_name, 'System') || ' created client ' || COALESCE(NEW.business_name, 'Unknown');

    INSERT INTO public.client_activities (client_id, user_id, action_type, description)
    VALUES (NEW.id, current_user_id, 'created', activity_description);

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.business_name IS DISTINCT FROM NEW.business_name OR 
       OLD.contact_name IS DISTINCT FROM NEW.contact_name OR 
       OLD.email IS DISTINCT FROM NEW.email OR
       OLD.phone IS DISTINCT FROM NEW.phone OR
       OLD.address IS DISTINCT FROM NEW.address OR
       OLD.client_type IS DISTINCT FROM NEW.client_type OR
       OLD.portal_access IS DISTINCT FROM NEW.portal_access THEN

      activity_description := COALESCE(current_user_name, 'System') || ' updated client ' || COALESCE(NEW.business_name, 'Unknown');

      INSERT INTO public.client_activities (client_id, user_id, action_type, description)
      VALUES (NEW.id, current_user_id, 'updated', activity_description);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure triggers exist and are up to date
DROP TRIGGER IF EXISTS log_client_activity_insert ON public.clients;
DROP TRIGGER IF EXISTS log_client_activity_update ON public.clients;

CREATE TRIGGER log_client_activity_insert
AFTER INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.log_client_activity();

CREATE TRIGGER log_client_activity_update
AFTER UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.log_client_activity();