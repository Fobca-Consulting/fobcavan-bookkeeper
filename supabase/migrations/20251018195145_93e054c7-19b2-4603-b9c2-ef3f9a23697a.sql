-- Create client_activities table for tracking actions on client records
CREATE TABLE IF NOT EXISTS public.client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can view all activities"
  ON public.client_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert activities"
  ON public.client_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_client_activities_client_id ON public.client_activities(client_id);
CREATE INDEX idx_client_activities_created_at ON public.client_activities(created_at DESC);

-- Create function to log client activity
CREATE OR REPLACE FUNCTION public.log_client_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_description TEXT;
  current_user_name TEXT;
BEGIN
  -- Get the user's name from profiles
  SELECT full_name INTO current_user_name
  FROM public.profiles
  WHERE id = auth.uid();

  -- Determine the action description based on TG_OP
  IF TG_OP = 'INSERT' THEN
    activity_description := current_user_name || ' created client ' || NEW.business_name;
    
    INSERT INTO public.client_activities (client_id, user_id, action_type, description)
    VALUES (NEW.id, auth.uid(), 'created', activity_description);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if meaningful fields changed
    IF OLD.business_name != NEW.business_name OR 
       OLD.contact_name != NEW.contact_name OR 
       OLD.email != NEW.email OR
       OLD.phone != NEW.phone OR
       OLD.address != NEW.address OR
       OLD.client_type != NEW.client_type OR
       OLD.portal_access != NEW.portal_access THEN
      
      activity_description := current_user_name || ' updated client ' || NEW.business_name;
      
      INSERT INTO public.client_activities (client_id, user_id, action_type, description)
      VALUES (NEW.id, auth.uid(), 'updated', activity_description);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers for automatic activity logging
CREATE TRIGGER client_activity_on_insert
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_client_activity();

CREATE TRIGGER client_activity_on_update
  AFTER UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_client_activity();