-- Make user_id nullable in client_activities
ALTER TABLE public.client_activities ALTER COLUMN user_id DROP NOT NULL;