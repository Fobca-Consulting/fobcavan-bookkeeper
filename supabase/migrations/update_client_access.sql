
-- Update client_access table to make user_id NOT NULL
ALTER TABLE public.client_access 
ALTER COLUMN user_id SET NOT NULL;
